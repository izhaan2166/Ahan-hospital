"use client";

import { useEffect } from "react";
import { site } from "@/config/site";
import { Button, ButtonLink } from "@/components/ui/button";
import { RecoveryLinks } from "@/components/composite/states";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  /** What failed to load, in plain words. */
  what?: string;
};

/**
 * Shared recoverable error screen for route segments. Shows no technical
 * detail; the digest lets staff match the server log without exposing it.
 */
export function RouteError({ error, reset, what = "this page" }: Props) {
  useEffect(() => {
    console.error(`Route error${error.digest ? ` (${error.digest})` : ""}: ${error.name}`);
  }, [error]);

  return (
    <section className="container-page grid gap-12 py-20 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
      <div role="alert">
        <p className="text-sm font-semibold tracking-[0.16em] text-dawn-700 uppercase">Something went wrong</p>
        <h1 className="mt-4 text-4xl leading-tight font-extrabold text-ink md:text-5xl">We could not load {what}</h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
          This is a problem on our side, not something you did. Please try again. If it keeps happening, call
          reception on{" "}
          <a href={`tel:${site.contact.phoneE164}`} className="font-semibold text-teal-800 underline">
            {site.contact.phoneDisplay}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/contact" variant="secondary" size="lg">
            Contact us
          </ButtonLink>
        </div>
        {error.digest ? <p className="mt-6 text-sm text-ink-faint">Reference: {error.digest}</p> : null}
      </div>
      <nav aria-label="Helpful links" className="rounded-[2rem] bg-sand/80 p-6 md:p-8">
        <h2 className="text-xl font-extrabold text-ink">Or go somewhere else</h2>
        <div className="mt-5">
          <RecoveryLinks />
        </div>
      </nav>
    </section>
  );
}
