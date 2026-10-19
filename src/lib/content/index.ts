import { doctors } from "@/content/doctors";
import { specialities } from "@/content/specialities";
import type { Doctor, Speciality } from "@/content/types";

/**
 * The single read path for doctor and speciality content. Pages and
 * components never import the content files directly, so the data source can
 * move to a CMS later without touching the UI.
 */

export type { Doctor, Speciality };

export async function getSpecialities(): Promise<Speciality[]> {
  return specialities;
}

export async function getSpeciality(slug: string): Promise<Speciality | undefined> {
  return specialities.find((s) => s.slug === slug);
}

export async function getDoctors(): Promise<Doctor[]> {
  return doctors;
}

export async function getDoctor(slug: string): Promise<Doctor | undefined> {
  return doctors.find((d) => d.slug === slug);
}

export async function getDoctorsBySpeciality(slug: string): Promise<Doctor[]> {
  return doctors.filter((d) => d.specialitySlugs.includes(slug));
}

export async function getFeaturedDoctors(): Promise<Doctor[]> {
  return doctors.filter((d) => d.featured);
}

export const HEALTH_CHECKUP_SLUG = "health-checkup";

/** Lightweight shape used by the appointment form and its validation. */
export type DirectoryOption = {
  slug: string;
  name: string;
};

export type DoctorOption = DirectoryOption & { specialitySlugs: string[] };

export async function getAppointmentOptions(): Promise<{
  specialities: DirectoryOption[];
  doctors: DoctorOption[];
}> {
  return {
    // Health check-ups are booked through the same form, without a doctor.
    specialities: [...specialities.map(({ slug, name }) => ({ slug, name })), { slug: HEALTH_CHECKUP_SLUG, name: "Health check-up" }],
    doctors: doctors.map(({ slug, name, specialitySlugs }) => ({ slug, name, specialitySlugs })),
  };
}
