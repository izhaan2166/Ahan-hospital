import { describe, expect, it, vi } from "vitest";
import { handleAppointmentRequest, MAX_BODY_BYTES } from "@/lib/appointments/handler";
import type { AppointmentStore } from "@/lib/appointments/store";
import { buildAppointmentEmail, describeKey, type AppointmentNotifier } from "@/lib/appointments/notify";
import { createRateLimiter } from "@/lib/appointments/rate-limit";

// 06:30 UTC on 10 March 2026 is midday in India, so "today" is 2026-03-10.
const NOW = new Date("2026-03-10T06:30:00Z");

const body = {
  fullName: "Test Patient",
  phone: "98765 43210",
  email: "",
  specialitySlug: "cardiology",
  doctorSlug: "arjun-mehta",
  preferredDate: "2026-03-12",
  preferredSlot: "afternoon",
  message: "",
  consent: true,
};

const post = (data: unknown, init: RequestInit = {}) =>
  new Request("http://localhost:3000/api/appointments", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000", ...(init.headers ?? {}) },
    body: typeof data === "string" ? data : JSON.stringify(data),
    ...init,
  });

const storeReturning = (result: Awaited<ReturnType<AppointmentStore["save"]>>) => {
  const save = vi.fn<AppointmentStore["save"]>().mockResolvedValue(result);
  return { store: { save } satisfies AppointmentStore, save };
};

describe("POST /api/appointments", () => {
  it("stores a valid request and returns 201 with a reference", async () => {
    const { store, save } = storeReturning({ status: "stored", reference: "AH-TEST23" });
    const res = await handleAppointmentRequest(post(body), { store, now: NOW });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(save).toHaveBeenCalledTimes(1);
    expect(json).toEqual({ status: "received", reference: save.mock.calls[0][1] });
    expect(save.mock.calls[0][0]).toMatchObject({ phone: "+919876543210", fullName: "Test Patient" });
    expect(save.mock.calls[0][1]).toMatch(/^AH-[A-Z2-9]{6}$/);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("reports demo mode honestly when storage is not configured", async () => {
    const { store } = storeReturning({ status: "demo" });
    const res = await handleAppointmentRequest(post(body), { store, now: NOW });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "demo" });
  });

  it("returns 503, not success, when the database insert fails", async () => {
    const { store } = storeReturning({ status: "failed" });
    const res = await handleAppointmentRequest(post(body), { store, now: NOW });
    expect(res.status).toBe(503);
    expect((await res.json()).status).toBe("error");
  });

  it("returns 422 with field errors and never calls the store for invalid input", async () => {
    const { store, save } = storeReturning({ status: "stored", reference: "AH-TEST23" });
    const res = await handleAppointmentRequest(post({ ...body, preferredDate: "2026-03-09", doctorSlug: "kabir-sen" }), { store, now: NOW });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.fieldErrors.preferredDate).toBeTruthy();
    expect(json.fieldErrors.doctorSlug).toBeTruthy();
    expect(save).not.toHaveBeenCalled();
  });

  it("rejects unexpected fields", async () => {
    const { store, save } = storeReturning({ status: "stored", reference: "AH-TEST23" });
    const res = await handleAppointmentRequest(post({ ...body, role: "admin" }), { store, now: NOW });
    expect(res.status).toBe(422);
    expect(save).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const { store } = storeReturning({ status: "demo" });
    const res = await handleAppointmentRequest(post("{not json"), { store, now: NOW });
    expect(res.status).toBe(400);
  });

  it("returns 415 for non-JSON content types", async () => {
    const { store } = storeReturning({ status: "demo" });
    const res = await handleAppointmentRequest(
      post("fullName=Test", { headers: { "content-type": "application/x-www-form-urlencoded" } }),
      { store, now: NOW },
    );
    expect(res.status).toBe(415);
  });

  it("returns 413 for oversized bodies", async () => {
    const { store } = storeReturning({ status: "demo" });
    const res = await handleAppointmentRequest(post({ ...body, message: "x".repeat(MAX_BODY_BYTES) }), { store, now: NOW });
    expect(res.status).toBe(413);
  });

  it("rejects cross-origin submissions", async () => {
    const { store, save } = storeReturning({ status: "demo" });
    const res = await handleAppointmentRequest(post(body, { headers: { origin: "https://evil.example" } }), { store, now: NOW });
    expect(res.status).toBe(403);
    expect(save).not.toHaveBeenCalled();
  });

  it("hides internal errors behind a generic 500 and does not log request data", async () => {
    const save = vi.fn<AppointmentStore["save"]>().mockRejectedValue(new TypeError("connect ECONNREFUSED 10.0.0.5:5432"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleAppointmentRequest(post(body), { store: { save }, now: NOW });
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toMatch(/ECONNREFUSED|10\.0\.0\.5|TypeError/);
    const logged = log.mock.calls.flat().join(" ");
    expect(logged).not.toMatch(/Test Patient|98765|9876543210/);
  });
});

describe("POST /api/appointments with email notifications", () => {
  const notifierReturning = (result: Awaited<ReturnType<AppointmentNotifier["send"]>>) => {
    const send = vi.fn<AppointmentNotifier["send"]>().mockResolvedValue(result);
    return { notifier: { send } satisfies AppointmentNotifier, send };
  };

  it("counts an emailed request as received even without a database", async () => {
    const { store } = storeReturning({ status: "demo" });
    const { notifier, send } = notifierReturning({ status: "sent" });
    const res = await handleAppointmentRequest(post(body), { store, notifier, now: NOW });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.status).toBe("received");
    expect(json.reference).toMatch(/^AH-[A-Z2-9]{6}$/);
    expect(send.mock.calls[0][2]).toEqual({ speciality: "Cardiology", doctor: "Dr. Arjun Mehta" });
    expect(send.mock.calls[0][1]).toBe(json.reference);
  });

  it("still succeeds when the database works but email fails", async () => {
    const { store } = storeReturning({ status: "stored", reference: "AH-TEST23" });
    const { notifier } = notifierReturning({ status: "failed" });
    const res = await handleAppointmentRequest(post(body), { store, notifier, now: NOW });
    expect(res.status).toBe(201);
  });

  it("returns 503 when email is configured but fails and there is no database", async () => {
    const { store } = storeReturning({ status: "demo" });
    const { notifier } = notifierReturning({ status: "failed" });
    const res = await handleAppointmentRequest(post(body), { store, notifier, now: NOW });
    expect(res.status).toBe(503);
  });

  it("does not email invalid requests", async () => {
    const { store } = storeReturning({ status: "demo" });
    const { notifier, send } = notifierReturning({ status: "sent" });
    await handleAppointmentRequest(post({ ...body, phone: "nope" }), { store, notifier, now: NOW });
    expect(send).not.toHaveBeenCalled();
  });
});

describe("appointment email", () => {
  const request = {
    fullName: "Test Patient",
    phone: "+919876543210",
    email: "test.patient@example.com",
    specialitySlug: "cardiology",
    doctorSlug: "arjun-mehta",
    preferredDate: "2026-03-12",
    preferredSlot: "morning" as const,
    message: 'Chest pain <script>alert("x")</script>',
    consent: true as const,
  };

  it("includes every detail of the request", () => {
    const { subject, text, html } = buildAppointmentEmail(request, "AH-TEST23", { speciality: "Cardiology", doctor: "Dr. Arjun Mehta" }, NOW);
    expect(subject).toBe("New appointment request AH-TEST23: Cardiology, Thursday, 12 March 2026");
    for (const value of ["AH-TEST23", "Test Patient", "+919876543210", "test.patient@example.com", "Dr. Arjun Mehta", "Morning, 8 am to 12 pm"]) {
      expect(text).toContain(value);
      expect(html).toContain(value);
    }
  });

  it("escapes HTML typed by the patient", () => {
    const { html } = buildAppointmentEmail(request, "AH-TEST23", { speciality: "Cardiology" }, NOW);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Any available doctor");
  });
});

describe("POST /api/appointments rate limit", () => {
  const fromIp = (ip: string, data: unknown = body) => post(data, { headers: { "content-type": "application/json", origin: "http://localhost:3000", "x-forwarded-for": `${ip}, 10.0.0.1` } });

  it("allows five bookings an hour per visitor, then returns 429 without saving", async () => {
    const rateLimiter = createRateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 });
    const { store, save } = storeReturning({ status: "stored", reference: "AH-TEST23" });
    for (let i = 0; i < 5; i++) {
      expect((await handleAppointmentRequest(fromIp("203.0.113.7"), { store, rateLimiter, now: NOW })).status).toBe(201);
    }
    const blocked = await handleAppointmentRequest(fromIp("203.0.113.7"), { store, rateLimiter, now: NOW });
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
    expect((await blocked.json()).message).toMatch(/call reception/);
    expect(save).toHaveBeenCalledTimes(5);

    // Another visitor is unaffected, and the first is allowed again an hour later.
    expect((await handleAppointmentRequest(fromIp("198.51.100.4"), { store, rateLimiter, now: NOW })).status).toBe(201);
    const later = new Date(NOW.getTime() + 60 * 60 * 1000 + 1);
    expect((await handleAppointmentRequest(fromIp("203.0.113.7"), { store, rateLimiter, now: later })).status).toBe(201);
  });

  it("does not count invalid submissions", async () => {
    const rateLimiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    const { store } = storeReturning({ status: "stored", reference: "AH-TEST23" });
    for (let i = 0; i < 3; i++) {
      expect((await handleAppointmentRequest(fromIp("203.0.113.9", { ...body, phone: "nope" }), { store, rateLimiter, now: NOW })).status).toBe(422);
    }
    expect((await handleAppointmentRequest(fromIp("203.0.113.9"), { store, rateLimiter, now: NOW })).status).toBe(201);
  });
});

describe("describeKey", () => {
  it("reports the key's shape without revealing it", () => {
    const out = describeKey(' "re_abcdefgh" ');
    expect(out).toBe("key_prefix_ok=true key_length=11 key_has_space=false key_has_equals=false");
    expect(out).not.toContain("abcdefgh");
    expect(describeKey("RESEND_API_KEY=re_abc")).toContain("key_prefix_ok=false");
  });
});
