import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type HeroCtaButtonsProps = {
  primaryHref: string;
  secondaryHref: string;
  className?: string;
};

export function HeroCtaButtons({ primaryHref, secondaryHref, className }: HeroCtaButtonsProps) {
  return (
    <div className={cn("flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap", className)} data-testid="hero-cta">
      <Button
        asChild
        className="!flex w-full rounded-[8px] bg-[#0b5c8a] px-8 text-base font-semibold text-white transition hover:bg-[#0a537b] sm:!inline-flex sm:w-auto h-12"
      >
        <Link href={primaryHref} className="whitespace-nowrap">
          Browse{"\u00A0"}Library
        </Link>
      </Button>
      <Button
        asChild
        className="!flex w-full rounded-[8px] border border-[#39566c] bg-transparent px-8 text-base font-semibold text-slate-200 h-12 hover:border-[#0f76b0]/80 hover:text-white sm:!inline-flex sm:w-auto"
      >
        <Link href={secondaryHref} className="whitespace-nowrap">
          How It Works
        </Link>
      </Button>
    </div>
  );
}
