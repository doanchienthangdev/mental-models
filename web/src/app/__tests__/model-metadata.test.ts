import { describe, expect, it, vi } from "vitest";
import { generateMetadata } from "@/app/models/[slug]/page";

const modelBase = {
  id: "m1",
  title: "Strategy Model",
  slug: "strategy-model",
  summary: "A concise strategy model for better decisions.",
  body: "Full body",
  category: "strategy",
  tags: ["tag-1"],
  cover_url: "https://example.com/cover.png",
  audio_url: null,
  read_time: 5,
  status: "published",
  audio_status: "ready",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const fetchModelBySlug = vi.fn(async (slug: string) => {
  if (slug === "not-found") throw new Error("not found");
  if (slug === "no-cover") {
    return { ...modelBase, cover_url: null };
  }
  return modelBase;
});

vi.mock("@/lib/models", () => ({
  fetchModelBySlug,
}));

describe("Model detail metadata", () => {
  it("includes title, description, and cover in open graph", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: "strategy-model" }) });
    expect(meta.title).toBe("Strategy Model - Mental Models");
    expect(meta.description).toBe("A concise strategy model for better decisions.");
    expect(meta.openGraph?.images?.[0]?.url).toBe(modelBase.cover_url);
  });

  it("falls back when model is not found", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: "not-found" }) });
    expect(meta.title).toBe("Mental Model | Not Found");
  });

  it("uses favicon when cover is missing", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ slug: "no-cover" }) });
    expect(meta.openGraph?.images?.[0]?.url).toBe("/images/favicon.ico");
  });
});
