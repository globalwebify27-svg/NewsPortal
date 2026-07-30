// =============================================================================
// Tags Controller — CRUD & Cloud Tagging
// =============================================================================

import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.utils";
import { NotFoundError, ConflictError } from "../middleware/error.middleware";
import { createSlug } from "../utils/slug.utils";
import { createTagSchema, updateTagSchema } from "../validations/content.validation";

export async function getTags(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: "asc" },
    });
    sendSuccess(res, tags);
  } catch (error) {
    next(error);
  }
}

export async function createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createTagSchema.parse(req.body);
    const slug = createSlug(data.name);

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) throw new ConflictError("Tag already exists");

    const tag = await prisma.tag.create({
      data: { ...data, slug },
    });

    sendCreated(res, tag, "Tag created successfully");
  } catch (error) {
    next(error);
  }
}

export async function updateTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = updateTagSchema.parse(req.body);

    const tag = await prisma.tag.update({
      where: { id },
      data,
    });

    sendSuccess(res, tag, "Tag updated successfully");
  } catch (error) {
    next(error);
  }
}

export async function deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    await prisma.tag.delete({ where: { id } });
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
}
