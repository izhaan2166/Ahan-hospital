import type { Metadata } from "next";
import Image from "next/image";
import { about, facilities, images } from "@/content/hospital";
import { getDoctor } from "@/lib/content";
import { PageHeader, SectionHeading } from "@/components/composite/page-header";
import { DoctorPortrait } from "@/components/composite/doctor-portrait";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About us",
  description: "Ahan means dawn. Learn how Ahan Hospitals in Hyderabad brings eight specialities, diagnostics and emergency care together around clear, unhurried medicine.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const director = await getDoctor("sanjay-iyer");

  return (
    <>
      <PageHeader
        eyebrow="About Ahan"
        title="A hospital built around clear conversations"
        lead="Ahan means dawn. We named the hospital for the moment things begin to get better."
        breadcrumbs={[{ href: "/about", label: "About" }]}
      />

      <section className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-20">
        <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
          <h2 className="text-3xl font-extrabold text-ink md:text-[2.5rem]">Our story</h2>
          {about.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)]">
          <Image src={images.corridor.src} alt={images.corridor.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="values-heading" className="border-y border-line bg-surface">
        <div className="container-page py-16 md:py-24">
          <SectionHeading id="values-heading" eyebrow="What we stand for" title="Four promises to every patient" />
          <ol className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {about.values.map((value, index) => (
              <li key={value.title} className="border-t-2 border-teal-700 pt-5">
                <span aria-hidden="true" className="font-display text-lg text-dawn-700">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xl font-bold text-ink">{value.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{value.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {director ? (
        <section aria-labelledby="leadership-heading" className="container-page py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-[18rem_1fr] md:gap-14">
            <DoctorPortrait doctor={director} sizes="(min-width: 768px) 288px, 80vw" className="aspect-[4/5] max-w-xs rounded-[var(--radius-card)]" />
            <div>
              <h2 id="leadership-heading" className="text-sm font-extrabold tracking-[0.16em] text-dawn-700 uppercase">
                From our Medical Director
              </h2>
              <blockquote className="mt-4">
                <p className="font-display text-2xl leading-snug text-ink md:text-[2rem]">
                  &ldquo;The best hospitals are the ones where patients never feel rushed. We protect time for questions,
                  because understanding is part of treatment.&rdquo;
                </p>
                <footer className="mt-6 text-ink-soft">
                  <span className="font-semibold text-ink">{director.name}</span>, {director.title}
                </footer>
              </blockquote>
            </div>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="about-facilities-heading" className="on-dark bg-teal-900 text-teal-50">
        <div className="container-page grid gap-12 py-16 md:py-24 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold tracking-[0.16em] text-dawn-300 uppercase">Facilities</p>
            <h2 id="about-facilities-heading" className="mt-3 text-3xl leading-tight font-extrabold text-white md:text-[2.5rem]">
              Designed for calm, equipped for complexity
            </h2>
            <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[var(--radius-card)]">
              <Image src={images.room.src} alt={images.room.alt} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
            </div>
          </div>
          <dl className="grid content-start gap-x-10 sm:grid-cols-2">
            {facilities.map((item) => (
              <div key={item.title} className="border-t border-white/15 py-6">
                <dt className="font-display text-xl font-semibold text-white">{item.title}</dt>
                <dd className="mt-2 leading-relaxed text-teal-100">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page py-16 text-center md:py-24">
        <h2 className="text-3xl font-extrabold text-ink md:text-[2.5rem]">Ready to see a specialist?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
          Send an appointment request and our patient-services team will call you to confirm a time.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/appointments" size="lg">
            Request an appointment
          </ButtonLink>
          <ButtonLink href="/doctors" variant="secondary" size="lg">
            Find a doctor
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
