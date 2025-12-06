import { Edit, Trash2, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTag, deleteTag, listTags, updateTag } from "@/lib/tags";

export const revalidate = 0;

export default async function AdminTagsPage() {
  const tags = await listTags();
  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-white">Tags Management</h1>
        <AddTagForm />
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-[#1e3442] bg-[#0f202d] shadow-card">
        <div className="grid grid-cols-[2fr,2fr,1fr] gap-4 border-b border-[#1e3442] px-4 py-3 text-sm font-semibold text-slate-200">
          <span>Name</span>
          <span>Slug</span>
          <span className="text-right">Actions</span>
        </div>
        {tags.map((t) => (
          <TagRow key={t.id} tag={t} />
        ))}
        {tags.length === 0 && <p className="px-4 py-4 text-sm text-slate-400">No tags yet.</p>}
      </div>
    </AdminShell>
  );
}

function AddTagForm() {
  async function action(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    await createTag({ name, slug });
  }
  return (
    <form action={action} className="flex items-center gap-2">
      <Input name="name" placeholder="Name" className="h-10 w-40" required />
      <Input name="slug" placeholder="slug" className="h-10 w-40" required />
      <Button type="submit" className="h-10 bg-[#2ea0e1] px-4 text-slate-900 hover:bg-[#248bc5]">
        <Plus className="mr-2 h-4 w-4" /> Add Tag
      </Button>
    </form>
  );
}

function TagRow({ tag }: { tag: Awaited<ReturnType<typeof listTags>>[number] }) {
  async function action(formData: FormData) {
    "use server";
    const intent = formData.get("intent");
    if (intent === "delete") {
      await deleteTag(tag.id);
      return;
    }
    const name = (formData.get("name") as string) || tag.name;
    const slug = (formData.get("slug") as string) || tag.slug;
    await updateTag(tag.id, { name, slug });
  }
  return (
    <form action={action} className="grid grid-cols-[2fr,2fr,1fr] gap-4 border-t border-[#1e3442] px-4 py-3 text-sm text-slate-300">
      <Input name="name" defaultValue={tag.name} className="h-10" />
      <Input name="slug" defaultValue={tag.slug} className="h-10" />
      <div className="flex items-center justify-end gap-2">
        <Button type="submit" size="sm" variant="outline" className="border-[#1e3442] bg-[#10202d] text-slate-100">
          <Edit className="h-4 w-4" />
        </Button>
        <Button type="submit" name="intent" value="delete" size="sm" variant="destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
