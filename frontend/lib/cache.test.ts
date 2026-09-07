import { describe, it, expect, beforeEach } from "vitest";
import { serverCache, TTL } from "./cache";

describe("Server-Side In-Memory Cache (lib/cache.ts)", () => {
  beforeEach(() => {
    serverCache.clear();
  });

  it("should store and retrieve cached values within TTL", () => {
    serverCache.set("test:key1", { success: true, count: 42 }, TTL.ARTICLES_LIST);
    const cached = serverCache.get<{ success: boolean; count: number }>("test:key1");

    expect(cached).not.toBeNull();
    expect(cached?.success).toBe(true);
    expect(cached?.count).toBe(42);
  });

  it("should return null for non-existent keys", () => {
    const cached = serverCache.get("non:existent");
    expect(cached).toBeNull();
  });

  it("should invalidate keys by prefix correctly", () => {
    serverCache.set("articles:1", { id: "1" }, TTL.ARTICLES_LIST);
    serverCache.set("articles:2", { id: "2" }, TTL.ARTICLES_LIST);
    serverCache.set("settings:logo", { logo: "url" }, TTL.SETTINGS);

    serverCache.invalidatePrefix("articles:");

    expect(serverCache.get("articles:1")).toBeNull();
    expect(serverCache.get("articles:2")).toBeNull();
    expect(serverCache.get("settings:logo")).not.toBeNull();
  });

  it("should delete specific keys", () => {
    serverCache.set("key_to_delete", "value", TTL.SETTINGS);
    expect(serverCache.get("key_to_delete")).toBe("value");

    serverCache.delete("key_to_delete");
    expect(serverCache.get("key_to_delete")).toBeNull();
  });
});
