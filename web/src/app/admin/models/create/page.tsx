"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listCategories } from "@/lib/categories";
import { listTags } from "@/lib/tags";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { storage, ensureAnonAuth } from "@/lib/firebase/client";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

type Category = Awaited<ReturnType<typeof listCategories>>[number];
type Tag = Awaited<ReturnType<typeof listTags>>[number];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

export default function AdminCreateModelPage() {
  return (
    <AdminShell>
      <CreateModelClient />
    </AdminShell>
  );
}

function CreateModelClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState<number>(0);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successProgress, setSuccessProgress] = useState(100);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    summary: "",
    body: "",
    category: "",
    tagIds: [] as string[],
    status: "draft",
    read_time: "",
  });

  const autoSlug = useMemo(() => slugify(form.title), [form.title]);

  useEffect(() => {
    ensureAnonAuth();
    Promise.all([fetch("/api/admin/categories").then((r) => r.json()), fetch("/api/admin/tags").then((r) => r.json())]).then(
      ([cRes, tRes]) => {
        setCategories(cRes.data ?? []);
        setTags(tRes.data ?? []);
      },
    );
  }, []);

  const ensureTagRecords = async () => {
    const updated = [...tags];
    const ids: string[] = [];
    const names: string[] = [];

    for (const tagId of form.tagIds) {
      const existing = updated.find((t) => t.id === tagId);
      if (existing) {
        ids.push(existing.id);
        names.push(existing.name);
        continue;
      }
      const nameFromTemp = tagId.startsWith("temp-") ? tagId.replace("temp-", "") : tagId;
      const payload = { name: nameFromTemp, slug: slugify(nameFromTemp) };
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        updated.push(data.data);
        ids.push(data.data.id);
        names.push(data.data.name);
      }
    }

    if (updated.length !== tags.length) setTags(updated);
    return { ids, names };
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    setMessage(null);
    const { ids: tagIds, names: tagNames } = await ensureTagRecords();
    setForm((prev) => ({ ...prev, tagIds }));
    const categoryRow = categories.find((c) => c.slug === form.category);
    const payload = {
      title: form.title,
      slug: form.slug || autoSlug,
      summary: form.summary,
      body: form.body,
      category: form.category || null,
      tags: tagNames,
      cover_url: coverUrl,
      audio_url: audioUrl,
      status: publish ? "published" : form.status,
      read_time: form.read_time ? Number(form.read_time) : null,
      category_ids: categoryRow ? [categoryRow.id] : [],
      tag_ids: tagIds,
    };
    const res = await fetch("/api/admin/models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Failed to save");
      setSaving(false);
      return;
    }
    setSaving(false);
    setMessage("Saved");
    setShowSuccess(true);
    setSuccessProgress(100);
    setTimeout(() => setSuccessProgress(0), 50);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const existing = tags.find((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());
    if (existing) {
      toggleTag(existing.id);
    } else {
      const tempId = `temp-${tagInput}`;
      setTags((prev) => [
        ...prev,
        {
          id: tempId,
          name: tagInput.trim(),
          slug: slugify(tagInput.trim()),
          created_at: "",
          updated_at: "",
        } as Tag,
      ]);
      toggleTag(tempId);
    }
    setTagInput("");
  };

  const toggleTag = (id: string) => {
    setForm((prev) => {
      const exists = prev.tagIds.includes(id);
      return { ...prev, tagIds: exists ? prev.tagIds.filter((t) => t !== id) : [...prev.tagIds, id] };
    });
  };

  const uploadFile = async (file: File, type: "cover" | "audio") => {
    if (type === "cover" && file.size > 5 * 1024 * 1024) {
      setMessage("Cover image must be <= 5MB.");
      return;
    }
    if (type === "audio" && file.size > 50 * 1024 * 1024) {
      setMessage("Audio file must be <= 50MB.");
      return;
    }
    await ensureAnonAuth();
    const path = `${type}s/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    const setProgress = type === "cover" ? setCoverProgress : setAudioProgress;

    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(pct);
      },
      (err) => {
        setMessage(err.message);
        setProgress(0);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        if (type === "cover") {
          setCoverUrl(url);
          setCoverPreview(url);
        } else {
          setAudioUrl(url);
          setAudioName(file.name);
        }
        setProgress(100);
      },
    );
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="rounded-lg border border-emerald-600 bg-emerald-900/70 px-4 py-3 text-sm text-emerald-50 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Saved successfully.</span>
            </div>
            <button className="text-emerald-200 hover:text-white" onClick={() => setShowSuccess(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-emerald-800/70">
            <div
              className="h-full bg-emerald-400 transition-[width] duration-[3000ms] ease-linear"
              style={{ width: `${successProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <a href="/admin/models" className="hover:text-white">
            Models
          </a>
          <span>/</span>
          <span className="text-accent">Create</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-300">
          <span className="text-slate-500">{saving ? "Saving..." : message || "Unsaved"}</span>
          <Button
            type="button"
            className="rounded-md bg-[#2ea0e1] px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-[#248bc5]"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            Save
          </Button>
        </div>
      </div>

      <form className="space-y-5">
        <Field label="Title *">
          <Input
            value={form.title}
            onChange={(e) => {
              const nextTitle = e.target.value;
              setForm((p) => ({ ...p, title: nextTitle, slug: slugify(nextTitle) }));
            }}
            placeholder="Enter model title"
            required
            className="h-12 border-[#1e3442] bg-[#0f202d]"
          />
          {!form.title && <p className="text-xs text-red-400">Title is a required field.</p>}
        </Field>

        <Field label="Slug">
          <Input
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            placeholder="how-to-think-about-systems"
            className="h-12 border-[#1e3442] bg-[#0f202d]"
          />
        </Field>

        <Field label="Summary">
          <Textarea
            value={form.summary}
            onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
            rows={3}
            placeholder="Enter a brief summary of the model"
            className="border-[#1e3442] bg-[#0f202d]"
          />
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category *">
            <select
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              className="h-12 w-full rounded-md border border-[#1e3442] bg-[#0f202d] px-3 text-sm text-slate-100"
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags">
            <div className="flex flex-wrap gap-2">
              {form.tagIds.map((id) => {
                const tag = tags.find((t) => t.id === id);
                if (!tag) return null;
                return (
                  <Badge key={id} variant="outline" className="bg-[#10202d] text-slate-200">
                    {tag.name}{" "}
                    <button onClick={() => toggleTag(id)} className="ml-1 text-slate-400" type="button">
                      ×
                    </button>
                  </Badge>
                );
              })}
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                className="h-10 w-40 border-[#1e3442] bg-[#0f202d]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
              {tags.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={`rounded-full border px-3 py-1 ${
                    form.tagIds.includes(t.id) ? "border-accent text-accent" : "border-[#1e3442] text-slate-300"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Read Time (minutes)">
            <Input
              value={form.read_time}
              onChange={(e) => setForm((p) => ({ ...p, read_time: e.target.value }))}
              placeholder="e.g., 5"
              className="h-12 border-[#1e3442] bg-[#0f202d]"
            />
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="h-12 w-full rounded-md border border-[#1e3442] bg-[#0f202d] px-3 text-sm text-slate-100"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cover Image">
            <div className="h-full rounded-xl border border-dashed border-[#1e3442] bg-[#0f202d] p-6 text-center text-sm text-slate-400">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="cover-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCoverProgress(0);
                    uploadFile(file, "cover");
                  }
                }}
              />
              {coverPreview ? (
                <div className="flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between text-slate-200">
                    <span>{coverProgress < 100 ? "Uploading cover..." : "Upload complete"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPreview(null);
                        setCoverProgress(0);
                        setCoverUrl(null);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="absolute left-0 top-0 h-2 rounded-full bg-accent transition-all"
                      style={{ width: `${coverProgress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-slate-400">{coverProgress}%</div>
                  {coverProgress >= 100 && (
                    <div className="overflow-hidden rounded-lg border border-[#1e3442]">
                      <img src={coverPreview} alt="Cover preview" className="w-full rounded-lg" style={{ height: "auto" }} />
                    </div>
                  )}
                </div>
              ) : (
                <label htmlFor="cover-upload" className="flex h-full cursor-pointer flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <div>
                    <span className="text-accent">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </label>
              )}
            </div>
          </Field>

          <Field label="Audio File (Optional)">
            <div className="h-full rounded-xl border border-dashed border-[#1e3442] bg-[#0f202d] p-4 text-sm text-slate-400">
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                id="audio-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAudioName(file.name);
                    setAudioProgress(0);
                    uploadFile(file, "audio");
                  }
                }}
              />
              {!audioName ? (
                <label htmlFor="audio-upload" className="flex h-full cursor-pointer flex-col items-center justify-center gap-2">
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-accent">Click to upload</span>
                  <p className="text-xs text-slate-500">MP3, WAV (max. 50MB)</p>
                </label>
              ) : (
                <div className="flex h-full flex-col gap-2">
                  <div className="flex items-center justify-between text-slate-200">
                    <span>{audioName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAudioName(null);
                        setAudioProgress(0);
                        setAudioUrl(null);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="absolute left-0 top-0 h-2 rounded-full bg-accent"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-slate-400">{audioProgress}%</div>
                  {audioUrl && (
                    <audio controls className="mt-2 w-full">
                      <source src={audioUrl} />
                    </audio>
                  )}
                </div>
              )}
            </div>
          </Field>
        </div>

        <Field label="Body">
          <div className="rounded-xl border border-[#1e3442] bg-[#0f202d] p-3">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                  <span className="px-2 py-1 rounded bg-[#132836]">B</span>
                  <span className="px-2 py-1 rounded bg-[#132836]">I</span>
                  <span className="px-2 py-1 rounded bg-[#132836]">U</span>
                  <span className="px-2 py-1 rounded bg-[#132836]">•</span>
                  <span className="px-2 py-1 rounded bg-[#132836]">1.</span>
                  <span className="px-2 py-1 rounded bg-[#132836]">[]</span>
                  <span className="px-2 py-1 rounded bg-[#132836]">{"</>"}</span>
                </div>
                <Textarea
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  rows={40}
                  placeholder="Start writing your content here... You can paste Markdown and it will render on the right."
                  className="border border-[#1e3442] bg-[#0f202d] focus-visible:ring-1 focus-visible:ring-accent h-[1000px] overflow-auto resize-none"
                />
              </div>
              <div className="rounded-lg border border-[#1e3442] bg-[#101c26] p-4 text-sm text-slate-200 h-[1000px] overflow-auto">
                <p className="mb-2 text-xs uppercase tracking-[0.08em] text-slate-500">Preview</p>
                <div className="prose prose-invert prose-dark max-w-none">
                  {form.body ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.body}</ReactMarkdown>
                  ) : (
                    <p className="text-slate-500">Start writing to see live Markdown preview.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Field>

        {message && <p className="text-sm text-red-400">{message}</p>}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-200">{label}</label>
      {children}
    </div>
  );
}
