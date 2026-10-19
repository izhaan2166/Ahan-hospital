import { expect, test } from "@playwright/test";

// Fictional test data only.
const PATIENT = { name: "Test Patient", phone: "98765 43210", email: "test.patient@example.com", note: "Routine check" };

function istDatePlus(days: number) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

test("home → doctors → profile → appointment → validation → demo outcome", async ({ page, isMobile }) => {
  // Five page loads plus a submission; allow more than the default 30 s under parallel load.
  test.setTimeout(60_000);
  const visitedUrls: string[] = [];
  page.on("request", (request) => visitedUrls.push(request.url()));
  page.on("framenavigated", (frame) => visitedUrls.push(frame.url()));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Expert care for every member");

  await page.getByRole("link", { name: "Find a doctor" }).first().click();
  await expect(page).toHaveURL(/\/doctors$/);
  await expect(page.getByRole("heading", { level: 1, name: "Find a doctor" })).toBeVisible();

  await page.getByLabel("Speciality").selectOption("cardiology");
  await expect(page.getByRole("status")).toContainText("in Cardiology");
  await page.getByRole("link", { name: "Dr. Arjun Mehta", exact: true }).click();

  await expect(page).toHaveURL(/\/doctors\/arjun-mehta$/);
  await page.getByRole("link", { name: "Request an appointment" }).click();
  await expect(page).toHaveURL(/\/appointments\?doctor=arjun-mehta$/);
  await expect(page.getByLabel(/^Speciality/)).toHaveValue("cardiology");
  await expect(page.getByLabel(/^Doctor/)).toHaveValue("arjun-mehta");

  // Submitting empty shows validation errors.
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Please correct" })).toBeVisible();
  await expect(page.getByLabel(/^Full name/)).toHaveAttribute("aria-invalid", "true");

  await page.getByLabel(/^Full name/).fill(PATIENT.name);
  await page.getByLabel(/^Mobile number/).fill(PATIENT.phone);
  await page.getByLabel(/^Email/).fill(PATIENT.email);
  await page.getByLabel(/^Preferred date/).fill(istDatePlus(3));
  await page.getByLabel(/^Preferred time/).selectOption("morning");
  await page.getByLabel(/^Reason for visit/).fill(PATIENT.note);
  await page.getByLabel(/I agree/).check();

  const response = page.waitForResponse((r) => r.url().endsWith("/api/appointments") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Send request" }).click();
  const apiResponse = await response;

  // Storage is not configured in e2e runs, so the honest outcome is demo mode.
  expect(apiResponse.status()).toBe(200);
  expect(await apiResponse.json()).toEqual({ status: "demo" });
  await expect(page.getByRole("heading", { name: "Demo request checked, not sent" })).toBeVisible();
  await expect(page.getByText("nothing was saved")).toBeVisible();
  await expect(page.getByText("Request received")).toHaveCount(0);

  // The request body travelled in a POST, and no personal data ever reached a URL.
  expect(apiResponse.request().postDataJSON()).toMatchObject({ fullName: PATIENT.name });
  for (const url of visitedUrls) {
    const decoded = decodeURIComponent(url);
    for (const value of [PATIENT.name, "98765", PATIENT.email, PATIENT.note]) {
      expect(decoded, `personal data found in ${url}`).not.toContain(value);
    }
  }

  void isMobile;
});

test("speciality page links to a prefilled request and a WhatsApp enquiry", async ({ page }) => {
  await page.goto("/specialities");
  await page.getByRole("link", { name: /Orthopaedics/ }).first().click();
  await expect(page).toHaveURL(/\/specialities\/orthopaedics$/);

  const whatsapp = page.getByRole("link", { name: /Ask about Orthopaedics/ });
  const href = await whatsapp.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  expect(new URL(href!).searchParams.get("text")).toContain("Orthopaedics");
  await expect(whatsapp).toHaveAttribute("rel", /noopener/);

  await page.getByRole("link", { name: "Request an appointment" }).first().click();
  await expect(page.getByLabel(/^Speciality/)).toHaveValue("orthopaedics");
});

test("mobile menu opens, navigates and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The menu button only appears on small screens");
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu" });
  await toggle.click();
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
});
