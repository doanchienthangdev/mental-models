import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { LibraryClient } from "@/components/library-client";
import type { ModelRecord } from "@/lib/models";

const pushMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const baseCategories = [
  { id: "1", name: "Decision Making", slug: "decision-making", created_at: "", updated_at: "" },
  { id: "2", name: "Systems Thinking", slug: "systems-thinking", created_at: "", updated_at: "" },
  { id: "3", name: "Business & Economics", slug: "business-economics", created_at: "", updated_at: "" },
];

const baseTags: { id: string; name: string; slug?: string }[] = [];

const baseModels: ModelRecord[] = [];

const renderClient = (overrides?: Partial<React.ComponentProps<typeof LibraryClient>>) =>
  render(
    <LibraryClient
      models={baseModels}
      categories={baseCategories}
      tags={baseTags as never}
      totalCount={0}
      pageSize={12}
      {...overrides}
    />,
  );

describe("LibraryClient category selection", () => {
  beforeEach(() => {
    pushMock.mockReset();
  });

  it("shows category name as title and breadcrumb when exactly one category is selected", () => {
    renderClient({ initialSelectedCategories: ["systems-thinking"] });

    expect(screen.getByRole("heading", { name: "Systems Thinking" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/library");
    expect(screen.getByText("Systems Thinking")).toBeInTheDocument();
  });

  it("keeps default title and breadcrumb when no category is selected", () => {
    renderClient();

    expect(screen.getByRole("heading", { name: "Mental Models Library" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Library" })).not.toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
  });

  it("enforces single-select in category modal and updates URL and title but keeps button label static", async () => {
    const user = userEvent.setup();
    renderClient();

    await user.click(screen.getByRole("button", { name: /categories/i }));

    const firstRow = screen.getByText("Decision Making").closest("label") as HTMLElement;
    const secondRow = screen.getByText("Systems Thinking").closest("label") as HTMLElement;

    await user.click(within(firstRow).getByRole("radio"));
    expect(within(firstRow).getByRole("radio")).toBeChecked();

    await user.click(within(secondRow).getByRole("radio"));
    expect(within(secondRow).getByRole("radio")).toBeChecked();
    expect(within(firstRow).getByRole("radio")).not.toBeChecked();

    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/library?category=systems-thinking"));
    expect(screen.getByRole("heading", { name: "Systems Thinking" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Categories" })).toBeInTheDocument();
  });

  it("keeps button label as Categories even when preselected", () => {
    renderClient({ initialSelectedCategories: ["decision-making"] });
    expect(screen.getByRole("button", { name: "Categories" })).toBeInTheDocument();
  });

  it("keeps button label static after selecting category with special characters", async () => {
    const user = userEvent.setup();
    renderClient();

    await user.click(screen.getByRole("button", { name: /categories/i }));
    const bizRow = screen.getByText("Business & Economics").closest("label") as HTMLElement;
    await user.click(within(bizRow).getByRole("radio"));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByRole("button", { name: "Categories" })).toBeInTheDocument();
  });

  it("renders tag chips using tag names when selected by id", () => {
    renderClient({
      tags: [{ id: "tag-1", name: "Strategy", slug: "strategy" } as never],
      initialSelectedTags: ["tag-1"],
    });
    expect(screen.getByText("Strategy")).toBeInTheDocument();
  });
});
