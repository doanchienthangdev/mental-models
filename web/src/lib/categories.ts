import { supabase, supabaseAdmin } from "./supabase/client";
import type { Database } from "./supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

export async function listCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name");
    if (error) throw new Error(error.message);
    return data ?? ([] as Category[]);
  } catch (err) {
    console.error("listCategories failed", err);
    return [] as Category[];
  }
}

export async function createCategory(input: Database["public"]["Tables"]["categories"]["Insert"]) {
  if (!supabaseAdmin) throw new Error("Missing service role key");
  const { data, error } = await supabaseAdmin.from("categories").insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(id: string, input: Database["public"]["Tables"]["categories"]["Update"]) {
  if (!supabaseAdmin) throw new Error("Missing service role key");
  const { data, error } = await supabaseAdmin.from("categories").update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: string) {
  if (!supabaseAdmin) throw new Error("Missing service role key");
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
