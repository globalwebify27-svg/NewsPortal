"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Image as ImageIcon, X, Upload, Link2 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

type ToolbarButton = {
  label: string;
  title: string;
  cmd?: string;
  arg?: string;
  action?: () => void;
  isBlock?: boolean;
};

const TOOLBAR_ROWS: ToolbarButton[][] = [
  [
    { label: "B",   title: "Bold",          cmd: "bold"          },
    { label: "I",   title: "Italic",        cmd: "italic"        },
    { label: "U",   title: "Underline",     cmd: "underline"     },
    { label: "S̶",   title: "Strikethrough", cmd: "strikeThrough" },
    { label: "|",   title: "separator" },
    { label: "H1",  title: "Heading 1",     cmd: "formatBlock", arg: "h1", isBlock: true },
    { label: "H2",  title: "Heading 2",     cmd: "formatBlock", arg: "h2", isBlock: true },
    { label: "H3",  title: "Heading 3",     cmd: "formatBlock", arg: "h3", isBlock: true },
    { label: "¶",   title: "Paragraph",     cmd: "formatBlock", arg: "p",  isBlock: true },
    { label: "|",   title: "separator" },
    { label: "≡",   title: "Bullet List",   cmd: "insertUnorderedList" },
    { label: "①",   title: "Ordered List",  cmd: "insertOrderedList"   },
    { label: "❝",   title: "Blockquote",    cmd: "formatBlock", arg: "blockquote", isBlock: true },
    { label: "</>", title: "Inline Code",   cmd: "formatBlock", arg: "pre", isBlock: true },
    { label: "|",   title: "separator" },
    { label: "⬛L", title: "Align Left",    cmd: "justifyLeft"   },
    { label: "⬛C", title: "Align Center",  cmd: "justifyCenter" },
    { label: "⬛R", title: "Align Right",   cmd: "justifyRight"  },
    { label: "|",   title: "separator" },
    { label: "🔗",  title: "Insert Link"   },
    { label: "🖼️",  title: "Insert Image"  },
    { label: "✖",   title: "Clear Format", cmd: "removeFormat"  },
  ],
];

type ImageSize = "full" | "half" | "left" | "right";

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const lastHtmlRef = useRef("");

  // Image insert modal state
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgCaption, setImgCaption] = useState("");
  const [imgSize, setImgSize] = useState<ImageSize>("full");
  const [imgTab, setImgTab] = useState<"url" | "upload">("url");

  // Save cursor position before opening modal
  const savedRange = useRef<Range | null>(null);

  // Initialise editor with existing content
  useEffect(() => {
    if (editorRef.current && value !== lastHtmlRef.current) {
      editorRef.current.innerHTML = value || "";
      lastHtmlRef.current = value || "";
      countWords(value || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countWords = (html: string) => {
    const text = html.replace(/<[^>]*>/g, " ").trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  };

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastHtmlRef.current = html;
    onChange(html);
    countWords(html);
  }, [onChange]);

  const exec = useCallback((cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg ?? "");
    handleInput();
  }, [handleInput]);

  const handleLink = useCallback(() => {
    const url = window.prompt("Enter URL (e.g. https://example.com):");
    if (url) exec("createLink", url);
  }, [exec]);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const openImgModal = () => {
    saveSelection();
    setImgUrl("");
    setImgAlt("");
    setImgCaption("");
    setImgSize("full");
    setImgTab("url");
    setImgModalOpen(true);
  };

  const getImgStyle = (size: ImageSize): string => {
    switch (size) {
      case "full":  return "display:block;width:100%;max-width:100%;height:auto;border-radius:10px;margin:18px 0;";
      case "half":  return "display:block;width:50%;max-width:50%;height:auto;border-radius:10px;margin:18px auto;";
      case "left":  return "float:left;width:44%;height:auto;border-radius:10px;margin:10px 18px 10px 0;";
      case "right": return "float:right;width:44%;height:auto;border-radius:10px;margin:10px 0 10px 18px;";
    }
  };

  const insertImage = (url: string) => {
    if (!url.trim()) return;
    restoreSelection();
    editorRef.current?.focus();

    const alt   = imgAlt || "Article image";
    const style = getImgStyle(imgSize);

    let html = `<img src="${url}" alt="${alt}" style="${style}" />`;
    if (imgCaption.trim()) {
      html = `<figure style="margin:18px 0;${imgSize === "left" ? "float:left;width:44%;margin-right:18px;" : imgSize === "right" ? "float:right;width:44%;margin-left:18px;" : ""}">
        ${html}
        <figcaption style="font-size:0.82rem;color:#64748b;text-align:center;margin-top:6px;font-style:italic;">${imgCaption}</figcaption>
      </figure>`;
    }
    // Add a clearfix after float images
    if (imgSize === "left" || imgSize === "right") {
      html += `<div style="clear:both;"></div>`;
    }

    document.execCommand("insertHTML", false, html);
    handleInput();
    setImgModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      insertImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  };

  const btnStyle = (isActive = false): React.CSSProperties => ({
    padding: "5px 10px",
    border: isActive ? "1.5px solid #e50914" : "1.5px solid #e5e5e5",
    borderRadius: "5px",
    background: isActive ? "#fff0f0" : "#ffffff",
    color: isActive ? "#e50914" : "#0a0a0a",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    lineHeight: 1.2,
    flexShrink: 0,
    transition: "all 0.12s ease",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
  });

  const sizeOptions: { value: ImageSize; label: string; desc: string }[] = [
    { value: "full",  label: "Full Width",   desc: "Spans entire column" },
    { value: "half",  label: "Half Width",   desc: "Centered 50%" },
    { value: "left",  label: "Float Left",   desc: "Text wraps right" },
    { value: "right", label: "Float Right",  desc: "Text wraps left" },
  ];

  return (
    <>
      <div style={{ border: isFocused ? "2px solid #e50914" : "2px solid #e5e5e5", borderRadius: "10px", overflow: "hidden", transition: "border-color 0.2s ease", boxShadow: isFocused ? "0 0 0 3px rgba(229,9,20,0.1)" : "none" }}>

        {/* Label bar */}
        <div style={{ padding: "10px 14px 0 14px", background: "#fafafa" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b6b6b" }}>
            ✍️ Article Content
          </span>
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", padding: "10px 14px", background: "#fafafa", borderBottom: "1.5px solid #e5e5e5", alignItems: "center" }}>
          {TOOLBAR_ROWS[0].map((btn, i) => {
            if (btn.title === "separator") {
              return <div key={i} style={{ width: "1px", height: "24px", background: "#d0d0d0", margin: "0 4px" }} />;
            }
            if (btn.title === "Insert Link") {
              return (
                <button key={i} type="button" title={btn.title} style={btnStyle()} onClick={handleLink}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e50914"; e.currentTarget.style.color = "#e50914"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#0a0a0a"; }}
                >
                  {btn.label}
                </button>
              );
            }
            if (btn.title === "Insert Image") {
              return (
                <button
                  key={i}
                  type="button"
                  title="Insert Image"
                  style={{ ...btnStyle(), background: "#fff7f0", borderColor: "#fb923c", color: "#ea580c", display: "flex", alignItems: "center", gap: "4px" }}
                  onClick={openImgModal}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e50914"; e.currentTarget.style.color = "#e50914"; e.currentTarget.style.background = "#fff0f0"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#fb923c"; e.currentTarget.style.color = "#ea580c"; e.currentTarget.style.background = "#fff7f0"; }}
                >
                  <span style={{ fontFamily: "sans-serif" }}>📷</span>
                  <span>Image</span>
                </button>
              );
            }
            return (
              <button
                key={i}
                type="button"
                title={btn.title}
                style={btnStyle()}
                onClick={() => exec(btn.cmd!, btn.arg)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#e50914"; e.currentTarget.style.color = "#e50914"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#0a0a0a"; }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* Editable Canvas */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          data-placeholder="Start writing your article here… Use headings, paragraphs, bullet lists, bold text and 📷 images to craft premium editorial content."
          style={{
            minHeight: "520px",
            padding: "24px 28px",
            outline: "none",
            fontSize: "1.05rem",
            lineHeight: "1.85",
            color: "#0f172a",
            background: "#ffffff",
            fontFamily: "'Georgia', 'Playfair Display', serif",
            wordBreak: "break-word",
          }}
        />

        {/* Footer: word count */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "#fafafa", borderTop: "1.5px solid #e5e5e5", fontSize: "0.74rem", color: "#6b6b6b", fontWeight: 500 }}>
          <span>Supports <b>bold</b>, <i>italic</i>, headings, lists, links &amp; <b style={{ color: "#ea580c" }}>📷 inline images</b></span>
          <span style={{ fontFeatureSettings: '"tnum"' }}>
            {wordCount > 0
              ? <><b style={{ color: "#e50914" }}>{wordCount}</b> words · {charCount} chars</>
              : "Begin writing above"}
          </span>
        </div>

        {/* Styles */}
        <style>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #b0b0b0;
            pointer-events: none;
            font-style: italic;
          }
          [contenteditable] h1 { font-size: 1.9rem; font-weight: 900; margin: 0.6em 0 0.3em; color: #0a0a0a; }
          [contenteditable] h2 { font-size: 1.4rem; font-weight: 800; margin: 0.6em 0 0.3em; color: #0a0a0a; }
          [contenteditable] h3 { font-size: 1.15rem; font-weight: 700; margin: 0.5em 0 0.25em; color: #0a0a0a; }
          [contenteditable] blockquote { border-left: 4px solid #e50914; margin: 1em 0; padding: 10px 18px; background: #fff5f5; border-radius: 0 8px 8px 0; font-style: italic; color: #444; }
          [contenteditable] pre { background: #1a1a1a; color: #f0f0f0; padding: 14px 16px; border-radius: 8px; font-family: monospace; font-size: 0.9rem; margin: 0.8em 0; overflow-x: auto; }
          [contenteditable] ul { padding-left: 1.5em; margin: 0.5em 0; }
          [contenteditable] ol { padding-left: 1.5em; margin: 0.5em 0; }
          [contenteditable] a { color: #e50914; text-decoration: underline; }
          [contenteditable] p { margin: 0.5em 0; }
          [contenteditable] img { max-width: 100%; border-radius: 10px; }
          [contenteditable] figure { margin: 18px 0; }
          [contenteditable] figcaption { font-size: 0.82rem; color: #64748b; text-align: center; font-style: italic; margin-top: 6px; }
        `}</style>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* ── IMAGE INSERT MODAL ─────────────────────────────────────────── */}
      {imgModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={(e) => { if (e.target === e.currentTarget) setImgModalOpen(false); }}
        >
          <div style={{ background: "#ffffff", borderRadius: "18px", width: "100%", maxWidth: "540px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden" }}>

            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "#fff7ed", padding: "8px", borderRadius: "10px", color: "#ea580c" }}>
                  <ImageIcon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>Insert Image</h3>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>Add an image inside your article at cursor position</p>
                </div>
              </div>
              <button onClick={() => setImgModalOpen(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "6px", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Tab switcher */}
              <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "10px", padding: "3px", gap: "2px" }}>
                {(["url", "upload"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setImgTab(tab)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: "8px",
                      border: "none",
                      background: imgTab === tab ? "#ffffff" : "transparent",
                      color: imgTab === tab ? "#0f172a" : "#64748b",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      boxShadow: imgTab === tab ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {tab === "url" ? <><Link2 size={14} /> Image URL</> : <><Upload size={14} /> Upload File</>}
                  </button>
                ))}
              </div>

              {/* URL Tab */}
              {imgTab === "url" && (
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px", color: "#334155" }}>
                    Image URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    value={imgUrl}
                    onChange={(e) => setImgUrl(e.target.value)}
                    autoFocus
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => { e.target.style.borderColor = "#e50914"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#cbd5e1"; }}
                  />
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt="preview"
                      style={{ marginTop: "10px", width: "100%", maxHeight: "180px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = "block"; }}
                    />
                  )}
                </div>
              )}

              {/* Upload Tab */}
              {imgTab === "upload" && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: "2px dashed #cbd5e1", borderRadius: "12px", padding: "30px", textAlign: "center", cursor: "pointer", background: "#f8fafc", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#e50914"; (e.currentTarget as HTMLDivElement).style.background = "#fff5f5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#cbd5e1"; (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
                >
                  <Upload size={32} style={{ color: "#94a3b8", marginBottom: "10px" }} />
                  <p style={{ margin: "0 0 4px 0", fontWeight: 700, color: "#334155", fontSize: "0.9rem" }}>Click to upload image</p>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.78rem" }}>PNG, JPG, GIF, WEBP supported</p>
                </div>
              )}

              {/* Alt text & Caption */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px", color: "#334155" }}>Alt Text</label>
                  <input
                    type="text"
                    placeholder="Describe the image..."
                    value={imgAlt}
                    onChange={(e) => setImgAlt(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "6px", color: "#334155" }}>Caption (optional)</label>
                  <input
                    type="text"
                    placeholder="Photo credit or caption..."
                    value={imgCaption}
                    onChange={(e) => setImgCaption(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "0.88rem", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Size / Layout options */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, display: "block", marginBottom: "8px", color: "#334155" }}>Image Layout</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                  {sizeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setImgSize(opt.value)}
                      style={{
                        padding: "10px 6px",
                        borderRadius: "10px",
                        border: imgSize === opt.value ? "2px solid #e50914" : "2px solid #e2e8f0",
                        background: imgSize === opt.value ? "#fff0f0" : "#f8fafc",
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <div style={{ fontSize: "0.78rem", fontWeight: 800, color: imgSize === opt.value ? "#e50914" : "#0f172a", marginBottom: "2px" }}>{opt.label}</div>
                      <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Insert button (only for URL tab) */}
              {imgTab === "url" && (
                <button
                  type="button"
                  onClick={() => insertImage(imgUrl)}
                  disabled={!imgUrl.trim()}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: imgUrl.trim() ? "#e50914" : "#cbd5e1",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "0.92rem",
                    fontWeight: 800,
                    cursor: imgUrl.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: imgUrl.trim() ? "0 4px 14px rgba(229,9,20,0.35)" : "none",
                    transition: "all 0.2s ease"
                  }}
                >
                  <ImageIcon size={18} />
                  Insert Image into Article
                </button>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
