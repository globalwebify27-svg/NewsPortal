// =============================================================================
// SEO Routes — Sitemap, robots.txt, Schema.org
// =============================================================================

import { Router } from "express";
import { getXmlSitemap, getRobotsTxt, getArticleJsonLd } from "../controllers/seo.controller";

export const seoRouter = Router();

seoRouter.get("/sitemap.xml", getXmlSitemap);
seoRouter.get("/robots.txt", getRobotsTxt);
seoRouter.get("/jsonld/:slug", getArticleJsonLd);
