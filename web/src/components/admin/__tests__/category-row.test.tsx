import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { CategoryRow } from "@/components/admin/category-row";

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  };
});

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useActionState: (action: unknown, initial: unknown) => [initial, action],
  };
});

describe("CategoryRow", () => {
  it("renders without crashing and binds actions", () => {
    const updateAction = vi.fn();
    const deleteAction = vi.fn();
    render(
      <CategoryRow
        category={{
          id: "1",
          name: "Business & Economics",
          slug: "business-economics",
          description: "Biz",
          created_at: "",
          updated_at: "",
        }}
        updateAction={updateAction as never}
        deleteAction={deleteAction as never}
      />,
    );

    expect(screen.getByDisplayValue("Business & Economics")).toBeInTheDocument();
    expect(screen.getByDisplayValue("business-economics")).toBeInTheDocument();
  });
});
