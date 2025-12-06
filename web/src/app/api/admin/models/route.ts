import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type ModelInsert = Database["public"]["Tables"]["models"]["Insert"];

type ModelCategoryRow = Database["public"]["Tables"]["model_categories"]["Insert"];
type ModelTagRow = Database["public"]["Tables"]["model_tags"]["Insert"];

async function upsertRelations(modelId: string, categoryIds?: string[], tagIds?: string[]) {
  const admin = getSupabaseAdminClient();
  if (categoryIds && categoryIds.length > 0) {
    const rows = categoryIds.map(
      (category_id): ModelCategoryRow => ({ model_id: modelId, category_id }),
    ) as ModelCategoryRow[];
    // Supabase client typing struggles with composite keys, so cast builder temporarily.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("model_categories") as any).upsert(rows, {
      onConflict: "model_id,category_id",
    });
    if (error) throw new Error(error.message);
  }
  if (tagIds && tagIds.length > 0) {
    const rows = tagIds.map((tag_id): ModelTagRow => ({ model_id: modelId, tag_id })) as ModelTagRow[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin.from("model_tags") as any).upsert(rows, {
      onConflict: "model_id,tag_id",
    });
    if (error) throw new Error(error.message);
  }
}

async function upsertAudio(modelId: string, audioUrl?: string | null) {
  if (!audioUrl) return;
  const admin = getSupabaseAdminClient();
  // Supabase typings have trouble inferring composite updates for audio assets, so cast builder.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioTable = admin.from("audio_assets") as any;
  await audioTable.update({ is_primary: false }).eq("model_id", modelId);
  await audioTable
    .insert({
      model_id: modelId,
      audio_url: audioUrl,
      status: "ready",
      is_primary: true,
    })
    .select()
    .single();
}

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const admin = getSupabaseAdminClient();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (slug) {
      const { data, error } = await admin.from("models").select("*").eq("slug", slug).single();
      if (error) throw new Error(error.message);
      return NextResponse.json({ data });
    } else {
      const { data, error } = await admin.from("models").select("*").order("created_at", { ascending: false });
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
    const admin = getSupabaseAdminClient();
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelsTable = admin.from("models") as any;
    const { data, error } = await modelsTable.insert(model).select().single();
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
    const admin = getSupabaseAdminClient();
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelsTable = admin.from("models") as any;
    const { data, error } = await modelsTable.update(update).eq("id", body.id).select().single();
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
    const admin = getSupabaseAdminClient();
    const { id } = await request.json();
    const { error } = await admin.from("models").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
