import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/config/site";
import { healthPackages, photos, specialityPhotos, stats } from "@/content/home";
import { getFeaturedDoctors, getSpecialities } from "@/lib/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { DoctorCard, SpecialityCard } from "@/components/composite/cards";
import { SectionErrorBoundary } from "@/components/composite/error-boundary";
import { SectionHeading } from "@/components/composite/page-header";
import { PackageCard } from "@/components/composite/package-card";
import { WhatsAppLink } from "@/components/composite/whatsapp-link";
import { HeroSearch } from "@/components/sections/hero-search";
import { HeroVideo, type HeroClip } from "@/components/sections/hero-video";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

type QuickLink = { icon: IconName; title: string; body: string; href: string; external?: boolean; urgent?: boolean };

const quickLinks: QuickLink[] = [
  { icon: "calendar", title: "Book an appointment", body: "Pick a speciality and a day", href: "/appointments" },
  { icon: "stethoscope", title: "Find a doctor", body: "By name or condition", href: "/doctors" },
  { icon: "clipboard", title: "Health check-ups", body: "Packages from ₹1,999", href: "/health-checkups" },
  { icon: "siren", title: "Emergency & ambulance", body: "Open 24 hours, every day", href: "#emergency", urgent: true },
  { icon: "pin", title: "Plan your visit", body: "Hours, parking, directions", href: "/contact" },
  {
    icon: "chat",
    title: "Ask on WhatsApp",
    body: "Replies in working hours",
    href: whatsappUrl({ kind: "general" }),
    external: true,
  },
];

const reasons: { icon: IconName; title: string; body: string }[] = [
  { icon: "heart", title: "One team, one plan", body: "Specialists agree your treatment plan together." },
  { icon: "clock", title: "Time to talk", body: "Unhurried consultations and a written summary." },
  { icon: "bed", title: "Modern facilities", body: "MRI, CT, a cath lab and modular theatres." },
  { icon: "shield", title: "Clear costs", body: "Estimates and insurance explained upfront." },
];

// Short segments from licensed Pexels clips (free for commercial use), in story order.
const heroClips: HeroClip[] = [
  { src: "/videos/reception.mp4", poster: "/videos/reception.jpg", start: 1, length: 6 },
  { src: "/videos/corridor.mp4", poster: "/videos/corridor.jpg", start: 0, length: 5 },
  { src: "/videos/consultation.mp4", poster: "/videos/consultation.jpg", start: 1, length: 8 },
];

export default async function HomePage() {
  const [specialities, featured] = await Promise.all([getSpecialities(), getFeaturedDoctors()]);
  const nameOf = (slug: string) => specialities.find((s) => s.slug === slug)?.name ?? "";

  return (
    <>
      {/* Hero: a short film of the hospital, pulled up under the transparent header (5rem bar plus its 1px border). */}
      <section className="relative -mt-[calc(5rem+1px)]">
        <div className="on-dark relative h-[41rem] overflow-hidden md:h-[44rem]">
          <HeroVideo clips={heroClips} />
          {/* Deep teal grade: strongest behind the text, lighter over the film. */}
          <div aria-hidden="true" className="hero-grade absolute inset-0" />
          <div className="relative container-page flex h-full flex-col justify-center pt-20 pb-24">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
              <Icon name="shield" className="size-4 text-dawn-300" /> Multispeciality hospital, Banjara Hills, Hyderabad
            </p>
            <h1 className="mt-6 max-w-2xl text-[2.6rem] leading-[1.04] font-extrabold text-white md:text-[4rem]">
              Expert care for every member of your <span className="text-dawn-300">family.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/85">
              Eight centres of excellence, round-the-clock emergency care and consultants who take the time to explain.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/appointments" size="lg" variant="dawn" className="shadow-[0_12px_32px_-12px_rgb(224_138_60/0.8)]">
                Book an appointment
              </ButtonLink>
              <a
                href={`tel:${site.contact.phoneE164}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                <Icon name="phone" className="size-4" /> {site.contact.phoneDisplay}
              </a>
            </div>
          </div>
        </div>

        {/* Search panel */}
        <div className="relative z-10 container-page -mt-20">
          <div className="rounded-3xl bg-white p-3 shadow-[var(--shadow-lift)] ring-1 ring-line">
            <div className="flex gap-1 overflow-x-auto px-2 pt-1 text-sm font-bold">
              <span className="rounded-full bg-ink px-4 py-2 whitespace-nowrap text-white">Find a doctor</span>
              <Link href="/appointments" className="rounded-full px-4 py-2 whitespace-nowrap text-ink-soft hover:bg-sand">
                Book appointment
              </Link>
              <Link href="/health-checkups" className="rounded-full px-4 py-2 whitespace-nowrap text-ink-soft hover:bg-sand">
                Health check-ups
              </Link>
            </div>
            <HeroSearch specialities={specialities.map(({ slug, name }) => ({ slug, name }))} />
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section aria-label="Quick links" className="container-page pt-14">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {quickLinks.map((q) => {
            const inner = (
              <>
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${q.urgent ? "bg-danger-50 text-danger" : "bg-teal-50 text-teal-700"}`}
                >
                  <Icon name={q.icon} className="size-6" />
                </span>
                <span>
                  <span className="block font-bold text-ink">{q.title}</span>
                  <span className="mt-0.5 block text-sm text-ink-faint">{q.body}</span>
                </span>
                {q.external ? <span className="sr-only"> (opens WhatsApp in a new tab)</span> : null}
              </>
            );
            const cls =
              "flex h-full flex-col gap-3 rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-teal-700 hover:shadow-[var(--shadow-soft)]";
            return (
              <li key={q.title}>
                {q.external ? (
                  <a href={q.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link href={q.href} className={cls}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Key numbers */}
      <section aria-label="Ahan in numbers" className="container-page mt-16">
        <dl className="grid grid-cols-2 overflow-hidden rounded-3xl bg-olive-900 text-white shadow-[0_30px_60px_-30px_rgb(22_31_23/0.7)] md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse border-white/10 p-7 not-last:border-r md:p-9">
              <dt className="mt-2 text-sm text-olive-100">{s.label}</dt>
              <dd className="text-4xl font-extrabold tracking-tight text-dawn-300 md:text-5xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Centres of excellence */}
      <section aria-labelledby="centres-heading" className="mt-24 border-y border-line bg-white">
        <div className="container-page py-24">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading
              id="centres-heading"
              eyebrow="Centres of excellence"
              title="Specialist teams, with diagnostics under the same roof"
            />
            <Link
              href="/specialities"
              className="inline-flex shrink-0 items-center gap-2 font-bold text-teal-700 hover:underline"
            >
              All specialities <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          <SectionErrorBoundary section="our centres of excellence">
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {specialities.map((s) => (
                <li key={s.slug} className="flex">
                  <SpecialityCard speciality={s} photo={specialityPhotos[s.slug]} className="w-full" />
                </li>
              ))}
            </ul>
          </SectionErrorBoundary>
        </div>
      </section>

      {/* Emergency: a slim olive strip with the number and a call button. */}
      <section id="emergency" aria-labelledby="emergency-heading" className="on-dark scroll-mt-24 bg-olive-900 text-white">
        <div className="container-page flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-olive-100">
              <Icon name="siren" className="size-6" />
            </span>
            <div>
              <h2 id="emergency-heading" className="text-xl font-extrabold text-white md:text-2xl">
                24-hour emergency and ambulance
              </h2>
              <p className="mt-0.5 text-sm text-olive-100">Emergency physicians, a cath lab and a stroke team, ready around the clock.</p>
            </div>
          </div>
          <a
            href={`tel:${site.contact.emergencyE164}`}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-white px-6 py-3 font-bold text-olive-900 transition hover:bg-olive-100"
          >
            <Icon name="phone" className="size-5" />
            Call {site.contact.emergencyDisplay}
          </a>
        </div>
      </section>

      {/* Doctors */}
      <section aria-labelledby="doctors-heading" className="bg-sand">
        <div className="container-page py-24">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading id="doctors-heading" eyebrow="Our doctors" title="Consultants you can book today" />
            <Link href="/doctors" className="inline-flex shrink-0 items-center gap-2 font-bold text-teal-700 hover:underline">
              View all doctors <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          <SectionErrorBoundary section="our featured doctors">
            <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.slice(0, 4).map((doctor) => (
                <li key={doctor.slug} className="flex">
                  <DoctorCard doctor={doctor} specialityNames={doctor.specialitySlugs.map(nameOf)} className="w-full" />
                </li>
              ))}
            </ul>
          </SectionErrorBoundary>
        </div>
      </section>

      {/* Health check-ups */}
      <section aria-labelledby="packages-heading" className="border-b border-line bg-white">
        <div className="container-page py-24">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <SectionHeading
              id="packages-heading"
              eyebrow="Preventive health"
              title="Health check-ups, finished in one morning"
              lead="Same-day reports, reviewed with a physician before you leave."
            />
            <Link
              href="/health-checkups"
              className="inline-flex shrink-0 items-center gap-2 font-bold text-teal-700 hover:underline"
            >
              Compare packages <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {healthPackages.map((p) => (
              <li key={p.slug} className="flex">
                <PackageCard pkg={p} className="w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why Ahan */}
      <section aria-labelledby="why-heading" className="container-page grid items-center gap-14 py-24 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-3xl">
            <Image
              src={photos.surgery.src}
              alt={photos.surgery.alt}
              fill
              sizes="(min-width:1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src={photos.imaging.src}
              alt={photos.imaging.alt}
              fill
              sizes="(min-width:1024px) 300px, 45vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image
              src={photos.ward.src}
              alt={photos.ward.alt}
              fill
              sizes="(min-width:1024px) 300px, 45vw"
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <SectionHeading
            id="why-heading"
            eyebrow="Why families choose Ahan"
            title="Advanced medicine, explained in plain language"
          />
          <ul className="mt-8 grid gap-6 sm:grid-cols-2">
            {reasons.map((r) => (
              <li key={r.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon name={r.icon} className="size-6" />
                </span>
                <span>
                  <span className="block font-bold">{r.title}</span>
                  <span className="mt-1 block text-sm text-ink-faint">{r.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing call to action */}
      <section aria-labelledby="help-heading" className="container-page pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-teal-700 px-8 py-12 text-white md:px-14 md:py-16">
          <div aria-hidden="true" className="absolute -right-24 -bottom-40 size-[28rem] glow-dawn" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 id="help-heading" className="text-3xl font-extrabold md:text-[2.5rem]">
                Not sure which specialist you need?
              </h2>
              <p className="mt-3 max-w-xl text-lg text-white/90">
                Tell our patient-services team what is going on. We will guide you to the right doctor.
              </p>
            </div>
            <div className="on-dark flex flex-wrap gap-3 lg:justify-end">
              <WhatsAppLink context={{ kind: "general" }} variant="light" size="lg">
                Chat on WhatsApp
              </WhatsAppLink>
              <ButtonLink href="/appointments" variant="outlineLight" size="lg">
                Book appointment
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
