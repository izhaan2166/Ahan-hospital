"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/config/site";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/composite/logo";
import { cn } from "@/lib/utils/cn";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // On the homepage the header floats over the hero photo until the page scrolls.
  const overHero = pathname === "/" && !scrolled && !open;

  // Close the mobile menu after navigation.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,border-color,box-shadow] duration-300",
        overHero
          ? "on-dark border-b border-transparent bg-transparent"
          : "border-b border-line bg-paper/95 shadow-[0_8px_24px_-20px_rgb(11_59_60/0.35)] backdrop-blur supports-[backdrop-filter]:bg-paper/80",
      )}
    >
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Logo inverted={overHero} />

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-1 whitespace-nowrap">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3.5 py-2.5 text-[0.95rem] font-semibold transition-colors",
                    overHero
                      ? cn("hover:bg-white/10", isActive(item.href) ? "text-dawn-300" : "text-white/85 hover:text-white")
                      : cn("hover:bg-sand", isActive(item.href) ? "text-teal-700" : "text-ink-soft hover:text-ink"),
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:block">
            <ButtonLink href="/appointments" variant={overHero ? "dawn" : "primary"} className="shadow-[0_10px_24px_-12px_rgb(15_107_102/0.7)]">
              Book appointment
            </ButtonLink>
          </span>
          <button
            ref={toggleRef}
            type="button"
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full border xl:hidden",
              overHero ? "border-white/40 bg-white/10 text-white backdrop-blur" : "border-line-strong bg-white text-ink",
            )}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div id="mobile-menu" hidden={!open} className="border-t border-line bg-paper xl:hidden">
        <nav aria-label="Mobile" className="container-page py-4">
          <ul className="flex flex-col">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex min-h-12 items-center border-b border-line text-lg font-semibold text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href="/appointments" size="lg" className="mt-5 w-full">
            Book appointment
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
