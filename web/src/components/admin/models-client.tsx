"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Filter, Pencil, Plus, Search, X } from "lucide-react";
import { type ModelRecord } from "@/lib/models";
import type { Category } from "@/lib/categories";
import type { Tag as TagRecord } from "@/lib/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { colorForSlug } from "@/components/lib/color";

type FilterType = "category" | "tag" | "status" | null;

type Props = {
  models: ModelRecord[];
  categories: Category[];
  tags: TagRecord[];
  statusOptions: string[];
  totalCount: number;
  pageSize: number;
  initialSearchTerm?: string;
  initialSelectedCategories?: string[];
  initialSelectedTags?: string[];
  initialSelectedStatuses?: string[];
  initialPage?: number;
};

const tagPalette = [
  "bg-emerald-600/20 text-emerald-200 border-emerald-500/30",
  "bg-sky-600/20 text-sky-200 border-sky-500/30",
  "bg-purple-600/20 text-purple-200 border-purple-500/30",
  "bg-rose-600/20 text-rose-200 border-rose-500/30",
  "bg-amber-500/20 text-amber-200 border-amber-400/30",
];

export function AdminModelsClient({
  models,
  categories,
  tags,
  statusOptions,
  totalCount,
  pageSize,
  initialSearchTerm = "",
  initialSelectedCategories = [],
  initialSelectedTags = [],
  initialSelectedStatuses = [],
  initialPage = 1,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.slug, c.name ?? c.slug])), [categories]);
  const [searchInput, setSearchInput] = useState(initialSearchTerm);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(initialSearchTerm);
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelectedCategories);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialSelectedStatuses);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setSearchInput(initialSearchTerm);
    setCurrentSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    setSelectedCategories(initialSelectedCategories);
  }, [initialSelectedCategories]);

  useEffect(() => {
    setSelectedTags(initialSelectedTags);
  }, [initialSelectedTags]);

  useEffect(() => {
    setSelectedStatuses(initialSelectedStatuses);
  }, [initialSelectedStatuses]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const totalPages = Math.max(1, Math.ceil(Math.max(totalCount, 0) / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const showEmptyState = models.length === 0;

  const mergedStatusOptions = useMemo(() => {
    const unique = new Set(statusOptions);
    selectedStatuses.forEach((status) => unique.add(status));
    return Array.from(unique);
  }, [statusOptions, selectedStatuses]);

  const openFilter = (type: FilterType) => {
    if (!type) return;
    setActiveFilter(type);
    if (type === "category") setPendingSelection([...selectedCategories]);
    if (type === "tag") setPendingSelection([...selectedTags]);
    if (type === "status") setPendingSelection([...selectedStatuses]);
  };

  const closeFilter = () => {
    setActiveFilter(null);
    setPendingSelection([]);
  };

  const buildQuery = ({
    search,
    categories: nextCategories,
    tags: nextTags,
    statuses: nextStatuses,
    page: nextPage,
  }: {
    search?: string;
    categories?: string[];
    tags?: string[];
    statuses?: string[];
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    (nextCategories ?? []).forEach((cat) => params.append("category", cat));
    (nextTags ?? []).forEach((tag) => params.append("tag", tag));
    (nextStatuses ?? []).forEach((status) => params.append("status", status));
    if (nextPage && nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/admin/models?${qs}` : "/admin/models";
  };

  const commitFilters = (overrides: Partial<{ search: string; categories: string[]; tags: string[]; statuses: string[]; page: number }>) => {
    const nextSearch = overrides.search !== undefined ? overrides.search : currentSearchTerm;
    const nextCategories = overrides.categories ?? selectedCategories;
    const nextTags = overrides.tags ?? selectedTags;
    const nextStatuses = overrides.statuses ?? selectedStatuses;
    const shouldResetPage =
      overrides.page === undefined &&
      (overrides.search !== undefined ||
        overrides.categories !== undefined ||
        overrides.tags !== undefined ||
        overrides.statuses !== undefined);
    const nextPage = overrides.page ?? (shouldResetPage ? 1 : currentPage);

    setCurrentSearchTerm(nextSearch);
    setSelectedCategories(nextCategories);
    setSelectedTags(nextTags);
    setSelectedStatuses(nextStatuses);
    setPage(nextPage);

    const url = buildQuery({
      search: nextSearch,
      categories: nextCategories,
      tags: nextTags,
      statuses: nextStatuses,
      page: nextPage,
    });
    startTransition(() => {
      router.push(url);
    });
  };

  const applyFilter = () => {
    if (activeFilter === "category") commitFilters({ categories: [...pendingSelection] });
    if (activeFilter === "tag") commitFilters({ tags: [...pendingSelection] });
    if (activeFilter === "status") commitFilters({ statuses: [...pendingSelection] });
    closeFilter();
  };

  const clearFilter = (type: FilterType) => {
    if (type === "category") commitFilters({ categories: [] });
    if (type === "tag") commitFilters({ tags: [] });
    if (type === "status") commitFilters({ statuses: [] });
  };

  const currentOptions = useMemo(() => {
    if (activeFilter === "category") {
      return categories.map((c) => ({ id: c.slug, label: c.name ?? c.slug }));
    }
    if (activeFilter === "tag") {
      return tags.map((t) => ({ id: t.id, label: t.name ?? t.id }));
    }
    if (activeFilter === "status") {
      return mergedStatusOptions.map((status) => ({ id: status, label: status }));
    }
    return [];
  }, [activeFilter, categories, tags, mergedStatusOptions]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setSearchInput(trimmed);
    commitFilters({ search: trimmed, page: 1 });
  };

  const clearSearch = () => {
    setSearchInput("");
    commitFilters({ search: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-white">Mental Models</h1>
        <Button asChild className="rounded-md bg-[#2ea0e1] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#248bc5]">
          <Link href="/admin/models/create">
            <Plus className="mr-2 h-4 w-4" /> Create Model
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[260px] max-w-[420px]">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Search</div>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                name="q"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search models by title..."
                className="h-11 rounded-lg border-[#1e3442] bg-[#10202d] pl-10"
              />
            </div>
          </form>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Category</span>
          <FilterButton
            label="Category"
            active={selectedCategories.length > 0}
            onClick={() => openFilter("category")}
            onClear={() => clearFilter("category")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Tag</span>
          <FilterButton
            label="Tag"
            active={selectedTags.length > 0}
            onClick={() => openFilter("tag")}
            onClear={() => clearFilter("tag")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Status</span>
          <FilterButton
            label="Status"
            active={selectedStatuses.length > 0}
            onClick={() => openFilter("status")}
            onClear={() => clearFilter("status")}
          />
        </div>
      </div>

      {currentSearchTerm && (
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-200">
          <div className="flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-4 py-2">
            <span className="font-medium text-white">Search:</span>
            <span className="text-white">{currentSearchTerm}</span>
            <span className="text-xs text-slate-300">({totalCount} results)</span>
          </div>
          <button
            type="button"
            onClick={clearSearch}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/50 text-accent hover:bg-accent/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {showEmptyState ? (
        <div className="rounded-xl border border-dashed border-[#1e3442] bg-[#0f202d]/60 p-10 text-center text-slate-400">
          No models match the current filters.
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {models.map((model) => (
              <ModelCard key={model.id} model={model} categoryMap={categoryMap} />
            ))}
          </div>
          <AdminPagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(next) => commitFilters({ page: next })}
            disabled={isPending}
          />
        </>
      )}

      {activeFilter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#1e3442] bg-[#08131e] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold capitalize">{activeFilter} filter</h3>
              <button onClick={closeFilter} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[320px] space-y-2 overflow-y-auto pr-2">
              {currentOptions.map((option) => {
                const checked = pendingSelection.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-[#1e3442] bg-[#0f202d] px-3 py-2 text-sm hover:border-accent"
                  >
                    <span>{option.label}</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...pendingSelection, option.id]
                          : pendingSelection.filter((id) => id !== option.id);
                        setPendingSelection(next);
                      }}
                    />
                  </label>
                );
              })}
              {currentOptions.length === 0 && <p className="text-sm text-slate-400">No options available.</p>}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" className="text-slate-200" onClick={closeFilter}>
                Cancel
              </Button>
              <Button className="bg-[#2ea0e1] text-slate-900 hover:bg-[#248bc5]" onClick={applyFilter}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterButton({ label, onClick, active, onClear }: { label: string; onClick: () => void; active: boolean; onClear: () => void }) {
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        className={cn(
          "h-11 rounded-lg border-[#1e3442] bg-[#10202d] text-slate-100",
          active && "border-accent text-white",
        )}
      >
        <Filter className="mr-2 h-4 w-4" />
        {label}
      </Button>
      {active && (
        <button
          type="button"
          onClick={onClear}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-slate-900"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function AdminPagination({
  page,
  totalPages,
  onPageChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-10 flex items-center justify-between border-t border-[#1e3442] pt-4 text-sm text-slate-300">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-full border-[#1e3442] bg-[#10202d] text-slate-100"
          disabled={page <= 1 || disabled}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9 rounded-full border-[#1e3442] bg-[#10202d] text-slate-100"
          disabled={page >= totalPages || disabled}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ModelCard({
  model,
  categoryMap,
}: {
  model: ModelRecord;
  categoryMap: Map<string, string | null>;
}) {
  const summary = truncateWords(model.summary ?? "", 20);
  const normalizedSlug = (model.category ?? "").replace(/[^a-z0-9]/gi, "");
  const categoryName = model.category ? categoryMap.get(model.category) || categoryMap.get(normalizedSlug) || model.category : "";
  const audioLabel = statusLabel(model.audio_status);
  const badgeColor = colorForSlug(model.category ?? model.slug, tagPalette);
  return (
    <div className="group overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d]/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(46,160,225,0.25)]">
      <div className="relative h-[180px] w-full bg-[#0c1622]">
        {model.cover_url ? (
          <Image src={model.cover_url} alt={model.title} fill className="object-cover" sizes="(min-width: 1024px) 320px, 100vw" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900/50" />
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {model.audio_status && (
            <Badge variant={audioLabel.variant} className="bg-[#0f202d]/90">
              {audioLabel.label}
            </Badge>
          )}
        </div>
        <Badge className="absolute right-3 top-3 bg-[#0f202d] text-xs text-slate-100">
          {model.status ?? "draft"}
        </Badge>
      </div>
      <div className="space-y-3 px-4 pb-12 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-white group-hover:text-accent">{model.title}</h3>
            <p className="mt-1 text-sm text-slate-400">{summary}</p>
          </div>
          <div className="flex gap-2">
            <IconButton href={`/admin/models/${model.slug}/edit`}>
              <Pencil className="h-4 w-4" />
            </IconButton>
            <IconButton href={`/models/${model.slug}`}>
              <Eye className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categoryName && (
            <Badge variant="outline" className={cn(badgeColor, "rounded-[4px]")}>
              {categoryName}
            </Badge>
          )}
        </div>
        <div className="text-sm text-slate-400">{model.read_time ? `${model.read_time} min read` : "—"}</div>
      </div>
    </div>
  );
}

function IconButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1e3442] bg-[#10202d] text-slate-100 hover:border-accent"
    >
      {children}
    </Link>
  );
}

const statusLabel = (status: string | null) => {
  switch (status) {
    case "ready":
      return { label: "Audio Ready", variant: "success" as const };
    case "generating":
      return { label: "Audio Pending", variant: "outline" as const };
    default:
      return { label: "Audio Pending", variant: "outline" as const };
  }
};

function truncateWords(text: string, limit: number) {
  const words = text.split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "...";
}
