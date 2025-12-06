import { describe, expect, it, vi, beforeEach } from "vitest";
import { fetchModels, listModelStatuses } from "@/lib/models";

type TableResult = {
  data: unknown;
  error: null | { message: string };
  count?: number;
};

const tableResults: Record<string, TableResult> = {};

type ChainMethod = () => SupabaseQuery;

type SupabaseQuery = {
  select: ChainMethod;
  order: ChainMethod;
  in: ChainMethod;
  eq: ChainMethod;
  ilike: ChainMethod;
  overlaps: ChainMethod;
  range: ChainMethod;
  limit: ChainMethod;
  then: (resolve: (value: TableResult) => unknown) => Promise<unknown>;
};

vi.mock("@/lib/supabase/client", () => {
  const createQuery = (table: string): SupabaseQuery => {
    const chain: SupabaseQuery = {
      select: vi.fn<ChainMethod>(() => chain),
      order: vi.fn<ChainMethod>(() => chain),
      in: vi.fn<ChainMethod>(() => chain),
      eq: vi.fn<ChainMethod>(() => chain),
      ilike: vi.fn<ChainMethod>(() => chain),
      overlaps: vi.fn<ChainMethod>(() => chain),
      range: vi.fn<ChainMethod>(() => chain),
      limit: vi.fn<ChainMethod>(() => chain),
      then: (resolve) => Promise.resolve(tableResults[table]).then(resolve),
    };
    return chain;
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
