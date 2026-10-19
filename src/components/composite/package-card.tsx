import Link from "next/link";
import type { healthPackages } from "@/content/home";
import { inr } from "@/content/home";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils/cn";

type Pkg = (typeof healthPackages)[number];

export function PackageCard({ pkg, className, headingLevel = "h3" }: { pkg: Pkg; className?: string; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const featured = "featured" in pkg && pkg.featured;
  return (
    <article
      id={pkg.slug}
      className={cn(
        "relative flex scroll-mt-28 flex-col rounded-[var(--radius-card)] p-7",
        featured ? "on-dark bg-teal-900 text-white shadow-[0_30px_60px_-30px_rgb(11_59_60/0.8)]" : "bg-white ring-1 ring-line shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {featured ? (
        <span className="absolute -top-3 left-7 rounded-full bg-dawn-500 px-3 py-1 text-xs font-bold text-teal-950">Most chosen</span>
      ) : null}
      <p className={cn("text-sm font-semibold", featured ? "text-teal-100" : "text-ink-faint")}>{pkg.for}</p>
      <Heading className="mt-1 text-xl font-bold">{pkg.name}</Heading>
      <p className="mt-5 text-4xl font-extrabold tracking-tight">{inr(pkg.price)}</p>
      <p className={cn("text-sm", featured ? "text-teal-100" : "text-ink-faint")}>{pkg.tests} tests</p>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {pkg.includes.map((item) => (
          <li key={item} className="flex gap-2">
            <Icon name="check" className={cn("mt-0.5 size-4 shrink-0", featured ? "text-dawn-300" : "text-teal-700")} />
            {item}
          </li>
        ))}
      </ul>
      <Link
        href={`/appointments?speciality=health-checkup&package=${pkg.slug}`}
        className={cn(
          "mt-7 flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-bold",
          featured ? "bg-dawn-500 text-teal-950 hover:bg-dawn-300" : "bg-ink text-white hover:bg-teal-700",
        )}
      >
        Book this check-up<span className="sr-only">: {pkg.name}</span>
      </Link>
    </article>
  );
}
