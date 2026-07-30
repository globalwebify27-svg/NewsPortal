// =============================================================================
// Modules Controller — Polls, Fact Check Verdicts, and Live Blogs
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { FactCheckVerdict } from "@prisma/client";
import { prisma } from "../config/database";
import { io } from "../app";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.utils";
import { NotFoundError, UnauthorizedError, ValidationError } from "../middleware/error.middleware";

// =============================================================================
// 1. POLLS & VOTING SYSTEM
// =============================================================================

export async function getPolls(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const polls = await prisma.poll.findMany({
      include: { options: { orderBy: { order: "asc" } }, article: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, polls);
  } catch (error) {
    next(error);
  }
}

export async function createPoll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { question, questionHi, articleId, options, startDate, endDate } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      throw new ValidationError("Poll question and at least 2 options are required.");
    }

    const poll = await prisma.poll.create({
      data: {
        question,
        questionHi,
        articleId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        options: {
          create: options.map((opt: { text: string; textHi?: string }, idx: number) => ({
            text: opt.text,
            textHi: opt.textHi,
            order: idx,
          })),
        },
      },
      include: { options: true },
    });

    sendCreated(res, poll, "Poll created successfully!");
  } catch (error) {
    next(error);
  }
}

export async function votePoll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pollId = req.params.pollId as string;
    const { optionId } = req.body;

    if (!optionId) throw new ValidationError("Option ID is required.");

    const option = await prisma.pollOption.findFirst({
      where: { id: optionId, pollId },
    });

    if (!option) throw new NotFoundError("Poll option not found.");

    const updatedOption = await prisma.pollOption.update({
      where: { id: optionId },
      data: { votes: { increment: 1 } },
    });

    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: { orderBy: { order: "asc" } } },
    });

    // Broadcast real-time poll update via WebSocket
    io.emit(`poll:${pollId}:update`, updatedPoll);

    sendSuccess(res, updatedPoll, "Vote registered!");
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// 2. FACT CHECK MODULE
// =============================================================================

export async function getFactChecks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const verdict = req.query.verdict as FactCheckVerdict | undefined;

    const where: any = { isFactChecked: true };
    if (verdict) where.factCheckVerdict = verdict;

    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        factCheckVerdict: true,
        factCheckNote: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
        publishedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    sendSuccess(res, articles);
  } catch (error) {
    next(error);
  }
}

export async function setFactCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const articleId = req.params.articleId as string;
    const { verdict, note } = req.body;

    if (!verdict) throw new ValidationError("Fact check verdict is required.");

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        isFactChecked: true,
        factCheckVerdict: verdict as FactCheckVerdict,
        factCheckNote: note,
      },
    });

    sendSuccess(res, article, "Fact check verdict updated.");
  } catch (error) {
    next(error);
  }
}

// =============================================================================
// 3. LIVE BLOG MODULE
// =============================================================================

export async function getLiveBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const articleId = req.params.articleId as string;

    const liveBlog = await prisma.liveBlog.findUnique({
      where: { articleId },
      include: {
        article: { select: { id: true, title: true, slug: true } },
        entries: {
          orderBy: { postedAt: "desc" },
          include: { author: { select: { name: true, avatar: true } } },
        },
      },
    });

    if (!liveBlog) throw new NotFoundError("Live blog not found for this article.");

    sendSuccess(res, liveBlog);
  } catch (error) {
    next(error);
  }
}

export async function addLiveBlogEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();
    const articleId = req.params.articleId as string;
    const { body, isBreaking } = req.body;

    if (!body) throw new ValidationError("Entry body content is required.");

    let liveBlog = await prisma.liveBlog.findUnique({ where: { articleId } });
    if (!liveBlog) {
      liveBlog = await prisma.liveBlog.create({ data: { articleId } });
    }

    const entry = await prisma.liveBlogEntry.create({
      data: {
        liveBlogId: liveBlog.id,
        body,
        isBreaking: Boolean(isBreaking),
        authorId: req.user.id,
      },
      include: { author: { select: { name: true, avatar: true } } },
    });

    // Broadcast real-time entry via WebSocket
    io.emit(`liveblog:${articleId}:entry`, entry);

    sendCreated(res, entry, "Live blog entry posted!");
  } catch (error) {
    next(error);
  }
}
