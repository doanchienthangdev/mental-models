import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth";
import { createTag, deleteTag, listTags, updateTag } from "@/lib/tags";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const tags = await listTags();
    return NextResponse.json({ data: tags });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const body = await request.json();
    const created = await createTag({ name: body.name, slug: body.slug });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    requireAdminToken(request);
    const body = await request.json();
    const updated = await updateTag(body.id, { name: body.name, slug: body.slug });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    requireAdminToken(request);
    const { id } = await request.json();
    await deleteTag(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
