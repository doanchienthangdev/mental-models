"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, X, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ModelRecord } from "@/lib/models";
import type { Category } from "@/lib/categories";
import type { Tag } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { colorForSlug } from "@/components/lib/color";

type Props = {
  models: ModelRecord[];
  categories: Category[];
  tags: Tag[];
  totalCount: number;
  pageSize: number;
  initialSearchTerm?: string;
  initialSelectedCategories?: string[];
  initialSelectedTags?: string[];
  initialSortOrder?: "recent" | "oldest";
  initialPage?: number;
};

const ensureSingle = (values: string[]) => (values.length > 0 ? [values[0]] : []);

type FilterType = "category" | "tag" | null;

const tagPalette = [
  "bg-emerald-600/20 text-emerald-200 border-emerald-500/30",
  "bg-sky-600/20 text-sky-200 border-sky-500/30",
  "bg-purple-600/20 text-purple-200 border-purple-500/30",
  "bg-rose-600/20 text-rose-200 border-rose-500/30",
  "bg-amber-500/20 text-amber-200 border-amber-400/30",
];

export function LibraryClient({
  models,
  categories,
  tags,
  totalCount,
  pageSize,
  initialSearchTerm = "",
  initialSelectedCategories,
  initialSelectedTags,
  initialSortOrder = "recent",
  initialPage = 1,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const normalizedInitialCategories = useMemo(() => ensureSingle(initialSelectedCategories ?? []), [initialSelectedCategories]);
  const normalizedInitialTags = useMemo(() => initialSelectedTags ?? [], [initialSelectedTags]);
  const [searchInput, setSearchInput] = useState(initialSearchTerm);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(initialSearchTerm);
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">(initialSortOrder);
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(normalizedInitialCategories);
  const [selectedTags, setSelectedTags] = useState<string[]>(normalizedInitialTags);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);
  const [page, setPage] = useState(initialPage);

  const categoryNameMap = useMemo(() => buildCategoryMap(categories), [categories]);
  const categoryOptions = useMemo(() => categories.map((c) => ({ id: c.slug, label: c.name ?? c.slug })), [categories]);
  const tagOptions = useMemo(() => tags.map((t) => ({ id: t.id, label: t.name ?? t.id })), [tags]);
  const tagNameMap = useMemo(() => buildTagMap(tags), [tags]);
  const activeCategorySlug = selectedCategories[0];
  const activeCategoryName = activeCategorySlug ? categoryNameMap.get(activeCategorySlug) ?? activeCategorySlug : null;
  const categoryFilterLabel = "Categories";

  useEffect(() => {
    setSearchInput(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    setCurrentSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    setSelectedCategories(normalizedInitialCategories);
  }, [normalizedInitialCategories]);

  useEffect(() => {
    setSelectedTags(normalizedInitialTags);
  }, [normalizedInitialTags]);

  useEffect(() => {
    setSortOrder(initialSortOrder);
  }, [initialSortOrder]);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const totalPages = Math.max(1, Math.ceil(Math.max(totalCount, 0) / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const showEmptyState = models.length === 0;

  const openFilter = (type: FilterType) => {
    if (!type) return;
    setActiveFilter(type);
    if (type === "category") setPendingSelection(ensureSingle([...selectedCategories]));
    if (type === "tag") setPendingSelection([...selectedTags]);
  };

  const closeFilter = () => {
    setActiveFilter(null);
    setPendingSelection([]);
  };

  const buildQuery = ({
    search,
    categories: nextCategories,
    tags: nextTags,
    sort,
    page: nextPage,
  }: {
    search?: string;
    categories?: string[];
    tags?: string[];
    sort?: "recent" | "oldest";
    page?: number;
  }) => {
    const params = new URLSearchParams();
    if (search) {
      params.set("q", search);
    }
    (nextCategories ?? []).forEach((cat) => params.append("category", cat));
    (nextTags ?? []).forEach((tag) => params.append("tag", tag));
    if (sort && sort !== "recent") {
      params.set("sort", sort);
    }
    if (nextPage && nextPage > 1) {
      params.set("page", String(nextPage));
    }
    const qs = params.toString();
    return qs ? `/library?${qs}` : "/library";
  };

  const commitFilters = (overrides: Partial<{ search: string; categories: string[]; tags: string[]; sort: "recent" | "oldest"; page: number }>) => {
    const nextSearch = overrides.search !== undefined ? overrides.search : currentSearchTerm;
    const nextCategories = ensureSingle(overrides.categories ?? selectedCategories);
    const nextTags = overrides.tags ?? selectedTags;
    const nextSort = overrides.sort ?? sortOrder;
    const shouldResetPage =
      overrides.page === undefined &&
      (overrides.search !== undefined || overrides.categories !== undefined || overrides.tags !== undefined || overrides.sort !== undefined);
    const nextPage = overrides.page ?? (shouldResetPage ? 1 : currentPage);

    setCurrentSearchTerm(nextSearch);
    setSelectedCategories(nextCategories);
    setSelectedTags(nextTags);
    setSortOrder(nextSort);
    setPage(nextPage);

    const url = buildQuery({ search: nextSearch, categories: nextCategories, tags: nextTags, sort: nextSort, page: nextPage });
    startTransition(() => {
      router.push(url);
    });
  };

  const applyFilter = () => {
    if (activeFilter === "category") {
      commitFilters({ categories: ensureSingle([...pendingSelection]) });
    }
    if (activeFilter === "tag") {
      commitFilters({ tags: [...pendingSelection] });
    }
    closeFilter();
  };

  const clearFilter = (type: FilterType) => {
    if (type === "category") {
      commitFilters({ categories: [] });
    }
    if (type === "tag") {
      commitFilters({ tags: [] });
    }
  };

  const currentOptions = activeFilter === "category" ? categoryOptions : activeFilter === "tag" ? tagOptions : [];

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchInput.trim();
    setSearchInput(trimmed);
    commitFilters({ search: trimmed, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    commitFilters({ search: "" });
  };

  const renderBreadcrumb = () => (
    <nav className="text-sm text-slate-400">
      <Link href="/" className="text-accent hover:underline">
        Home
      </Link>
      <span className="px-2">&gt;</span>
      {activeCategorySlug ? (
        <>
          <Link href="/library" className="text-accent hover:underline">
            Library
          </Link>
          <span className="px-2">&gt;</span>
          <span>{activeCategoryName}</span>
        </>
      ) : (
        <span>Library</span>
      )}
    </nav>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {renderBreadcrumb()}
        <h1 className="font-display text-4xl font-semibold text-white">
          {activeCategoryName ?? "Mental Models Library"}
        </h1>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[260px] max-w-[420px]">
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Search</div>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                name="q"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search models..."
                className="h-11 rounded-lg border-[#1e3442] bg-[#10202d] pl-10"
              />
            </div>
          </form>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-1 sm:min-w-[200px] sm:flex-row sm:items-end sm:gap-2">
          <div className="flex gap-2 sm:flex-1">
            <SelectBox label="Category" className="basis-1/2 sm:basis-auto sm:w-[180px]">
              <FilterToggleButton
                label={categoryFilterLabel}
                active={selectedCategories.length > 0}
                onClick={() => openFilter("category")}
                onClear={() => clearFilter("category")}
              />
            </SelectBox>
            <SelectBox label="Tag" className="basis-1/2 sm:basis-auto sm:w-[180px]">
              <FilterToggleButton
                label={selectedTags.length ? `${selectedTags.length} selected` : "Tags"}
                active={selectedTags.length > 0}
                onClick={() => openFilter("tag")}
                onClear={() => clearFilter("tag")}
              />
            </SelectBox>
          </div>
          <SelectBox label="Sort by" className="w-full sm:w-[200px] sm:flex-1">
            <div className="relative">
              <select
                className="h-11 w-full appearance-none rounded-lg border border-[#1e3442] bg-[#10202d] px-4 pr-12 text-center text-slate-100 transition hover:border-accent hover:text-white cursor-pointer"
                value={sortOrder}
                onChange={(event) => commitFilters({ sort: event.target.value as "recent" | "oldest" })}
              >
                <option value="recent">Recently Added</option>
                <option value="oldest">Oldest</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </SelectBox>
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
            onClick={handleClearSearch}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/50 text-accent hover:bg-accent/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        {selectedCategories.map((cat) => (
          <span
            key={`cat-${cat}`}
            className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent"
          >
            {categoryNameMap.get(cat) ?? cat}
            <button
              type="button"
              onClick={() => commitFilters({ categories: selectedCategories.filter((item) => item !== cat) })}
              className="text-slate-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {selectedTags.map((tag) => (
          <span
            key={`tagChip-${tag}`}
            className="flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-accent"
          >
            {resolveTagLabel(tag, tagNameMap)}
            <button
              type="button"
              onClick={() => commitFilters({ tags: selectedTags.filter((item) => item !== tag) })}
              className="text-slate-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      {showEmptyState ? (
        <div className="rounded-2xl border border-dashed border-[#1e3442] p-10 text-center text-slate-400">
          No published models match your filters.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {models.map((model) => (
            <ModelCard key={model.id} model={model} tagPalette={tagPalette} categories={categoryNameMap} />
          ))}
        </div>
      )}

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={(next) => commitFilters({ page: next })} disabled={isPending} />

      {activeFilter && (
        <FilterModal
          title={activeFilter === "category" ? "Categories" : "Tags"}
          options={currentOptions}
          values={pendingSelection}
          onChange={(next) => setPendingSelection(next)}
          onClose={closeFilter}
          onApply={applyFilter}
          singleSelect={activeFilter === "category"}
        />
      )}
    </div>
  );
}

function ModelCard({
  model,
  tagPalette,
  categories,
}: {
  model: ModelRecord;
  tagPalette: string[];
  categories: Map<string, string | null>;
}) {
  const summary = truncateWords(model.summary ?? "", 20);
  const normalizedSlug = (model.category ?? "").replace(/[^a-z0-9]/gi, "");
  const categoryName =
    model.category ? categories.get(model.category) || categories.get(normalizedSlug) || model.category : "General";
  const color = colorForSlug(model.category ?? model.slug, tagPalette);
  return (
    <Link
      href={`/models/${model.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d]/80 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(46,160,225,0.25)]"
    >
      <div className="relative h-[180px] w-full bg-[#0c1622]">
        {model.cover_url ? (
          <Image src={model.cover_url} alt={model.title} fill className="object-cover" sizes="(min-width: 1024px) 320px, 100vw" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900/50" />
        )}
      </div>
      <div className="space-y-3 px-4 pb-12 pt-4">
        <h3 className="font-display text-lg font-semibold text-white group-hover:text-accent">{model.title}</h3>
        <p className="text-sm text-slate-400">{summary}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={cn(color, "rounded-[4px]")}>
            {categoryName}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-400">{model.read_time ? `${model.read_time} min read` : "—"}</div>
      </div>
    </Link>
  );
}

function Pagination({
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

function FilterModal({
  title,
  options,
  values,
  onChange,
  onClose,
  onApply,
  singleSelect = false,
}: {
  title: string;
  options: { id: string; label: string }[];
  values: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  onApply: () => void;
  singleSelect?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#1e3442] bg-[#08131e] p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[320px] space-y-2 overflow-y-auto pr-2">
          {options.map((option) => {
            const checked = values.includes(option.id);
            return (
              <label
                key={option.id}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-[#1e3442] bg-[#0f202d] px-3 py-2 text-sm hover:border-accent"
              >
                <span>{option.label}</span>
                <input
                  type={singleSelect ? "radio" : "checkbox"}
                  name={singleSelect ? `${title}-single` : `${title}-multi`}
                  className="h-4 w-4"
                  checked={checked}
                  onChange={(event) => {
                    const next = singleSelect
                      ? event.target.checked
                        ? [option.id]
                        : []
                      : event.target.checked
                        ? [...values, option.id]
                        : values.filter((id) => id !== option.id);
                    onChange(next);
                  }}
                />
              </label>
            );
          })}
          {options.length === 0 && <p className="text-sm text-slate-400">No options available.</p>}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" className="text-slate-200" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-[#2ea0e1] text-slate-900 hover:bg-[#248bc5]" onClick={onApply}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

function SelectBox({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{label}</div>
      {children}
    </div>
  );
}

function FilterToggleButton({
  label,
  active,
  onClick,
  onClear,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-11 w-full rounded-lg border-[#1e3442] bg-[#10202d] text-left text-slate-100",
          active && "border-accent text-white",
        )}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <span>{label}</span>
          <Filter className="ml-2 h-4 w-4" />
        </div>
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

function truncateWords(text: string, limit: number) {
  const words = text.split(/\s+/);
  if (words.length <= limit) return text;
  return words.slice(0, limit).join(" ") + "...";
}

function buildCategoryMap(categories: Category[]) {
  const map = new Map<string, string>();
  for (const c of categories) {
    const name = c.name ?? c.slug;
    const slug = c.slug ?? "";
    map.set(slug, name);
    const primary = slug.split("-")[0];
    if (primary && !map.has(primary)) map.set(primary, name);
    const normalized = slug.replace(/[^a-z0-9]/gi, "");
    if (normalized && !map.has(normalized)) map.set(normalized, name);
  }
  return map;
}

function buildTagMap(tags: Tag[]) {
  const map = new Map<string, string>();
  for (const t of tags) {
    const name = t.name ?? t.id;
    map.set(t.id, name);
    if (t.slug) {
      map.set(t.slug, name);
    }
  }
  return map;
}

const resolveTagLabel = (tag: string, tagNameMap: Map<string, string>) => {
  const direct = tagNameMap.get(tag);
  if (direct) return direct;
  return tag;
};
