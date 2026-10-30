"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Edit,
  Trash2,
  Sparkles,
  ArrowUpRight,
  Upload,
  Image as ImageIcon2,
  Zap,
  Megaphone,
  X,
  AlertCircle,
  MessageSquare,
  Folder,
  Layers,
  MapPin,
  ArrowLeft,
  Check,
  Globe,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  BookOpen
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/config";
import { getArticleImage, formatArticleSlug, translateHindiToEnglishSlug } from "@/lib/defaultArticles";
import { INDIAN_STATES } from "@/lib/states";
import { INDIAN_DISTRICTS, getDistrictsForState } from "@/lib/districts";
import { convertImageToWebP } from "@/lib/webpConverter";
import { getSubCategories } from "@/lib/subCategories";
import { uploadMediaDirectly } from "@/lib/mediaUpload";

interface ArticleAdItem {
  id: string;
  title?: string;
  subtitle?: string;
  link?: string;
  image?: string;
  badge?: string;
  placement?: "both" | "right" | "left" | "body";
  enabled?: boolean;
}

function normalizeCategoriesArray(raw: any, fallbackCatName?: string): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((x) => typeof x === "string" && x.trim().length > 0);
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((x) => typeof x === "string" && x.trim().length > 0);
      }
    } catch (e) {
      if (raw.includes(",")) {
        return raw.split(",").map((c: string) => c.trim()).filter(Boolean);
      }
      return [raw.trim()];
    }
  }
  return fallbackCatName ? [fallbackCatName] : ["Education"];
}

const FRONTEND_NAV_TABS = [
  { en: "Education", hi: "शिक्षा", icon: "⚡", slug: "education" },
  { en: "World", hi: "विदेश", icon: "🌐", slug: "world" },
  { en: "India", hi: "भारत", icon: "📍", slug: "india" },
  { en: "Business", hi: "व्यापार", icon: "📈", slug: "business" },
  { en: "Technology", hi: "तकनीक", icon: "⚙️", slug: "technology" },
  { en: "Sports", hi: "खेल", icon: "🏆", slug: "sports" },
  { en: "Entertainment", hi: "मनोरंजन", icon: "🎬", slug: "entertainment" },
  { en: "Science", hi: "विज्ञान", icon: "⚛️", slug: "science" },
  { en: "Politics", hi: "राजनीति", icon: "🏛️", slug: "politics" },
  { en: "Crime", hi: "अपराध / जुर्म", icon: "🛡️", slug: "crime" },
  { en: "Videos", hi: "वीडियो", icon: "📺", slug: "videos" },
  { en: "Top News", hi: "टॉप न्यूज़", icon: "🏠", slug: "latest" },
  { en: "Markets", hi: "शेयर बाजार", icon: "📊", slug: "markets" }
];

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  featuredImage?: string;
  category?: { name: string; slug?: string; color?: string; subCategory?: string };
  categories?: string[];
  subCategory?: string;
  author?: { name: string };
  authorId?: string;
  status: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  views?: number;
  readTime?: string;
  publishedAt?: string;
  isPinned?: boolean;
  isHero?: boolean;
  isSuperfast?: boolean;
  language?: "EN" | "HI";
  imageHeight?: string;
  imageFit?: "cover" | "contain" | "fill";
  videoUrl?: string;
  state?: string;
  district?: string;
  isTrending?: boolean;
  reviewComment?: string;
  reviewedBy?: string;
  submittedBy?: string;
  // Custom Article-Specific Advertisement
  adTitle?: string;
  adSubtitle?: string;
  adLink?: string;
  adImage?: string;
  adBadge?: string;
  customAds?: ArticleAdItem[];
  // Search Engine Optimization (SEO) Fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
}

function AdminArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryStatus = searchParams.get("status")?.toUpperCase();
  const [statusFilter, setStatusFilter] = useState<string>(() => {
    if (queryStatus === "REVIEW" || queryStatus === "PENDING_REVIEW") return "PENDING_REVIEW";
    return queryStatus || "ALL";
  });

  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  // Sync filter when URL search params change
  useEffect(() => {
    const s = searchParams.get("status")?.toUpperCase();
    if (s) {
      const target = s === "REVIEW" ? "PENDING_REVIEW" : s;
      setStatusFilter(target);
    }
  }, [searchParams]);

  // Role Context
  const [adminRole, setAdminRole] = useState<string>("super_admin");
  const [adminUserName, setAdminUserName] = useState<string>("Global Admin");

  // Rejection Feedback Modal State
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectingArticle, setRejectingArticle] = useState<AdminArticle | null>(null);
  const [rejectComment, setRejectComment] = useState<string>("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AdminArticle | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"placement" | "content" | "advanced">("placement");

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [formCategory, setFormCategory] = useState("Education");
  const [formCategories, setFormCategories] = useState<string[]>(["Top News", "Education"]);
  const [formSubCategory, setFormSubCategory] = useState("General");
  const [formState, setFormState] = useState("Jharkhand");
  const [formDistrict, setFormDistrict] = useState("Ranchi");
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formAuthor, setFormAuthor] = useState("Global Admin");
  const [staffMembersList, setStaffMembersList] = useState<any[]>([]);
  const [formStatus, setFormStatus] = useState("PUBLISHED");
  const [formLanguage, setFormLanguage] = useState<"EN" | "HI">("HI");
  const [formSummary, setFormSummary] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [formIsHero, setFormIsHero] = useState(false);
  const [formIsSuperfast, setFormIsSuperfast] = useState(false);
  const [formImageHeight, setFormImageHeight] = useState("auto");
  const [formCustomHeight, setFormCustomHeight] = useState("");
  const [formImageFit, setFormImageFit] = useState<"cover" | "contain" | "fill">("cover");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Custom Article-Specific Advertisement States
  const [formAdTitle, setFormAdTitle] = useState("");
  const [formAdSubtitle, setFormAdSubtitle] = useState("");
  const [formAdLink, setFormAdLink] = useState("");
  const [formAdImage, setFormAdImage] = useState("");
  const [formAdBadge, setFormAdBadge] = useState("SPONSORED");
  const [formCustomAds, setFormCustomAds] = useState<ArticleAdItem[]>([]);
  const [isUploadingAdImage, setIsUploadingAdImage] = useState(false);
  const slugTranslateTimer = useRef<any>(null);

  // Search Engine Optimization (SEO) Form States & Auto-Sync Flags
  const [formSeoTitle, setFormSeoTitle] = useState("");
  const [formSeoDescription, setFormSeoDescription] = useState("");
  const [formSeoKeywords, setFormSeoKeywords] = useState("");
  const [formCanonicalUrl, setFormCanonicalUrl] = useState("");
  const [formFocusKeyword, setFormFocusKeyword] = useState("");
  const [isSeoTitleCustomized, setIsSeoTitleCustomized] = useState(false);
  const [isSeoDescCustomized, setIsSeoDescCustomized] = useState(false);

  const handleSelectCategory = (newCat: string) => {
    setFormCategory(newCat);
    if (!formCategories.includes(newCat)) {
      setFormCategories([newCat, ...formCategories.filter((c) => c !== formCategory)]);
    }
    const subs = getSubCategories(newCat);
    const isCurrentSubValid = subs.some(
      (s) =>
        s.en.toLowerCase() === formSubCategory.toLowerCase() ||
        s.hi.toLowerCase() === formSubCategory.toLowerCase()
    );
    if (!isCurrentSubValid) {
      if (subs && subs.length > 0) setFormSubCategory(subs[0].en);
      else setFormSubCategory("General");
    }
  };

  const autoGenerateSeoFields = (title: string, summary: string, category: string, stateName: string) => {
    setFormSeoTitle(title);
    setFormSeoDescription(summary);
    setIsSeoTitleCustomized(false);
    setIsSeoDescCustomized(false);
    
    const kwParts = [category, stateName !== "National" ? stateName : "", "Global Awaaz", "Hindi News"].filter(Boolean);
    setFormSeoKeywords(kwParts.join(", "));
    setFormFocusKeyword(`${category} ${stateName !== "National" ? stateName : ""}`.trim());
  };

  const isEditor = (role: string) => {
    const r = (role || "").toLowerCase();
    return r.includes("editor") && !r.includes("chief");
  };

  const isChiefOrSuperAdmin = (role: string) => {
    const r = (role || "").toLowerCase();
    return r.includes("chief") || r.includes("super") || r.includes("admin");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const persistArticlesToDatabase = async (list: AdminArticle[]) => {
    try {
      await fetch(API_ENDPOINTS.articles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: list })
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function initArticlesPageRole() {
      try {
        let rawRole = sessionStorage.getItem("ga_admin_role") || "";
        const user = sessionStorage.getItem("ga_admin_user") || "Global Admin";
        if (rawRole) setAdminRole(rawRole.toLowerCase());
        if (user) setAdminUserName(user);

        try {
          const res = await fetch("/api/v1/staff");
          const json = await res.json();
          const storedUsers = (json && json.success && Array.isArray(json.data)) ? json.data : [];
          setStaffMembersList(storedUsers);
          if (user && user !== "Global Awaaz Admin" && user !== "Chief Editor" && user !== "Staff Editor") {
            const found = storedUsers.find((u: any) => u.name === user || u.email === user);
            if (found && found.roleSlug) {
              setAdminRole(found.roleSlug.toLowerCase());
            }
          }
        } catch (e) {}
      } catch (e) {}
    }

    initArticlesPageRole();
  }, []);

  const handleOpenModal = async (art?: AdminArticle) => {
    if (art) {
      setEditingArticle(art);
      setFormTitle(art.title);
      setFormSlug(art.slug || formatArticleSlug(art));
      setIsSlugCustomized(false);
      setFormCategory(art.category?.name || "Education");
      const initialCats = normalizeCategoriesArray(art.categories, art.category?.name);
      setFormCategories(initialCats);
      setFormSubCategory(art.subCategory || art.category?.subCategory || "General");
      setFormState(art.state || "Jharkhand");
      setFormDistrict(art.district || "Ranchi");
      setFormAuthor(art.author?.name || "Global Awaaz Bureau");
      setFormStatus(art.status || "PUBLISHED");
      setFormSummary(art.summary || "");
      setFormContent(art.body || "");
      setFormImage(art.featuredImage || "");
      setImageFileName(art.featuredImage ? "Uploaded Image" : "");
      setFormState(art.state || "National");
      setFormDistrict(art.district || "All");
      setFormIsHero(art.isHero || false);
      setFormIsSuperfast(art.isSuperfast || false);
      setFormIsTrending(art.isTrending || false);

      // Async fallback: If body is missing on cached item, fetch full article
      if (!art.body && (art.slug || art.id)) {
        try {
          const fetchTarget = art.slug || art.id;
          fetch(`/api/v1/articles/${encodeURIComponent(fetchTarget)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data && data.success && data.data) {
                const full = data.data;
                if (full.body) setFormContent(full.body);
                if (full.seoTitle) setFormSeoTitle(full.seoTitle);
                if (full.seoDescription || full.seoDesc) setFormSeoDescription(full.seoDescription || full.seoDesc);
                if (full.seoKeywords) setFormSeoKeywords(full.seoKeywords);
                if (full.canonicalUrl) setFormCanonicalUrl(full.canonicalUrl);
              }
            })
            .catch(() => {});
        } catch (e) {}
      }

      setFormAdTitle(art.adTitle || "");
      setFormAdSubtitle(art.adSubtitle || "");
      setFormAdLink(art.adLink || "");
      setFormAdImage(art.adImage || "");
      setFormAdBadge(art.adBadge || "SPONSORED");

      if (art.customAds && Array.isArray(art.customAds) && art.customAds.length > 0) {
        setFormCustomAds(art.customAds);
      } else if (art.adImage || art.adTitle) {
        setFormCustomAds([{
          id: `ad_${Date.now()}`,
          title: art.adTitle || "",
          subtitle: art.adSubtitle || "",
          link: art.adLink || "",
          image: art.adImage || "",
          badge: art.adBadge || "SPONSORED"
        }]);
      } else {
        setFormCustomAds([]);
      }

      const h = art.imageHeight || "auto";
      if (["auto", "250px", "350px", "450px", "550px"].includes(h)) {
        setFormImageHeight(h);
        setFormCustomHeight("");
      } else {
        setFormImageHeight("custom");
        setFormCustomHeight(h);
      }
      setFormImageFit(art.imageFit || "cover");
      setFormVideoUrl(art.videoUrl || "");

      // SEO Fields Prefill (Auto-synced if not customized)
      setIsSeoTitleCustomized(!!art.seoTitle);
      setIsSeoDescCustomized(!!art.seoDescription);
      setFormSeoTitle(art.seoTitle || art.title);
      setFormSeoDescription(art.seoDescription || art.summary || "");
      setFormSeoKeywords(art.seoKeywords || `${art.category?.name || "Education"}, ${art.state || "Jharkhand"}, Global Awaaz, Hindi News`);
      setFormCanonicalUrl(art.canonicalUrl || "");
      setFormFocusKeyword(art.focusKeyword || `${art.category?.name || "Education"} ${art.state || ""}`.trim());
    } else {
      setEditingArticle(null);
      setFormTitle("");
      setFormSlug("");
      setIsSlugCustomized(false);
      setFormCategory("Education");
      setFormCategories(["Top News", "Education"]);
      setFormSubCategory("General");
      setFormState("Jharkhand");
      setFormAuthor(adminUserName || "Editor");
      setFormStatus(isEditor(adminRole) ? "PENDING_REVIEW" : "PUBLISHED");
      setFormLanguage("HI");
      setFormSummary("");
      setFormContent("");
      setFormImage("");
      setImageFileName("");
      setFormState("National");
      setFormDistrict("All");
      setFormIsHero(false);
      setFormIsSuperfast(false);
      setFormIsTrending(false);
      setFormImageHeight("auto");
      setFormCustomHeight("");
      setFormImageFit("cover");
      setFormVideoUrl("");

      // SEO Fields Reset
      setIsSeoTitleCustomized(false);
      setIsSeoDescCustomized(false);
      setFormSeoTitle("");
      setFormSeoDescription("");
      setFormSeoKeywords("Education, Global Awaaz, Hindi News");
      setFormCanonicalUrl("");
      setFormFocusKeyword("Education");

      setFormAdTitle("");
      setFormAdSubtitle("");
      setFormAdLink("");
      setFormAdImage("");
      setFormAdBadge("SPONSORED");
      setFormCustomAds([]);
    }
    setActiveModalTab("placement");
    setIsModalOpen(true);
  };

  useEffect(() => {
    async function loadQueueArticles() {
      try {
        setLoading(true);
        const filter = statusFilter;
        let url = "/api/v1/articles?admin=true&limit=10000";
        if (filter && filter !== "ALL") {
          url += `&status=${filter}`;
        }

        const promises: Promise<Response>[] = [fetch(url, { cache: "no-store" })];
        if (filter === "ALL") {
          promises.push(fetch("/api/v1/articles?admin=true&status=PENDING_REVIEW&limit=1000", { cache: "no-store" }));
        }

        const responses = await Promise.all(promises);
        const json = await responses[0].json();
        let list = (json && (json.data || json.articles)) ? (json.data || json.articles) : [];

        if (promises.length > 1) {
          try {
            const pJson = await responses[1].json();
            const pList = (pJson && (pJson.data || pJson.articles)) ? (pJson.data || pJson.articles) : [];
            const merged = [...pList];
            for (const a of list) {
              if (!merged.some((item: any) => item.id === a.id)) {
                merged.push(a);
              }
            }
            list = merged;
          } catch (_) {}
        }

        if (Array.isArray(list)) {
          const sanitized = list.map((a: any) => ({
            ...a,
            categories: normalizeCategoriesArray(a.categories, a.category?.name),
          }));
          setArticles(sanitized);

          const editId = searchParams.get("edit");
          if (editId) {
            const target = sanitized.find((a: any) => a.id === editId);
            if (target) {
              handleOpenModal(target);
            }
          }
        }
      } catch (err) {
        console.warn("Backend fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQueueArticles();
  }, [statusFilter]);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setIsUploadingImage(true);
    showToast("⏳ Converting photo to ultra-optimized WebP format...");

    // Auto-convert any image type (JPG, PNG, GIF, BMP) to WebP format
    const file = await convertImageToWebP(rawFile);
    setImageFileName(file.name);

    // Show local WebP preview immediately while uploading
    const reader = new FileReader();
    reader.onloadend = () => setFormImage(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const uploadedUrl = await uploadMediaDirectly(file);
      setFormImage(uploadedUrl);
      setImageFileName(file.name + " (WebP Format ✓)");
      showToast("✅ Image converted to WebP & saved to Hostinger!");
    } catch (err: any) {
      console.error("Local upload error:", err);
      showToast("⚠️ Upload failed — image saved as local preview only.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAdImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setIsUploadingAdImage(true);
    showToast("⏳ Converting advertisement photo to WebP format...");
    const file = await convertImageToWebP(rawFile);

    const reader = new FileReader();
    reader.onloadend = () => setFormAdImage(reader.result as string);
    reader.readAsDataURL(file);

    try {
      const uploadedUrl = await uploadMediaDirectly(file);
      setFormAdImage(uploadedUrl);
      showToast("✅ Custom Ad Banner uploaded successfully!");
    } catch (err) {
      showToast("⚠️ Ad image saved as local preview.");
    } finally {
      setIsUploadingAdImage(false);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setActiveModalTab("content");
      showToast("Article headline is required!");
      return;
    }

    let autoSlugBase = await translateHindiToEnglishSlug(formTitle);
    const autoSlug = formatArticleSlug({ title: formTitle, slug: autoSlugBase, createdAt: editingArticle?.publishedAt || new Date().toISOString() });
    const finalSlug = editingArticle?.slug
      ? (isSlugCustomized && formSlug.trim() ? formSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : editingArticle.slug)
      : (formSlug.trim() && isSlugCustomized
        ? formSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        : autoSlug);
    const finalHeight = formImageHeight === "custom" ? (formCustomHeight ? (formCustomHeight.endsWith("px") ? formCustomHeight : `${formCustomHeight}px`) : "auto") : formImageHeight;

    const activeCat = formCategory || (formCategories.length > 0 ? formCategories[0] : "Education");
    const finalCategories = Array.from(new Set([activeCat, ...formCategories]));

    const isEditorRole = adminRole === "editor" || adminRole.includes("staff");
    const isChiefOrAdmin = isChiefOrSuperAdmin(adminRole);

    let targetStatus: string = (formStatus || "DRAFT").toUpperCase();
    if (targetStatus === "REVIEW") targetStatus = "PENDING_REVIEW";

    if (isEditorRole) {
      if (targetStatus === "PUBLISHED" || targetStatus === "APPROVED" || targetStatus === "PENDING_REVIEW" || targetStatus === "REVIEW") {
        targetStatus = "PENDING_REVIEW";
      } else {
        targetStatus = "DRAFT";
      }
    }

    const nowIso = new Date().toISOString();
    const reviewerName = `${adminUserName} (${adminRole === "chief_editor" ? "Chief Editor" : adminRole === "super_admin" ? "Super Admin" : "Editor"})`;

    let submittedAt = editingArticle?.submittedAt;
    if (targetStatus === "PENDING_REVIEW" && !submittedAt) {
      submittedAt = nowIso;
    }

    let approvedBy = editingArticle?.approvedBy;
    let approvedAt = editingArticle?.approvedAt;
    let rejectedBy = editingArticle?.rejectedBy;
    let rejectedAt = editingArticle?.rejectedAt;
    let rejectionReason = editingArticle?.rejectionReason || editingArticle?.reviewComment;

    if ((targetStatus === "APPROVED" || targetStatus === "PUBLISHED") && isChiefOrAdmin) {
      approvedBy = reviewerName;
      approvedAt = nowIso;
      rejectedBy = undefined;
      rejectedAt = undefined;
      rejectionReason = undefined;
    }

    const newArt: AdminArticle = {
      id: editingArticle ? editingArticle.id : `art_${Date.now()}`,
      title: formTitle,
      slug: finalSlug,
      summary: formSummary,
      body: formContent,
      featuredImage: formImage || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60",
      category: { name: activeCat, slug: activeCat.toLowerCase().replace(/\s+/g, "-"), color: getCategoryColor(activeCat), subCategory: formSubCategory },
      categories: finalCategories,
      subCategory: formSubCategory,
      author: { name: (formAuthor && formAuthor.trim()) ? formAuthor.trim() : (adminUserName && adminUserName !== "Global Admin" ? adminUserName : "Global Awaaz Admin") },
      authorId: (formAuthor && formAuthor.trim()) ? formAuthor.trim() : adminUserName,
      status: targetStatus,
      submittedAt: submittedAt || undefined,
      approvedBy: approvedBy || undefined,
      approvedAt: approvedAt || undefined,
      rejectedBy: rejectedBy || undefined,
      rejectedAt: rejectedAt || undefined,
      rejectionReason: rejectionReason || undefined,
      reviewComment: rejectionReason || undefined,
      reviewedBy: (approvedBy || rejectedBy) ? (approvedBy || rejectedBy) : editingArticle?.reviewedBy,
      submittedBy: isEditorRole ? adminUserName : editingArticle?.submittedBy,
      views: editingArticle ? editingArticle.views : 100,
      readTime: "3 min read",
      publishedAt: targetStatus === "PUBLISHED" ? (editingArticle?.publishedAt || nowIso) : editingArticle?.publishedAt,
      isHero: formIsHero,
      isSuperfast: formIsSuperfast,
      isTrending: formIsTrending,
      language: formLanguage,
      imageHeight: finalHeight,
      imageFit: formImageFit,
      videoUrl: formVideoUrl,
      state: formState,
      district: (formState === "National" || formState === "National / All India") ? "All" : (formDistrict || "All"),
      adTitle: formAdTitle,
      adSubtitle: formAdSubtitle,
      adLink: formAdLink,
      adImage: formAdImage,
      adBadge: formAdBadge,
      customAds: formCustomAds,
      // SEO Metadata Payload
      seoTitle: formSeoTitle.trim() || undefined,
      seoDescription: formSeoDescription.trim() || undefined,
      seoKeywords: formSeoKeywords.trim() || undefined,
      canonicalUrl: formCanonicalUrl.trim() || undefined,
      focusKeyword: formFocusKeyword.trim() || undefined,
    };

    let updatedList: AdminArticle[];
    if (editingArticle) {
      updatedList = articles.map((a) => (a.id === newArt.id ? newArt : (formIsHero ? { ...a, isHero: false } : a)));
    } else {
      const previousList = formIsHero ? articles.map((a) => ({ ...a, isHero: false })) : articles;
      updatedList = [newArt, ...previousList];
    }

    setArticles(updatedList);
    setIsModalOpen(false);

    showToast(
      isEditorRole
        ? `Article "${formTitle}" submitted for Chief Editor & Super Admin review!`
        : formIsHero
        ? `Article "${formTitle}" set as Main Hero Banner!`
        : editingArticle
        ? `Article "${formTitle}" updated!`
        : `Article "${formTitle}" published live!`
    );

    try {
      const res = await fetch(API_ENDPOINTS.articles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newArt,
          userRole: adminRole,
          userName: adminUserName,
          status: targetStatus
        }),
      });
      const json = await res.json();
      if (json?.success && json?.data) {
        const dbArt = { ...newArt, ...json.data };
        setArticles((prev) => prev.map((a) => (a.id === newArt.id ? dbArt : a)));
      } else {
        showToast("⚠️ Save Warning: " + (json?.message || "Failed to persist to database"));
      }
    } catch (err) {
      console.warn("DB save error:", err);
      showToast("⚠️ Could not connect to server database");
    }
  };

  // Chief Editor Approval Handler
  const handleApproveArticle = async (art: AdminArticle) => {
    const nowIso = new Date().toISOString();
    const reviewer = `${adminUserName} (${adminRole === "chief_editor" ? "Chief Editor" : "Super Admin"})`;

    const updatedArt: AdminArticle = {
      ...art,
      status: "PUBLISHED",
      approvedBy: reviewer,
      approvedAt: nowIso,
      rejectedBy: undefined,
      rejectedAt: undefined,
      reviewComment: undefined,
      rejectionReason: undefined,
      publishedAt: art.publishedAt || nowIso
    };

    setArticles((prev) => prev.map((a) => (a.id === art.id ? updatedArt : a)));
    showToast(`✅ Article "${art.title}" approved & published live!`);

    try {
      await fetch(API_ENDPOINTS.articles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedArt,
          userRole: adminRole,
          userName: adminUserName,
          reviewerName: reviewer,
          status: "PUBLISHED"
        })
      });
    } catch (e) {}
  };

  // Chief Editor Rejection Modal Handlers
  const handleOpenRejectModal = (art: AdminArticle) => {
    setRejectingArticle(art);
    setRejectComment("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectingArticle) return;
    if (!rejectComment.trim()) {
      showToast("Please enter a feedback comment for the Editor!");
      return;
    }

    const nowIso = new Date().toISOString();
    const reviewer = `${adminUserName} (${adminRole === "chief_editor" ? "Chief Editor" : "Super Admin"})`;

    const updatedArt: AdminArticle = {
      ...rejectingArticle,
      status: "REJECTED",
      rejectedBy: reviewer,
      rejectedAt: nowIso,
      reviewComment: rejectComment.trim(),
      rejectionReason: rejectComment.trim(),
      approvedBy: undefined,
      approvedAt: undefined
    };

    setArticles((prev) => prev.map((a) => (a.id === rejectingArticle.id ? updatedArt : a)));
    setShowRejectModal(false);
    setRejectingArticle(null);
    setRejectComment("");
    showToast(`❌ Article rejected with feedback comment sent to Editor.`);

    try {
      await fetch(API_ENDPOINTS.articles, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedArt,
          userRole: adminRole,
          userName: adminUserName,
          reviewerName: reviewer,
          rejectionReason: rejectComment.trim(),
          status: "REJECTED"
        })
      });
    } catch (e) {}
  };

  const handleDeleteArticle = async (id: string, slug: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setArticles((prev) => prev.filter((a) => a.id !== id && a.slug !== slug));
      showToast(`Article "${title}" deleted.`);

      try {
        const target = encodeURIComponent(slug || id);
        const idParam = encodeURIComponent(id || slug);
        const res = await fetch(`/api/v1/articles/${target}?id=${idParam}`, { method: "DELETE" });
        const json = await res.json();
        if (json?.success) {
          showToast(`✅ "${title}" permanently removed from database.`);
        }
      } catch (err) {
        console.warn("DB delete failed:", err);
      }
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "business": return "#3b82f6";
      case "technology": return "#8b5cf6";
      case "sports": return "#00875a";
      case "india": return "#f59e0b";
      case "education": return "#06b6d4";
      case "entertainment": return "#ec4899";
      case "science": return "#10b981";
      case "health": return "#ef4444";
      case "opinion": return "#6366f1";
      default: return "#e50914";
    }
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title ? art.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesStatus = statusFilter === "ALL" || art.status === statusFilter || (statusFilter === "PENDING_REVIEW" && art.status === "REVIEW") || (statusFilter === "REVIEW" && art.status === "PENDING_REVIEW");
    const matchesLang = languageFilter === "ALL" || (languageFilter === "HI" ? art.language === "HI" : art.language !== "HI");
    const matchesDate = !dateFilter || (art.publishedAt ? art.publishedAt.slice(0, 10) === dateFilter : false);
    return matchesSearch && matchesStatus && matchesLang && matchesDate;
  });

  // Reset pagination when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, languageFilter, pageSize]);

  // Pagination Calculations
  const totalItems = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    const target = Math.min(Math.max(1, newPage), totalPages);
    setCurrentPage(target);
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (activePage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (activePage >= totalPages - 3) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(activePage - 1);
      pages.push(activePage);
      pages.push(activePage + 1);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleToggleHero = (artId: string) => {
    const updatedList = articles.map((a) => ({
      ...a,
      isHero: a.id === artId ? !a.isHero : false,
      ...(a.id === artId && !a.isHero ? { imageFit: "cover" as const } : {})
    }));
    setArticles(updatedList);
    persistArticlesToDatabase(updatedList);
    const target = updatedList.find((a) => a.id === artId);
    showToast(target?.isHero ? `🌟 Set "${target.title}" as Main Hero Banner!` : `Hero status removed from "${target?.title}".`);
  };

  const handleToggleSuperfast = (artId: string) => {
    const updatedList = articles.map((a) => (
      a.id === artId ? { ...a, isSuperfast: !a.isSuperfast } : a
    ));
    setArticles(updatedList);
    persistArticlesToDatabase(updatedList);
    const target = updatedList.find((a) => a.id === artId);
    showToast(target?.isSuperfast ? `⚡ Set "${target?.title}" in ⚡ सुपरफ़ास्ट NEWS section!` : `Removed "${target?.title}" from Superfast News.`);
  };

  const handleToggleTrending = (artId: string) => {
    const updatedList = articles.map((a) => (
      a.id === artId ? { ...a, isTrending: !a.isTrending } : a
    ));
    setArticles(updatedList);
    persistArticlesToDatabase(updatedList);
    const target = updatedList.find((a) => a.id === artId);
    showToast(target?.isTrending ? `🔥 Marked "${target?.title}" as Trending / Hot Topic!` : `Unmarked "${target?.title}" from Trending.`);
  };

  return (
    <div>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", background: "#0a0a0a", color: "#ffffff", border: "2px solid #e50914", padding: "14px 20px", borderRadius: "10px", boxShadow: "0 10px 30px rgba(229,9,20,0.2)", zIndex: 9999, fontWeight: 600, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle size={18} style={{ color: "#00875a" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
            Editorial News Queue ({articles.length})
          </h2>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
            Create, publish, edit, or remove news stories across English & Hindi portals.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          style={{
            background: adminRole === "editor" ? "#2563eb" : "#e50914",
            color: "#ffffff",
            border: "none",
            padding: "11px 22px",
            borderRadius: "10px",
            fontWeight: 800,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: adminRole === "editor" ? "0 4px 14px rgba(37,99,235,0.3)" : "0 4px 14px rgba(229,9,20,0.3)"
          }}
        >
          <Plus size={18} /> {adminRole === "editor" ? "Compose News for Review" : "Compose New News"}
        </button>
      </div>

      {/* Live Articles Table */}
      <div className="admin-table-container" ref={tableContainerRef}>
        <div className="admin-table-header">
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
            {statusFilter === "PENDING_REVIEW" ? (
              <span style={{ color: "#854d0e", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                ⏳ Pending Review Queue ({filteredArticles.length})
              </span>
            ) : statusFilter === "PUBLISHED" ? (
              <span>Published Live News ({filteredArticles.length})</span>
            ) : statusFilter === "REJECTED" ? (
              <span>Rejected Submissions ({filteredArticles.length})</span>
            ) : statusFilter === "DRAFT" ? (
              <span>Drafts ({filteredArticles.length})</span>
            ) : (
              <span>News Queue ({filteredArticles.length})</span>
            )}
          </h3>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-secondary)" }} />
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px 12px 8px 36px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.85rem" }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                const newStatus = e.target.value;
                setStatusFilter(newStatus);
                if (newStatus === "ALL") {
                  router.replace("/admin/articles");
                } else {
                  router.replace(`/admin/articles?status=${newStatus}`);
                }
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: statusFilter === "PENDING_REVIEW" ? "2px solid #ca8a04" : "1px solid var(--color-border)",
                fontSize: "0.85rem",
                fontWeight: statusFilter === "PENDING_REVIEW" ? 800 : 500,
                background: statusFilter === "PENDING_REVIEW" ? "#fefce8" : "#ffffff",
                color: statusFilter === "PENDING_REVIEW" ? "#854d0e" : "inherit"
              }}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING_REVIEW">⏳ Pending Review</option>
              <option value="APPROVED">✅ Approved</option>
              <option value="PUBLISHED">🟢 Published (Live)</option>
              <option value="REJECTED">🔴 Rejected (Needs Revision)</option>
              <option value="DRAFT">⚪ Draft</option>
            </select>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="date"
                title="Filter news date wise"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--color-border)", fontSize: "0.85rem", background: "var(--color-bg, #ffffff)", color: "var(--color-text, #0f172a)" }}
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 10px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer" }}
                  title="Clear date filter"
                >
                  ✕ Clear Date
                </button>
              )}
            </div>
          </div>
        </div>

        {statusFilter === "PENDING_REVIEW" && (
          <div style={{ background: "#fefce8", borderBottom: "1px solid #fef08a", padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.86rem", color: "#854d0e", fontWeight: 700 }}>
              <span>⚠️ Showing {filteredArticles.length} editor {filteredArticles.length === 1 ? "submission" : "submissions"} awaiting Chief Editor & Super Admin review & approval.</span>
            </div>
            <button
              onClick={() => {
                setStatusFilter("ALL");
                router.replace("/admin/articles");
              }}
              style={{ background: "#ffffff", border: "1px solid #ca8a04", color: "#854d0e", padding: "5px 12px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
            >
              Show All News (Clear Filter)
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-secondary)" }}>
            Loading editorial queue...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-secondary)" }}>
            No news matches your criteria.
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#ffffff" }}>
            <table className="admin-data-table" style={{ minWidth: "980px", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{ width: "30%", textAlign: "left" }}>News Title</th>
                  <th style={{ width: "10%", textAlign: "left" }}>Category</th>
                  <th style={{ width: "10%", textAlign: "left" }}>State</th>
                  <th style={{ width: "12%", textAlign: "left" }}>Review Status</th>
                  <th style={{ width: "38%", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArticles.map((art) => (
                  <tr key={art.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {art.featuredImage && (
                          <img src={getArticleImage(art)} alt="" style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", flexShrink: 0, border: "1px solid #e2e8f0" }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", lineHeight: "1.3" }}>
                            {art.title}
                            {art.isHero && <span style={{ background: "#e50914", color: "#fff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>HERO</span>}
                            {art.isSuperfast && <span style={{ background: "#dc2626", color: "#fff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>⚡ SUPERFAST</span>}
                            {art.isTrending && <span style={{ background: "#ea580c", color: "#fff", fontSize: "0.62rem", padding: "1px 6px", borderRadius: "4px", fontWeight: 800 }}>🔥 TRENDING</span>}
                          </div>
                          <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600 }}>
                            by {art.author?.name || "Global Admin"} • 📅 {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Today"}
                          </span>

                          {/* Rejection Feedback Comment Display for Editor */}
                          {art.status === "REJECTED" && art.reviewComment && (
                            <div style={{ marginTop: "6px", background: "#fff1f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "6px 10px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                              <MessageSquare size={13} style={{ flexShrink: 0, color: "#dc2626" }} />
                              <span><strong>Chief Editor Feedback:</strong> "{art.reviewComment}"</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {normalizeCategoriesArray(art.categories, art.category?.name).map((c) => (
                          <span key={c} className="category-tag-pill" style={{ background: getCategoryColor(c), color: "#ffffff", border: "none", fontSize: "0.72rem", padding: "2px 8px" }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "3px 10px", borderRadius: "6px", fontSize: "0.74rem", fontWeight: 700, display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                        <span>{art.state || "National"}</span>
                        {art.district && <span style={{ color: "#2563eb", fontWeight: 800 }}>📍 {art.district}</span>}
                      </span>
                    </td>
                    <td>
                      {art.status === "PUBLISHED" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "4px 10px", borderRadius: "6px", fontWeight: 800, fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            🟢 Published Live
                          </span>
                          {art.approvedBy && (
                            <span style={{ fontSize: "0.68rem", color: "#047857", fontWeight: 600 }}>
                              Approved by {art.approvedBy}
                            </span>
                          )}
                        </div>
                      ) : (art.status === "PENDING_REVIEW" || art.status === "REVIEW") ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ background: "#fefce8", color: "#a16207", border: "1px solid #fef08a", padding: "4px 10px", borderRadius: "6px", fontWeight: 800, fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            ⏳ Pending Review
                          </span>
                          {art.submittedAt && (
                            <span style={{ fontSize: "0.68rem", color: "#a16207", fontWeight: 600 }}>
                              Submitted {new Date(art.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ) : art.status === "APPROVED" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "6px", fontWeight: 800, fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            ✅ Approved
                          </span>
                          {art.approvedBy && (
                            <span style={{ fontSize: "0.68rem", color: "#1d4ed8", fontWeight: 600 }}>
                              Approved by {art.approvedBy}
                            </span>
                          )}
                        </div>
                      ) : art.status === "REJECTED" ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", padding: "4px 10px", borderRadius: "6px", fontWeight: 800, fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            🔴 Rejected
                          </span>
                          {art.rejectedBy && (
                            <span style={{ fontSize: "0.68rem", color: "#b91c1c", fontWeight: 600 }}>
                              Rejected by {art.rejectedBy}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1", padding: "4px 10px", borderRadius: "6px", fontWeight: 800, fontSize: "0.74rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          ⚪ Draft
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {/* Chief Editor & Super Admin Approve & Reject Buttons */}
                        {isChiefOrSuperAdmin(adminRole) && art.status !== "PUBLISHED" && (
                          <button
                            onClick={() => handleApproveArticle(art)}
                            title="Approve Article and Publish Live"
                            style={{ background: "#10b981", color: "#ffffff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 6px rgba(16,185,129,0.3)" }}
                          >
                            <CheckCircle size={13} /> Approve & Publish
                          </button>
                        )}
                        {isChiefOrSuperAdmin(adminRole) && (art.status === "PENDING_REVIEW" || art.status === "REVIEW") && (
                          <button
                            onClick={() => handleOpenRejectModal(art)}
                            title="Reject Article with Revision Feedback"
                            style={{ background: "#fff1f2", color: "#dc2626", border: "1px solid #fca5a5", padding: "6px 12px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <X size={13} /> Reject & Comment
                          </button>
                        )}

                        {/* Edit Button: Chief/Super can edit all; Editor can edit own drafts/submissions only */}
                        {(isChiefOrSuperAdmin(adminRole) || art.submittedBy === adminUserName || art.author?.name === adminUserName || art.author?.name?.toLowerCase() === adminUserName.toLowerCase()) && (
                          <button
                            onClick={() => handleOpenModal(art)}
                            title="Edit Article"
                            style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", padding: "6px 12px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                          >
                            <Edit size={13} /> Edit
                          </button>
                        )}

                        {/* Delete Button: Chief Editor & Super Admin Only */}
                        {isChiefOrSuperAdmin(adminRole) && (
                          <button
                            onClick={() => handleDeleteArticle(art.id, art.slug, art.title)}
                            title="Delete Article"
                            style={{ background: "#dc2626", color: "#ffffff", border: "1px solid #b91c1c", padding: "6px 12px", borderRadius: "6px", fontSize: "0.76rem", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 6px rgba(220,38,38,0.25)" }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}

                        {/* Section Feature Toggles: Chief Editor & Super Admin Only */}
                        {isChiefOrSuperAdmin(adminRole) && (
                          <>
                            <button
                              onClick={() => handleToggleHero(art.id)}
                              title={art.isHero ? "Click to unmark as Hero Banner" : "Set as Main Hero Banner (Top Lead Story)"}
                              style={{
                                background: art.isHero ? "#e50914" : "#fff1f2",
                                color: art.isHero ? "#ffffff" : "#e50914",
                                border: `1px solid ${art.isHero ? "#e50914" : "#fca5a5"}`,
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "0.76rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Sparkles size={13} /> {art.isHero ? "Hero ★" : "Set Hero"}
                            </button>
                            <button
                              onClick={() => handleToggleSuperfast(art.id)}
                              title={art.isSuperfast ? "Click to remove from Superfast News section" : "Add to ⚡ सुपरफ़ास्ट NEWS section"}
                              style={{
                                background: art.isSuperfast ? "#dc2626" : "#fef2f2",
                                color: art.isSuperfast ? "#ffffff" : "#dc2626",
                                border: `1px solid ${art.isSuperfast ? "#dc2626" : "#fca5a5"}`,
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "0.76rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <Zap size={13} /> {art.isSuperfast ? "Superfast ⚡" : "+ Superfast"}
                            </button>
                            <button
                              onClick={() => handleToggleTrending(art.id)}
                              title={art.isTrending ? "Click to remove from Trending / Hot Topics" : "Mark as 🔥 Trending / Hot Topic"}
                              style={{
                                background: art.isTrending ? "#ea580c" : "#fff7ed",
                                color: art.isTrending ? "#ffffff" : "#ea580c",
                                border: `1px solid ${art.isTrending ? "#ea580c" : "#ffedd5"}`,
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "0.76rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              🔥 {art.isTrending ? "Trending" : "+ Trending"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredArticles.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
              padding: "16px 24px",
              borderTop: "1px solid #e2e8f0",
              background: "#fafbfc",
            }}
          >
            {/* Left Info: Range & Page size */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem", color: "#64748b" }}>
              <span>
                Showing <strong style={{ color: "#0f172a" }}>{totalItems === 0 ? 0 : startIndex + 1}</strong> to{" "}
                <strong style={{ color: "#0f172a" }}>{endIndex}</strong> of{" "}
                <strong style={{ color: "#0f172a" }}>{totalItems}</strong> news stories
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748b" }}>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#0f172a",
                    cursor: "pointer"
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Right Controls: Page Buttons */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={activePage === 1}
                  title="First Page"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: activePage === 1 ? "#cbd5e1" : "#475569",
                    cursor: activePage === 1 ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ChevronsLeft size={16} />
                </button>

                {/* Prev Page */}
                <button
                  onClick={() => handlePageChange(activePage - 1)}
                  disabled={activePage === 1}
                  title="Previous Page"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    height: "32px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: activePage === 1 ? "#cbd5e1" : "#475569",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: activePage === 1 ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ChevronLeft size={15} /> Prev
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span
                        key={`dots-${idx}`}
                        style={{
                          width: "28px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#94a3b8",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                        }}
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = p as number;
                  const isActive = pageNum === activePage;

                  return (
                    <button
                      key={`page-${pageNum}`}
                      onClick={() => handlePageChange(pageNum)}
                      style={{
                        minWidth: "32px",
                        height: "32px",
                        padding: "0 8px",
                        borderRadius: "6px",
                        border: isActive ? "1px solid #e50914" : "1px solid #e2e8f0",
                        background: isActive ? "#e50914" : "#ffffff",
                        color: isActive ? "#ffffff" : "#334155",
                        fontWeight: isActive ? 800 : 600,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        boxShadow: isActive ? "0 2px 8px rgba(229,9,20,0.3)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(activePage + 1)}
                  disabled={activePage === totalPages}
                  title="Next Page"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    height: "32px",
                    padding: "0 10px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: activePage === totalPages ? "#cbd5e1" : "#475569",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: activePage === totalPages ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Next <ChevronRight size={15} />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={activePage === totalPages}
                  title="Last Page"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    color: activePage === totalPages ? "#cbd5e1" : "#475569",
                    cursor: activePage === totalPages ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Article Creation & Editing Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "16px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "980px", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}>
            
            {/* Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fee2e2", color: "#e50914", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.18rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                    {isEditor(adminRole)
                      ? (editingArticle ? (editingArticle.status === "REJECTED" ? "Revise Rejected Article" : "Edit Article Draft") : "Compose News Submission")
                      : (editingArticle ? "Edit Article Details" : "Compose & Publish Article")}
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                    Write story content, choose desk placements, and publish across portals.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "#f1f5f9", border: "none", width: "34px", height: "34px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer", transition: "background 0.15s ease" }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Segmented Tab Bar */}
            <div style={{ display: "flex", gap: "6px", padding: "8px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <button
                type="button"
                onClick={() => setActiveModalTab("placement")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: activeModalTab === "placement" ? "1px solid #e2e8f0" : "1px solid transparent",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: activeModalTab === "placement" ? "#ffffff" : "transparent",
                  color: activeModalTab === "placement" ? "#e50914" : "#64748b",
                  boxShadow: activeModalTab === "placement" ? "0 2px 6px rgba(0,0,0,0.04)" : "none"
                }}
              >
                <Zap size={15} /> 1. Category & Sub-Tab
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("content")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: activeModalTab === "content" ? "1px solid #e2e8f0" : "1px solid transparent",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: activeModalTab === "content" ? "#ffffff" : "transparent",
                  color: activeModalTab === "content" ? "#e50914" : "#64748b",
                  boxShadow: activeModalTab === "content" ? "0 2px 6px rgba(0,0,0,0.04)" : "none"
                }}
              >
                <FileText size={15} /> 2. Story & Media
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("advanced")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: activeModalTab === "advanced" ? "1px solid #e2e8f0" : "1px solid transparent",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: activeModalTab === "advanced" ? "#ffffff" : "transparent",
                  color: activeModalTab === "advanced" ? "#e50914" : "#64748b",
                  boxShadow: activeModalTab === "advanced" ? "0 2px 6px rgba(0,0,0,0.04)" : "none"
                }}
              >
                <Sparkles size={15} /> 3. SEO & Sponsor Ads
                {formCustomAds.length > 0 && (
                  <span style={{ fontSize: "0.7rem", background: "#eff6ff", color: "#2563eb", padding: "1px 6px", borderRadius: "10px", fontWeight: 800 }}>
                    {formCustomAds.length} Ads
                  </span>
                )}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveArticle} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div style={{ flex: 1, overflowY: "auto", padding: "22px 26px", display: "flex", flexDirection: "column", gap: "18px" }}>
                
                {/* TAB 1: CATEGORY & PLACEMENT */}
                {activeModalTab === "placement" && (
                  <>
                    {/* 1. Professional Category & Sub-Tab Navigation Mapper */}
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                      {/* Top Header: Title & Edition toggle */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fef2f2", color: "#e50914", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Folder size={17} />
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#0f172a" }}>
                              Primary Category & Sub-Tab (वेबसाइट नेविगेशन मैपिंग)
                            </h4>
                            <p style={{ margin: 0, fontSize: "0.74rem", color: "#64748b" }}>
                              First select the main navigation tab, then select the sub-tab (बिल्कुल वेबसाइट की तरह)
                            </p>
                          </div>
                        </div>

                        {/* Edition Selector */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f8fafc", padding: "3px 6px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: "0.73rem", fontWeight: 700, color: "#64748b", marginRight: "4px" }}>Edition:</span>
                          <button
                            type="button"
                            onClick={() => setFormLanguage("HI")}
                            style={{
                              padding: "4px 9px",
                              borderRadius: "5px",
                              border: "none",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              background: formLanguage === "HI" ? "#e50914" : "transparent",
                              color: formLanguage === "HI" ? "#ffffff" : "#475569",
                              transition: "all 0.15s ease"
                            }}
                          >
                            🇮🇳 Hindi
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormLanguage("EN")}
                            style={{
                              padding: "4px 9px",
                              borderRadius: "5px",
                              border: "none",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              background: formLanguage === "EN" ? "#0f172a" : "transparent",
                              color: formLanguage === "EN" ? "#ffffff" : "#475569",
                              transition: "all 0.15s ease"
                            }}
                          >
                            🌐 English
                          </button>
                        </div>
                      </div>

                      {/* STEP 1: SLEEK FRONTEND NAVBAR BAR (Single horizontal line, exactly matching Screenshot 2) */}
                      <div style={{ marginBottom: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Step 1: Main Category Tab (मुख्य श्रेणी टैब चुनें) <span style={{ color: "#e50914" }}>*</span>
                          </span>
                          <span style={{ fontSize: "0.74rem", color: "#64748b" }}>
                            Selected Tab: <b style={{ color: "#e50914" }}>{formCategory}</b>
                          </span>
                        </div>

                        <div style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          background: "#f8fafc",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "8px 10px",
                          gap: "8px"
                        }}>
                          {FRONTEND_NAV_TABS.map((cat) => {
                            const isSelected = formCategory.toLowerCase() === cat.en.toLowerCase();
                            return (
                              <button
                                key={cat.en}
                                type="button"
                                onClick={() => handleSelectCategory(cat.en)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "7px",
                                  padding: "9px 15px",
                                  borderRadius: "8px",
                                  background: isSelected ? "#e50914" : "#ffffff",
                                  color: isSelected ? "#ffffff" : "#1e293b",
                                  border: isSelected ? "1.5px solid #dc2626" : "1.5px solid #e2e8f0",
                                  fontSize: "0.88rem",
                                  fontWeight: isSelected ? 800 : 600,
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  boxShadow: isSelected ? "0 2px 8px rgba(229,9,20,0.25)" : "0 1px 2px rgba(0,0,0,0.03)",
                                  transition: "all 0.15s ease"
                                }}
                              >
                                <span style={{ fontSize: "1rem" }}>{cat.icon}</span>
                                <span>{cat.hi}</span>
                                {isSelected && <Check size={14} strokeWidth={2.5} style={{ marginLeft: "2px" }} />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* STEP 2: ATTACHED SUB-TABS CARDS */}
                      {(() => {
                        const currentCatObj = FRONTEND_NAV_TABS.find((c) => c.en.toLowerCase() === formCategory.toLowerCase()) || {
                          en: formCategory,
                          hi: formCategory,
                          slug: formCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                          icon: "📁"
                        };
                        const activeSubs = getSubCategories(formCategory);
                        const currentSubObj = activeSubs.find(
                          (s) => s.en.toLowerCase() === formSubCategory.toLowerCase() || s.hi.toLowerCase() === formSubCategory.toLowerCase()
                        );
                        const subSlug =
                          formSubCategory && formSubCategory.toLowerCase() !== "general"
                            ? (currentSubObj ? currentSubObj.en : formSubCategory)
                                .toLowerCase()
                                .trim()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-+|-+$/g, "")
                            : "";
                        const previewUrl = subSlug ? `/${currentCatObj.slug}/${subSlug}` : `/${currentCatObj.slug}`;

                        return (
                          <div style={{
                            background: "#ffffff",
                            border: "1.5px solid #e2e8f0",
                            borderRadius: "14px",
                            padding: "16px 18px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                            position: "relative"
                          }}>
                            {/* Header row of Sub-Tabs menu */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontSize: "1.05rem" }}>{currentCatObj.icon}</span>
                                  <span>Step 2: {currentCatObj.hi} के उप-टैब्स (Sub-Desk)</span>
                                </span>
                                <span style={{ fontSize: "0.76rem", color: "#64748b" }}>— संबंधित टॉपिक चुनें:</span>
                              </div>
                              <div style={{ fontSize: "0.76rem", color: "#2563eb", background: "#eff6ff", border: "1px solid #dbeafe", padding: "4px 10px", borderRadius: "8px", fontFamily: "monospace", fontWeight: 700 }}>
                                URL Route: {previewUrl}
                              </div>
                            </div>

                            {/* Sub-Tabs Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "10px" }}>
                              {/* Option 1: General / All */}
                              <button
                                type="button"
                                onClick={() => setFormSubCategory("General")}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "12px 16px",
                                  borderRadius: "10px",
                                  border: formSubCategory.toLowerCase() === "general" ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                                  background: formSubCategory.toLowerCase() === "general" ? "#eff6ff" : "#ffffff",
                                  color: formSubCategory.toLowerCase() === "general" ? "#1d4ed8" : "#0f172a",
                                  fontSize: "0.88rem",
                                  fontWeight: formSubCategory.toLowerCase() === "general" ? 800 : 600,
                                  cursor: "pointer",
                                  textAlign: "left",
                                  transition: "all 0.15s ease",
                                  boxShadow: formSubCategory.toLowerCase() === "general" ? "0 3px 10px rgba(37,99,235,0.12)" : "0 1px 3px rgba(0,0,0,0.02)"
                                }}
                              >
                                <div style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  background: formSubCategory.toLowerCase() === "general" ? "#dbeafe" : "#f1f5f9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0
                                }}>
                                  <BookOpen size={16} color={formSubCategory.toLowerCase() === "general" ? "#2563eb" : "#64748b"} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>General / All</div>
                                  <div style={{ fontSize: "0.74rem", color: formSubCategory.toLowerCase() === "general" ? "#2563eb" : "#64748b" }}>सभी उप-टैब्स</div>
                                </div>
                                {formSubCategory.toLowerCase() === "general" && <Check size={16} color="#2563eb" strokeWidth={2.5} />}
                              </button>

                              {/* Specific Sub-Categories */}
                              {activeSubs.map((sub) => {
                                const isSelected = formSubCategory.toLowerCase() === sub.en.toLowerCase() || formSubCategory.toLowerCase() === sub.hi.toLowerCase();
                                return (
                                  <button
                                    key={sub.en}
                                    type="button"
                                    onClick={() => setFormSubCategory(sub.en)}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "10px",
                                      padding: "12px 16px",
                                      borderRadius: "10px",
                                      border: isSelected ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                                      background: isSelected ? "#eff6ff" : "#ffffff",
                                      color: isSelected ? "#1d4ed8" : "#0f172a",
                                      fontSize: "0.88rem",
                                      fontWeight: isSelected ? 800 : 600,
                                      cursor: "pointer",
                                      textAlign: "left",
                                      transition: "all 0.15s ease",
                                      boxShadow: isSelected ? "0 3px 10px rgba(37,99,235,0.12)" : "0 1px 3px rgba(0,0,0,0.02)"
                                    }}
                                  >
                                    <div style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "8px",
                                      background: isSelected ? "#dbeafe" : "#f1f5f9",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0
                                    }}>
                                      <BookOpen size={16} color={isSelected ? "#2563eb" : "#64748b"} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: "0.88rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub.hi}</div>
                                      <div style={{ fontSize: "0.74rem", color: isSelected ? "#2563eb" : "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub.en}</div>
                                    </div>
                                    {isSelected && <Check size={16} color="#2563eb" strokeWidth={2.5} />}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Live Display Mapping Footer Bar */}
                            <div style={{
                              marginTop: "14px",
                              paddingTop: "10px",
                              borderTop: "1px solid #e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "8px",
                              fontSize: "0.8rem"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
                                <span style={{ color: "#64748b", fontWeight: 700 }}>लाइव मैपिंग:</span>
                                <span style={{ background: "#e50914", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.82rem" }}>
                                  {currentCatObj.icon} {currentCatObj.hi}
                                </span>
                                <span style={{ color: "#94a3b8", fontWeight: 900 }}>›</span>
                                <span style={{ background: "#f8fafc", border: "1.5px solid #cbd5e1", color: "#0f172a", padding: "3px 10px", borderRadius: "6px", fontWeight: 700, fontSize: "0.82rem" }}>
                                  {formSubCategory.toLowerCase() === "general" ? "सभी उप-टैब्स" : (currentSubObj?.hi || formSubCategory)}
                                </span>
                              </div>
                              <span style={{ color: "#64748b", fontSize: "0.74rem" }}>
                                (वेबसाइट नेविगेशन बार और आर्टिकल ब्रेडक्रम्ब में ऐसा प्रदर्शित होगा)
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* 2. Location Coverage & Reporter */}
                    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#ecfdf5", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <MapPin size={16} />
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 800, color: "#0f172a" }}>
                            Location Coverage & Reporter Byline
                          </h4>
                          <p style={{ margin: 0, fontSize: "0.74rem", color: "#64748b" }}>
                            Tag regional audience filters for city news and assign the article author
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                            Target State / Territory
                          </label>
                          <select
                            value={formState}
                            onChange={(e) => {
                              const newSt = e.target.value;
                              setFormState(newSt);
                              if (newSt === "National" || newSt === "National / All India") {
                                setFormDistrict("All");
                              } else {
                                const stObj = INDIAN_STATES.find((s) => s.nameEn === newSt);
                                const dists = getDistrictsForState(stObj?.code || "");
                                if (dists.length > 0) setFormDistrict(dists[0].nameEn);
                                else setFormDistrict("All");
                              }
                            }}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.86rem", background: "#ffffff", color: "#0f172a", fontWeight: 600 }}
                          >
                            <option value="National">National (All India)</option>
                            {INDIAN_STATES.map((st) => (
                              <option key={st.slug} value={st.nameEn}>
                                {st.nameEn} ({st.nameHi})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                            City / District
                          </label>
                          <select
                            value={formDistrict}
                            onChange={(e) => setFormDistrict(e.target.value)}
                            disabled={formState === "National" || formState === "National / All India"}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              border: "1px solid #cbd5e1",
                              fontSize: "0.86rem",
                              background: (formState === "National" || formState === "National / All India") ? "#f8fafc" : "#ffffff",
                              color: (formState === "National" || formState === "National / All India") ? "#94a3b8" : "#0f172a",
                              fontWeight: 600,
                              cursor: (formState === "National" || formState === "National / All India") ? "not-allowed" : "pointer"
                            }}
                          >
                            {(formState === "National" || formState === "National / All India") ? (
                              <option value="All">All Cities & Districts (National)</option>
                            ) : (
                              <>
                                <option value="All">All Districts in {formState}</option>
                                {getDistrictsForState(INDIAN_STATES.find((s) => s.nameEn === formState)?.code || "").map((d) => (
                                  <option key={d.id} value={d.nameEn}>
                                    📍 {d.nameEn}
                                  </option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#334155", marginBottom: "5px" }}>
                            Reporter / Author Name
                          </label>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <input
                              type="text"
                              placeholder="Reporter byline name..."
                              value={formAuthor}
                              onChange={(e) => setFormAuthor(e.target.value)}
                              style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.86rem", background: "#ffffff", color: "#0f172a", fontWeight: 600 }}
                            />
                            {staffMembersList.length > 0 && (
                              <select
                                value={formAuthor}
                                onChange={(e) => setFormAuthor(e.target.value)}
                                style={{ maxWidth: "130px", padding: "10px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.8rem", background: "#ffffff", color: "#0f172a", fontWeight: 600 }}
                              >
                                <option value="">Staff...</option>
                                {staffMembersList.map((st: any) => (
                                  <option key={st.id || st.email} value={st.name || st.email}>
                                    👤 {st.name || st.email}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step Navigation Bar */}
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", paddingTop: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setActiveModalTab("content")}
                        style={{
                          background: "#0f172a",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 18px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        Next: 2. Story & Media <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </>
                )}

                {/* TAB 2: STORY & MEDIA */}
                {activeModalTab === "content" && (
                  <>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b" }}>
                          Article Headline <span style={{ color: "#e50914" }}>*</span>
                        </label>
                        <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Hindi or English headline</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter news headline (e.g. LPG उपभोक्ताओं की बढ़ सकती है परेशानी)..."
                        value={formTitle}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setFormTitle(newTitle);
                          if (!isSeoTitleCustomized) setFormSeoTitle(newTitle);
                          if (!isSlugCustomized) {
                            const instantSlug = formatArticleSlug({ title: newTitle, createdAt: editingArticle?.publishedAt || new Date().toISOString() });
                            setFormSlug(instantSlug);
                            if (slugTranslateTimer.current) clearTimeout(slugTranslateTimer.current);
                            slugTranslateTimer.current = setTimeout(async () => {
                              if (/[\u0900-\u097F]/.test(newTitle)) {
                                const fullSlug = await translateHindiToEnglishSlug(newTitle);
                                if (fullSlug) setFormSlug(fullSlug);
                              }
                            }, 500);
                          }
                        }}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "0.96rem", fontWeight: 600, color: "#0f172a" }}
                        required
                      />
                    </div>

                    {/* Featured Cover Image */}
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <label style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                          <ImageIcon2 size={16} style={{ color: "#e50914" }} />
                          <span>Featured Cover Photo</span>
                        </label>
                        {!showUrlInput && (
                          <button
                            type="button"
                            onClick={() => setShowUrlInput(true)}
                            style={{ background: "none", border: "none", color: "#2563eb", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            + Paste Image URL
                          </button>
                        )}
                      </div>

                      {formImage ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "90px", height: "58px", borderRadius: "8px", overflow: "hidden", border: "1px solid #cbd5e1", background: "#000", flexShrink: 0 }}>
                              <img src={formImage} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div>
                              <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a", display: "block" }}>
                                {imageFileName || "Uploaded Article Image"}
                              </span>
                              <span style={{ fontSize: "0.74rem", color: isUploadingImage ? "#ea580c" : "#16a34a", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                                {isUploadingImage ? (
                                  <><span style={{ display: "inline-block", width: 13, height: 13, border: "2px solid #ea580c", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Uploading to Hostinger…</>
                                ) : (
                                  <><CheckCircle size={13} /> Optimized WebP on Hostinger ✓</>
                                )}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: "8px" }}>
                            <label style={{ background: "#0f172a", color: "#ffffff", padding: "6px 12px", borderRadius: "7px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <Upload size={13} /> Change
                              <input type="file" accept="image/*" onChange={handleImageFileUpload} style={{ display: "none" }} />
                            </label>
                            <button
                              type="button"
                              onClick={() => { setFormImage(""); setImageFileName(""); }}
                              style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 10px", borderRadius: "7px", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer" }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ border: "2px dashed #cbd5e1", borderRadius: "10px", padding: "20px 14px", textAlign: "center", background: "#ffffff" }}>
                          <Upload size={24} style={{ color: "#e50914", marginBottom: "6px" }} />
                          <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>
                            Choose Cover Image
                          </div>
                          <p style={{ margin: "0 0 10px 0", fontSize: "0.76rem", color: "#64748b" }}>
                            Auto-converted to high-resolution WebP format (JPG, PNG, WebP)
                          </p>
                          <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#e50914", color: "#ffffff", padding: "8px 18px", borderRadius: "8px", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", boxShadow: "0 3px 8px rgba(229,9,20,0.25)" }}>
                            <Upload size={14} /> Upload from Computer
                            <input type="file" accept="image/*" onChange={handleImageFileUpload} style={{ display: "none" }} />
                          </label>
                        </div>
                      )}

                      {showUrlInput && (
                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/..."
                            value={formImage.startsWith("data:") ? "" : formImage}
                            onChange={(e) => { setFormImage(e.target.value); setImageFileName("URL Image"); }}
                            style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.82rem" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowUrlInput(false)}
                            style={{ background: "#f1f5f9", border: "none", padding: "8px 12px", borderRadius: "8px", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Summary Teaser */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>
                          Summary Teaser
                        </label>
                        <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Short synopsis for cards and previews</span>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Enter brief synopsis for article card previews and news excerpts..."
                        value={formSummary}
                        onChange={(e) => {
                          const newSummary = e.target.value;
                          setFormSummary(newSummary);
                          if (!isSeoDescCustomized) setFormSeoDescription(newSummary);
                        }}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem", fontWeight: 500 }}
                      />
                    </div>

                    {/* Rich Text Editor */}
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                        Article Body Content <span style={{ color: "#e50914" }}>*</span>
                      </label>
                      <RichTextEditor value={formContent} onChange={setFormContent} />
                    </div>

                    {/* Step Navigation Bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setActiveModalTab("placement")}
                        style={{
                          background: "#ffffff",
                          color: "#475569",
                          border: "1px solid #cbd5e1",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <ArrowLeft size={14} /> Back to 1. Category & Placement
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveModalTab("advanced")}
                        style={{
                          background: "#0f172a",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 18px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        Next: 3. SEO & Sponsor Ads <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </>
                )}

                {/* TAB 3: SEO & SPONSORS */}
                {activeModalTab === "advanced" && (
                  <>
                    {/* SEO Card */}
                    <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "18px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Search size={18} style={{ color: "#2563eb" }} />
                          <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.92rem" }}>
                            Google Search Engine Optimization (SEO)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            autoGenerateSeoFields(formTitle, formSummary, formCategory, formState);
                            showToast("⚡ Auto-synced SEO Title, Description & Keywords from news content!");
                          }}
                          style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          ⚡ Auto-Fill SEO from News
                        </button>
                      </div>

                      {/* Google Search Live Preview */}
                      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", fontFamily: "arial, sans-serif" }}>
                        <div style={{ fontSize: "0.78rem", color: "#202124", display: "flex", alignItems: "center", gap: "6px" }}>
                          <img src="/favicon.ico" alt="" style={{ width: 14, height: 14 }} />
                          <span>GLOBAL AWAAZ</span>
                          <span style={{ color: "#5f6368" }}>https://www.globalawaaz.com › {(formCategory || "news").toLowerCase()} › {formSlug || "news-slug"}</span>
                        </div>
                        <div style={{ fontSize: "1.05rem", color: "#1a0dab", marginTop: "2px", fontWeight: 400, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {formSeoTitle || formTitle || "Article Headline Title | GLOBAL AWAAZ"}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#4d5156", marginTop: "3px", lineHeight: "1.4" }}>
                          {formSeoDescription || formSummary || "Add a brief search snippet description to show in Google search results..."}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155" }}>
                              Meta Title
                            </label>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: formSeoTitle.length > 60 ? "#dc2626" : "#16a34a" }}>
                              {formSeoTitle.length} / 60
                            </span>
                          </div>
                          <input
                            type="text"
                            placeholder="Custom Meta Title..."
                            value={formSeoTitle}
                            onChange={(e) => {
                              setFormSeoTitle(e.target.value);
                              setIsSeoTitleCustomized(true);
                            }}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                            Primary Focus Keyword
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Jharkhand Board Exam 2026"
                            value={formFocusKeyword}
                            onChange={(e) => setFormFocusKeyword(e.target.value)}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#334155" }}>
                            Meta Description
                          </label>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: formSeoDescription.length > 160 ? "#dc2626" : "#16a34a" }}>
                            {formSeoDescription.length} / 160
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Enter snippet for Google search results..."
                          value={formSeoDescription}
                          onChange={(e) => {
                            setFormSeoDescription(e.target.value);
                            setIsSeoDescCustomized(true);
                          }}
                          style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                            Target Keywords (Comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ranchi News, Jharkhand Jobs"
                            value={formSeoKeywords}
                            onChange={(e) => setFormSeoKeywords(e.target.value)}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                            Canonical URL (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Default: https://www.globalawaaz.com/..."
                            value={formCanonicalUrl}
                            onChange={(e) => setFormCanonicalUrl(e.target.value)}
                            style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Article-Specific Sponsor Ads */}
                    <div style={{ background: "#0f172a", color: "#ffffff", borderRadius: "14px", padding: "18px", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Megaphone size={18} style={{ color: "#e50914" }} />
                          <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>
                            Custom Sponsor Banners ({formCustomAds.length})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormCustomAds([
                              ...formCustomAds,
                              {
                                id: `ad_${Date.now()}_${formCustomAds.length}`,
                                title: "",
                                subtitle: "",
                                link: "",
                                image: "",
                                badge: "SPONSORED",
                                enabled: true
                              }
                            ]);
                          }}
                          style={{
                            background: "#e50914", color: "#ffffff", border: "none",
                            padding: "6px 14px", borderRadius: "8px", fontWeight: 800,
                            fontSize: "0.78rem", cursor: "pointer", display: "inline-flex",
                            alignItems: "center", gap: "6px"
                          }}
                        >
                          <Plus size={14} /> Add Sponsor Ad
                        </button>
                      </div>

                      {formCustomAds.length === 0 ? (
                        <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", textAlign: "center", color: "#94a3b8", fontSize: "0.82rem" }}>
                          No custom ads configured for this article. Click <strong>&quot;+ Add Sponsor Ad&quot;</strong> to insert specific sponsor banners.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                          {formCustomAds.map((adItem, index) => {
                            const isAdEnabled = adItem.enabled !== false;
                            return (
                              <div key={adItem.id || index} style={{ background: isAdEnabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)", border: isAdEnabled ? "1px solid rgba(255,255,255,0.12)" : "1px dashed rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                  <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#cbd5e1" }}>
                                    Ad Slot #{index + 1}
                                  </span>
                                  <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...formCustomAds];
                                        updated[index].enabled = !isAdEnabled;
                                        setFormCustomAds(updated);
                                      }}
                                      style={{ background: isAdEnabled ? "#16a34a" : "#475569", color: "#ffffff", border: "none", padding: "3px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer" }}
                                    >
                                      {isAdEnabled ? "ON" : "OFF"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFormCustomAds(formCustomAds.filter((_, i) => i !== index))}
                                      style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "3px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer" }}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                                  <input
                                    type="text"
                                    placeholder="Sponsor Name / Title"
                                    value={adItem.title || ""}
                                    onChange={(e) => {
                                      const updated = [...formCustomAds];
                                      updated[index].title = e.target.value;
                                      setFormCustomAds(updated);
                                    }}
                                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #475569", background: "#020617", color: "#ffffff", fontSize: "0.8rem" }}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Target Link URL"
                                    value={adItem.link || ""}
                                    onChange={(e) => {
                                      const updated = [...formCustomAds];
                                      updated[index].link = e.target.value;
                                      setFormCustomAds(updated);
                                    }}
                                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #475569", background: "#020617", color: "#ffffff", fontSize: "0.8rem" }}
                                  />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "8px" }}>
                                  <select
                                    value={adItem.placement || "both"}
                                    onChange={(e) => {
                                      const updated = [...formCustomAds];
                                      (updated[index] as any).placement = e.target.value;
                                      setFormCustomAds(updated);
                                    }}
                                    style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #475569", background: "#020617", color: "#ffffff", fontSize: "0.8rem" }}
                                  >
                                    <option value="both">Both Sidebars</option>
                                    <option value="right">Right Column Only</option>
                                    <option value="left">Left Column Only</option>
                                    <option value="body">Inside Body Paragraphs</option>
                                  </select>

                                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    {adItem.image && (
                                      <img src={adItem.image} alt="" style={{ width: "40px", height: "26px", borderRadius: "4px", objectFit: "cover" }} />
                                    )}
                                    <label style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", padding: "6px 10px", borderRadius: "6px", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                      <Upload size={11} /> {adItem.image ? "Change Photo" : "Upload Banner"}
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                          const rawFile = e.target.files?.[0];
                                          if (!rawFile) return;
                                          const file = await convertImageToWebP(rawFile);
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            const updated = [...formCustomAds];
                                            updated[index].image = reader.result as string;
                                            setFormCustomAds(updated);
                                          };
                                          reader.readAsDataURL(file);
                                          try {
                                            const fd = new FormData();
                                            fd.append("file", file);
                                            const res = await fetch("/api/v1/media/upload", { method: "POST", body: fd });
                                            const json = await res.json();
                                            if (json?.success && json?.data?.url) {
                                              const updated = [...formCustomAds];
                                              updated[index].image = json.data.url;
                                              setFormCustomAds(updated);
                                              showToast("✅ Ad Banner uploaded!");
                                            }
                                          } catch (_) {}
                                        }}
                                        style={{ display: "none" }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Step Navigation Bar */}
                    <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", paddingTop: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setActiveModalTab("content")}
                        style={{
                          background: "#ffffff",
                          color: "#475569",
                          border: "1px solid #cbd5e1",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <ArrowLeft size={14} /> Back to 2. Story & Media
                      </button>
                    </div>
                  </>
                )}

              </div>

              {/* Sticky Footer Action Bar */}
              <div style={{
                padding: "14px 24px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                    Publishing to:
                  </span>
                  <span style={{ background: "#e2e8f0", color: "#0f172a", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 800 }}>
                    📁 {formCategory}
                  </span>
                  {formSubCategory && formSubCategory.toLowerCase() !== "general" && (
                    <span style={{ background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, border: "1px solid #dbeafe" }}>
                      › {formSubCategory}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: "#ffffff",
                      color: "#475569",
                      border: "1px solid #cbd5e1",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingImage}
                    style={{
                      background: isUploadingImage ? "#94a3b8" : adminRole === "editor" ? "#2563eb" : "#e50914",
                      color: "#ffffff",
                      border: "none",
                      padding: "9px 24px",
                      borderRadius: "8px",
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      cursor: isUploadingImage ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 4px 12px rgba(229,9,20,0.25)"
                    }}
                  >
                    {isUploadingImage ? (
                      <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Uploading Image…</>
                    ) : adminRole === "editor" ? (
                      editingArticle
                        ? (editingArticle.status === "REJECTED" ? "Re-submit for Review" : "Update & Submit")
                        : "Submit for Review"
                    ) : (
                      editingArticle ? "Update Article" : "Publish Article"
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Editorial Rejection & Feedback Modal */}
      {showRejectModal && rejectingArticle && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)", zIndex: 10001, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "520px", padding: "28px", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fef2f2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle size={20} />
                </div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                  Reject News & Send Feedback
                </h3>
              </div>
              <button onClick={() => setShowRejectModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: "16px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>News Title:</span>
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                {rejectingArticle.title}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                Feedback / Revision Instructions for Editor <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Specify what needs correction (e.g. headline revision, factual proof, spelling fix, or formatting)..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.88rem", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "#ffffff", fontWeight: 700, fontSize: "0.86rem", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#dc2626", color: "#ffffff", fontWeight: 800, fontSize: "0.86rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                Reject News & Send Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminArticlesPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Editorial News Queue...</div>}>
      <AdminArticlesContent />
    </Suspense>
  );
}
