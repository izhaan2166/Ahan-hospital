import type { Metadata } from "next";
import { getDoctors, getSpecialities } from "@/lib/content";
import { PageHeader } from "@/components/composite/page-header";
import { SectionErrorBoundary } from "@/components/composite/error-boundary";
import { EmptyState } from "@/components/composite/states";
import { DoctorDirectory } from "@/components/sections/doctor-directory";

export const metadata: Metadata = {
  title: "Find a doctor",
  description: "Search consultants at Ahan Hospitals by name, condition or speciality and request an appointment.",
  alternates: { canonical: "/doctors" },
};

type Props = { searchParams: Promise<{ speciality?: string | string[] }> };

export default async function DoctorsPage({ searchParams }: Props) {
  const [doctors, specialities, params] = await Promise.all([getDoctors(), getSpecialities(), searchParams]);
  const initialSpeciality = typeof params.speciality === "string" ? params.speciality : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Our doctors"
        title="Find a doctor"
        lead="Search by name or condition, or filter by speciality. Every profile lists consultation days and the languages the doctor speaks."
        breadcrumbs={[{ href: "/doctors", label: "Doctors" }]}
      />
      <section className="container-page py-12 md:py-16">
        {doctors.length === 0 ? (
          <EmptyState title="Doctor profiles are being updated">
            Please call reception or send us a WhatsApp message and we will help you find the right consultant.
          </EmptyState>
        ) : (
          <SectionErrorBoundary section="the doctor directory">
            <DoctorDirectory
              doctors={doctors}
              specialities={specialities.map(({ slug, name }) => ({ slug, name }))}
              initialSpeciality={initialSpeciality}
            />
          </SectionErrorBoundary>
        )}
      </section>
    </>
  );
}
