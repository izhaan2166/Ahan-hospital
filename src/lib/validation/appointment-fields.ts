/**
 * Field names, limits, types and date helpers for appointment requests.
 * Kept free of heavy dependencies so the form can load it immediately; the
 * full validator (zod, phone metadata) lives in ./appointment.ts.
 */

export const APPOINTMENT_FIELDS = [
  "fullName",
  "phone",
  "email",
  "specialitySlug",
  "doctorSlug",
  "preferredDate",
  "preferredSlot",
  "message",
  "consent",
] as const;

export type AppointmentField = (typeof APPOINTMENT_FIELDS)[number];

export const LIMITS = {
  nameMin: 2,
  nameMax: 80,
  phoneMax: 24,
  emailMax: 254,
  messageMax: 500,
  maxDaysAhead: 90,
} as const;

export const TIME_SLOTS = [
  { value: "morning", label: "Morning, 8 am to 12 pm" },
  { value: "afternoon", label: "Afternoon, 12 pm to 4 pm" },
  { value: "evening", label: "Evening, 4 pm to 8 pm" },
] as const;

export type TimeSlot = (typeof TIME_SLOTS)[number]["value"];

/** Phone numbers without a country code are read as Indian numbers. */
export const DEFAULT_PHONE_REGION = "IN" as const;

export type AppointmentContext = {
  /** Today's date in the hospital's time zone, as YYYY-MM-DD. */
  today: string;
  specialities: ReadonlyArray<{ slug: string }>;
  doctors: ReadonlyArray<{ slug: string; specialitySlugs: readonly string[] }>;
};

export type AppointmentRequest = {
  fullName: string;
  /** E.164, for example +919876543210. */
  phone: string;
  email?: string;
  specialitySlug: string;
  doctorSlug?: string;
  preferredDate: string;
  preferredSlot: TimeSlot;
  message?: string;
  consent: true;
};

export type FieldErrors = Partial<Record<AppointmentField, string>>;

export type ValidationResult =
  | { success: true; data: AppointmentRequest }
  | { success: false; fieldErrors: FieldErrors; formError?: string };

// ---------------------------------------------------------------------------
// Dates. All comparisons use plain YYYY-MM-DD strings in the hospital's time
// zone, so results do not depend on the visitor's or server's clock zone.

export function todayInTimeZone(now: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
