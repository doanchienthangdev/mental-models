import { supabase, supabaseAdmin } from "./supabase/client";
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
  if (!supabaseAdmin) throw new Error("Missing service role key");
  const { data, error } = await supabaseAdmin.from("tags").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTag(id: string, input: Database["public"]["Tables"]["tags"]["Update"]) {
  if (!supabaseAdmin) throw new Error("Missing service role key");
  const { data, error } = await supabaseAdmin.from("tags").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTag(id: string) {
  if (!supabaseAdmin) throw new Error("Missing service role key");
  const { error } = await supabaseAdmin.from("tags").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
