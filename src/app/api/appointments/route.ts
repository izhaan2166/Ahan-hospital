import { handleAppointmentRequest } from "@/lib/appointments/handler";
import { emailNotifier } from "@/lib/appointments/notify";
import { appointmentRateLimiter } from "@/lib/appointments/rate-limit";
import { supabaseStore } from "@/lib/appointments/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleAppointmentRequest(request, { store: supabaseStore, notifier: emailNotifier, rateLimiter: appointmentRateLimiter });
}
