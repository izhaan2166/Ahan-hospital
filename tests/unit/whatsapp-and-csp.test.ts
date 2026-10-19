import { describe, expect, it } from "vitest";
import { buildCsp } from "@/lib/security/csp";
import { whatsappMessage, whatsappUrl } from "@/lib/whatsapp";

describe("WhatsApp links", () => {
  it("builds context-aware messages", () => {
    expect(whatsappMessage({ kind: "general" })).toMatch(/general enquiry/);
    expect(whatsappMessage({ kind: "speciality", specialityName: "Cardiology" })).toMatch(/about Cardiology\.$/);
    expect(whatsappMessage({ kind: "doctor", doctorName: "Dr. Test", specialityName: "Paediatrics" })).toMatch(
      /consultations with Dr\. Test \(Paediatrics\)/,
    );
  });

  it("encodes the message and strips formatting from the number", () => {
    const url = new URL(whatsappUrl({ kind: "speciality", specialityName: "Obstetrics & Gynaecology" }, "+91 91000 12345"));
    expect(url.origin + url.pathname).toBe("https://wa.me/919100012345");
    expect(url.searchParams.get("text")).toBe("Hello Ahan Hospitals, I would like to know more about Obstetrics & Gynaecology.");
  });
});

describe("Content Security Policy", () => {
  const prod = buildCsp("abc123");

  it("locks scripts to the nonce without unsafe-eval or unsafe-inline", () => {
    const scriptSrc = prod.split("; ").find((d) => d.startsWith("script-src"))!;
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).not.toContain("unsafe-eval");
    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  it("blocks framing, plugins and foreign form targets, with no wildcards", () => {
    expect(prod).toContain("frame-ancestors 'none'");
    expect(prod).toContain("object-src 'none'");
    expect(prod).toContain("base-uri 'self'");
    expect(prod).toContain("form-action 'self'");
    expect(prod).not.toMatch(/\s\*(\s|;|$)/);
  });

  it("only relaxes eval in development and only upgrades on HTTPS", () => {
    expect(buildCsp("n", { dev: true })).toContain("'unsafe-eval'");
    expect(prod).not.toContain("upgrade-insecure-requests");
    expect(buildCsp("n", { upgradeInsecure: true })).toContain("upgrade-insecure-requests");
  });
});
