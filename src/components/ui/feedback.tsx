import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 animate-spin" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
        <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {label ? <span>{label}</span> : null}
    </span>
  );
}

type Tone = "error" | "success" | "notice" | "info";

const tones: Record<Tone, { box: string; title: string }> = {
  error: { box: "border-danger/30 bg-danger-50", title: "text-danger" },
  success: { box: "border-success/30 bg-success-50", title: "text-success" },
  notice: { box: "border-notice/30 bg-notice-50", title: "text-notice" },
  info: { box: "border-teal-700/20 bg-teal-50", title: "text-teal-800" },
};

type AlertProps = {
  tone: Tone;
  title: string;
  children?: ReactNode;
  className?: string;
  /** "alert" interrupts screen readers; use it only for errors that block progress. */
  role?: "alert" | "status";
  id?: string;
  tabIndex?: number;
};

export function Alert({ tone, title, children, className, role, id, tabIndex }: AlertProps) {
  return (
    <div
      id={id}
      role={role}
      tabIndex={tabIndex}
      className={cn("rounded-[var(--radius-control)] border px-5 py-4 text-ink", tones[tone].box, className)}
    >
      <p className={cn("font-semibold", tones[tone].title)}>{title}</p>
      {children ? <div className="mt-1 text-sm text-ink-soft">{children}</div> : null}
    </div>
  );
}
