// =============================================================================
// Global Awaaz — Database Seed Script
// Populate default categories, admin user, site settings, and sample data
// =============================================================================

import "dotenv/config";
import { PrismaClient, Role, ArticleStatus, SettingType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 0. Seed Granular Permissions
  const permissionsData = [
    { slug: "articles:view", name: "View Articles", module: "articles", description: "Can view articles queue and content drafts" },
    { slug: "articles:create", name: "Create Draft", module: "articles", description: "Can create new article drafts" },
    { slug: "articles:edit_own", name: "Edit Own Drafts", module: "articles", description: "Can edit articles authored by self" },
    { slug: "articles:edit_any", name: "Edit Any Article", module: "articles", description: "Can edit articles authored by anyone" },
    { slug: "articles:delete", name: "Delete Articles", module: "articles", description: "Can delete article drafts or records" },
    { slug: "articles:publish", name: "Publish Articles", module: "articles", description: "Can publish articles directly" },
    { slug: "articles:approve", name: "Approve Articles", module: "articles", description: "Can approve submitted review articles" },
    { slug: "articles:reject", name: "Reject Articles", module: "articles", description: "Can reject articles and request revision" },
    { slug: "articles:schedule", name: "Schedule Articles", module: "articles", description: "Can schedule article publishing date/time" },
    { slug: "articles:restore", name: "Restore Articles", module: "articles", description: "Can restore archived or deleted articles" },
    { slug: "categories:manage", name: "Manage Categories", module: "categories", description: "Can create, update, or delete categories" },
    { slug: "tags:manage", name: "Manage Tags", module: "tags", description: "Can create, update, or delete tags" },
    { slug: "media:manage", name: "Manage Media Library", module: "media", description: "Can upload, manage, or delete media assets" },
    { slug: "comments:manage", name: "Moderate Comments", module: "comments", description: "Can approve, reject, or delete user comments" },
    { slug: "users:manage", name: "Manage Users", module: "users", description: "Can view users, assign roles, activate or ban accounts" },
    { slug: "roles:manage", name: "Manage Roles & Permissions", module: "roles", description: "Can create roles and update permission matrix" },
    { slug: "settings:manage", name: "Manage Site Settings", module: "settings", description: "Can update portal configuration and SEO settings" },
    { slug: "audit_logs:view", name: "View Audit Logs", module: "audit_logs", description: "Can view system activity logs and security audits" }
  ];

  const dbPermissions: Record<string, string> = {};
  for (const perm of permissionsData) {
    const createdPerm = await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, description: perm.description, module: perm.module },
      create: perm
    });
    dbPermissions[perm.slug] = createdPerm.id;
  }
  console.log("✅ Granular permissions seeded:", Object.keys(dbPermissions).length);

  // 0.1 Seed System Default Roles
  const superAdminRole = await prisma.roleModel.upsert({
    where: { slug: "super_admin" },
    update: { name: "Super Admin", description: "Full system control over all modules, users, roles, and settings.", isSystem: true },
    create: { name: "Super Admin", slug: "super_admin", description: "Full system control over all modules, users, roles, and settings.", isSystem: true }
  });

  const chiefEditorRole = await prisma.roleModel.upsert({
    where: { slug: "chief_editor" },
    update: { name: "Chief Editor", description: "Manage news review, approve, reject, publish, categories, and tags.", isSystem: true },
    create: { name: "Chief Editor", slug: "chief_editor", description: "Manage news review, approve, reject, publish, categories, and tags.", isSystem: true }
  });

  const editorRole = await prisma.roleModel.upsert({
    where: { slug: "editor" },
    update: { name: "Editor", description: "Create and edit own drafts and submit for review.", isSystem: true },
    create: { name: "Editor", slug: "editor", description: "Create and edit own drafts and submit for review.", isSystem: true }
  });

  // Assign permissions to Super Admin (ALL)
  for (const permId of Object.values(dbPermissions)) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permId } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: permId }
    });
  }

  // Assign permissions to Chief Editor
  const chiefEditorPermSlugs = [
    "articles:view", "articles:create", "articles:edit_own", "articles:edit_any",
    "articles:delete", "articles:publish", "articles:approve", "articles:reject",
    "articles:schedule", "articles:restore", "categories:manage", "tags:manage",
    "media:manage", "comments:manage"
  ];
  for (const slug of chiefEditorPermSlugs) {
    if (dbPermissions[slug]) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: chiefEditorRole.id, permissionId: dbPermissions[slug] } },
        update: {},
        create: { roleId: chiefEditorRole.id, permissionId: dbPermissions[slug] }
      });
    }
  }

  // Assign permissions to Editor
  const editorPermSlugs = ["articles:view", "articles:create", "articles:edit_own", "media:manage"];
  for (const slug of editorPermSlugs) {
    if (dbPermissions[slug]) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: editorRole.id, permissionId: dbPermissions[slug] } },
        update: {},
        create: { roleId: editorRole.id, permissionId: dbPermissions[slug] }
      });
    }
  }
  console.log("✅ Default system roles & permissions matrix seeded");

  // 1. Create SuperAdmin Users
  const rawAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "Global@#2409";
  const adminPassword = await bcrypt.hash(rawAdminPassword, 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: "global2409@globalawaaz.com" },
    update: { password: adminPassword, roleId: superAdminRole.id, isVerified: true, isActive: true },
    create: {
      name: "Global Awaaz Admin",
      email: "global2409@globalawaaz.com",
      password: adminPassword,
      role: Role.SUPERADMIN,
      roleId: superAdminRole.id,
      isVerified: true,
      isActive: true,
      bio: "Chief Editor & Administrator at Global Awaaz.",
    },
  });
  console.log("✅ SuperAdmin user created & linked to Super Admin role:", superAdmin.email);

  // 2. Create Default Categories
  const categories = [
    { name: "World", nameHi: "विश्व", slug: "world", color: "#e50914", icon: "globe", order: 1 },
    { name: "India", nameHi: "भारत", slug: "india", color: "#ff9933", icon: "map-pin", order: 2 },
    { name: "Business", nameHi: "बिजनेस", slug: "business", color: "#10b981", icon: "trending-up", order: 3 },
    { name: "Technology", nameHi: "टेक्नोलॉजी", slug: "technology", color: "#3b82f6", icon: "cpu", order: 4 },
    { name: "Sports", nameHi: "खेल", slug: "sports", color: "#f59e0b", icon: "trophy", order: 5 },
    { name: "Entertainment", nameHi: "मनोरंजन", slug: "entertainment", color: "#8b5cf6", icon: "film", order: 6 },
    { name: "Science", nameHi: "विज्ञान", slug: "science", color: "#06b6d4", icon: "atom", order: 7 },
    { name: "Health", nameHi: "स्वास्थ्य", slug: "health", color: "#ec4899", icon: "heart-pulse", order: 8 },
    { name: "Opinion", nameHi: "विचार", slug: "opinion", color: "#64748b", icon: "quote", order: 9 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Default categories seeded");

  // 3. Create Tags
  const tags = [
    { name: "Artificial Intelligence", nameHi: "एआई", slug: "artificial-intelligence", color: "#3b82f6" },
    { name: "Climate Change", nameHi: "जलवायु परिवर्तन", slug: "climate-change", color: "#10b981" },
    { name: "Cryptocurrency", nameHi: "क्रिप्टो", slug: "cryptocurrency", color: "#f59e0b" },
    { name: "Elections 2026", nameHi: "चुनाव 2026", slug: "elections-2026", color: "#e50914" },
    { name: "Space Exploration", nameHi: "अंतरिक्ष", slug: "space-exploration", color: "#8b5cf6" },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log("✅ Default tags seeded");

  // 4. Seed Default Site Settings
  const defaultSettings = [
    { key: "site_name", value: "Global Awaaz", type: SettingType.TEXT, label: "Site Name", group: "general" },
    { key: "site_tagline", value: "World-Class Editorial Journalism", type: SettingType.TEXT, label: "Tagline", group: "general" },
    { key: "primary_color", value: "#e50914", type: SettingType.COLOR, label: "Primary Accent Color", group: "theme" },
    { key: "breaking_ticker_active", value: "true", type: SettingType.BOOLEAN, label: "Show Breaking Ticker", group: "features" },
    { key: "comments_auto_approve", value: "false", type: SettingType.BOOLEAN, label: "Auto Approve Comments", group: "moderation" },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Site settings seeded");

  // 5. Seed Sample Breaking News
  await prisma.breakingNews.createMany({
    data: [
      { text: "GLOBAL SUMMIT 2026: World leaders sign historic AI Governance Accords in Geneva.", textHi: "ग्लोबल समिट 2026: जेनेवा में ऐतिहासिक एआई समझौते पर हस्ताक्षर।", priority: 1 },
      { text: "MARKETS: Global tech stocks surge following breakthrough quantum processor announcements.", textHi: "शेयर बाजार: क्वांटम प्रोसेसर घोषणा के बाद टेक शेयरों में तेजी।", priority: 2 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Sample breaking news seeded");

  // 6. Seed Sample Articles across categories
  const techCat = await prisma.category.findUnique({ where: { slug: "technology" } });
  const bizCat = await prisma.category.findUnique({ where: { slug: "business" } });
  const sciCat = await prisma.category.findUnique({ where: { slug: "science" } });
  const worldCat = await prisma.category.findUnique({ where: { slug: "world" } });
  const indiaCat = await prisma.category.findUnique({ where: { slug: "india" } });
  const sportsCat = await prisma.category.findUnique({ where: { slug: "sports" } });

  const sampleArticles = [
    {
      title: "Autonomous Frontier: AI Reaches Cognitive Autonomy Milestones",
      titleHi: "स्वास्थ्य सीमा: एआई ने संज्ञानात्मक स्वायत्तता के नए मील के पत्थर हासिल किए",
      slug: "autonomous-frontier-ai-cognitive-autonomy",
      summary: "Scientists reveal architectural changes that allow localized neural networks to process real-time contextual streams with 90% less energy.",
      body: "As global metropolises expand, sustainable infrastructure and AI-driven urban analytics are emerging as foundational pillars for future coexistence and economic resilience. International delegates convening across major global capitals have emphasized the urgency of integrating green transit networks, renewable power grids, and privacy-preserving data hubs.",
      featuredImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      categoryId: techCat?.id || "",
      authorId: superAdmin.id,
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      readTime: "3 min read",
      views: 1420
    },
    {
      title: "Global Markets Surge as Investor Confidence Strengthens",
      titleHi: "वैश्विक बाजार में तेजी, निवेशकों में उत्साह बढ़ा",
      slug: "global-markets-surge-investor-confidence",
      summary: "Interest rate shifts from central banks signal inflation containment across major indices.",
      body: "Markets rallied across New York, London, and Tokyo following optimistic economic forecasts from international monetary chiefs. Analysts note strong quarterly earnings from energy and technology conglomerates.",
      featuredImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80",
      categoryId: bizCat?.id || "",
      authorId: superAdmin.id,
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      readTime: "5 min read",
      views: 980
    },
    {
      title: "Space Success: ISRO Creates History with Landmark Launch",
      titleHi: "अंतरिक्ष में नई सफलता, इसरो ने रचा इतिहास",
      slug: "space-success-isro-history",
      summary: "Next-gen satellite constellation deployed into lunar orbit for advanced deep-space observation.",
      body: "Indian Space Research Organisation successfully injected 36 communications and observation satellites into polar orbit, marking another major commercial satellite deployment milestone.",
      featuredImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      categoryId: sciCat?.id || "",
      authorId: superAdmin.id,
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      readTime: "4 min read",
      views: 2150
    },
    {
      title: "Diplomatic Accords Signed in Geneva Restoring Trade Corridors",
      titleHi: "जेनेवा में व्यापार गलियारों को बहाल करने वाले राजनयिक समझौते",
      slug: "diplomatic-accords-geneva",
      summary: "Nations sign landmark maritime safety and duty agreements to ensure uninterrupted cargo flow.",
      body: "Representatives from over 40 countries established unified security guidelines for maritime traffic in international waters today.",
      featuredImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      categoryId: worldCat?.id || "",
      authorId: superAdmin.id,
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      readTime: "6 min read",
      views: 3100
    },
    {
      title: "India Boosts Clean Energy Mission with Major Investments in 5 States",
      titleHi: "भारत में स्वच्छ ऊर्जा मिशन को नई गति, 5 राज्यों में बड़े निवेश की घोषणा",
      slug: "clean-energy-mission-india",
      summary: "New solar and green hydrogen corridors target 100GW capacity by 2028.",
      body: "The Ministry of New and Renewable Energy announced landmark incentives for offshore wind and solar storage projects across Gujarat, Rajasthan, and Tamil Nadu.",
      featuredImage: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80",
      categoryId: indiaCat?.id || "",
      authorId: superAdmin.id,
      status: ArticleStatus.PUBLISHED,
      isFeatured: true,
      readTime: "4 min read",
      views: 1850
    },
    {
      title: "Championship Final Thriller Ends with Epic Penalty Shootout",
      titleHi: "रोमांचक पेनाल्टी शूटआउट के साथ समाप्त हुआ चैंपियनशिप फाइनल",
      slug: "championship-final-thriller",
      summary: "Underdog squad secures victory in extra time before capacity stadium crowd.",
      body: "An extraordinary display of tactical resilience crowned the tournament as underdog contenders converted five consecutive penalties under pressure.",
      featuredImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      categoryId: sportsCat?.id || "",
      authorId: superAdmin.id,
      status: ArticleStatus.PUBLISHED,
      isFeatured: false,
      readTime: "4 min read",
      views: 1200
    }
  ];

  for (const art of sampleArticles) {
    if (art.categoryId) {
      await prisma.article.upsert({
        where: { slug: art.slug },
        update: {},
        create: art
      });
    }
  }
  console.log("✅ Sample articles seeded successfully!");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
