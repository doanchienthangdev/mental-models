import { supabase, getSupabaseAdminClient } from "./supabase/client";
import type { Database } from "./supabase/types";

export type Tag = Database["public"]["Tables"]["tags"]["Row"];

export async function listTags(): Promise<Tag[]> {
  try {
    const { data, error } = await supabase.from("tags").select("*").order("name");
    if (error) throw new Error(error.message);
    return data ?? ([] as Tag[]);
  } catch (err) {
    console.error("listTags failed", err);
    return [] as Tag[];
  }
}

export async function createTag(input: Database["public"]["Tables"]["tags"]["Insert"]) {
  const admin = getSupabaseAdminClient();
  // Supabase typing cannot infer payload when chaining select().single(), so cast builder temporarily.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagsTable = admin.from("tags") as any;
  const { data, error } = await tagsTable.insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTag(id: string, input: Database["public"]["Tables"]["tags"]["Update"]) {
  const admin = getSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagsTable = admin.from("tags") as any;
  const { data, error } = await tagsTable.update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTag(id: string) {
  const admin = getSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagsTable = admin.from("tags") as any;
  const { error } = await tagsTable.delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
