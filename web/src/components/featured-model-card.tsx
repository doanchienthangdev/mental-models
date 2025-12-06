import Link from "next/link";
import Image from "next/image";
import type { ModelRecord } from "@/lib/models";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type FeaturedModelCardProps = {
  model: ModelRecord;
  summary: string;
  tagNames: string[];
  categoryName: string;
  tagPalette: string[];
  audioStatusLabel: string;
};

export function FeaturedModelCard({ model, summary, tagNames, categoryName, tagPalette, audioStatusLabel }: FeaturedModelCardProps) {
  return (
    <Link
      key={model.slug}
      href={`/models/${model.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d]/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(46,160,225,0.25)]"
    >
      <div className="relative h-[180px] w-full bg-[#0c1622]">
        {model.cover_url ? (
          <Image src={model.cover_url} alt={model.title} fill className="object-cover" sizes="(min-width: 1024px) 320px, 100vw" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">No cover</div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-[#0b2031]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">
          {audioStatusLabel}
        </span>
      </div>
      <div className="space-y-3 px-4 py-5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{categoryName}</span>
          <span>{model.read_time ? `${model.read_time} min read` : "—"}</span>
        </div>
        <div>
          <h3 className="font-display text-xl font-semibold text-white">{model.title}</h3>
          <p className="mt-1 text-sm text-slate-300">{summary}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {tagNames.map((tag, idx) => (
            <Badge key={`${tag}-${idx}`} variant="outline" className={cn(tagPalette[idx % tagPalette.length])}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
