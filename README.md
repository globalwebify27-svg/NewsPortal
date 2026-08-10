# 🌐 Global Awaaz — World-Class Enterprise News CMS & Media Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20.0+-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?logo=redis)](https://redis.io/)
[![Meilisearch](https://img.shields.io/badge/Meilisearch-v1.6-FF5C5C?logo=meilisearch)](https://www.meilisearch.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?logo=google)](https://ai.google.dev/)

Global Awaaz is a high-performance, enterprise-grade news CMS and media publishing platform modeled after global leaders like **BBC News**, **The New York Times**, **Reuters**, and **Bloomberg**.

Built to handle **millions of concurrent readers and millions of articles**, Global Awaaz combines a sleek, modern, glassmorphic frontend UI with a robust micro-service architecture powered by Express, TypeScript, Prisma, MySQL 8, Redis, Meilisearch, Cloudinary, and Google Gemini AI.

---

## 🚀 Key Features & Enterprise Modules

### 🎨 Frontend & Design System (Phase 1)
- **Top Utility Bar**: Live date, edition selector, social links, and one-click subscription CTA.
- **Glassmorphism Mega Dropdowns**: 6 interactive navigation dropdowns for *World*, *India*, *Business*, *Technology*, *Sports*, and *Entertainment*.
- **Auth Modal**: Sign In & Register modal with Google and Facebook OAuth buttons.
- **Toast Notification System**: Lightweight, zero-dependency slide-in toast notifications.
- **Scroll Reveal Animations**: IntersectionObserver-powered section reveal effects.
- **28 CMS Admin Modules**: Full HTML views grouped into *Core*, *Editorial*, *Content Modules*, *Users & Access*, *Monetization*, and *System*.

### ⚡ Backend Architecture (Phases 2 – 15)
- **Prisma 22-Model Database Schema**: Complete relational schema covering Users, Sessions, Categories, Tags, Articles, Media, Threaded Comments, Bookmarks, Likes, Author Follows, Breaking News, Advertisements, Site Settings, Polls, Live Blogs, Notifications, and Audit Logs.
- **Authentication & RBAC**: JWT Access/Refresh tokens, httpOnly cookies, 6-digit Redis OTP email verification, secure password reset, and 7-tier Role-Based Access Control (`SUPERADMIN`, `ADMIN`, `PUBLISHER`, `EDITOR`, `REPORTER`, `AUTHOR`, `READER`).
- **Core Content Engine**: Article CRUD with auto-generated unique slugs, reading time calculator (WPM-based), multilingual EN+HI support, and multi-tier Redis caching (`article:*`, `featured:*`, `categories:*`).
- **Media Library & Cloudinary CDN**: Multer 50MB file uploader, automatic WebP image conversion, responsive image srcset generator (320px–1920px), and chunked video upload pipeline.
- **Meilisearch Full-Text Search Engine**: Instant search with typo tolerance, term highlighting `<mark>`, category filters, search autocomplete, and MySQL `LIKE` fallback.
- **Interactive Modules**: Polls & voting system with Socket.IO real-time updates, Fact Check verdict ratings, and Live Blog streaming.
- **Monetization Engine**: Ad campaign manager with zone targeting (`HEADER`, `SIDEBAR`, `FOOTER`, `ARTICLE`, `VIDEO`, `STICKY`) and atomic click/impression CTR tracking.
- **SEO Automation**: Dynamic Google News XML sitemap (`/sitemap.xml`), `robots.txt`, and Schema.org `NewsArticle` JSON-LD structured data.
- **Real-Time Analytics**: Redis heartbeat active reader counter (`POST /analytics/heartbeat`), 7-day view trends, category view distribution, and article leaderboards.
- **AI Newsroom Copilot**: Google Gemini 1.5 Flash integration for BBC-style executive summaries, English-to-Hindi auto-translation, 3-headline SEO generator, and automated tag suggestions.
- **Real-Time WebSockets & Push**: Socket.IO event gateway (`analytics:realtime_users`, `notification:push`, `liveblog:entry`) and user notification inbox.
- **Security Hardening**: XSS Input Sanitization, Helmet security headers, CORS origin whitelisting, multi-tier Rate Limiting, and DB Audit Logging.

---

## 📂 Architecture & Directory Structure

```
NewsPortal/
├── backend/                   # Node.js + Express + TypeScript Backend API
│   ├── src/
│   │   ├── app.ts             # Express app & Socket.IO server
│   │   ├── server.ts          # Server bootstrap
│   │   ├── config/            # Prisma, Redis, Cloudinary, Meilisearch, Logger
│   │   ├── controllers/       # Auth, Articles, Categories, Tags, Media, Search, Admin, Modules, Monetization, UserFeatures, SEO, Analytics, AI, Notifications
│   │   ├── middleware/        # Auth, RBAC, Error, RateLimit, Logger, Upload, Sanitizer, Audit
│   │   ├── routes/            # API Routers (v1)
│   │   ├── services/          # Google Gemini AI Service
│   │   ├── utils/             # JWT, Response, Email, OTP, Slug
│   │   └── validations/       # Zod validation schemas
│   ├── prisma/
│   │   ├── schema.prisma      # 22 Prisma Database Models
│   │   └── seed.ts            # Database Seeder script
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile             # Multi-stage production container
├── frontend/                  # World-Class Enterprise News Portal Frontend
│   ├── index.html             # Homepage UI
│   ├── article.html           # Article Reading Page UI
│   ├── admin.html             # Enterprise CMS Admin Portal (28 Modules)
│   ├── styles.css             # Design System & Styling (~4,050 lines)
│   ├── admin.css              # Admin Portal Styling
│   ├── app.js                 # Client-side UI & Auth Modal logic
│   ├── admin.js               # Admin logic
│   ├── adminStore.js          # Admin state management
│   ├── assets/                # Images & Avatars
│   └── [section].html         # World, India, Business, Tech, Sports, etc.
├── docker-compose.yml         # MySQL 8 + Redis 7 + Meilisearch + API
└── README.md
```

---

## 🛠️ Quick Start & Local Setup

### 1. Prerequisites
- Node.js >= v20.0.0
- Docker & Docker Compose
- Git

### 2. Infrastructure Setup (Docker Compose)
To start MySQL, Redis, and Meilisearch services:

```bash
docker-compose up -d mysql redis meilisearch
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env with your database and API credentials

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed default SuperAdmin user, Categories, and Site Settings
npx prisma db seed

# Start development server with hot-reload
npm run dev
```

The API will be live at `http://localhost:5000/api/v1`
Health check endpoint: `http://localhost:5000/health`

### 4. Running Production Build

```bash
cd backend
npm run build
npm start
```

---

## 📖 API Documentation Summary

| Module | Base Path | Endpoints |
|--------|-----------|-----------|
| **Auth** | `/api/v1/auth` | `POST /register`, `POST /login`, `POST /verify-otp`, `POST /resend-otp`, `POST /refresh-token`, `POST /logout`, `POST /forgot-password`, `POST /reset-password`, `GET /me` |
| **Articles** | `/api/v1/articles` | `GET /`, `GET /:slug`, `GET /feeds/featured`, `POST /`, `PUT /:id`, `DELETE /:id` |
| **Categories** | `/api/v1/categories` | `GET /`, `GET /:slug`, `POST /`, `PUT /:id`, `DELETE /:id` |
| **Tags** | `/api/v1/tags` | `GET /`, `POST /`, `PUT /:id`, `DELETE /:id` |
| **Media** | `/api/v1/media` | `POST /upload`, `GET /`, `DELETE /:id`, `GET /:id/responsive` |
| **Search** | `/api/v1/search` | `GET /?q=query`, `GET /autocomplete?q=query`, `POST /sync` |
| **Admin** | `/api/v1/admin` | `GET /stats`, `GET /breaking-news`, `POST /breaking-news`, `GET /settings`, `POST /settings`, `GET /users`, `PATCH /users/:id/role`, `GET /audit-logs` |
| **Modules** | `/api/v1/modules` | `GET /polls`, `POST /polls`, `POST /polls/:id/vote`, `GET /fact-check`, `POST /fact-check/:articleId`, `GET /live-blog/:articleId`, `POST /live-blog/:articleId/entries` |
| **Monetization** | `/api/v1/monetization` | `GET /ads`, `POST /ads`, `POST /ads/:id/impression`, `POST /ads/:id/click`, `POST /newsletter/subscribe`, `POST /newsletter/unsubscribe`, `GET /newsletter/subscribers` |
| **User** | `/api/v1/user` | `GET /comments/:articleId`, `POST /comments/:articleId`, `PATCH /comments/:id/moderate`, `GET /bookmarks`, `POST /bookmarks/:articleId`, `POST /likes/:articleId`, `POST /authors/:authorId/follow` |
| **SEO** | `/api/v1/seo` | `GET /sitemap.xml`, `GET /robots.txt`, `GET /jsonld/:slug` |
| **Analytics** | `/api/v1/analytics` | `POST /heartbeat`, `GET /realtime`, `GET /leaderboard`, `GET /categories`, `GET /trends` |
| **AI Copilot** | `/api/v1/ai` | `POST /summarize`, `POST /translate`, `POST /generate-seo`, `POST /suggest-tags` |
| **Notifications**| `/api/v1/notifications` | `GET /`, `PATCH /:id/read`, `POST /read-all`, `POST /broadcast` |

---

## 🏆 Default Admin Credentials (Seeded)

- **Email**: `global2409@globalawaaz.com` (or username `global2409`)
- **Password**: `Global@#2409`
- **Role**: `SUPERADMIN`

---

## 📄 License

This project is proprietary software created for Global Awaaz Media Group. All rights reserved.
