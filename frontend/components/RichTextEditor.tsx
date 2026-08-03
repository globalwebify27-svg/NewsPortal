"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";

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
  // Row 1 – inline formatting
  [
    { label: "B",  title: "Bold",          cmd: "bold"          },
    { label: "I",  title: "Italic",        cmd: "italic"        },
    { label: "U",  title: "Underline",     cmd: "underline"     },
    { label: "S̶",  title: "Strikethrough", cmd: "strikeThrough" },
    { label: "|",  title: "separator" },
    { label: "H1", title: "Heading 1",     cmd: "formatBlock", arg: "h1", isBlock: true },
    { label: "H2", title: "Heading 2",     cmd: "formatBlock", arg: "h2", isBlock: true },
    { label: "H3", title: "Heading 3",     cmd: "formatBlock", arg: "h3", isBlock: true },
    { label: "¶",  title: "Paragraph",     cmd: "formatBlock", arg: "p",  isBlock: true },
    { label: "|",  title: "separator" },
    { label: "≡",  title: "Bullet List",   cmd: "insertUnorderedList" },
    { label: "①",  title: "Ordered List",  cmd: "insertOrderedList"   },
    { label: "❝",  title: "Blockquote",    cmd: "formatBlock", arg: "blockquote", isBlock: true },
    { label: "</>", title: "Inline Code",  cmd: "formatBlock", arg: "pre", isBlock: true },
    { label: "|",  title: "separator" },
    { label: "⬛L", title: "Align Left",   cmd: "justifyLeft"   },
    { label: "⬛C", title: "Align Center", cmd: "justifyCenter" },
    { label: "⬛R", title: "Align Right",  cmd: "justifyRight"  },
    { label: "|",  title: "separator" },
    { label: "🔗", title: "Insert Link"   },
    { label: "✖",  title: "Clear Format", cmd: "removeFormat"  },
  ],
];

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const lastHtmlRef = useRef("");

  // Initialise editor with existing content (e.g. when editing an article)
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

  return (
    <div style={{ border: isFocused ? "2px solid #e50914" : "2px solid #e5e5e5", borderRadius: "10px", overflow: "hidden", transition: "border-color 0.2s ease", boxShadow: isFocused ? "0 0 0 3px rgba(229,9,20,0.1)" : "none" }}>

      {/* Label bar */}
      <div style={{ padding: "10px 14px 0 14px", background: "#fafafa" }}>
        <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b6b6b" }}>
          ✍️ Article Content
        </span>
      </div>

      {/* Toolbar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        padding: "10px 14px",
        background: "#fafafa",
        borderBottom: "1.5px solid #e5e5e5",
        alignItems: "center",
      }}>
        {TOOLBAR_ROWS[0].map((btn, i) => {
          if (btn.title === "separator") {
            return (
              <div key={i} style={{ width: "1px", height: "24px", background: "#d0d0d0", margin: "0 4px" }} />
            );
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
        data-placeholder="Start writing your article here…  Use headings, paragraphs, bullet lists and bold text to structure premium editorial content."
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
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 14px",
        background: "#fafafa",
        borderTop: "1.5px solid #e5e5e5",
        fontSize: "0.74rem",
        color: "#6b6b6b",
        fontWeight: 500,
      }}>
        <span>Supports <b>bold</b>, <i>italic</i>, headings, lists &amp; links</span>
        <span style={{ fontFeatureSettings: "\"tnum\"" }}>
          {wordCount > 0
            ? <><b style={{ color: "#e50914" }}>{wordCount}</b> words · {charCount} chars</>
            : "Begin writing above"}
        </span>
      </div>

      {/* Styles for placeholder & content formatting */}
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
      `}</style>
    </div>
  );
}
