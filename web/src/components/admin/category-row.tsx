"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Category } from "@/lib/categories";
import { cn } from "@/lib/utils";

type UpdateState = { status: "idle" | "success" | "error"; message?: string };

type CategoryRowProps = {
  category: Category;
  updateAction: (state: UpdateState, formData: FormData) => Promise<UpdateState>;
  deleteAction: (formData: FormData) => Promise<void>;
};

const initialState: UpdateState = { status: "idle" };

export function CategoryRow({ category, updateAction, deleteAction }: CategoryRowProps) {
  const [state, formAction] = useFormState(updateAction, initialState);
  const [toast, setToast] = useState<{ type: "loading" | "success" | "error"; message: string } | null>(null);
  const submitIntent = useRef<"update" | "delete">("update");
  const formRef = useRef<HTMLFormElement>(null);

  const markUpdateIntent = () => {
    submitIntent.current = "update";
  };

  const markDeleteIntent = () => {
    submitIntent.current = "delete";
  };

  const handlePendingChange = useCallback(
    (pending: boolean) => {
      if (submitIntent.current !== "update") {
        return;
      }
      if (pending) {
        setToast({ type: "loading", message: "Updating category..." });
      } else {
        setToast((prev) => (prev?.type === "loading" ? null : prev));
      }
    },
    [],
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (state.status === "success") {
      setToast({ type: "success", message: state.message ?? "Category updated" });
    } else if (state.status === "error") {
      setToast({ type: "error", message: state.message ?? "Update failed" });
    }
  }, [state]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (toast && toast.type !== "loading") {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      markUpdateIntent();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div
          className={cn(
            "pointer-events-none absolute -top-3 right-4 translate-y-[-100%] rounded-xl px-3 py-2 text-sm shadow-xl backdrop-blur",
            toast.type === "loading" && "bg-slate-800/90 text-white",
            toast.type === "success" && "bg-emerald-600/90 text-white",
            toast.type === "error" && "bg-rose-600/90 text-white",
          )}
        >
          {toast.message}
        </div>
      )}
      <form
        ref={formRef}
        action={formAction}
        className="grid grid-cols-[2fr,2fr,2fr,1fr] gap-4 border-t border-[#1e3442] px-4 py-3 text-sm text-slate-300"
      >
        <StatusWatcher onPendingChange={handlePendingChange} />
        <input type="hidden" name="id" value={category.id} />
        <Input name="name" defaultValue={category.name ?? ""} className="h-10" onKeyDown={handleKeyDown} onFocus={markUpdateIntent} />
        <Input name="slug" defaultValue={category.slug ?? ""} className="h-10" onKeyDown={handleKeyDown} onFocus={markUpdateIntent} />
        <Input
          name="description"
          defaultValue={category.description ?? ""}
          className="h-10"
          onKeyDown={handleKeyDown}
          onFocus={markUpdateIntent}
        />
        <div className="flex items-center justify-end gap-2">
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="border-[#1e3442] bg-[#10202d] text-slate-100"
            onClick={markUpdateIntent}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button type="submit" size="sm" variant="destructive" formAction={deleteAction} onClick={markDeleteIntent}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function StatusWatcher({ onPendingChange }: { onPendingChange: (pending: boolean) => void }) {
  const { pending } = useFormStatus();
  useEffect(() => {
    onPendingChange(pending);
  }, [pending, onPendingChange]);
  return null;
}
