// =============================================================================
// AI Controller — Newsroom Assistance Endpoints
// =============================================================================

import { Request, Response, NextFunction } from "express";
import {
  generateArticleSummary,
  translateEnglishToHindi,
  generateSeoMetadata,
  suggestArticleTags,
} from "../services/ai.service";
import { sendSuccess } from "../utils/response.utils";
import { ValidationError } from "../middleware/error.middleware";

export async function summarizeText(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { content } = req.body;
    if (!content || content.length < 20) {
      throw new ValidationError("Content is required (minimum 20 characters).");
    }

    const summary = await generateArticleSummary(content);
    sendSuccess(res, { summary });
  } catch (error) {
    next(error);
  }
}

export async function translateText(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text } = req.body;
    if (!text) throw new ValidationError("Text is required for translation.");

    const translation = await translateEnglishToHindi(text);
    sendSuccess(res, { translation, targetLanguage: "hi" });
  } catch (error) {
    next(error);
  }
}

export async function generateSeo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      throw new ValidationError("Title and content are required.");
    }

    const seoData = await generateSeoMetadata(title, content);
    sendSuccess(res, seoData);
  } catch (error) {
    next(error);
  }
}

export async function suggestTags(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { content } = req.body;
    if (!content) throw new ValidationError("Content is required.");

    const tags = await suggestArticleTags(content);
    sendSuccess(res, { tags });
  } catch (error) {
    next(error);
  }
}
