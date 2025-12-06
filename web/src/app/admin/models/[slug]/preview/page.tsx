import { notFound } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { fetchModelBySlug } from "@/lib/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminModelPreview({ params }: { params: { slug: string } }) {
  const model = await fetchModelBySlug(params.slug).catch(() => null);
  if (!model) notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">Preview</p>
          <h1 className="font-display text-3xl font-semibold text-white">{model.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {(model.tags ?? []).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {model.category && <Badge variant="outline">{model.category}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-[#1e3442] bg-[#10202d] text-slate-100">
            <a href={`/admin/models/${model.slug}/edit`}>Edit</a>
          </Button>
          <Button asChild className="bg-[#2ea0e1] text-slate-900 hover:bg-[#248bc5]">
            <a href={`/models/${model.slug}`} target="_blank" rel="noreferrer">
              View Public
            </a>
          </Button>
        </div>
      </div>

      {model.cover_url && (
        <div className="relative h-64 w-full overflow-hidden rounded-xl">
          <Image src={model.cover_url} alt={model.title} fill className="object-cover" sizes="100vw" />
        </div>
      )}

      <article className="prose prose-invert prose-dark max-w-none space-y-6 text-[15px] leading-7">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>
          {model.body ?? model.summary ?? ""}
        </ReactMarkdown>
      </article>
    </div>
  );
}
