import "server-only";
import { site } from "@/config/site";
import { TIME_SLOTS, type AppointmentRequest } from "@/lib/validation/appointment";

/**
 * Emails each appointment request to the hospital's inbox through Resend.
 * Credentials are server-only environment variables; nothing here reaches
 * the browser.
 */

export type NotifyResult = { status: "sent" } | { status: "skipped" } | { status: "failed" };

export type AppointmentLabels = { speciality: string; doctor?: string };

export interface AppointmentNotifier {
  send(request: AppointmentRequest, reference: string, labels: AppointmentLabels): Promise<NotifyResult>;
}

/** Reads a setting, ignoring spaces or quotes pasted around it in a hosting dashboard. */
const setting = (value: string | undefined) => value?.trim().replace(/^["']|["']$/g, "").trim() || undefined;

/**
 * Describes the shape of the API key for troubleshooting, without revealing
 * it: whether it has Resend's prefix, its length, and any stray characters.
 */
export function describeKey(raw: string | undefined): string {
  const key = setting(raw) ?? "";
  return `key_prefix_ok=${key.startsWith("re_")} key_length=${key.length} key_has_space=${/\s/.test(key)} key_has_equals=${key.includes("=")}`;
}

export function isEmailConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(setting(env.RESEND_API_KEY) && setting(env.APPOINTMENT_NOTIFY_TO));
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** Builds the subject, plain-text and HTML versions of the notification. */
export function buildAppointmentEmail(request: AppointmentRequest, reference: string, labels: AppointmentLabels, receivedAt = new Date()) {
  const slot = TIME_SLOTS.find((s) => s.value === request.preferredSlot)?.label ?? request.preferredSlot;
  const date = formatDate(request.preferredDate);
  const received = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: site.timeZone }).format(receivedAt);
  const doctor = labels.doctor ?? "Any available doctor";

  const rows: [string, string, string?][] = [
    ["Reference", reference],
    ["Patient name", request.fullName],
    ["Phone", request.phone, `tel:${request.phone}`],
    ["Email", request.email ?? "Not given", request.email ? `mailto:${request.email}` : undefined],
    ["Speciality", labels.speciality],
    ["Doctor", doctor],
    ["Preferred date", date],
    ["Preferred time", slot],
    ["Reason for visit", request.message ?? "Not given"],
    ["Received", `${received} (India time)`],
  ];

  const subject = `New appointment request ${reference}: ${labels.speciality}, ${date}`;

  const text = [
    `New appointment request from the ${site.name} website.`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "This is a request, not a confirmed booking. Please call the patient to confirm a time.",
  ].join("\n");

  const htmlRows = rows
    .map(([label, value, href]) => {
      const safe = escapeHtml(value).replace(/\n/g, "<br>");
      const cell = href ? `<a href="${escapeHtml(href)}" style="color:#0f6b66;font-weight:600">${safe}</a>` : safe;
      return `<tr><td style="padding:10px 16px;color:#4a6170;font-size:14px;white-space:nowrap;vertical-align:top;border-top:1px solid #e1ebe5">${escapeHtml(label)}</td><td style="padding:10px 16px;color:#0e2a3b;font-size:15px;border-top:1px solid #e1ebe5">${cell}</td></tr>`;
    })
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#edf5f1;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#edf5f1;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#0f6b66;padding:22px 24px;color:#ffffff">
<div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;opacity:.85">${escapeHtml(site.name)}</div>
<div style="font-size:22px;font-weight:700;margin-top:4px">New appointment request</div>
<div style="font-size:14px;margin-top:6px;opacity:.9">${escapeHtml(labels.speciality)} &middot; ${escapeHtml(date)} &middot; ${escapeHtml(slot)}</div>
</td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${htmlRows}</table></td></tr>
<tr><td style="padding:18px 24px;background:#f6faf8;color:#4a6170;font-size:13px">This is a request, not a confirmed booking. Please call the patient to confirm a time.</td></tr>
</table></td></tr></table></body></html>`;

  return { subject, text, html };
}

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const emailNotifier: AppointmentNotifier = {
  async send(request, reference, labels) {
    if (!isEmailConfigured()) return { status: "skipped" };
    const { subject, text, html } = buildAppointmentEmail(request, reference, labels);
    try {
      const res = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: { authorization: `Bearer ${setting(process.env.RESEND_API_KEY)}`, "content-type": "application/json" },
        body: JSON.stringify({
          // Resend's shared test sender works without verifying a domain.
          from: setting(process.env.APPOINTMENT_NOTIFY_FROM) || `${site.name} website <onboarding@resend.dev>`,
          to: [setting(process.env.APPOINTMENT_NOTIFY_TO)],
          reply_to: request.email || undefined,
          subject,
          text,
          html,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        // Log the status and Resend's error name only; never the patient's details.
        const name = ((await res.json().catch(() => ({}))) as { name?: string }).name ?? "unknown";
        console.error(`appointment_email_failed status=${res.status} name=${name} ${describeKey(process.env.RESEND_API_KEY)}`);
        return { status: "failed" };
      }
      return { status: "sent" };
    } catch (cause) {
      console.error(`appointment_email_failed code=${cause instanceof Error ? cause.name : "unknown"}`);
      return { status: "failed" };
    }
  },
};
