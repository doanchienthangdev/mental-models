import { supabase, getSupabaseAdminClient } from "./supabase/client";
import type { Database } from "./supabase/types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

type Tag = Database["public"]["Tables"]["tags"]["Row"];

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

export async function createCategory(input: Database["public"]["Tables"]["categories"]["Insert"]) {
  const admin = getSupabaseAdminClient();
  // Supabase generics struggle when using .insert().select().single() in strict mode; cast builder temporarily.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesTable = admin.from("categories") as any;
  const { data, error } = await categoriesTable.insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(id: string, input: Database["public"]["Tables"]["categories"]["Update"]) {
  const admin = getSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesTable = admin.from("categories") as any;
  const { data, error } = await categoriesTable.update(input).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: string) {
  const admin = getSupabaseAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const categoriesTable = admin.from("categories") as any;
  const { error } = await categoriesTable.delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
