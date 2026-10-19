import type { Metadata } from "next";
import { getSpecialities } from "@/lib/content";
import { PageHeader } from "@/components/composite/page-header";
import { SpecialityCard } from "@/components/composite/cards";
import { specialityPhotos } from "@/content/home";
import { EmptyState } from "@/components/composite/states";
import { WhatsAppLink } from "@/components/composite/whatsapp-link";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Specialities",
  description: "Cardiology, neurosciences, orthopaedics, women's health, paediatrics, oncology, gastroenterology and kidney care at Ahan Hospitals, Hyderabad.",
  alternates: { canonical: "/specialities" },
};

export default async function SpecialitiesPage() {
  const specialities = await getSpecialities();

  return (
    <>
      <PageHeader
        eyebrow="Specialities"
        title="Find the right team for your care"
        lead="Every department at Ahan combines consultants, specialist nurses and therapists, with imaging and laboratory services in the same building."
        breadcrumbs={[{ href: "/specialities", label: "Specialities" }]}
      />
      <section className="container-page grid gap-12 py-16 md:py-20 lg:grid-cols-[1fr_20rem] lg:gap-16">
        {specialities.length > 0 ? (
          <ul className="grid gap-6 self-start sm:grid-cols-2 xl:grid-cols-3">
            {specialities.map((speciality) => (
              <li key={speciality.slug} className="flex">
                <SpecialityCard speciality={speciality} photo={specialityPhotos[speciality.slug]} headingLevel="h2" className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Specialities are being updated">
            Please call reception and we will direct you to the right department.
          </EmptyState>
        )}
        <aside aria-labelledby="unsure-heading" className="self-start rounded-[var(--radius-card)] bg-teal-50 p-7 lg:sticky lg:top-36">
          <h2 id="unsure-heading" className="text-2xl font-extrabold text-ink">
            Not sure where to start?
          </h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            Tell us what you need help with and our patient-services team will suggest the right speciality and doctor.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <WhatsAppLink context={{ kind: "general" }} variant="primary">
              Ask on WhatsApp
            </WhatsAppLink>
            <ButtonLink href="/appointments" variant="secondary">
              Request an appointment
            </ButtonLink>
          </div>
        </aside>
      </section>
    </>
  );
}
