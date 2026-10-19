import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { RecoveryLinks } from "@/components/composite/states";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
      <div>
        <p className="text-sm font-semibold tracking-[0.16em] text-dawn-700 uppercase">Error 404</p>
        <h1 className="mt-4 text-4xl leading-tight font-extrabold text-ink md:text-6xl">We could not find that page</h1>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-soft">
          The page or profile you are looking for may have moved, or the link may be incorrect. Nothing you entered
          has been lost.
        </p>
        <ButtonLink href="/" size="lg" className="mt-8">
          Back to the homepage
        </ButtonLink>
      </div>
      <nav aria-label="Helpful links" className="rounded-[2rem] bg-sand/80 p-6 md:p-8">
        <h2 className="text-xl font-extrabold text-ink">You might be looking for</h2>
        <div className="mt-5">
          <RecoveryLinks />
        </div>
      </nav>
    </section>
  );
}
