"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { nanoid } from "nanoid";

const schema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  summary: z.string().min(5).max(150),
  body: z.string().min(10),
  tags: z.string().optional(),
  category: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreatePage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      body: "",
      tags: "",
      category: "",
    },
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncSlug = (title: string) => {
      if (title && !form.getFieldState("slug").isDirty) {
        form.setValue("slug", title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || nanoid(6));
      }
    };

    syncSlug(form.getValues("title"));
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && typeof value.title === "string") {
        syncSlug(value.title);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      setFormMessage(null);
      const payload = {
        title: values.title,
        slug: values.slug,
        summary: values.summary,
        content: values.body,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        category: values.category,
      };
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create model");
      }
      form.reset();
      setFormMessage("Model created successfully.");
    } catch (error) {
      setFormMessage((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const tags = form.watch("tags")?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-[#0d1821] text-slate-100">
      <header className="flex items-center justify-between border-b border-[#1e3442] bg-[#0f202d] px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-slate-900 font-semibold">
            MM
          </div>
          <span className="font-display text-lg font-semibold">Mental Models</span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link href="#">Dashboard</Link>
          <Link href="#">Library</Link>
          <Link href="#">Community</Link>
          <Link href="/create" className="rounded-full bg-[#2ea0e1] px-3 py-2 font-semibold text-slate-900 hover:bg-[#248bc5]">
            Create Model
          </Link>
          <button className="h-10 w-10 rounded-full bg-slate-700" aria-label="Profile" />
        </nav>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-8">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold text-white">Create Mental Model</h1>
          <p className="text-slate-400">Fill in the details below to build your new mental model.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <Card className="bg-[#0f202d]">
              <CardHeader>
                <CardTitle>Basics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Title">
                  <Input
                    placeholder="e.g., Occam's Razor"
                    className="h-11 rounded-lg border-[#1e3442] bg-[#0f202d] text-slate-100"
                    {...form.register("title")}
                  />
                  <FieldError message={form.formState.errors.title?.message} />
                </Field>
                <Field label="Slug">
                  <Input
                    placeholder="/models/occams-razor"
                    className="h-11 rounded-lg border-[#1e3442] bg-[#0f202d] text-slate-100"
                    {...form.register("slug")}
                  />
                  <FieldError message={form.formState.errors.slug?.message} />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Category">
                    <Input
                      placeholder="Decision Making"
                      className="h-11 rounded-lg border-[#1e3442] bg-[#0f202d] text-slate-100"
                      {...form.register("category")}
                    />
                    <FieldError message={form.formState.errors.category?.message} />
                  </Field>
                  <Field label="Tags (comma separated)">
                    <Input
                      placeholder="Problem Solving, Innovation"
                      className="h-11 rounded-lg border-[#1e3442] bg-[#0f202d] text-slate-100"
                      {...form.register("tags")}
                    />
                    <FieldError message={form.formState.errors.tags?.message} />
                  </Field>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f202d]">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>One-line summary</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={4}
                  maxLength={150}
                  placeholder="A short, compelling summary of the model."
                  className="rounded-lg border-[#1e3442] bg-[#0f202d] text-slate-100"
                  {...form.register("summary")}
                />
                <div className="mt-1 text-right text-xs text-slate-500">
                  {(form.watch("summary")?.length ?? 0)}/150
                </div>
                <FieldError message={form.formState.errors.summary?.message} />
              </CardContent>
            </Card>

            <Card className="bg-[#0f202d]">
              <CardHeader>
                <CardTitle>Body</CardTitle>
                <CardDescription>Start writing with markdown formatting</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={10}
                  placeholder="Start writing the body of your mental model here..."
                  className="rounded-lg border-[#1e3442] bg-[#0f202d] text-slate-100"
                  {...form.register("body")}
                />
                <FieldError message={form.formState.errors.body?.message} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-[#0f202d]">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 rounded-lg border border-[#1e3442] bg-[#0f202d] p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.08em] text-slate-500">
                    {form.watch("category") || "Category"}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-white">
                    {form.watch("title") || "Model title"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {form.watch("summary") || "Your one-line summary will appear here."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.length === 0 && <Badge variant="outline">Tags</Badge>}
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="rounded-lg border border-[#1e3442] bg-[#101c26] p-3 text-sm text-slate-300">
                  {form.watch("body") || "Start writing in the body to preview markdown."}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f202d]">
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#1e3442] bg-[#0f202d] text-sm text-slate-400">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#1e3442] text-slate-300">
                    <Image
                      src="https://images.ctfassets.net/u0haasspfa6q/7gGhtKOJ42WLvFdqKDljsO/1b6b1c06c7e816ce47beee3dd2c9f8a8/upload_icon.svg"
                      alt="Upload"
                      width={24}
                      height={24}
                      unoptimized
                    />
                  </div>
                  <p>Click to upload or drag & drop</p>
                  <p className="text-xs text-slate-600">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-400">{formMessage}</div>
          <Button variant="ghost" className="text-slate-200">
            Cancel
          </Button>
          <Button variant="outline" className="border-[#1e3442] bg-[#0f202d] text-slate-100">
            Save Draft
          </Button>
          <Button
            className="bg-[#2ea0e1] px-5 text-slate-900 hover:bg-[#248bc5]"
            onClick={form.handleSubmit(onSubmit)}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save & Publish"}
          </Button>
        </div>
      </main>
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-400">{message}</p>;
}
