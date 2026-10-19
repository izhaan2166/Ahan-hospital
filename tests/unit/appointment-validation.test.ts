import { describe, expect, it } from "vitest";
import {
  LIMITS,
  addDays,
  isIsoDate,
  normalisePhone,
  todayInTimeZone,
  validateAppointment,
  type AppointmentContext,
} from "@/lib/validation/appointment";

// A fixed "today" keeps every date test deterministic, whatever day it runs.
const TODAY = "2026-03-10";

const ctx: AppointmentContext = {
  today: TODAY,
  specialities: [{ slug: "cardiology" }, { slug: "paediatrics" }],
  doctors: [
    { slug: "test-cardiologist", specialitySlugs: ["cardiology"] },
    { slug: "test-paediatrician", specialitySlugs: ["paediatrics"] },
  ],
};

// Fictional, non-personal demo values only.
const valid = {
  fullName: "Test Patient",
  phone: "98765 43210",
  email: "test.patient@example.com",
  specialitySlug: "cardiology",
  doctorSlug: "test-cardiologist",
  preferredDate: addDays(TODAY, 3),
  preferredSlot: "morning",
  message: "Follow-up visit",
  consent: true,
};

const errorsFor = (input: Record<string, unknown>) => {
  const result = validateAppointment(input, ctx);
  return result.success ? {} : result.fieldErrors;
};

describe("required fields", () => {
  it("accepts a correctly completed request and normalises it", () => {
    const result = validateAppointment(valid, ctx);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toEqual({
      fullName: "Test Patient",
      phone: "+919876543210",
      email: "test.patient@example.com",
      specialitySlug: "cardiology",
      doctorSlug: "test-cardiologist",
      preferredDate: "2026-03-13",
      preferredSlot: "morning",
      message: "Follow-up visit",
      consent: true,
    });
  });

  it.each(["fullName", "phone", "specialitySlug", "preferredDate", "preferredSlot"])("rejects an empty %s", (field) => {
    expect(errorsFor({ ...valid, [field]: "" })[field as keyof typeof valid]).toBeTruthy();
  });

  it.each(["fullName", "phone", "preferredDate"])("rejects a whitespace-only %s", (field) => {
    expect(errorsFor({ ...valid, [field]: "   \t " })[field as keyof typeof valid]).toBeTruthy();
  });

  it("rejects missing required keys", () => {
    const errors = errorsFor({ consent: true });
    expect(Object.keys(errors).sort()).toEqual(["fullName", "phone", "preferredDate", "preferredSlot", "specialitySlug"]);
  });

  it("requires consent to be exactly true", () => {
    expect(errorsFor({ ...valid, consent: false }).consent).toBeTruthy();
    expect(errorsFor({ ...valid, consent: "true" }).consent).toBeTruthy();
  });

  it("treats email, doctor and message as optional", () => {
    const result = validateAppointment({ ...valid, email: "", doctorSlug: "", message: "" }, ctx);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeUndefined();
      expect(result.data.doctorSlug).toBeUndefined();
      expect(result.data.message).toBeUndefined();
    }
  });

  it("enforces field-length limits", () => {
    expect(errorsFor({ ...valid, fullName: "A" }).fullName).toMatch(/at least 2/);
    expect(errorsFor({ ...valid, fullName: "A".repeat(LIMITS.nameMax + 1) }).fullName).toMatch(/80 characters or fewer/);
    expect(errorsFor({ ...valid, fullName: "A".repeat(LIMITS.nameMax) }).fullName).toBeUndefined();
    expect(errorsFor({ ...valid, message: "x".repeat(LIMITS.messageMax + 1) }).message).toMatch(/500/);
    expect(errorsFor({ ...valid, message: "x".repeat(LIMITS.messageMax) }).message).toBeUndefined();
    expect(errorsFor({ ...valid, email: `${"a".repeat(250)}@example.com` }).email).toBeTruthy();
  });

  it("rejects an invalid email address", () => {
    expect(errorsFor({ ...valid, email: "not-an-email" }).email).toBeTruthy();
  });
});

describe("phone numbers", () => {
  it.each([
    ["98765 43210", "+919876543210"],
    ["9876543210", "+919876543210"],
    ["+91 98765 43210", "+919876543210"],
    ["+91-98765-43210", "+919876543210"],
    ["(040) 4567 8900", "+914045678900"],
    ["040 4567 8900", "+914045678900"],
    ["+44 20 7946 0958", "+442079460958"],
    ["+1 (212) 555-0182", "+12125550182"],
  ])("accepts %s as %s", (input, e164) => {
    expect(normalisePhone(input)).toBe(e164);
    expect(errorsFor({ ...valid, phone: input }).phone).toBeUndefined();
  });

  it.each([
    "abcdefghij",
    "phone me",
    "98765",
    "++91 98765 43210",
    "+91 98765 4321098765",
    "0000000000",
    "+999 1234 5678",
    "98765-43210 ext. 2",
  ])("rejects %s", (input) => {
    expect(normalisePhone(input)).toBeNull();
    expect(errorsFor({ ...valid, phone: input }).phone).toBeTruthy();
  });

  it("formats the same number consistently whatever the input style", () => {
    const forms = ["9876543210", "+919876543210", "+91 98765 43210", "91 98765 43210"];
    expect(new Set(forms.map(normalisePhone))).toEqual(new Set(["+919876543210"]));
  });
});

describe("dates", () => {
  it("rejects a date in the past", () => {
    expect(errorsFor({ ...valid, preferredDate: addDays(TODAY, -1) }).preferredDate).toMatch(/today or a future date/);
    expect(errorsFor({ ...valid, preferredDate: "2020-01-01" }).preferredDate).toBeTruthy();
  });

  it("accepts today and valid future dates", () => {
    expect(errorsFor({ ...valid, preferredDate: TODAY }).preferredDate).toBeUndefined();
    expect(errorsFor({ ...valid, preferredDate: addDays(TODAY, 30) }).preferredDate).toBeUndefined();
    expect(errorsFor({ ...valid, preferredDate: addDays(TODAY, LIMITS.maxDaysAhead) }).preferredDate).toBeUndefined();
  });

  it("rejects dates beyond the booking window", () => {
    expect(errorsFor({ ...valid, preferredDate: addDays(TODAY, LIMITS.maxDaysAhead + 1) }).preferredDate).toMatch(/90 days/);
  });

  it.each(["2026-02-30", "2026-13-01", "10/03/2026", "tomorrow", "2026-3-15", "2026-03-15T10:00"])(
    "rejects malformed date %s",
    (input) => {
      expect(isIsoDate(input)).toBe(false);
      expect(errorsFor({ ...valid, preferredDate: input }).preferredDate).toBeTruthy();
    },
  );

  it("works out today in the hospital time zone, not the machine's", () => {
    // 20:00 UTC on 10 March is 01:30 on 11 March in India.
    expect(todayInTimeZone(new Date("2026-03-10T20:00:00Z"), "Asia/Kolkata")).toBe("2026-03-11");
    expect(todayInTimeZone(new Date("2026-03-10T18:00:00Z"), "Asia/Kolkata")).toBe("2026-03-10");
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-02-27", 2)).toBe("2026-03-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("speciality and doctor relationships", () => {
  it("rejects a doctor who does not belong to the selected speciality", () => {
    expect(errorsFor({ ...valid, doctorSlug: "test-paediatrician" }).doctorSlug).toMatch(/does not work in the selected speciality/);
  });

  it("accepts a doctor from the selected speciality", () => {
    expect(errorsFor({ ...valid, specialitySlug: "paediatrics", doctorSlug: "test-paediatrician" }).doctorSlug).toBeUndefined();
  });

  it("rejects unknown speciality and doctor identifiers", () => {
    expect(errorsFor({ ...valid, specialitySlug: "astrology" }).specialitySlug).toBeTruthy();
    expect(errorsFor({ ...valid, doctorSlug: "dr-nobody" }).doctorSlug).toBeTruthy();
    expect(errorsFor({ ...valid, specialitySlug: "../../etc/passwd" }).specialitySlug).toBeTruthy();
  });

  it("rejects identifiers of the wrong type without throwing", () => {
    expect(errorsFor({ ...valid, specialitySlug: 42 }).specialitySlug).toBeTruthy();
    expect(errorsFor({ ...valid, doctorSlug: { $ne: null } }).doctorSlug).toBeTruthy();
  });
});

describe("input handling", () => {
  it("rejects non-object bodies", () => {
    for (const input of [null, "text", 42, [valid]]) {
      const result = validateAppointment(input, ctx);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.formError).toBeTruthy();
    }
  });

  it("rejects unexpected fields", () => {
    const result = validateAppointment({ ...valid, isAdmin: true }, ctx);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.formError).toMatch(/could not be processed/);
  });

  it("rejects a filled honeypot field", () => {
    expect(validateAppointment({ ...valid, website: "https://spam.example" }, ctx).success).toBe(false);
  });

  it("rejects an unknown time slot", () => {
    expect(errorsFor({ ...valid, preferredSlot: "midnight" }).preferredSlot).toBeTruthy();
  });

  it.each(["Anne-Marie O'Brien", "José Álvarez", "Zoë D’Souza", "Dr. K. Ramesh", "प्रिया शर्मा", "محمد علي", "李小龙"])(
    "preserves the valid name %s",
    (name) => {
      const result = validateAppointment({ ...valid, fullName: name }, ctx);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.fullName).toBe(name.normalize("NFC"));
    },
  );

  it("normalises whitespace and Unicode composition in names", () => {
    const decomposed = "José   Test  ";
    const result = validateAppointment({ ...valid, fullName: decomposed }, ctx);
    expect(result.success && result.data.fullName).toBe("José Test");
  });

  it.each(["<script>alert(1)</script>", "Test <b>Patient</b>", "Robert'); DROP TABLE--", "Test123"])(
    "rejects markup or code-like text in names: %s",
    (name) => {
      expect(errorsFor({ ...valid, fullName: name }).fullName).toBeTruthy();
    },
  );

  it("keeps HTML in the message as literal text rather than stripping or interpreting it", () => {
    const message = 'Pain after <img src=x onerror="alert(1)"> lifting & "bending"';
    const result = validateAppointment({ ...valid, message }, ctx);
    expect(result.success).toBe(true);
    // Stored exactly as typed; React escapes it on output.
    if (result.success) expect(result.data.message).toBe(message);
  });

  it("rejects control characters in the message", () => {
    expect(errorsFor({ ...valid, message: "Hello\u0000world" }).message).toBeTruthy();
  });

  it("keeps line breaks in the message but tidies excess blank lines", () => {
    const result = validateAppointment({ ...valid, message: "Line one\r\n\r\n\r\n\r\nLine two  " }, ctx);
    expect(result.success && result.data.message).toBe("Line one\n\nLine two");
  });
});
