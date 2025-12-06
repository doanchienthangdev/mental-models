import { render, screen } from "@testing-library/react";
import { FeaturedModelCard } from "@/components/featured-model-card";
import type { ModelRecord } from "@/lib/models";

const baseModel: ModelRecord = {
  id: "model-1",
  title: "Systems Thinking",
  slug: "systems-thinking",
  summary: "Sample summary",
  body: "Full body content",
  tags: ["decision-making", "strategy"],
  category: "strategy",
  cover_url: "https://example.com/cover.jpg",
  audio_url: null,
  read_time: 7,
  status: "published",
  audio_status: "ready",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("FeaturedModelCard", () => {
  it("renders model content, tags, and metadata", () => {
    render(
      <FeaturedModelCard
        model={baseModel}
        summary="Trimmed summary"
        tagNames={["Decision Making", "Strategy"]}
        categoryName="Strategy"
        tagPalette={["bg-blue-500 text-white", "bg-green-500 text-white"]}
        audioStatusLabel="Audio Ready"
      />,
    );

    expect(screen.getByRole("heading", { name: "Systems Thinking" })).toBeInTheDocument();
    expect(screen.getByText("Trimmed summary")).toBeInTheDocument();
    expect(screen.getByText("Audio Ready")).toBeInTheDocument();
    const strategyLabels = screen.getAllByText("Strategy");
    expect(strategyLabels.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Decision Making")).toBeInTheDocument();
  });
});
