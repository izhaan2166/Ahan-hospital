import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/** Sunrise mark: Ahan means dawn. */
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className={className}>
      <rect width="40" height="40" rx="12" fill="var(--color-teal-800)" />
      <path d="M9 26a11 11 0 0 1 22 0Z" fill="var(--color-dawn-500)" />
      <path d="M20 9v4M10.1 13.1l2.8 2.8M29.9 13.1l-2.8 2.8" stroke="var(--color-dawn-300)" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 29.5h26" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className={cn("text-xl font-extrabold tracking-tight", inverted ? "text-white" : "text-teal-800")}>Ahan</span>
        <span className={cn("mt-0.5 text-[0.62rem] font-bold tracking-[0.24em] uppercase", inverted ? "text-teal-100" : "text-ink-faint")}>
          Hospitals
        </span>
      </span>
      <span className="sr-only">, home</span>
    </Link>
  );
}
