import { describe, expect, it, vi, beforeEach } from "vitest";
import { fetchModels, listModelStatuses } from "@/lib/models";

const tableResults: Record<string, any> = {};

vi.mock("@/lib/supabase/client", () => {
  const createQuery = (table: string) => {
    const query: any = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      overlaps: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (resolve: (value: any) => void) => Promise.resolve(tableResults[table]).then(resolve),
    };
    return query;
  };

  return {
    supabase: {
      from: (table: string) => createQuery(table),
    },
    getSupabaseAdminClient: vi.fn(),
  };
});

describe("lib/models data helpers", () => {
  beforeEach(() => {
    tableResults.models = { data: [], error: null, count: 0 };
  });

  it("returns data and count from fetchModels", async () => {
    tableResults.models = {
      data: [{ id: "1", title: "Test", slug: "test" }],
      error: null,
      count: 1,
    };
    const { data, count } = await fetchModels();
    expect(count).toBe(1);
    expect(data[0].title).toBe("Test");
  });

  it("throws when Supabase returns error", async () => {
    tableResults.models = { data: null, error: { message: "failed" } };
    await expect(fetchModels()).rejects.toThrow("failed");
  });

  it("collects unique statuses", async () => {
    tableResults.models = {
      data: [{ status: "ready" }, { status: "ready" }, { status: "draft" }],
      error: null,
    };
    const statuses = await listModelStatuses();
    expect(statuses).toEqual(expect.arrayContaining(["ready", "draft"]));
  });
});
