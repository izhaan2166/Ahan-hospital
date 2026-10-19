import { expect, test } from "@playwright/test";

const PAGES = ["/", "/about", "/specialities", "/specialities/cardiology", "/doctors", "/doctors/priya-nair", "/health-checkups", "/appointments", "/contact"];

test.describe("security headers", () => {
  for (const path of ["/", "/appointments", "/doctors/arjun-mehta", "/does-not-exist"]) {
    test(`are present on ${path}`, async ({ request }) => {
      const res = await request.get(path);
      const h = res.headers();
      const csp = h["content-security-policy"];

      expect(csp, "CSP must be enforced").toBeTruthy();
      expect(h["content-security-policy-report-only"]).toBeUndefined();
      expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
      expect(csp).not.toContain("unsafe-eval");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'self'");

      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(h["permissions-policy"]).toContain("camera=()");
      expect(h["x-powered-by"]).toBeUndefined();
      // HSTS is off unless ENABLE_HSTS=true on an HTTPS deployment.
      expect(h["strict-transport-security"]).toBeUndefined();
    });
  }

  test("each response gets a fresh nonce", async ({ request }) => {
    const a = (await request.get("/")).headers()["content-security-policy"];
    const b = (await request.get("/")).headers()["content-security-policy"];
    expect(a).not.toEqual(b);
  });

  test("the API sends nosniff and refuses GET", async ({ request }) => {
    const res = await request.get("/api/appointments");
    expect(res.status()).toBe(405);
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });
});

test("pages load without CSP violations or console errors", async ({ page }) => {
  // Visits every main page in turn, so it needs more than the default 30 s.
  test.setTimeout(90_000);
  const problems: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(`${page.url()}: ${msg.text()}`);
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`));
  });
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: "networkidle" });
    // Hydration worked if a client-side interaction responds.
    await expect(page.locator("main")).toBeVisible();
  }
  expect(problems).toEqual([]);
});

test.describe("not-found handling", () => {
  for (const path of ["/no-such-page", "/doctors/dr-nobody", "/specialities/astrology"]) {
    test(`${path} returns a branded 404`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1, name: "We could not find that page" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Back to the homepage" })).toHaveAttribute("href", "/");
      const help = page.getByRole("navigation", { name: "Helpful links" });
      await expect(help.getByRole("link", { name: "Find a doctor" })).toBeVisible();
      await expect(help.getByRole("link", { name: "Browse specialities" })).toBeVisible();
      await expect(help.getByRole("link", { name: "Request an appointment" })).toBeVisible();
    });
  }
});

test("a failed submission shows an error and keeps the form", async ({ page }) => {
  await page.route("**/api/appointments", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ status: "error", message: "We could not save your request just now." }) }),
  );
  await page.goto("/appointments?speciality=paediatrics");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  await page.getByLabel(/^Full name/).fill("Test Patient");
  await page.getByLabel(/^Mobile number/).fill("9876543210");
  await page.getByLabel(/^Preferred date/).fill(today);
  await page.getByLabel(/^Preferred time/).selectOption("afternoon");
  await page.getByLabel(/I agree/).check();
  await page.getByRole("button", { name: "Send request" }).click();

  await expect(page.getByText("Your request was not sent")).toBeVisible();
  await expect(page.getByText("We could not save your request just now.")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Request received|Demo request/ })).toHaveCount(0);
  await expect(page.getByLabel(/^Full name/)).toHaveValue("Test Patient");
});

test("every internal link resolves", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const path of PAGES) {
    await page.goto(path);
    const hrefs = await page.locator("a[href^='/']").evaluateAll((links) => links.map((a) => a.getAttribute("href")!));
    hrefs.forEach((h) => seen.add(h.split("#")[0]));
  }
  for (const href of seen) {
    const res = await request.get(href);
    expect(res.status(), href).toBe(200);
  }
});
