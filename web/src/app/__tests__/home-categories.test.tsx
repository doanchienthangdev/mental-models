import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "@/app/page";

const mockCategories = vi.hoisted(() => [
  { id: "cat-1", name: "Decision Making", slug: "decision-making" },
  { id: "cat-2", name: "Systems Thinking", slug: "systems-thinking" },
  { id: "cat-3", name: "Product Strategy", slug: "product-strategy" },
  { id: "cat-4", name: "Leadership", slug: "leadership" },
]);

vi.mock("@/lib/models", () => ({
  fetchModels: vi.fn().mockResolvedValue({ data: [] }),
}));

vi.mock("@/lib/categories", () => ({
  listCategories: vi.fn().mockResolvedValue(mockCategories),
}));

vi.mock("@/lib/tags", () => ({
  listTags: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/components/hero-globe", () => ({
  HeroGlobe: () => <div data-testid="hero-globe-mock" />,
}));

describe("HomePage categories section", () => {
  it("renders Categories heading and a card for each category", async () => {
    const ui = await HomePage();
    render(ui);

    expect(screen.getByRole("heading", { name: "Mental Model Categories" })).toBeInTheDocument();
    mockCategories.forEach((cat) => {
      expect(screen.getByRole("link", { name: new RegExp(cat.name, "i") })).toHaveAttribute(
        "href",
        `/library?category=${cat.slug}`,
      );
    });
  });

  it("shows exactly one card per category returned", async () => {
    const ui = await HomePage();
    render(ui);

    const links = screen.getAllByRole("link", { name: /explore models in this category/i });
    expect(links).toHaveLength(mockCategories.length);
  });
});
