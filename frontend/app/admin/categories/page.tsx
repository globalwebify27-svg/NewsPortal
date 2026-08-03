"use client";

import React, { useState, useEffect } from "react";
import { FolderTree, MapPin, Plus, Trash2, CheckCircle, X } from "lucide-react";
import { INDIAN_STATES } from "@/lib/states";

interface CategoryItem {
  name: string;
  count: number;
  color: string;
  slug: string;
  isCustom?: boolean;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { name: "India", count: 48, color: "#f59e0b", slug: "india" },
  { name: "World", count: 62, color: "#e50914", slug: "world" },
  { name: "Business", count: 34, color: "#3b82f6", slug: "business" },
  { name: "Sports", count: 29, color: "#00875a", slug: "sports" },
  { name: "Technology", count: 41, color: "#8b5cf6", slug: "technology" },
  { name: "Entertainment", count: 27, color: "#ec4899", slug: "entertainment" },
  { name: "Health", count: 18, color: "#ef4444", slug: "health" },
  { name: "Science", count: 15, color: "#10b981", slug: "science" },
  { name: "Education", count: 22, color: "#06b6d4", slug: "education" },
  { name: "Opinion", count: 19, color: "#6366f1", slug: "opinion" }
];

const LOCAL_STORAGE_CATEGORIES_KEY = "globalawaaz_custom_categories";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#e50914");
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
      if (stored) {
        const customItems: CategoryItem[] = JSON.parse(stored);
        const customSlugs = new Set(customItems.map(c => c.slug));
        const filteredDefault = DEFAULT_CATEGORIES.filter(c => !customSlugs.has(c.slug));
        setCategories([...filteredDefault, ...customItems]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveCategoriesToStorage = (items: CategoryItem[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast("Category name is required!");
      return;
    }

    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (categories.some(c => c.slug === slug)) {
      showToast(`Category with slug "/${slug}" already exists!`);
      return;
    }

    const newCat: CategoryItem = {
      name: catName.trim(),
      count: 0,
      color: catColor,
      slug,
      isCustom: true
    };

    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategoriesToStorage(updated);
    showToast(`New Category "${catName}" created successfully!`);

    setCatName("");
    setCatColor("#e50914");
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (slug: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      const updated = categories.filter(c => c.slug !== slug);
      setCategories(updated);
      saveCategoriesToStorage(updated);
      showToast(`Category "${name}" deleted.`);
    }
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

      {/* Header */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "280px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FolderTree size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
              Categories & Regional News Desks
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
              Manage global news topics, state-level targeted regional news, and color taxonomies.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{ background: "#0f172a", color: "#ffffff", border: "none", padding: "11px 22px", borderRadius: "10px", fontWeight: 800, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, boxShadow: "0 4px 14px rgba(15,23,42,0.2)" }}
        >
          <Plus size={16} /> Add Custom Category
        </button>
      </div>

      {/* Categories Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "18px", marginBottom: "36px" }}>
        {categories.map((cat) => (
          <div key={cat.slug} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)", position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: cat.color, width: "12px", height: "12px", borderRadius: "50%", display: "inline-block" }} />
                {cat.isCustom && (
                  <span style={{ fontSize: "0.65rem", background: "#fef3c7", color: "#d97706", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>
                    CUSTOM
                  </span>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#64748b", background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px" }}>
                  {cat.count} Articles
                </span>
                {cat.isCustom && (
                  <button
                    onClick={() => handleDeleteCategory(cat.slug, cat.name)}
                    style={{ background: "#fee2e2", border: "none", color: "#dc2626", padding: "4px", borderRadius: "4px", cursor: "pointer", display: "inline-flex" }}
                    title="Delete Category"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>
              {cat.name}
            </h3>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>
              slug: /{cat.slug}
            </span>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "480px", padding: "32px", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, color: "#0f172a" }}>
                Add Custom Category
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Crime & Investigation, Automobile, Real Estate..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: 600 }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>Theme Accent Color</label>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="color"
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    style={{ width: "42px", height: "42px", borderRadius: "8px", border: "1px solid #cbd5e1", cursor: "pointer", padding: "2px" }}
                  />
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["#e50914", "#3b82f6", "#00875a", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4"].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCatColor(color)}
                        style={{ width: "24px", height: "24px", borderRadius: "50%", background: color, border: catColor === color ? "2px solid #0f172a" : "none", cursor: "pointer" }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: "11px", borderRadius: "8px", border: "none", background: "#0f172a", color: "#ffffff", fontWeight: 800, cursor: "pointer" }}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regional Indian States Desk */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={20} style={{ color: "#e50914" }} /> Regional State News Desks ({INDIAN_STATES.length} States)
        </h3>
        <p style={{ margin: "0 0 20px 0", fontSize: "0.85rem", color: "#64748b" }}>
          Targeted hyper-local news channels configured for direct reader filtering.
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {INDIAN_STATES.map((state) => (
            <span key={state.slug} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#334155", padding: "7px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: 700 }}>
              {state.nameEn} ({state.nameHi})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
