import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = ["/", "/about", "/specialities", "/specialities/oncology", "/doctors", "/doctors/farah-siddiqui", "/health-checkups", "/appointments", "/contact", "/missing"];

for (const path of PAGES) {
  test(`${path} has no WCAG 2.2 A/AA violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
    expect(summary).toEqual([]);
  });
}

test("appointment form errors are accessible", async ({ page }) => {
  await page.goto("/appointments");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Please correct" })).toBeFocused();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
