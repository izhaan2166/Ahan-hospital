"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { site } from "@/config/site";
import { submitAppointment as defaultSubmit, type SubmitAppointment } from "@/lib/appointments/client";
import {
  APPOINTMENT_FIELDS,
  LIMITS,
  TIME_SLOTS,
  addDays,
  todayInTimeZone,
  type AppointmentField,
  type FieldErrors,
} from "@/lib/validation/appointment-fields";

type Validate = typeof import("@/lib/validation/appointment").validateAppointment;
import type { DirectoryOption, DoctorOption } from "@/lib/content";
import { Alert, Spinner } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/controls";
import { Field, FieldError } from "@/components/ui/field";

type Values = {
  fullName: string;
  phone: string;
  email: string;
  specialitySlug: string;
  doctorSlug: string;
  preferredDate: string;
  preferredSlot: string;
  message: string;
  consent: boolean;
  website: string;
};

type Status =
  | { kind: "editing" }
  | { kind: "submitting" }
  | { kind: "received"; reference: string }
  | { kind: "demo" }
  | { kind: "failed"; message: string };

type Props = {
  specialities: DirectoryOption[];
  doctors: DoctorOption[];
  /** Today's date in the hospital time zone, from the server. */
  today: string;
  initialSpeciality?: string;
  initialDoctor?: string;
  /** Prefills the reason for visit, for example a chosen check-up package. */
  initialMessage?: string;
  /** Injectable for tests; defaults to the real API call. */
  submit?: SubmitAppointment;
};

const fieldId = (field: AppointmentField) => `appointment-${field}`;

function initialValues(props: Props): Values {
  const doctor = props.doctors.find((d) => d.slug === props.initialDoctor);
  const specialityFromUrl = props.specialities.some((s) => s.slug === props.initialSpeciality) ? props.initialSpeciality! : "";
  const specialitySlug = doctor
    ? specialityFromUrl && doctor.specialitySlugs.includes(specialityFromUrl)
      ? specialityFromUrl
      : doctor.specialitySlugs[0]
    : specialityFromUrl;
  return {
    fullName: "",
    phone: "",
    email: "",
    specialitySlug,
    doctorSlug: doctor?.slug ?? "",
    preferredDate: "",
    preferredSlot: "",
    message: props.initialMessage ?? "",
    consent: false,
    website: "",
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

export function AppointmentForm(props: Props) {
  const { specialities, doctors, today, submit = defaultSubmit } = props;
  const [values, setValues] = useState<Values>(() => initialValues(props));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string>();
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "editing" });
  const [submitted, setSubmitted] = useState<Values | null>(null);
  // Bumped whenever the error summary should take focus, after it renders.
  const [summaryFocus, setSummaryFocus] = useState(0);
  const inFlight = useRef(false);
  // The full validator (zod and phone metadata) is loaded on first use so it
  // does not delay the page becoming interactive.
  const validatorRef = useRef<Validate | null>(null);
  const loadValidator = useCallback(async () => {
    validatorRef.current ??= (await import("@/lib/validation/appointment")).validateAppointment;
    return validatorRef.current;
  }, []);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const failureRef = useRef<HTMLDivElement>(null);

  const context = useMemo(
    () => ({ today: todayInTimeZone(new Date(), site.timeZone), specialities, doctors }),
    [specialities, doctors],
  );

  const availableDoctors = useMemo(
    () => (values.specialitySlug ? doctors.filter((d) => d.specialitySlugs.includes(values.specialitySlug)) : doctors),
    [doctors, values.specialitySlug],
  );

  const errorEntries = APPOINTMENT_FIELDS.filter((field) => errors[field]).map((field) => [field, errors[field]!] as const);

  useEffect(() => {
    if (summaryFocus) summaryRef.current?.focus();
  }, [summaryFocus]);

  useEffect(() => {
    if (status.kind === "received" || status.kind === "demo") resultRef.current?.focus();
    if (status.kind === "failed") failureRef.current?.focus();
  }, [status.kind]);

  const toPayload = (v: Values) => ({
    fullName: v.fullName,
    phone: v.phone,
    email: v.email,
    specialitySlug: v.specialitySlug,
    doctorSlug: v.doctorSlug,
    preferredDate: v.preferredDate,
    preferredSlot: v.preferredSlot,
    message: v.message,
    consent: v.consent,
    website: v.website,
  });

  const revalidate = (next: Values) => {
    const validateAppointment = validatorRef.current;
    if (!attempted || !validateAppointment) return;
    const result = validateAppointment(toPayload(next), context);
    setErrors(result.success ? {} : result.fieldErrors);
  };

  const update = <K extends keyof Values>(key: K, value: Values[K]) => {
    const next = { ...values, [key]: value };
    // Keep the doctor consistent with the chosen speciality.
    if (key === "specialitySlug" && next.doctorSlug) {
      const doctor = doctors.find((d) => d.slug === next.doctorSlug);
      if (!doctor?.specialitySlugs.includes(value as string)) next.doctorSlug = "";
    }
    setValues(next);
    revalidate(next);
  };

  // Callers set inFlight before calling, so double clicks cannot send twice.
  const send = async (snapshot: Values) => {
    setStatus({ kind: "submitting" });
    setFormError(undefined);
    try {
      const outcome = await submit(toPayload(snapshot));
      switch (outcome.kind) {
        case "received":
          setSubmitted(snapshot);
          setStatus({ kind: "received", reference: outcome.reference });
          break;
        case "demo":
          setSubmitted(snapshot);
          setStatus({ kind: "demo" });
          break;
        case "invalid":
          setErrors(outcome.fieldErrors);
          setFormError(Object.keys(outcome.fieldErrors).length ? undefined : outcome.message);
          setStatus({ kind: "editing" });
          setSummaryFocus((n) => n + 1);
          break;
        case "error":
          setStatus({ kind: "failed", message: outcome.message });
          break;
      }
    } catch {
      setStatus({ kind: "failed", message: "Something went wrong on our side. Please try again, or call reception." });
    } finally {
      inFlight.current = false;
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setAttempted(true);
    let validateAppointment: Validate;
    try {
      validateAppointment = await loadValidator();
    } catch {
      inFlight.current = false;
      setStatus({ kind: "failed", message: "Part of this page did not load. Check your connection and try again." });
      return;
    }
    const result = validateAppointment(toPayload(values), context);
    if (!result.success) {
      inFlight.current = false;
      setErrors(result.fieldErrors);
      setFormError(result.formError);
      setStatus({ kind: "editing" });
      setSummaryFocus((n) => n + 1);
      return;
    }
    setErrors({});
    await send(values);
  };

  const startAgain = () => {
    setValues(initialValues(props));
    setErrors({});
    setAttempted(false);
    setSubmitted(null);
    setStatus({ kind: "editing" });
  };

  if ((status.kind === "received" || status.kind === "demo") && submitted) {
    const speciality = specialities.find((s) => s.slug === submitted.specialitySlug)?.name;
    const doctor = doctors.find((d) => d.slug === submitted.doctorSlug)?.name ?? "Any available doctor";
    const slot = TIME_SLOTS.find((s) => s.value === submitted.preferredSlot)?.label;
    const isDemo = status.kind === "demo";

    return (
      <section aria-labelledby="result-heading" className="rounded-[var(--radius-card)] border border-line bg-surface p-6 md:p-10">
        <span
          aria-hidden="true"
          className={`flex size-12 items-center justify-center rounded-full ${isDemo ? "bg-notice-50 text-notice" : "bg-success-50 text-success"}`}
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isDemo ? <path d="M12 8v5m0 3h.01M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" /> : <path d="m5 12.5 4.5 4.5L19 7.5" />}
          </svg>
        </span>
        <h2 id="result-heading" ref={resultRef} tabIndex={-1} className="mt-5 text-3xl font-extrabold text-ink focus:outline-none">
          {isDemo ? "Demo request checked, not sent" : "Request received"}
        </h2>
        {isDemo ? (
          <Alert tone="notice" title="This site is running in demo mode" className="mt-5">
            Your details passed validation, but neither appointment storage nor email alerts are configured, so nothing was saved and no one
            will contact you. To request a real appointment, call {site.contact.phoneDisplay}.
          </Alert>
        ) : (
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-ink-soft">
            Thank you. This is a request, not a confirmed booking. Our patient-services team will call you to confirm a
            time, usually within one working day.
          </p>
        )}

        <dl className="mt-8 grid gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-2">
          {!isDemo && status.kind === "received" ? (
            <div>
              <dt className="text-sm text-ink-soft">Request reference</dt>
              <dd className="mt-1 font-mono text-lg font-semibold text-ink">{status.reference}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-sm text-ink-soft">Speciality</dt>
            <dd className="mt-1 font-semibold text-ink">{speciality}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Doctor</dt>
            <dd className="mt-1 font-semibold text-ink">{doctor}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Preferred day</dt>
            <dd className="mt-1 font-semibold text-ink">{formatDate(submitted.preferredDate)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">Preferred time</dt>
            <dd className="mt-1 font-semibold text-ink">{slot}</dd>
          </div>
        </dl>

        <Button variant="secondary" className="mt-8" onClick={startAgain}>
          Make another request
        </Button>
      </section>
    );
  }

  const submitting = status.kind === "submitting";

  return (
    <form noValidate onSubmit={onSubmit} onFocus={() => void loadValidator().catch(() => {})} aria-labelledby="appointment-form-heading" className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-soft)] md:p-10">
      <h2 id="appointment-form-heading" className="text-2xl font-extrabold text-ink md:text-3xl">
        Appointment request
      </h2>
      <p className="mt-2 text-ink-soft">
        Please use details for the person who needs the appointment. Do not include medical records.
      </p>

      {errorEntries.length > 0 || formError ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className="mt-6 rounded-[var(--radius-control)] border-2 border-danger bg-danger-50 p-5 focus:outline-none focus-visible:ring-4 focus-visible:ring-danger/30">
          <h3 id="error-summary-title" className="font-sans text-base font-bold text-danger">
            {errorEntries.length > 0
              ? `Please correct ${errorEntries.length === 1 ? "1 detail" : `${errorEntries.length} details`} before sending`
              : "We could not send your request"}
          </h3>
          {formError ? <p className="mt-1 text-sm text-ink">{formError}</p> : null}
          {errorEntries.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <a href={`#${fieldId(field)}`} className="font-medium text-danger underline underline-offset-2">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {status.kind === "failed" ? (
        <div ref={failureRef} tabIndex={-1} className="mt-6 focus:outline-none">
          <Alert tone="error" role="alert" title="Your request was not sent">
            <p>{status.message}</p>
            <p className="mt-1">Your details are still here. You can try again, or call {site.contact.phoneDisplay}.</p>
          </Alert>
        </div>
      ) : null}

      <fieldset className="mt-8">
        <legend className="font-display text-xl font-semibold text-ink">Patient details</legend>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <Field label="Full name" required error={errors.fullName} id={fieldId("fullName")} className="md:col-span-2">
            {(control) => (
              <Input {...control} name="fullName" autoComplete="name" maxLength={LIMITS.nameMax} value={values.fullName} onChange={(e) => update("fullName", e.target.value)} />
            )}
          </Field>
          <Field label="Mobile number" required hint="Indian numbers can be entered without +91." error={errors.phone} id={fieldId("phone")}>
            {(control) => (
              <Input {...control} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={LIMITS.phoneMax} value={values.phone} onChange={(e) => update("phone", e.target.value)} />
            )}
          </Field>
          <Field label="Email" hint="For a written confirmation." error={errors.email} id={fieldId("email")}>
            {(control) => (
              <Input {...control} name="email" type="email" autoComplete="email" maxLength={LIMITS.emailMax} value={values.email} onChange={(e) => update("email", e.target.value)} />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="mt-10">
        <legend className="font-display text-xl font-semibold text-ink">Appointment</legend>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <Field label="Speciality" required error={errors.specialitySlug} id={fieldId("specialitySlug")}>
            {(control) => (
              <Select {...control} name="specialitySlug" value={values.specialitySlug} onChange={(e) => update("specialitySlug", e.target.value)}>
                <option value="">Choose a speciality</option>
                {specialities.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Doctor" hint={values.specialitySlug ? undefined : "Choose a speciality to narrow this list."} error={errors.doctorSlug} id={fieldId("doctorSlug")}>
            {(control) => (
              <Select {...control} name="doctorSlug" value={values.doctorSlug} onChange={(e) => update("doctorSlug", e.target.value)}>
                <option value="">Any available doctor</option>
                {availableDoctors.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Preferred date" required hint="We will confirm the exact time by phone." error={errors.preferredDate} id={fieldId("preferredDate")}>
            {(control) => (
              <Input {...control} name="preferredDate" type="date" min={today} max={addDays(today, LIMITS.maxDaysAhead)} value={values.preferredDate} onChange={(e) => update("preferredDate", e.target.value)} />
            )}
          </Field>
          <Field label="Preferred time" required error={errors.preferredSlot} id={fieldId("preferredSlot")}>
            {(control) => (
              <Select {...control} name="preferredSlot" value={values.preferredSlot} onChange={(e) => update("preferredSlot", e.target.value)}>
                <option value="">Choose a time of day</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field
            label="Reason for visit"
            hint={`A short note helps us prepare. ${LIMITS.messageMax} characters maximum.`}
            error={errors.message}
            id={fieldId("message")}
            className="md:col-span-2"
          >
            {(control) => (
              <Textarea {...control} name="message" rows={4} maxLength={LIMITS.messageMax} value={values.message} onChange={(e) => update("message", e.target.value)} />
            )}
          </Field>
        </div>
      </fieldset>

      {/* Honeypot: hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="appointment-website">Website</label>
        <input id="appointment-website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => update("website", e.target.value)} />
      </div>

      <div className="mt-8">
        <Checkbox
          id={fieldId("consent")}
          name="consent"
          checked={values.consent}
          onChange={(e) => update("consent", e.target.checked)}
          aria-invalid={errors.consent ? true : undefined}
          aria-describedby={errors.consent ? `${fieldId("consent")}-error` : undefined}
          label="I agree that Ahan Hospitals may contact me by phone or email about this appointment request. (required)"
        />
        {errors.consent ? (
          <div className="mt-2 pl-8">
            <FieldError id={`${fieldId("consent")}-error`}>{errors.consent}</FieldError>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">Sending a request does not confirm a booking.</p>
        <Button type="submit" size="lg" disabled={submitting} aria-disabled={submitting}>
          {submitting ? <Spinner label="Sending request" /> : status.kind === "failed" ? "Try again" : "Send request"}
        </Button>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {submitting ? "Sending your request" : ""}
      </p>
    </form>
  );
}
