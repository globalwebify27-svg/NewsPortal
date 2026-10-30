import { describe, it, expect } from "vitest";
import {
  gzipCompress,
  gzipDecompress,
  stripEmptyFields,
  createCompressedResponse,
} from "./compression";
import { NextRequest } from "next/server";

describe("Payload Compression Utility (lib/compression.ts)", () => {
  it("should compress and decompress data accurately with gzip", () => {
    const rawData = JSON.stringify({
      title: "Global Summit 2026: Historic Technology Accords Signed",
      articles: Array.from({ length: 50 }, (_, i) => ({
        id: `art_${i}`,
        headline: `Headline story ${i}`,
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10),
      })),
    });

    const compressed = gzipCompress(rawData);
    expect(compressed.length).toBeLessThan(rawData.length);
    expect(compressed.length / rawData.length).toBeLessThan(0.3); // >70% compression ratio

    const decompressed = gzipDecompress(compressed);
    expect(decompressed).toBe(rawData);
  });

  it("should strip null and undefined fields from objects to reduce payload size", () => {
    const input = {
      id: "123",
      title: "Active News",
      draftContent: undefined,
      legacyNotes: null,
      meta: {
        author: "Editor",
        unusedKey: null,
      },
    };

    const cleaned = stripEmptyFields(input);
    expect(cleaned).toEqual({
      id: "123",
      title: "Active News",
      meta: {
        author: "Editor",
      },
    });
    expect((cleaned as any).draftContent).toBeUndefined();
    expect((cleaned as any).legacyNotes).toBeUndefined();
  });

  it("should return a clean NextResponse with JSON headers", () => {
    const payload = { success: true, count: 100 };
    const req = new NextRequest("http://localhost:3000/api/v1/articles");
    const res = createCompressedResponse(payload, req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
  });
});

