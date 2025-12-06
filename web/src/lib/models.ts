import type { Database } from "./supabase/types";
import { supabase, getSupabaseAdminClient } from "./supabase/client";

export type ModelRecord = Database["public"]["Tables"]["models"]["Row"];

export type ModelInput = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  tags?: string[];
  category?: string;
  readTime?: number;
};

type FetchOptions = {
  status?: string;
  statuses?: string[];
  search?: string;
  categories?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
  sort?: "recent" | "oldest";
};

export async function fetchModels(
  options: FetchOptions = {},
): Promise<{ data: ModelRecord[]; count: number }> {
  const {
    status,
    statuses,
    search,
    categories,
    tags,
    limit,
    offset,
    sort = "recent",
  } = options;

  let query = supabase
    .from("models")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: sort === "oldest" });

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  } else if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    const sanitized = search.replace(/["'%;]/g, "").trim();
    if (sanitized.length > 0) {
      query = query.ilike("title", `%${sanitized}%`);
    }
  }

  if (categories && categories.length > 0) {
    query = query.in("category", categories);
  }

  if (tags && tags.length > 0) {
    query = query.overlaps("tags", tags);
  }

  if (typeof offset === "number" && typeof limit === "number") {
    query = query.range(offset, offset + limit - 1);
  } else if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return {
    data: (data ?? []) as ModelRecord[],
    count: typeof count === "number" ? count : data?.length ?? 0,
  };
}

export async function fetchModelBySlug(slug: string): Promise<ModelRecord> {
  const { data, error } = await supabase.from("models").select("*").eq("slug", slug).single();
  if (error) {
    throw new Error(error.message);
  }
  return data as ModelRecord;
}

export async function listModelStatuses() {
  const { data, error } = await supabase.from("models").select("status");
  if (error) {
    throw new Error(error.message);
  }
  const unique = new Set<string>();
  for (const row of data ?? []) {
    if (row.status) {
      unique.add(row.status);
    }
  }
  return Array.from(unique);
}

export async function createModelEntry(input: ModelInput): Promise<ModelRecord> {
  const admin = getSupabaseAdminClient();
  const payload: Database["public"]["Tables"]["models"]["Insert"] = {
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    body: input.body,
    tags: input.tags ?? [],
    category: input.category,
    read_time: input.readTime ?? null,
    status: "published",
    audio_status: "idle",
  };
  const { data, error } = await admin.from("models").insert(payload).select().single();
  if (error) {
    throw new Error(error.message);
  }
  return data as ModelRecord;
}
