import type { Metadata } from "next";
import { site } from "@/config/site";
import { PageHeader } from "@/components/composite/page-header";
import { WhatsAppLink } from "@/components/composite/whatsapp-link";
import { buttonStyles } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact and visit us",
  description: "Phone, WhatsApp, opening hours, address and directions for Ahan Hospitals, Banjara Hills, Hyderabad.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact, address, directions, hours } = site;

  return (
    <>
      <PageHeader
        eyebrow="Contact and visit"
        title="We are here to help"
        lead="Reach our patient-services team by phone, WhatsApp or email, or find everything you need to plan your visit."
        breadcrumbs={[{ href: "/contact", label: "Contact and visit" }]}
      />

      <section className="container-page py-12 md:py-16">
        <div className="rounded-[var(--radius-card)] border border-danger/25 bg-danger-50 px-6 py-5 md:flex md:items-center md:justify-between md:gap-6">
          <p className="text-ink">
            <span className="font-semibold text-danger">Medical emergency?</span> Our emergency department is open 24
            hours. In a life-threatening situation, call 108.
          </p>
          <a href={`tel:${contact.emergencyE164}`} className={buttonStyles({ variant: "danger", className: "mt-4 md:mt-0" })}>
            Call emergency {contact.emergencyDisplay}
          </a>
        </div>

        <h2 className="sr-only">Ways to contact us</h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          <li className="rounded-[var(--radius-card)] border border-line bg-surface p-7">
            <h3 className="text-xl font-bold text-ink">Call reception</h3>
            <p className="mt-2 text-ink-soft">For appointments, doctor availability and general questions.</p>
            <a href={`tel:${contact.phoneE164}`} className="mt-5 inline-block font-display text-2xl font-semibold text-teal-800 hover:underline">
              {contact.phoneDisplay}
            </a>
          </li>
          <li className="rounded-[var(--radius-card)] border border-line bg-surface p-7">
            <h3 className="text-xl font-bold text-ink">Message on WhatsApp</h3>
            <p className="mt-2 text-ink-soft">Quick questions, directions and help choosing a speciality.</p>
            <WhatsAppLink context={{ kind: "general" }} variant="primary" className="mt-5">
              Start a chat
            </WhatsAppLink>
          </li>
          <li className="rounded-[var(--radius-card)] border border-line bg-surface p-7">
            <h3 className="text-xl font-bold text-ink">Email us</h3>
            <p className="mt-2 text-ink-soft">For non-urgent questions. Please do not email medical records.</p>
            <a href={`mailto:${contact.email}`} className="mt-5 inline-block font-semibold break-all text-teal-800 hover:underline">
              {contact.email}
            </a>
          </li>
        </ul>
      </section>

      <section aria-labelledby="hours-heading" className="border-t border-line bg-sand/70">
        <div className="container-page grid gap-14 py-16 md:py-20 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 id="hours-heading" className="text-3xl font-extrabold text-ink">
              Opening hours
            </h2>
            <table className="mt-6 w-full text-left">
              <caption className="sr-only">Opening hours by service</caption>
              <thead>
                <tr className="border-b border-line-strong text-sm text-ink-soft">
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    Service
                  </th>
                  <th scope="col" className="py-3 pr-4 font-semibold">
                    Days
                  </th>
                  <th scope="col" className="py-3 font-semibold">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {hours.map((row) => (
                  <tr key={`${row.label}-${row.days}`} className="border-b border-line align-top">
                    <th scope="row" className="py-4 pr-4 font-semibold text-ink">
                      {row.label}
                    </th>
                    <td className="py-4 pr-4 text-ink-soft">{row.days}</td>
                    <td className="py-4 text-ink">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-ink">Getting here</h2>
            <address className="mt-6 text-lg leading-relaxed text-ink not-italic">
              {site.name}
              <br />
              {address.street}
              <br />
              {address.city}, {address.region} {address.postalCode}
            </address>
            <a
              href={directions.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "secondary", className: "mt-6" })}
            >
              Open directions in Google Maps
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <h3 className="mt-10 text-lg font-bold text-ink">Landmarks</h3>
            <ul className="mt-3 space-y-2">
              {directions.landmarks.map((item) => (
                <li key={item} className="flex gap-3 text-ink-soft">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-dawn-500" />
                  {item}
                </li>
              ))}
            </ul>
            <h3 className="mt-8 text-lg font-bold text-ink">Parking</h3>
            <p className="mt-2 text-ink-soft">{directions.parking}</p>
          </div>
        </div>
      </section>
    </>
  );
}
