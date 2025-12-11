import { fetchModels } from "@/lib/models";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import { LibraryClient } from "@/components/library-client";

const PAGE_SIZE = 12;

function toArray(param: string | string[] | undefined) {
  if (!param) return [];
  return Array.isArray(param) ? param : [param];
}

function sanitizeList(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.replace(/[^a-zA-Z0-9-_]/g, "").trim())
        .filter((value) => value.length > 0),
    ),
  );
}

const extractTagKey = (value: string) => {
  const parts = value.split("-");
  return parts.length ? parts[parts.length - 1] : value;
};

export const revalidate = 0;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const queryParam = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q.slice(0, 120) : "";
  const sanitizedQuery = queryParam.replace(/[\"'%;]/g, "").trim();
  const categoryFilters = sanitizeList(toArray(resolvedSearchParams?.category)).slice(0, 1);
  const tagFilters = sanitizeList(toArray(resolvedSearchParams?.tag));
  const rawSort = typeof resolvedSearchParams?.sort === "string" ? resolvedSearchParams.sort : undefined;
  const sortOrder = rawSort === "oldest" ? "oldest" : "recent";
  const rawPage = typeof resolvedSearchParams?.page === "string" ? parseInt(resolvedSearchParams.page, 10) : 1;
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [{ data: models, count }, categories, tags] = await Promise.all([
    fetchModels({
      status: "published",
      search: sanitizedQuery,
      categories: categoryFilters,
      tags: tagFilters,
      limit: PAGE_SIZE,
      offset,
      sort: sortOrder,
    }),
    listCategories(),
    listTags(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-10">
      <LibraryClient
        models={models}
        categories={categories}
        tags={tags}
        totalCount={count}
        pageSize={PAGE_SIZE}
        initialSearchTerm={sanitizedQuery}
        initialSelectedCategories={categoryFilters}
        initialSelectedTags={tagFilters}
        initialSortOrder={sortOrder}
        initialPage={currentPage}
      />
    </div>
  );
}
