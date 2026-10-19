import type { Metadata } from "next";
import Image from "next/image";
import { specialityPhotos } from "@/content/home";
import { Icon } from "@/components/ui/icon";
import { notFound } from "next/navigation";
import { getDoctorsBySpeciality, getSpeciality, getSpecialities } from "@/lib/content";
import { JsonLd, breadcrumbSchema, specialitySchema } from "@/lib/seo/json-ld";
import { PageHeader } from "@/components/composite/page-header";
import { DoctorCard } from "@/components/composite/cards";
import { SpecialityIcon } from "@/components/composite/speciality-icon";
import { EmptyState } from "@/components/composite/states";
import { WhatsAppLink } from "@/components/composite/whatsapp-link";
import { ButtonLink } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getSpecialities()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const speciality = await getSpeciality((await params).slug);
  if (!speciality) return { title: "Speciality not found" };
  return {
    title: speciality.name,
    description: speciality.summary,
    alternates: { canonical: `/specialities/${speciality.slug}` },
  };
}

export default async function SpecialityPage({ params }: Props) {
  const { slug } = await params;
  const speciality = await getSpeciality(slug);
  if (!speciality) notFound();

  const doctors = await getDoctorsBySpeciality(speciality.slug);
  const photo = specialityPhotos[speciality.slug];

  return (
    <>
      <JsonLd data={specialitySchema(speciality)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Specialities", path: "/specialities" },
          { name: speciality.name, path: `/specialities/${speciality.slug}` },
        ])}
      />
      <PageHeader
        eyebrow="Speciality"
        title={speciality.name}
        lead={speciality.summary}
        breadcrumbs={[
          { href: "/specialities", label: "Specialities" },
          { href: `/specialities/${speciality.slug}`, label: speciality.name },
        ]}
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={`/appointments?speciality=${speciality.slug}`} size="lg">
            Request an appointment
          </ButtonLink>
          <WhatsAppLink context={{ kind: "speciality", specialityName: speciality.name }} size="lg" variant="secondary">
            Ask about {speciality.name}
          </WhatsAppLink>
        </div>
      </PageHeader>

      <section className="container-page grid gap-14 py-16 md:py-20 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <div>
          {photo ? (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)]">
              <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
              <span className="absolute bottom-4 left-4 flex size-12 items-center justify-center rounded-2xl bg-white text-teal-700 shadow">
                <SpecialityIcon icon={speciality.icon} className="size-6" />
              </span>
            </div>
          ) : null}
          <h2 className="text-3xl font-extrabold text-ink">About the department</h2>
          <div className="mt-4 space-y-4 text-lg leading-relaxed text-ink-soft">
            {speciality.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <h2 className="text-xl font-bold text-ink">Conditions we treat</h2>
            <ul className="mt-4 space-y-2.5">
              {speciality.conditions.map((item) => (
                <li key={item} className="flex gap-3 text-ink-soft">
                  <Icon name="check" className="mt-1 size-4 shrink-0 text-teal-700" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Tests and treatments</h2>
            <ul className="mt-4 space-y-2.5">
              {speciality.services.map((item) => (
                <li key={item} className="flex gap-3 text-ink-soft">
                  <Icon name="check" className="mt-1 size-4 shrink-0 text-dawn-700" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="team-heading" className="border-t border-line bg-sand">
        <div className="container-page py-16 md:py-20">
          <h2 id="team-heading" className="text-3xl font-extrabold text-ink">
            {speciality.name} doctors
          </h2>
          {doctors.length > 0 ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {doctors.map((doctor) => (
                <li key={doctor.slug} className="flex">
                  <DoctorCard doctor={doctor} specialityNames={[speciality.name]} className="w-full" />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState className="mt-10" headingLevel="h3" title="Consultant profiles coming soon">
              You can still request an appointment and our team will match you with the right specialist.
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
