import { describe, expect, it, vi } from "vitest";
import { generateMetadata } from "@/app/library/page";

const mockCategories = vi.hoisted(() => [
  { id: "1", name: "Decision Making", slug: "decision-making", created_at: "", updated_at: "" },
  { id: "2", name: "Systems Thinking", slug: "systems-thinking", created_at: "", updated_at: "" },
]);

vi.mock("@/lib/categories", () => ({
  listCategories: vi.fn().mockResolvedValue(mockCategories),
}));

describe("LibraryPage metadata", () => {
  it("returns All Mental Models when no category filter", async () => {
    const meta = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(meta.title).toBe("All Mental Models");
  });

  it("returns category-specific title when category filter exists", async () => {
    const meta = await generateMetadata({ searchParams: Promise.resolve({ category: "systems-thinking" }) });
    expect(meta.title).toBe("Systems Thinking Mental Models");
  });
});
