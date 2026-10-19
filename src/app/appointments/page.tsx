import type { Metadata } from "next";
import { site } from "@/config/site";
import { healthPackages } from "@/content/home";
import { getAppointmentOptions } from "@/lib/content";
import { isEmailConfigured } from "@/lib/appointments/notify";
import { isStorageConfigured } from "@/lib/appointments/store";
import { todayInTimeZone } from "@/lib/validation/appointment";
import { PageHeader } from "@/components/composite/page-header";
import { SectionErrorBoundary } from "@/components/composite/error-boundary";
import { WhatsAppLink } from "@/components/composite/whatsapp-link";
import { Alert } from "@/components/ui/feedback";
import { AppointmentForm } from "@/components/sections/appointment-form";

export const metadata: Metadata = {
  title: "Request an appointment",
  description: "Request a consultation with a specialist at Ahan Hospitals, Hyderabad. Our team calls you to confirm a time.",
  alternates: { canonical: "/appointments" },
};

type Props = {
  searchParams: Promise<{ doctor?: string | string[]; speciality?: string | string[]; package?: string | string[] }>;
};

const single = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

export default async function AppointmentsPage({ searchParams }: Props) {
  const [options, params] = await Promise.all([getAppointmentOptions(), searchParams]);
  const demoMode = !isStorageConfigured() && !isEmailConfigured();
  const pkg = healthPackages.find((p) => p.slug === single(params.package));

  return (
    <>
      <PageHeader
        eyebrow="Appointments"
        title="Request an appointment"
        lead="Tell us who you would like to see and when suits you. Our patient-services team will call to confirm a time."
        breadcrumbs={[{ href: "/appointments", label: "Request an appointment" }]}
      />
      <section className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <div>
          {demoMode ? (
            <Alert tone="notice" title="Demo mode" className="mb-6">
              Appointment storage and email alerts are not configured on this deployment. The form checks your details, but requests are
              not saved and no one will call you.
            </Alert>
          ) : null}
          <SectionErrorBoundary section="the appointment form">
            <AppointmentForm
              specialities={options.specialities}
              doctors={options.doctors}
              today={todayInTimeZone(new Date(), site.timeZone)}
              initialDoctor={single(params.doctor)}
              initialSpeciality={single(params.speciality)}
              initialMessage={pkg ? `Health check-up: ${pkg.name}` : undefined}
            />
          </SectionErrorBoundary>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-[var(--radius-card)] bg-teal-50 p-7">
            <h2 className="text-2xl font-extrabold text-ink">What happens next</h2>
            <ol className="mt-5 space-y-5">
              {[
                ["We review your request", "Our patient-services team checks the doctor's consultation days."],
                ["We call to confirm", "Usually within one working day, on the number you give us."],
                ["Visit with your reports", "Bring previous prescriptions and test results, and arrive 15 minutes early."],
              ].map(([title, body], index) => (
                <li key={title} className="grid grid-cols-[2rem_1fr] gap-3">
                  <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-sans font-bold text-ink">{title}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-7">
            <h2 className="text-xl font-extrabold text-ink">Prefer to talk?</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              Call reception on{" "}
              <a href={`tel:${site.contact.phoneE164}`} className="font-semibold text-teal-800 underline">
                {site.contact.phoneDisplay}
              </a>{" "}
              or message us on WhatsApp.
            </p>
            <WhatsAppLink context={{ kind: "general" }} className="mt-4 w-full">
              Chat on WhatsApp
            </WhatsAppLink>
          </div>
          <p className="rounded-[var(--radius-card)] border border-danger/25 bg-danger-50 p-5 text-sm leading-relaxed text-ink">
            <span className="font-semibold text-danger">Not for emergencies.</span> If you need urgent care, call{" "}
            <a href={`tel:${site.contact.emergencyE164}`} className="font-semibold underline">
              {site.contact.emergencyDisplay}
            </a>{" "}
            or 108.
          </p>
        </aside>
      </section>
    </>
  );
}
