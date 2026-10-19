import type { Metadata } from "next";
import Image from "next/image";
import { healthPackages, inr, photos } from "@/content/home";
import { Icon, type IconName } from "@/components/ui/icon";
import { PageHeader, SectionHeading } from "@/components/composite/page-header";
import { PackageCard } from "@/components/composite/package-card";
import { WhatsAppLink } from "@/components/composite/whatsapp-link";

export const metadata: Metadata = {
  title: "Health check-ups",
  description: "Preventive health check-up packages at Ahan Hospitals, Hyderabad, with same-day reports and a physician review.",
  alternates: { canonical: "/health-checkups" },
};

const steps: { icon: IconName; title: string; body: string }[] = [
  { icon: "calendar", title: "Book a morning slot", body: "Choose a package and a day. We call to confirm." },
  { icon: "clock", title: "Fast overnight", body: "Eat nothing after 10 pm. Water is fine." },
  { icon: "clipboard", title: "Tests in one place", body: "Lab, imaging and checks on one floor, finished by noon." },
  { icon: "stethoscope", title: "Physician review", body: "Go through your results with a doctor before you leave." },
];

export default function HealthCheckupsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Preventive health"
        title="Health check-ups"
        lead="Catch problems early. Every package includes same-day reports and a review with a physician before you go home."
        breadcrumbs={[{ href: "/health-checkups", label: "Health check-ups" }]}
      />

      <section aria-labelledby="packages-heading" className="container-page py-16 md:py-20">
        <h2 id="packages-heading" className="sr-only">
          Packages
        </h2>
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {healthPackages.map((p) => (
            <li key={p.slug} className="flex">
              <PackageCard pkg={p} headingLevel="h3" className="w-full" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="compare-heading" className="border-y border-line bg-sand">
        <div className="container-page py-16 md:py-20">
          <SectionHeading id="compare-heading" eyebrow="Compare" title="Which check-up is right for you?" />
          <div className="mt-10 overflow-x-auto rounded-[var(--radius-card)] bg-white ring-1 ring-line">
            <table className="w-full min-w-[36rem] text-left">
              <caption className="sr-only">Health check-up packages compared by price, number of tests and who they suit</caption>
              <thead>
                <tr className="text-sm text-ink-faint">
                  <th scope="col" className="px-6 py-4 font-semibold">Package</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Best for</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Tests</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody>
                {healthPackages.map((p) => (
                  <tr key={p.slug} className="border-t border-line">
                    <th scope="row" className="px-6 py-4 font-bold">
                      <a href={`#${p.slug}`} className="hover:text-teal-700 hover:underline">
                        {p.name}
                      </a>
                    </th>
                    <td className="px-6 py-4 text-ink-soft">{p.for}</td>
                    <td className="px-6 py-4 tabular-nums">{p.tests}</td>
                    <td className="px-6 py-4 font-bold tabular-nums">{inr(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section aria-labelledby="day-heading" className="container-page grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)]">
          <Image src={photos.lab.src} alt={photos.lab.alt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionHeading id="day-heading" eyebrow="On the day" title="Done by lunchtime" />
          <ol className="mt-8 grid gap-6 sm:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon name={step.icon} className="size-6" />
                </span>
                <span>
                  <span className="block font-bold">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </span>
                  <span className="mt-1 block text-sm text-ink-faint">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-[var(--radius-card)] bg-teal-50 p-6">
            <p className="font-bold">Not sure which package to choose?</p>
            <p className="mt-1 text-sm text-ink-soft">Our team can suggest one based on your age and family history.</p>
            <WhatsAppLink context={{ kind: "general" }} variant="primary" className="mt-4">
              Ask on WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </section>
    </>
  );
}
