import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = { href: string; label: string };

type Props = {
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  breadcrumbs?: Crumb[];
  children?: ReactNode;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-ink-faint">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-teal-700 hover:underline">
            Home
          </Link>
        </li>
        {items.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {i === items.length - 1 ? (
              <span aria-current="page" className="font-semibold text-ink">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className="hover:text-teal-700 hover:underline">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-sm font-bold tracking-[0.18em] text-teal-700 uppercase">{children}</p>;
}

/** Light page header shared by every inner page. */
export function PageHeader({ eyebrow, title, lead, breadcrumbs, children }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-sand">
      <div aria-hidden="true" className="absolute -top-32 -right-32 size-[26rem] glow-teal" />
      <div aria-hidden="true" className="absolute -bottom-40 right-1/3 size-[18rem] glow-dawn-soft" />
      <div className="relative container-page py-12 md:py-16">
        {breadcrumbs ? (
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        ) : null}
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="mt-3 max-w-3xl text-4xl leading-[1.08] font-extrabold md:text-[3.25rem]">{title}</h1>
        {lead ? <div className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{lead}</div> : null}
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, lead, id }: { eyebrow?: string; title: string; lead?: ReactNode; id?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 id={id} className="mt-3 text-3xl leading-[1.1] font-extrabold text-ink md:text-[2.6rem]">
        {title}
      </h2>
      {lead ? <div className="mt-4 text-lg leading-relaxed text-ink-soft">{lead}</div> : null}
    </div>
  );
}
