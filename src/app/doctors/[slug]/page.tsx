import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoctor, getDoctors, getSpecialities } from "@/lib/content";
import { JsonLd, breadcrumbSchema, physicianSchema } from "@/lib/seo/json-ld";
import { DoctorPortrait } from "@/components/composite/doctor-portrait";
import { Breadcrumbs } from "@/components/composite/page-header";
import { WhatsAppLink } from "@/components/composite/whatsapp-link";
import { ButtonLink } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getDoctors()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doctor = await getDoctor((await params).slug);
  if (!doctor) return { title: "Doctor not found" };
  return {
    title: `${doctor.name}, ${doctor.title}`,
    description: `${doctor.name} is ${doctor.title} at Ahan Hospitals, Hyderabad. ${doctor.bio[0]}`,
    alternates: { canonical: `/doctors/${doctor.slug}` },
  };
}

export default async function DoctorPage({ params }: Props) {
  const { slug } = await params;
  const doctor = await getDoctor(slug);
  if (!doctor) notFound();

  const specialities = (await getSpecialities()).filter((s) => doctor.specialitySlugs.includes(s.slug));
  const primary = specialities[0];

  return (
    <>
      <JsonLd data={physicianSchema(doctor, specialities)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Doctors", path: "/doctors" },
          { name: doctor.name, path: `/doctors/${doctor.slug}` },
        ])}
      />
      <section className="relative overflow-hidden border-b border-line bg-sand">
        <div aria-hidden="true" className="absolute -top-32 -right-32 size-[26rem] glow-teal" />
        <div className="relative container-page py-10 md:py-16">
          <Breadcrumbs
            items={[
              { href: "/doctors", label: "Doctors" },
              { href: `/doctors/${doctor.slug}`, label: doctor.name },
            ]}
          />

          <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-14">
            <DoctorPortrait
              doctor={doctor}
              priority
              sizes="(min-width: 768px) 352px, 100vw"
              className="aspect-[4/5] rounded-[var(--radius-card)] shadow-[var(--shadow-lift)]"
            />
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold tracking-[0.16em] text-teal-700 uppercase">
                {specialities.map((s, i) => (
                  <span key={s.slug}>
                    {i > 0 ? ", " : null}
                    <Link href={`/specialities/${s.slug}`} className="hover:underline">
                      {s.name}
                    </Link>
                  </span>
                ))}
              </p>
              <h1 className="mt-3 text-4xl leading-tight font-extrabold md:text-6xl">{doctor.name}</h1>
              <p className="mt-3 text-lg text-ink-soft">{doctor.title}</p>
              <p className="mt-2 text-ink-faint">{doctor.qualifications.join(", ")}</p>

              <dl className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
                  <dt className="text-sm text-ink-faint">Experience</dt>
                  <dd className="mt-1 font-bold text-ink">{doctor.experienceYears} years</dd>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
                  <dt className="text-sm text-ink-faint">Consultation days</dt>
                  <dd className="mt-1 font-bold text-ink">{doctor.availability}</dd>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
                  <dt className="text-sm text-ink-faint">Languages</dt>
                  <dd className="mt-1 font-bold text-ink">{doctor.languages.join(", ")}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={`/appointments?doctor=${doctor.slug}`} size="lg">
                  Request an appointment
                </ButtonLink>
                <WhatsAppLink
                  context={{ kind: "doctor", doctorName: doctor.name, specialityName: primary?.name }}
                  size="lg"
                  variant="secondary"
                >
                  Ask on WhatsApp
                </WhatsAppLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 md:py-20 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div>
          <h2 className="text-3xl font-extrabold text-ink">About {doctor.name}</h2>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-ink-soft">
            {doctor.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-ink">Clinical interests</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {doctor.interests.map((interest) => (
              <li key={interest} className="rounded-full border border-line-strong bg-surface px-4 py-2 text-sm text-ink">
                {interest}
              </li>
            ))}
          </ul>
          <p className="mt-8 rounded-[var(--radius-control)] bg-teal-50 p-5 text-sm leading-relaxed text-ink-soft">
            Appointment requests are reviewed by our patient-services team, who call you to confirm a time with{" "}
            {doctor.name}.
          </p>
        </div>
      </section>
    </>
  );
}
