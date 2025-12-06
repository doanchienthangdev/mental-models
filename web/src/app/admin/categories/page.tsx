import { Plus } from "lucide-react";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listCategories, createCategory, updateCategory, deleteCategory } from "@/lib/categories";
import { CategoryRow } from "@/components/admin/category-row";

export const revalidate = 0;

type UpdateState = { status: "idle" | "success" | "error"; message?: string };

async function createCategoryAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const description = ((formData.get("description") as string) || "").trim();
  if (!name || !slug) {
    throw new Error("Name and slug are required");
  }
  await createCategory({ name, slug, description: description || undefined });
  revalidatePath("/admin/categories");
}

async function updateCategoryAction(_state: UpdateState, formData: FormData): Promise<UpdateState> {
  "use server";
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { status: "error", message: "Missing category id" };
  }
  try {
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const description = ((formData.get("description") as string) || "").trim();
    await updateCategory(id, {
      name: name || undefined,
      slug: slug || undefined,
      description: description || undefined,
    });
    revalidatePath("/admin/categories");
    return { status: "success", message: `${name || "Category"} updated successfully` };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

async function deleteCategoryAction(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    throw new Error("Missing category id");
  }
  await deleteCategory(id);
  revalidatePath("/admin/categories");
}

export default async function AdminCategoriesPage() {
  const categories = await listCategories();
  return (
    <AdminShell>
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold text-white">Manage Categories</h1>
        <AddCategoryForm />
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d] shadow-card">
        <div className="grid grid-cols-[2fr,2fr,2fr,1fr] gap-4 border-b border-[#1e3442] px-4 py-3 text-sm font-semibold text-slate-200">
          <span>Name</span>
          <span>Slug</span>
          <span>Description</span>
          <span className="text-right">Actions</span>
        </div>
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            updateAction={updateCategoryAction}
            deleteAction={deleteCategoryAction}
          />
        ))}
        {categories.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No categories yet.</p>}
      </div>
    </AdminShell>
  );
}

function AddCategoryForm() {
  return (
    <form action={createCategoryAction} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#1e3442] bg-[#0f202d] px-4 py-4">
      <Input name="name" placeholder="Name" className="h-11 flex-1 min-w-[150px]" required />
      <Input name="slug" placeholder="Slug" className="h-11 flex-1 min-w-[150px]" required />
      <Input name="description" placeholder="Description" className="h-11 flex-1 min-w-[200px]" />
      <Button type="submit" className="h-11 bg-[#2ea0e1] px-4 text-slate-900 hover:bg-[#248bc5]">
        <Plus className="mr-2 h-4 w-4" /> Add Category
      </Button>
    </form>
  );
}
