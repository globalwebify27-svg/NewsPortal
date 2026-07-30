-- MySQL dump 10.13  Distrib 9.6.0, for macos26.4 (arm64)
--
-- Host: localhost    Database: global_awaaz
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'e8d3541e-5993-11f1-a273-5886996b4e45:1-2414';

--
-- Table structure for table `advertisements`
--

DROP TABLE IF EXISTS `advertisements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advertisements` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zone` enum('HEADER','SIDEBAR','FOOTER','ARTICLE_TOP','ARTICLE_MID','ARTICLE_BOTTOM','STICKY_BANNER','VIDEO_PRE_ROLL','POPUP') COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('IMAGE_BANNER','HTML_EMBED','VIDEO_AD') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IMAGE_BANNER',
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `targetUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `htmlCode` text COLLATE utf8mb4_unicode_ci,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `impressions` int NOT NULL DEFAULT '0',
  `clicks` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `advertisements_zone_idx` (`zone`),
  KEY `advertisements_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advertisements`
--

LOCK TABLES `advertisements` WRITE;
/*!40000 ALTER TABLE `advertisements` DISABLE KEYS */;
/*!40000 ALTER TABLE `advertisements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_likes`
--

DROP TABLE IF EXISTS `article_likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_likes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `articleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_likes_userId_articleId_key` (`userId`,`articleId`),
  KEY `article_likes_userId_idx` (`userId`),
  KEY `article_likes_articleId_fkey` (`articleId`),
  CONSTRAINT `article_likes_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `article_likes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_likes`
--

LOCK TABLES `article_likes` WRITE;
/*!40000 ALTER TABLE `article_likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `article_likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `article_tags`
--

DROP TABLE IF EXISTS `article_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_tags` (
  `articleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`articleId`,`tagId`),
  KEY `article_tags_tagId_fkey` (`tagId`),
  CONSTRAINT `article_tags_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `article_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `article_tags`
--

LOCK TABLES `article_tags` WRITE;
/*!40000 ALTER TABLE `article_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `article_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titleHi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(600) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary` text COLLATE utf8mb4_unicode_ci,
  `summaryHi` text COLLATE utf8mb4_unicode_ci,
  `body` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `bodyHi` longtext COLLATE utf8mb4_unicode_ci,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `authorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `editorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publisherId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','REVIEW','SCHEDULED','PUBLISHED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `isBreaking` tinyint(1) NOT NULL DEFAULT '0',
  `isTrending` tinyint(1) NOT NULL DEFAULT '0',
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `isEditorsPick` tinyint(1) NOT NULL DEFAULT '0',
  `isPremium` tinyint(1) NOT NULL DEFAULT '0',
  `isLiveBlog` tinyint(1) NOT NULL DEFAULT '0',
  `featuredImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `featuredImageAlt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `readTime` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `views` int NOT NULL DEFAULT '0',
  `shareCount` int NOT NULL DEFAULT '0',
  `publishedAt` datetime(3) DEFAULT NULL,
  `scheduledAt` datetime(3) DEFAULT NULL,
  `seoTitle` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seoDesc` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seoKeywords` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ogImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `canonicalUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isFactChecked` tinyint(1) NOT NULL DEFAULT '0',
  `factCheckVerdict` enum('TRUE','FALSE','MISLEADING','MIXED','SATIRE','UNVERIFIED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `factCheckNote` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `articles_slug_key` (`slug`),
  KEY `articles_slug_idx` (`slug`),
  KEY `articles_categoryId_idx` (`categoryId`),
  KEY `articles_authorId_idx` (`authorId`),
  KEY `articles_status_idx` (`status`),
  KEY `articles_publishedAt_idx` (`publishedAt`),
  KEY `articles_isBreaking_idx` (`isBreaking`),
  KEY `articles_isTrending_idx` (`isTrending`),
  KEY `articles_isFeatured_idx` (`isFeatured`),
  KEY `articles_editorId_fkey` (`editorId`),
  KEY `articles_publisherId_fkey` (`publisherId`),
  CONSTRAINT `articles_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `articles_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `articles_editorId_fkey` FOREIGN KEY (`editorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `articles_publisherId_fkey` FOREIGN KEY (`publisherId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES ('cms4m09hh000nv2r5wh0pylmi','Autonomous Frontier: AI Reaches Cognitive Autonomy Milestones','स्वास्थ्य सीमा: एआई ने संज्ञानात्मक स्वायत्तता के नए मील के पत्थर हासिल किए','autonomous-frontier-ai-cognitive-autonomy','Scientists reveal architectural changes that allow localized neural networks to process real-time contextual streams with 90% less energy.',NULL,'As global metropolises expand, sustainable infrastructure and AI-driven urban analytics are emerging as foundational pillars for future coexistence and economic resilience. International delegates convening across major global capitals have emphasized the urgency of integrating green transit networks, renewable power grids, and privacy-preserving data hubs.',NULL,'cms4m09gh0004v2r581nqw54u','cms4m09g20000v2r59wf8o556',NULL,NULL,'PUBLISHED',0,0,1,0,0,0,'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',NULL,'3 min read',1420,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-28 12:05:44.069','2026-07-28 12:05:44.069'),('cms4m09hn000pv2r5ngo5z3f7','Global Markets Surge as Investor Confidence Strengthens','वैश्विक बाजार में तेजी, निवेशकों में उत्साह बढ़ा','global-markets-surge-investor-confidence','Interest rate shifts from central banks signal inflation containment across major indices.',NULL,'Markets rallied across New York, London, and Tokyo following optimistic economic forecasts from international monetary chiefs. Analysts note strong quarterly earnings from energy and technology conglomerates.',NULL,'cms4m09gg0003v2r556xaw3tu','cms4m09g20000v2r59wf8o556',NULL,NULL,'PUBLISHED',0,0,1,0,0,0,'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',NULL,'5 min read',980,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-28 12:05:44.076','2026-07-28 12:05:44.076'),('cms4m09hp000rv2r5hu5wilxu','Space Success: ISRO Creates History with Landmark Launch','अंतरिक्ष में नई सफलता, इसरो ने रचा इतिहास','space-success-isro-history','Next-gen satellite constellation deployed into lunar orbit for advanced deep-space observation.',NULL,'Indian Space Research Organisation successfully injected 36 communications and observation satellites into polar orbit, marking another major commercial satellite deployment milestone.',NULL,'cms4m09gm0007v2r5ey5yd4ze','cms4m09g20000v2r59wf8o556',NULL,NULL,'PUBLISHED',0,0,1,0,0,0,'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',NULL,'4 min read',2150,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-28 12:05:44.077','2026-07-28 12:05:44.077'),('cms4m09hr000tv2r5017kqz9l','Diplomatic Accords Signed in Geneva Restoring Trade Corridors','जेनेवा में व्यापार गलियारों को बहाल करने वाले राजनयिक समझौते','diplomatic-accords-geneva','Nations sign landmark maritime safety and duty agreements to ensure uninterrupted cargo flow.',NULL,'Representatives from over 40 countries established unified security guidelines for maritime traffic in international waters today.',NULL,'cms4m09gb0001v2r515e3mr7j','cms4m09g20000v2r59wf8o556',NULL,NULL,'PUBLISHED',0,0,1,0,0,0,'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',NULL,'6 min read',3100,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-28 12:05:44.080','2026-07-28 12:05:44.080'),('cms4m09ht000vv2r5vfb3noxi','India Boosts Clean Energy Mission with Major Investments in 5 States','भारत में स्वच्छ ऊर्जा मिशन को नई गति, 5 राज्यों में बड़े निवेश की घोषणा','clean-energy-mission-india','New solar and green hydrogen corridors target 100GW capacity by 2028.',NULL,'The Ministry of New and Renewable Energy announced landmark incentives for offshore wind and solar storage projects across Gujarat, Rajasthan, and Tamil Nadu.',NULL,'cms4m09ge0002v2r52obykl0e','cms4m09g20000v2r59wf8o556',NULL,NULL,'PUBLISHED',0,0,1,0,0,0,'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',NULL,'4 min read',1850,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-28 12:05:44.082','2026-07-28 12:05:44.082'),('cms4m09hv000xv2r5nx2glcfo','Championship Final Thriller Ends with Epic Penalty Shootout','रोमांचक पेनाल्टी शूटआउट के साथ समाप्त हुआ चैंपियनशिप फाइनल','championship-final-thriller','Underdog squad secures victory in extra time before capacity stadium crowd.',NULL,'An extraordinary display of tactical resilience crowned the tournament as underdog contenders converted five consecutive penalties under pressure.',NULL,'cms4m09gi0005v2r5k51w37do','cms4m09g20000v2r59wf8o556',NULL,NULL,'PUBLISHED',0,0,0,0,0,0,'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',NULL,'4 min read',1200,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,'2026-07-28 12:05:44.083','2026-07-28 12:05:44.083');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resourceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `before` json DEFAULT NULL,
  `after` json DEFAULT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_userId_idx` (`userId`),
  KEY `audit_logs_resource_idx` (`resource`),
  KEY `audit_logs_createdAt_idx` (`createdAt`),
  CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `author_follows`
--

DROP TABLE IF EXISTS `author_follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `author_follows` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `followerId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `followedId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `author_follows_followerId_followedId_key` (`followerId`,`followedId`),
  KEY `author_follows_followerId_idx` (`followerId`),
  KEY `author_follows_followedId_idx` (`followedId`),
  CONSTRAINT `author_follows_followedId_fkey` FOREIGN KEY (`followedId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `author_follows_followerId_fkey` FOREIGN KEY (`followerId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `author_follows`
--

LOCK TABLES `author_follows` WRITE;
/*!40000 ALTER TABLE `author_follows` DISABLE KEYS */;
/*!40000 ALTER TABLE `author_follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookmarks`
--

DROP TABLE IF EXISTS `bookmarks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookmarks` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `articleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookmarks_userId_articleId_key` (`userId`,`articleId`),
  KEY `bookmarks_userId_idx` (`userId`),
  KEY `bookmarks_articleId_fkey` (`articleId`),
  CONSTRAINT `bookmarks_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookmarks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookmarks`
--

LOCK TABLES `bookmarks` WRITE;
/*!40000 ALTER TABLE `bookmarks` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookmarks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `breaking_news`
--

DROP TABLE IF EXISTS `breaking_news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `breaking_news` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `textHi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `priority` int NOT NULL DEFAULT '0',
  `expiresAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `breaking_news_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `breaking_news`
--

LOCK TABLES `breaking_news` WRITE;
/*!40000 ALTER TABLE `breaking_news` DISABLE KEYS */;
INSERT INTO `breaking_news` VALUES ('cms4m09hc000kv2r5u8hutjjs','GLOBAL SUMMIT 2026: World leaders sign historic AI Governance Accords in Geneva.','ग्लोबल समिट 2026: जेनेवा में ऐतिहासिक एआई समझौते पर हस्ताक्षर।',NULL,1,1,NULL,'2026-07-28 12:05:44.064','2026-07-28 12:05:44.064'),('cms4m09hc000lv2r5n7dwbfrd','MARKETS: Global tech stocks surge following breakthrough quantum processor announcements.','शेयर बाजार: क्वांटम प्रोसेसर घोषणा के बाद टेक शेयरों में तेजी।',NULL,1,2,NULL,'2026-07-28 12:05:44.064','2026-07-28 12:05:44.064');
/*!40000 ALTER TABLE `breaking_news` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nameHi` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `descHi` text COLLATE utf8mb4_unicode_ci,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT '#e50914',
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_key` (`slug`),
  KEY `categories_slug_idx` (`slug`),
  KEY `categories_parentId_idx` (`parentId`),
  CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('cms4m09gb0001v2r515e3mr7j','World','विश्व','world',NULL,NULL,NULL,'#e50914','globe',1,1,'2026-07-28 12:05:44.027','2026-07-28 12:05:44.027'),('cms4m09ge0002v2r52obykl0e','India','भारत','india',NULL,NULL,NULL,'#ff9933','map-pin',2,1,'2026-07-28 12:05:44.031','2026-07-28 12:05:44.031'),('cms4m09gg0003v2r556xaw3tu','Business','बिजनेस','business',NULL,NULL,NULL,'#10b981','trending-up',3,1,'2026-07-28 12:05:44.032','2026-07-28 12:05:44.032'),('cms4m09gh0004v2r581nqw54u','Technology','टेक्नोलॉजी','technology',NULL,NULL,NULL,'#3b82f6','cpu',4,1,'2026-07-28 12:05:44.033','2026-07-28 12:05:44.033'),('cms4m09gi0005v2r5k51w37do','Sports','खेल','sports',NULL,NULL,NULL,'#f59e0b','trophy',5,1,'2026-07-28 12:05:44.035','2026-07-28 12:05:44.035'),('cms4m09gk0006v2r526bow1gt','Entertainment','मनोरंजन','entertainment',NULL,NULL,NULL,'#8b5cf6','film',6,1,'2026-07-28 12:05:44.036','2026-07-28 12:05:44.036'),('cms4m09gm0007v2r5ey5yd4ze','Science','विज्ञान','science',NULL,NULL,NULL,'#06b6d4','atom',7,1,'2026-07-28 12:05:44.038','2026-07-28 12:05:44.038'),('cms4m09go0008v2r5vrudnfxs','Health','स्वास्थ्य','health',NULL,NULL,NULL,'#ec4899','heart-pulse',8,1,'2026-07-28 12:05:44.041','2026-07-28 12:05:44.041'),('cms4m09gr0009v2r5qyawhc0q','Opinion','विचार','opinion',NULL,NULL,NULL,'#64748b','quote',9,1,'2026-07-28 12:05:44.043','2026-07-28 12:05:44.043');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `articleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','FLAGGED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `likes` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `comments_articleId_idx` (`articleId`),
  KEY `comments_userId_idx` (`userId`),
  KEY `comments_status_idx` (`status`),
  KEY `comments_parentId_fkey` (`parentId`),
  CONSTRAINT `comments_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comments_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `comments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_blog_entries`
--

DROP TABLE IF EXISTS `live_blog_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `live_blog_entries` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `liveBlogId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `authorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isBreaking` tinyint(1) NOT NULL DEFAULT '0',
  `postedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `live_blog_entries_liveBlogId_idx` (`liveBlogId`),
  KEY `live_blog_entries_authorId_fkey` (`authorId`),
  CONSTRAINT `live_blog_entries_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `live_blog_entries_liveBlogId_fkey` FOREIGN KEY (`liveBlogId`) REFERENCES `live_blogs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_blog_entries`
--

LOCK TABLES `live_blog_entries` WRITE;
/*!40000 ALTER TABLE `live_blog_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `live_blog_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `live_blogs`
--

DROP TABLE IF EXISTS `live_blogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `live_blogs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `articleId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `live_blogs_articleId_key` (`articleId`),
  CONSTRAINT `live_blogs_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `live_blogs`
--

LOCK TABLES `live_blogs` WRITE;
/*!40000 ALTER TABLE `live_blogs` DISABLE KEYS */;
/*!40000 ALTER TABLE `live_blogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cloudinaryId` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publicId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('IMAGE','VIDEO','AUDIO','PDF','DOCUMENT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mimeType` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `size` int DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `duration` double DEFAULT NULL,
  `altText` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caption` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `folder` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `uploadedById` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `media_type_idx` (`type`),
  KEY `media_uploadedById_idx` (`uploadedById`),
  CONSTRAINT `media_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscribers`
--

DROP TABLE IF EXISTS `newsletter_subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscribers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `subscribedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `unsubscribedAt` datetime(3) DEFAULT NULL,
  `source` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'homepage',
  PRIMARY KEY (`id`),
  UNIQUE KEY `newsletter_subscribers_email_key` (`email`),
  KEY `newsletter_subscribers_email_idx` (`email`),
  KEY `newsletter_subscribers_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscribers`
--

LOCK TABLES `newsletter_subscribers` WRITE;
/*!40000 ALTER TABLE `newsletter_subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notifications_userId_idx` (`userId`),
  KEY `notifications_isRead_idx` (`isRead`),
  CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poll_options`
--

DROP TABLE IF EXISTS `poll_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `poll_options` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pollId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `textHi` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `votes` int NOT NULL DEFAULT '0',
  `order` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `poll_options_pollId_idx` (`pollId`),
  CONSTRAINT `poll_options_pollId_fkey` FOREIGN KEY (`pollId`) REFERENCES `polls` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poll_options`
--

LOCK TABLES `poll_options` WRITE;
/*!40000 ALTER TABLE `poll_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `poll_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `polls`
--

DROP TABLE IF EXISTS `polls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `polls` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionHi` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `articleId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `startDate` datetime(3) DEFAULT NULL,
  `endDate` datetime(3) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `polls_articleId_key` (`articleId`),
  CONSTRAINT `polls_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `articles` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `polls`
--

LOCK TABLES `polls` WRITE;
/*!40000 ALTER TABLE `polls` DISABLE KEYS */;
/*!40000 ALTER TABLE `polls` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refreshToken` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` text COLLATE utf8mb4_unicode_ci,
  `isRevoked` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_token_key` (`token`),
  UNIQUE KEY `sessions_refreshToken_key` (`refreshToken`),
  KEY `sessions_userId_idx` (`userId`),
  KEY `sessions_token_idx` (`token`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_settings`
--

DROP TABLE IF EXISTS `site_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('TEXT','JSON','BOOLEAN','NUMBER','COLOR','URL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEXT',
  `label` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `group` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_settings_key_key` (`key`),
  KEY `site_settings_key_idx` (`key`),
  KEY `site_settings_group_idx` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_settings`
--

LOCK TABLES `site_settings` WRITE;
/*!40000 ALTER TABLE `site_settings` DISABLE KEYS */;
INSERT INTO `site_settings` VALUES ('cms4m09h1000fv2r59hd1xhb7','site_name','Global Awaaz','TEXT','Site Name','general','2026-07-28 12:05:44.054'),('cms4m09h6000gv2r53ox8zr58','site_tagline','World-Class Editorial Journalism','TEXT','Tagline','general','2026-07-28 12:05:44.058'),('cms4m09h7000hv2r5gce4bh6d','primary_color','#e50914','COLOR','Primary Accent Color','theme','2026-07-28 12:05:44.060'),('cms4m09h9000iv2r5iypxw1ed','breaking_ticker_active','true','BOOLEAN','Show Breaking Ticker','features','2026-07-28 12:05:44.061'),('cms4m09ha000jv2r53sradpsd','comments_auto_approve','false','BOOLEAN','Auto Approve Comments','moderation','2026-07-28 12:05:44.063');
/*!40000 ALTER TABLE `site_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nameHi` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_slug_key` (`slug`),
  KEY `tags_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES ('cms4m09gs000av2r5raz6t16t','Artificial Intelligence','एआई','artificial-intelligence','#3b82f6','2026-07-28 12:05:44.045'),('cms4m09gv000bv2r5b2snafrp','Climate Change','जलवायु परिवर्तन','climate-change','#10b981','2026-07-28 12:05:44.048'),('cms4m09gx000cv2r5tr7pt8h9','Cryptocurrency','क्रिप्टो','cryptocurrency','#f59e0b','2026-07-28 12:05:44.049'),('cms4m09gy000dv2r5l7itrznb','Elections 2026','चुनाव 2026','elections-2026','#e50914','2026-07-28 12:05:44.051'),('cms4m09h0000ev2r54sihe95e','Space Exploration','अंतरिक्ष','space-exploration','#8b5cf6','2026-07-28 12:05:44.052');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('SUPERADMIN','ADMIN','PUBLISHER','EDITOR','REPORTER','AUTHOR','READER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'READER',
  `avatar` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitterHandle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `googleId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebookId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twoFASecret` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twoFAEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_googleId_key` (`googleId`),
  UNIQUE KEY `users_facebookId_key` (`facebookId`),
  KEY `users_email_idx` (`email`),
  KEY `users_role_idx` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cms4m09g20000v2r59wf8o556','Global Awaaz Admin','admin@globalawaaz.com','$2a$12$n43L/a10On/mM8lzhxIjUu0C67glZZWw/e1GawFx7FXpCveBz6fOq','SUPERADMIN',NULL,'Chief Editor & Administrator at Global Awaaz.',NULL,NULL,NULL,NULL,NULL,0,1,1,NULL,'2026-07-28 12:05:44.018','2026-07-28 12:05:44.018');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-30 14:16:10
