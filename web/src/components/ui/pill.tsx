import { cn } from "@/lib/utils";

type PillProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
};

export function Pill({ label, active, onClick }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1 text-sm font-medium transition",
        active
          ? "bg-accent/20 text-white border border-accent/60"
          : "bg-surface text-slate-300 border border-border hover:border-accent/40 hover:text-white",
      )}
    >
      {label}
    </button>
  );
}
