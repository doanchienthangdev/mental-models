import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/auth";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/categories";

export async function GET(request: Request) {
  try {
    requireAdminToken(request);
    const categories = await listCategories();
    return NextResponse.json({ data: categories });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    requireAdminToken(request);
    const body = await request.json();
    const created = await createCategory({ name: body.name, slug: body.slug, description: body.description });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    requireAdminToken(request);
    const body = await request.json();
    const updated = await updateCategory(body.id, {
      name: body.name,
      slug: body.slug,
      description: body.description,
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    requireAdminToken(request);
    const { id } = await request.json();
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
