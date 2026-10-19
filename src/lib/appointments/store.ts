import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppointmentRequest } from "@/lib/validation/appointment";

/**
 * Persists appointment requests in Supabase. Runs only on the server: the
 * service-role key never reaches the browser bundle.
 */

export type StoreResult =
  | { status: "stored"; reference: string }
  | { status: "demo" }
  | { status: "failed" };

export interface AppointmentStore {
  save(request: AppointmentRequest, reference: string): Promise<StoreResult>;
}

export function isStorageConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

let cached: SupabaseClient | undefined;

function supabase(): SupabaseClient {
  cached ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const supabaseStore: AppointmentStore = {
  async save(request, reference) {
    if (!isStorageConfigured()) return { status: "demo" };

    const { error } = await supabase()
      .from("appointment_requests")
      .insert({
        reference,
        full_name: request.fullName,
        phone: request.phone,
        email: request.email ?? null,
        speciality_slug: request.specialitySlug,
        doctor_slug: request.doctorSlug ?? null,
        preferred_date: request.preferredDate,
        preferred_slot: request.preferredSlot,
        message: request.message ?? null,
        consent: request.consent,
      });

    if (error) {
      // Log the database error code only. Never log the request itself.
      console.error(`appointment_insert_failed code=${error.code ?? "unknown"}`);
      return { status: "failed" };
    }
    return { status: "stored", reference };
  },
};

/** Short, human-readable reference without ambiguous characters. */
export function createReference(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return `AH-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}
