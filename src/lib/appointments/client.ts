import type { FieldErrors } from "@/lib/validation/appointment";

export type SubmitOutcome =
  | { kind: "received"; reference: string }
  | { kind: "demo" }
  | { kind: "invalid"; message: string; fieldErrors: FieldErrors }
  | { kind: "error"; message: string };

export type SubmitAppointment = (payload: Record<string, unknown>) => Promise<SubmitOutcome>;

const NETWORK_ERROR = "We could not reach our server. Check your internet connection and try again.";
const GENERIC_ERROR = "Something went wrong on our side. Please try again, or call reception.";

/**
 * Sends the request body in a POST, never in the URL, so personal details
 * stay out of browser history, logs and analytics.
 */
export const submitAppointment: SubmitAppointment = async (payload) => {
  let response: Response;
  try {
    response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    return { kind: "error", message: NETWORK_ERROR };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { kind: "error", message: GENERIC_ERROR };
  }

  const data = body as { status?: string; reference?: string; message?: string; fieldErrors?: FieldErrors };
  if (response.status === 201 && data.status === "received" && typeof data.reference === "string") {
    return { kind: "received", reference: data.reference };
  }
  if (response.ok && data.status === "demo") return { kind: "demo" };
  if (response.status === 422 && data.status === "invalid") {
    return { kind: "invalid", message: data.message ?? "Some details need attention.", fieldErrors: data.fieldErrors ?? {} };
  }
  return { kind: "error", message: typeof data.message === "string" ? data.message : GENERIC_ERROR };
};
