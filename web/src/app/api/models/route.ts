import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createModelEntry } from "@/lib/models";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, summary, content, tags, category } = body;
    if (!title || !slug || !summary || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const readTime = Math.max(1, Math.round(content.split(/\s+/).length / 200));
    const created = await createModelEntry({
      title,
      slug,
      summary,
      body: content,
      tags,
      category,
      readTime,
    });
    revalidatePath("/");
    revalidatePath(`/models/${created.slug}`);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
