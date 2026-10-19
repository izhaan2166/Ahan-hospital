"use client";

import { useEffect } from "react";
import { site } from "@/config/site";
import "./globals.css";

/**
 * Last-resort screen when the root layout itself fails. It replaces the whole
 * document, so it cannot rely on the header, footer or fonts.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(`Global error${error.digest ? ` (${error.digest})` : ""}: ${error.name}`);
  }, [error]);

  return (
    <html lang="en-IN">
      <body className="flex min-h-dvh items-center bg-paper text-ink">
        <main className="container-page py-20">
          <p className="text-sm font-semibold tracking-[0.16em] text-dawn-700 uppercase">Ahan Hospitals</p>
          <h1 className="mt-4 max-w-2xl text-4xl leading-tight font-extrabold md:text-5xl">
            Our website is having trouble right now
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Please try again in a moment. For urgent help, call our 24-hour emergency line on{" "}
            <a href={`tel:${site.contact.emergencyE164}`} className="font-semibold text-teal-800 underline">
              {site.contact.emergencyDisplay}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="min-h-11 rounded-full bg-teal-700 px-7 py-3.5 font-semibold text-white hover:bg-teal-800"
            >
              Try again
            </button>
            {/* A full reload is intentional here: the app shell itself failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="min-h-11 rounded-full border border-line-strong bg-surface px-7 py-3.5 font-semibold">
              Go to the homepage
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
