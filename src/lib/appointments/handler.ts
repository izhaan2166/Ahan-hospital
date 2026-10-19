import "server-only";
import { site } from "@/config/site";
import { getAppointmentOptions } from "@/lib/content";
import { todayInTimeZone, validateAppointment, type FieldErrors } from "@/lib/validation/appointment";
import { createReference, type AppointmentStore } from "./store";
import type { AppointmentNotifier } from "./notify";
import { clientKey, type RateLimiter } from "./rate-limit";

export const MAX_BODY_BYTES = 10 * 1024;

export type AppointmentResponse =
  | { status: "received"; reference: string }
  | { status: "demo" }
  | { status: "invalid"; message: string; fieldErrors: FieldErrors }
  | { status: "error"; message: string };

const json = (body: AppointmentResponse, status: number) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

const error = (message: string, status: number, headers: HeadersInit = {}) =>
  Response.json({ status: "error", message } satisfies AppointmentResponse, { status, headers: { "Cache-Control": "no-store", ...headers } });

const skipNotifier: AppointmentNotifier = { send: async () => ({ status: "skipped" }) };

/**
 * Handles one appointment POST. Kept separate from the route file so tests
 * can call it with a fake store, a fake email sender and a fixed clock.
 *
 * A request counts as received when it was saved to the database or emailed
 * to the hospital. With neither configured the site is in demo mode.
 */
export async function handleAppointmentRequest(
  request: Request,
  {
    store,
    notifier = skipNotifier,
    rateLimiter,
    now = new Date(),
  }: { store: AppointmentStore; notifier?: AppointmentNotifier; rateLimiter?: RateLimiter; now?: Date },
): Promise<Response> {
  try {
    // Same-origin check: browsers send Origin on POST; reject other sites.
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) {
      return error("This request is not allowed.", 403);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return error("Send the request as JSON.", 415);
    }

    const declared = Number(request.headers.get("content-length") ?? "0");
    if (declared > MAX_BODY_BYTES) return error("The request is too large.", 413);

    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return error("The request is too large.", 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return error("The request could not be read.", 400);
    }

    const options = await getAppointmentOptions();
    const result = validateAppointment(body, {
      today: todayInTimeZone(now, site.timeZone),
      specialities: options.specialities,
      doctors: options.doctors,
    });

    if (!result.success) {
      return json(
        {
          status: "invalid",
          message: result.formError ?? "Some details need attention.",
          fieldErrors: result.fieldErrors,
        },
        422,
      );
    }

    // Only valid requests count, so a patient fixing a typo is never blocked.
    const allowance = rateLimiter?.take(clientKey(request), now.getTime());
    if (allowance && !allowance.allowed) {
      return error(
        `You have sent several requests in the last hour. Please call reception on ${site.contact.phoneDisplay} instead.`,
        429,
        { "Retry-After": String(allowance.retryAfterSeconds) },
      );
    }

    const reference = createReference();
    const labels = {
      speciality: options.specialities.find((sp) => sp.slug === result.data.specialitySlug)?.name ?? result.data.specialitySlug,
      doctor: options.doctors.find((d) => d.slug === result.data.doctorSlug)?.name,
    };
    const [saved, emailed] = await Promise.all([
      store.save(result.data, reference),
      notifier.send(result.data, reference, labels),
    ]);

    if (saved.status === "stored" || emailed.status === "sent") {
      return json({ status: "received", reference }, 201);
    }
    if (saved.status === "demo" && emailed.status === "skipped") {
      return json({ status: "demo" }, 200);
    }
    return error("We could not send your request just now. Please try again, or call reception.", 503);
  } catch (cause) {
    console.error(`appointment_handler_error ${cause instanceof Error ? cause.name : "unknown"}`);
    return error("Something went wrong on our side. Please try again, or call reception.", 500);
  }
}
