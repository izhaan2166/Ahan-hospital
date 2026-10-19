import type { MetadataRoute } from "next";
import { getDoctors, getSpecialities } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo/json-ld";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [doctors, specialities] = await Promise.all([getDoctors(), getSpecialities()]);
  const pages = ["/", "/about", "/specialities", "/doctors", "/health-checkups", "/appointments", "/contact"];
  return [
    ...pages.map((path) => ({ url: absoluteUrl(path), changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.8 })),
    ...specialities.map((s) => ({ url: absoluteUrl(`/specialities/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...doctors.map((d) => ({ url: absoluteUrl(`/doctors/${d.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
