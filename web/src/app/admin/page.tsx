import { Lightbulb, Tags as TagsIcon, FolderOpen, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { fetchModels } from "@/lib/models";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import { Button } from "@/components/ui/button";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [{ data: models }, categories, tags] = await Promise.all([fetchModels(), listCategories(), listTags()]);
  return (
    <AdminShell>
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold text-white">Dashboard Overview</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Lightbulb className="h-4 w-4" />} label="Total Models" value={models.length} />
          <StatCard icon={<FolderOpen className="h-4 w-4" />} label="Total Categories" value={categories.length} />
          <StatCard icon={<TagsIcon className="h-4 w-4" />} label="Total Tags" value={tags.length} />
        </div>
        <div className="rounded-xl border border-[#1e3442] bg-[#143041] p-5 shadow-card">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            <ActionButton href="/admin/models" label="New Model" />
            <ActionButton href="/admin/categories" label="New Category" />
            <ActionButton href="/admin/tags" label="New Tag" />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#1e3442] bg-[#143041] p-5 shadow-card">
      <div className="flex items-center justify-between text-slate-300">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-3 text-3xl font-semibold text-white">{value.toLocaleString()}</div>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <Button
      asChild
      className="rounded-md bg-[#2ea0e1] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#248bc5]"
    >
      <a href={href}>
        <Plus className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
