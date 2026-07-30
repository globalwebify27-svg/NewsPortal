// =============================================================================
// User Features Controller — Threaded Comments, Bookmarks, Likes, Author Follows
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { CommentStatus } from "@prisma/client";
import { prisma } from "../config/database";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.utils";
import { NotFoundError, UnauthorizedError, ValidationError, ForbiddenError } from "../middleware/error.middleware";

// =============================================================================
// 1. THREADED COMMENTS ENGINE
// =============================================================================

export async function getArticleComments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const articleId = req.params.articleId as string;

    const comments = await prisma.comment.findMany({
      where: {
        articleId,
        parentId: null, // Top level
        status: CommentStatus.APPROVED,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          where: { status: CommentStatus.APPROVED },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    sendSuccess(res, comments);
  } catch (error) {
    next(error);
  }
}

export async function postComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const articleId = req.params.articleId as string;
    const { body, parentId } = req.body;

    if (!body || body.trim().length < 2) {
      throw new ValidationError("Comment body cannot be empty.");
    }

    const comment = await prisma.comment.create({
      data: {
        articleId,
        userId: req.user.id,
        body: body.trim(),
        parentId: parentId || null,
        status: CommentStatus.PENDING, // Pending moderation
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    sendCreated(res, comment, "Comment submitted and pending moderation.");
  } catch (error) {
    next(error);
  }
}

export async function moderateComment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!Object.values(CommentStatus).includes(status)) {
      throw new ValidationError("Invalid comment status.");
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { status: status as CommentStatus },
    });

    sendSuccess(res, comment, `Comment status set to ${status}`);
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// 2. BOOKMARKS ENGINE
// =============================================================================

export async function toggleBookmark(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const articleId = req.params.articleId as string;

    const existing = await prisma.bookmark.findUnique({
      where: { userId_articleId: { userId: req.user.id, articleId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      sendSuccess(res, { bookmarked: false }, "Removed from bookmarks.");
    } else {
      await prisma.bookmark.create({
        data: { userId: req.user.id, articleId },
      });
      sendCreated(res, { bookmarked: true }, "Saved to bookmarks!");
    }
  } catch (error) {
    next(error);
  }
}

export async function getUserBookmarks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            featuredImage: true,
            readTime: true,
            publishedAt: true,
            category: { select: { name: true, slug: true } },
          },
        },
      },
    });

    sendSuccess(res, bookmarks);
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// 3. ARTICLE LIKES ENGINE
// =============================================================================

export async function toggleArticleLike(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const articleId = req.params.articleId as string;

    const existing = await prisma.articleLike.findUnique({
      where: { userId_articleId: { userId: req.user.id, articleId } },
    });

    if (existing) {
      await prisma.articleLike.delete({ where: { id: existing.id } });
      sendSuccess(res, { liked: false }, "Like removed.");
    } else {
      await prisma.articleLike.create({
        data: { userId: req.user.id, articleId },
      });
      sendCreated(res, { liked: true }, "Article liked!");
    }
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// 4. AUTHOR FOLLOW SYSTEM
// =============================================================================

export async function toggleFollowAuthor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const followedId = req.params.authorId as string;

    if (followedId === req.user.id) {
      throw new ValidationError("You cannot follow yourself.");
    }

    const existing = await prisma.authorFollow.findUnique({
      where: { followerId_followedId: { followerId: req.user.id, followedId } },
    });

    if (existing) {
      await prisma.authorFollow.delete({ where: { id: existing.id } });
      sendSuccess(res, { following: false }, "Unfollowed author.");
    } else {
      await prisma.authorFollow.create({
        data: { followerId: req.user.id, followedId },
      });
      sendCreated(res, { following: true }, "Following author!");
    }
  } catch (error) {
    next(error);
  }
}
