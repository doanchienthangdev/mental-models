"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { ensureAnonAuth, storage } from "@/lib/firebase/client";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Button } from "@/components/ui/button";

type UploadStatus = "uploading" | "complete" | "error";

export type ArticleImage = {
  id: string;
  name: string;
  url: string;
  progress: number;
  status: UploadStatus;
};

type Props = {
  initialImages?: ArticleImage[];
  onChange?: (images: ArticleImage[]) => void;
};

const arraysEqual = (a?: ArticleImage[], b?: ArticleImage[]) => {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((img, idx) => {
    const other = b[idx];
    return (
      img.id === other.id &&
      img.name === other.name &&
      img.url === other.url &&
      img.progress === other.progress &&
      img.status === other.status
    );
  });
};

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `img-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export function ArticleImageUploader({ initialImages, onChange }: Props) {
  const initializedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<ArticleImage[]>(initialImages ?? []);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initializedRef.current || !initialImages) return;
    if (!arraysEqual(initialImages, images)) {
      // Sync initial images once when provided (safe: guarded by ref).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImages(initialImages);
    }
    initializedRef.current = true;
  }, [initialImages, images]);

  useEffect(() => {
    if (onChange) {
      onChange(images);
    }
  }, [images, onChange]);

  const hasUploads = useMemo(() => images.length > 0, [images]);

  const updateImages = (updater: (prev: ArticleImage[]) => ArticleImage[]) => {
    setImages((prev) => updater(prev));
  };

  const handleFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setError(null);
    await ensureAnonAuth();
    Array.from(list).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        setError("Images must be 15MB or less.");
        return;
      }
      const id = generateId();
      const placeholderUrl = typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : "";
      updateImages((prev) => [
        ...prev,
        { id, name: file.name, url: placeholderUrl, progress: 0, status: "uploading" },
      ]);

      const storageRef = ref(storage, `article-images/${Date.now()}-${file.name}`);
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          updateImages((prev) => prev.map((img) => (img.id === id ? { ...img, progress: pct } : img)));
        },
        (err) => {
          setError(err.message);
          updateImages((prev) => prev.map((img) => (img.id === id ? { ...img, status: "error" } : img)));
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          updateImages((prev) =>
            prev.map((img) => (img.id === id ? { ...img, url, progress: 100, status: "complete" } : img)),
          );
        },
      );
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    updateImages((prev) => prev.filter((img) => img.id !== id));
  };

  const copyMarkdown = async (image: ArticleImage) => {
    if (!image.url) {
      setError("Image is still uploading. Please wait for the URL before copying.");
      return;
    }
    const markdown = `![${image.name}](${image.url})`;
    try {
      await navigator.clipboard?.writeText(markdown);
      setCopiedId(image.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.warn("Clipboard copy failed", err);
      setError("Could not copy markdown. Please try again.");
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-[#1e3442] bg-[#0f202d] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-200">Article Images</p>
          <p className="text-xs text-slate-400">Upload inline assets, then click any image to copy Markdown.</p>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-400">{error}</span>}
          <Button
            type="button"
            className="bg-[#2ea0e1] px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-[#248bc5]"
            onClick={() => inputRef.current?.click()}
          >
            Upload images
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            id="article-images-upload"
            aria-label="Upload article images"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {!hasUploads && (
        <label
          htmlFor="article-images-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-[#1e3442] bg-[#10202d] px-4 py-10 text-center text-sm text-slate-400 transition hover:border-accent hover:text-slate-200"
        >
          <Upload className="h-6 w-6 text-slate-400" />
          <div>
            <span className="text-accent">Click to upload</span> or drag and drop multiple images.
          </div>
          <p className="text-xs text-slate-500">PNG, JPG, GIF, SVG up to 15MB each.</p>
        </label>
      )}

      {hasUploads && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg border border-[#1e3442] bg-[#11202c] shadow-sm"
            >
              <button
                type="button"
                aria-label={`Remove ${image.name}`}
                className="absolute right-2 top-2 z-10 rounded-full bg-slate-900/70 p-1 text-slate-300 opacity-0 transition hover:bg-red-900/70 hover:text-red-200 group-hover:opacity-100"
                onClick={() => removeImage(image.id)}
              >
                <X className="h-4 w-4" />
              </button>
              <img
                src={image.url || undefined}
                alt={image.name}
                className="h-36 w-full cursor-pointer object-cover transition hover:brightness-110"
                onClick={() => copyMarkdown(image)}
              />
              <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-300">
                <span className="truncate">{image.name}</span>
                <span>{Math.round(image.progress)}%</span>
              </div>
              {image.status === "uploading" && (
                <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-slate-800">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${image.progress}%` }}
                  />
                </div>
              )}
              {copiedId === image.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-emerald-300">
                  Markdown copied
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
