import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type StateProps = {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  headingLevel?: "h2" | "h3";
};

export function EmptyState({ title, children, actions, className, headingLevel = "h2" }: StateProps) {
  const Heading = headingLevel;
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface px-6 py-12 text-center", className)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto size-10 text-teal-700" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-4.2-4.2M8.5 11h5" />
      </svg>
      <Heading className="mt-4 text-2xl font-semibold text-ink">{title}</Heading>
      {children ? <div className="mx-auto mt-2 max-w-md text-ink-soft">{children}</div> : null}
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function ErrorState({ title, children, actions, className, headingLevel = "h2" }: StateProps) {
  const Heading = headingLevel;
  return (
    <div role="alert" className={cn("rounded-[var(--radius-card)] border border-danger/25 bg-danger-50 px-6 py-10 text-center", className)}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="mx-auto size-10 text-danger" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 8v5m0 3h.01M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      </svg>
      <Heading className="mt-4 text-2xl font-semibold text-ink">{title}</Heading>
      {children ? <div className="mx-auto mt-2 max-w-md text-ink-soft">{children}</div> : null}
      {actions ? <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}

/** Links offered on every not-found and error screen. */
export function RecoveryLinks() {
  const links = [
    { href: "/doctors", label: "Find a doctor" },
    { href: "/specialities", label: "Browse specialities" },
    { href: "/appointments", label: "Request an appointment" },
    { href: "/contact", label: "Contact us" },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="flex min-h-12 items-center justify-between rounded-[var(--radius-control)] border border-line bg-surface px-5 py-3 font-semibold text-ink hover:border-teal-700 hover:text-teal-800"
          >
            {link.label}
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
