import { headers } from "next/headers";
import { site } from "@/config/site";
import type { Doctor, Speciality } from "@/content/types";

/**
 * Renders schema.org data in a nonce-tagged script so it passes the CSP.
 * JSON is escaped so content can never close the script element.
 */
export async function JsonLd({ data }: { data: Record<string, unknown> }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: json }} />;
}

export const absoluteUrl = (path = "/") => new URL(path, site.url).toString();

export function hospitalSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Hospital",
    "@id": absoluteUrl("/#hospital"),
    name: site.name,
    description: site.description,
    url: absoluteUrl("/"),
    telephone: site.contact.phoneE164,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    openingHoursSpecification: site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      name: h.label,
      dayOfWeek: h.dayCodes.map((d) => dayNames[d]),
      opens: h.opens,
      closes: h.closes,
    })),
    emergencyService: true,
  };
}

const dayNames: Record<string, string> = {
  Mo: "https://schema.org/Monday",
  Tu: "https://schema.org/Tuesday",
  We: "https://schema.org/Wednesday",
  Th: "https://schema.org/Thursday",
  Fr: "https://schema.org/Friday",
  Sa: "https://schema.org/Saturday",
  Su: "https://schema.org/Sunday",
};

export function physicianSchema(doctor: Doctor, specialities: Speciality[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    name: doctor.name,
    jobTitle: doctor.title,
    url: absoluteUrl(`/doctors/${doctor.slug}`),
    medicalSpecialty: specialities.map((s) => s.name),
    knowsLanguage: doctor.languages,
    worksFor: { "@id": absoluteUrl("/#hospital") },
  };
}

export function specialitySchema(speciality: Speciality) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${speciality.name} at ${site.name}`,
    url: absoluteUrl(`/specialities/${speciality.slug}`),
    about: { "@type": "MedicalSpecialty", name: speciality.name },
    description: speciality.summary,
    publisher: { "@id": absoluteUrl("/#hospital") },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
