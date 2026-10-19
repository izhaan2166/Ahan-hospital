import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const control =
  "w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-faint transition-colors hover:border-ink-faint focus-visible:border-teal-700 aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger-50 disabled:bg-sand disabled:text-ink-faint";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "min-h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-32 resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cn(control, "min-h-12 cursor-pointer appearance-none pr-11", className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-soft"
      >
        <path
          fillRule="evenodd"
          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & { id: string; label: ReactNode };

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input id={id} type="checkbox" className="mt-0.5 size-5 shrink-0 cursor-pointer accent-teal-700" {...props} />
      <label htmlFor={id} className="cursor-pointer text-sm text-ink-soft">
        {label}
      </label>
    </div>
  );
}
