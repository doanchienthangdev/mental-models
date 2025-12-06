import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type ModelInsert = Database["public"]["Tables"]["models"]["Insert"];

type ModelCategoryRow = Database["public"]["Tables"]["model_categories"]["Insert"];
type ModelTagRow = Database["public"]["Tables"]["model_tags"]["Insert"];

async function upsertRelations(modelId: string, categoryIds?: string[], tagIds?: string[]) {
  if (!supabaseAdmin) throw new Error("Missing service role key");
  if (categoryIds && categoryIds.length > 0) {
    const rows: ModelCategoryRow[] = categoryIds.map((category_id) => ({ model_id: modelId, category_id }));
    await supabaseAdmin
      .from<Database["public"]["Tables"]["model_categories"]["Insert"]>("model_categories")
      .upsert(rows, {
        onConflict: "model_id,category_id",
      });
  }
  if (tagIds && tagIds.length > 0) {
    const rows: ModelTagRow[] = tagIds.map((tag_id) => ({ model_id: modelId, tag_id }));
    await supabaseAdmin
      .from<Database["public"]["Tables"]["model_tags"]["Insert"]>("model_tags")
      .upsert(rows, {
        onConflict: "model_id,tag_id",
      });
  }
}

async function upsertAudio(modelId: string, audioUrl?: string | null) {
  if (!supabaseAdmin || !audioUrl) return;
  await supabaseAdmin.from("audio_assets").update({ is_primary: false }).eq("model_id", modelId);
  await supabaseAdmin
    .from("audio_assets")
    .insert({ model_id: modelId, audio_url: audioUrl, status: "ready", is_primary: true })
    .select()
    .single();
}

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    if (!supabaseAdmin) throw new Error("Missing service role key");
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (slug) {
      const { data, error } = await supabaseAdmin.from("models").select("*").eq("slug", slug).single();
      if (error) throw new Error(error.message);
      return NextResponse.json({ data });
    } else {
      const { data, error } = await supabaseAdmin.from("models").select("*").order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return NextResponse.json({ data });
    }
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    if (!supabaseAdmin) throw new Error("Missing service role key");
    const body = await request.json();
    const model: ModelInsert = {
      title: body.title,
      slug: body.slug,
      summary: body.summary,
      body: body.body,
      tags: body.tags ?? [],
      category: body.category ?? null,
      cover_url: body.cover_url ?? null,
      audio_url: body.audio_url ?? null,
      read_time: body.read_time ?? null,
      status: body.status ?? "published",
      audio_status: body.audio_url ? "ready" : body.audio_status ?? "idle",
    };
    const { data, error } = await supabaseAdmin.from("models").insert(model).select().single();
    if (error) throw new Error(error.message);
    await upsertRelations(data.id, body.category_ids, body.tag_ids);
    await upsertAudio(data.id, body.audio_url);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    requireAdminToken(request);
    if (!supabaseAdmin) throw new Error("Missing service role key");
    const body = await request.json();
    const update = {
      title: body.title,
      slug: body.slug,
      summary: body.summary,
      body: body.body,
      tags: body.tags,
      category: body.category,
      cover_url: body.cover_url,
      audio_url: body.audio_url,
      read_time: body.read_time,
      status: body.status,
      audio_status: body.audio_url ? "ready" : body.audio_status,
    } as Database["public"]["Tables"]["models"]["Update"];
    const { data, error } = await supabaseAdmin.from("models").update(update).eq("id", body.id).select().single();
    if (error) throw new Error(error.message);
    await upsertRelations(data.id, body.category_ids, body.tag_ids);
    await upsertAudio(data.id, body.audio_url);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    requireAdminToken(request);
    if (!supabaseAdmin) throw new Error("Missing service role key");
    const { id } = await request.json();
    const { error } = await supabaseAdmin.from("models").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
