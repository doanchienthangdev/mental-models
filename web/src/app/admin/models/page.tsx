import { AdminShell } from "@/components/admin/admin-shell";
import { fetchModels, listModelStatuses } from "@/lib/models";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import { AdminModelsClient } from "@/components/admin/models-client";

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

export const revalidate = 0;

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const queryParam = typeof resolvedParams?.q === "string" ? resolvedParams.q.slice(0, 120) : "";
  const sanitizedQuery = queryParam.replace(/["'%;]/g, "").trim();

  const categoryFilters = sanitizeList(toArray(resolvedParams?.category));
  const tagFilters = sanitizeList(toArray(resolvedParams?.tag));
  const statusFilters = sanitizeList(toArray(resolvedParams?.status));
  const rawPage = typeof resolvedParams?.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [{ data: models, count }, categories, tags, statuses] = await Promise.all([
    fetchModels({
      search: sanitizedQuery,
      categories: categoryFilters,
      tags: tagFilters,
      statuses: statusFilters,
      limit: PAGE_SIZE,
      offset,
    }),
    listCategories(),
    listTags(),
    listModelStatuses(),
  ]);
  return (
    <AdminShell>
      <AdminModelsClient
        models={models}
        categories={categories}
        tags={tags}
        statusOptions={statuses}
        totalCount={count}
        pageSize={PAGE_SIZE}
        initialSearchTerm={sanitizedQuery}
        initialSelectedCategories={categoryFilters}
        initialSelectedTags={tagFilters}
        initialSelectedStatuses={statusFilters}
        initialPage={currentPage}
      />
    </AdminShell>
  );
}
