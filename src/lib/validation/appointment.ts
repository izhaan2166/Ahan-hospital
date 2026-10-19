import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { z } from "zod";

/**
 * Appointment request validation, shared by the form (for instant feedback)
 * and the API route (the real trust boundary). It has no UI or framework
 * dependencies so it can be unit-tested directly.
 */

import {
  APPOINTMENT_FIELDS,
  DEFAULT_PHONE_REGION,
  LIMITS,
  TIME_SLOTS,
  addDays,
  isIsoDate,
  type AppointmentContext,
  type AppointmentField,
  type AppointmentRequest,
  type FieldErrors,
  type TimeSlot,
  type ValidationResult,
} from "./appointment-fields";

export * from "./appointment-fields";

// ---------------------------------------------------------------------------
// Normalisation helpers. These tidy input without discarding legitimate
// characters: names keep apostrophes, hyphens, accents and non-Latin scripts.

export function normaliseLine(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

export function normaliseMultiline(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Letters and combining marks from any script, plus ' ’ . - and spaces. */
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}'’.\- ]*$/u;
/** Control characters other than newline and tab. */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const PHONE_CHARS = /^\+?[\d\s().-]+$/;

export function normalisePhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > LIMITS.phoneMax || !PHONE_CHARS.test(trimmed)) return null;
  const parsed = parsePhoneNumberFromString(trimmed, DEFAULT_PHONE_REGION);
  return parsed && parsed.isValid() ? parsed.number : null;
}

// ---------------------------------------------------------------------------

const text = (required: string) => z.string({ error: required });

export function createAppointmentSchema(ctx: AppointmentContext) {
  const specialitySlugs = new Set(ctx.specialities.map((s) => s.slug));
  const doctorsBySlug = new Map(ctx.doctors.map((d) => [d.slug, d]));
  const latest = addDays(ctx.today, LIMITS.maxDaysAhead);

  return z
    .strictObject({
      fullName: text("Enter the patient's full name.")
        .max(LIMITS.nameMax * 4, `Name must be ${LIMITS.nameMax} characters or fewer.`)
        .transform(normaliseLine)
        .pipe(
          z
            .string()
            .min(1, "Enter the patient's full name.")
            .min(LIMITS.nameMin, `Name must be at least ${LIMITS.nameMin} characters.`)
            .max(LIMITS.nameMax, `Name must be ${LIMITS.nameMax} characters or fewer.`)
            .regex(NAME_PATTERN, "Use letters, spaces, apostrophes, hyphens or full stops only."),
        ),

      phone: text("Enter a phone number.").transform((value, issue) => {
        if (!value.trim()) {
          issue.addIssue({ code: "custom", message: "Enter a phone number." });
          return z.NEVER;
        }
        const e164 = normalisePhone(value);
        if (!e164) {
          issue.addIssue({
            code: "custom",
            message: "Enter a valid phone number, for example 98765 43210 or +44 20 7946 0958.",
          });
          return z.NEVER;
        }
        return e164;
      }),

      email: z
        .string({ error: "Enter a valid email address." })
        .max(LIMITS.emailMax, "Email address is too long.")
        .transform((value) => value.trim())
        .pipe(z.union([z.literal(""), z.email("Enter a valid email address, like name@example.com.")]))
        .transform((value) => value || undefined)
        .optional(),

      specialitySlug: text("Choose a speciality.").refine((slug) => specialitySlugs.has(slug), "Choose a speciality."),

      doctorSlug: z
        .string({ error: "Choose a doctor from the list." })
        .transform((value) => value || undefined)
        .refine((slug) => slug === undefined || doctorsBySlug.has(slug), "Choose a doctor from the list.")
        .optional(),

      preferredDate: text("Choose a preferred date.")
        .refine((value) => value !== "", "Choose a preferred date.")
        .refine((value) => value === "" || isIsoDate(value), "Enter a real date.")
        .refine((value) => !isIsoDate(value) || value >= ctx.today, "Choose today or a future date.")
        .refine(
          (value) => !isIsoDate(value) || value < ctx.today || value <= latest,
          `Choose a date within the next ${LIMITS.maxDaysAhead} days.`,
        ),

      preferredSlot: z.enum(
        TIME_SLOTS.map((slot) => slot.value) as [TimeSlot, ...TimeSlot[]],
        { error: "Choose a preferred time of day." },
      ),

      message: z
        .string({ error: "Message must be text." })
        .transform(normaliseMultiline)
        .pipe(
          z
            .string()
            .max(LIMITS.messageMax, `Keep the message to ${LIMITS.messageMax} characters or fewer.`)
            .refine((value) => !CONTROL_CHARS.test(value), "Remove unsupported characters from the message."),
        )
        .transform((value) => value || undefined)
        .optional(),

      consent: z.literal(true, { error: "Please agree so our team can contact you about this request." }),

      /** Honeypot: hidden from people, so any value means an automated submission. */
      website: z.string().max(0, "Unexpected value.").optional(),
    })
    .superRefine((value, issue) => {
      if (!value.doctorSlug) return;
      const doctor = doctorsBySlug.get(value.doctorSlug);
      if (doctor && !doctor.specialitySlugs.includes(value.specialitySlug)) {
        issue.addIssue({
          code: "custom",
          path: ["doctorSlug"],
          message: "This doctor does not work in the selected speciality. Choose another doctor or any available doctor.",
        });
      }
    });
}

export function validateAppointment(input: unknown, ctx: AppointmentContext): ValidationResult {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { success: false, fieldErrors: {}, formError: "The request was not in the expected format." };
  }

  const result = createAppointmentSchema(ctx).safeParse(input);
  if (result.success) {
    // Drop the honeypot from the stored shape.
    const { website: _website, ...data } = result.data;
    void _website;
    return { success: true, data: data as AppointmentRequest };
  }

  const fieldErrors: FieldErrors = {};
  let formError: string | undefined;
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && (APPOINTMENT_FIELDS as readonly string[]).includes(field)) {
      fieldErrors[field as AppointmentField] ??= issue.message;
    } else {
      formError ??= "The request could not be processed. Please check the form and try again.";
    }
  }
  return { success: false, fieldErrors, formError };
}
