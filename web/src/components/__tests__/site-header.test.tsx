import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { SiteHeader } from "../site-header";

const pushMock = vi.hoisted(() => vi.fn());
const mockCategories = vi.hoisted(() => [
  { id: "1", name: "Decision Making", slug: "decision-making", created_at: "", updated_at: "" },
  { id: "2", name: "Systems Thinking", slug: "systems-thinking", created_at: "", updated_at: "" },
]);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/categories", () => ({
  listCategories: vi.fn().mockResolvedValue(mockCategories),
}));

describe("SiteHeader dropdown browse menu", () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ role: null }),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows categories in dropdown and navigates when clicking an item", async () => {
    const user = userEvent.setup();
    render(<SiteHeader />);

    const browseButton = screen.getByRole("button", { name: /browse/i });
    fireEvent.focus(browseButton);
    fireEvent.keyDown(browseButton, { key: "ArrowDown" });

    // Dropdown should list all items including "All mental models" and category names.
    expect(await screen.findByText(/All mental models/i)).toBeInTheDocument();
    expect(screen.getByText("Decision Making")).toBeInTheDocument();
    expect(screen.getByText("Systems Thinking")).toBeInTheDocument();

    await user.click(screen.getByText("Systems Thinking"));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/library?category=systems-thinking"));

    await user.click(screen.getByText("All mental models"));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/library"));
  });
});
