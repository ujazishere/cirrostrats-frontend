import { test, expect } from "@playwright/test";

const HAMBURGER_MENU_LOCATOR = ".navbar__hamburger";

test("Homepage : Title, Subtitle, Search Bar, Sign In Button", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Cirrostrats" })
  ).toBeVisible();
  await expect(page.locator("h2")).toContainText(
    "Unified Aviation Information Platform."
  );
  await expect(page.locator(".MuiInputBase-root")).toBeVisible();
  await expect(
    page
      .locator("div")
      .filter({ hasText: /^Sign in with Google$/ })
      .nth(1)
  ).toBeVisible();
});

test("Homepage : Hamburger Menu Options Visible", async ({ page }) => {
  await page.goto("/");
  await page.locator(HAMBURGER_MENU_LOCATOR).click();
  await expect(page.getByRole("link", { name: "Our Story" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact Us" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Source" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Guide" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Live Map" })).toBeVisible();
});

test("Homepage : Hamburger Menu: Our Story", async ({ page }) => {
  await page.goto("/");
  await page.locator(HAMBURGER_MENU_LOCATOR).click();
  await page.getByRole("link", { name: "Our Story" }).click();
  await expect(page.locator(".story")).toBeVisible();
  // Expect at least 500 characters of text
  await expect(page.locator(".story")).toContainText(/^.{500,}/);
});

test("Homepage : Hamburger Menu: Contact Us", async ({ page }) => {
  await page.goto("/");
  await page.locator(HAMBURGER_MENU_LOCATOR).click();
  await page.getByRole("link", { name: "Contact Us" }).click();
  await expect(page.getByRole("textbox", { name: "Name:" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email:" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message:" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
});

test("Homepage : Hamburger Menu: Source", async ({ page }) => {
  await page.goto("/");
  await page.locator(HAMBURGER_MENU_LOCATOR).click();
  await page.getByRole("link", { name: "Source" }).click();
  await expect(
    page.getByRole("link", { name: "https://www.aviationweather.gov" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://www.flightview.com" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://www.airport-ewr.com" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "https://www.flightstats.com" })
  ).toBeVisible();
});

test("Homepage : Hamburger Menu: Guide", async ({ page }) => {
  await page.goto("/");
  await page.locator(HAMBURGER_MENU_LOCATOR).click();
  await page.getByRole("link", { name: "Guide" }).click();
  await expect(page.locator(".guide__container")).toBeVisible();
  // Expect at least 500 characters of text
  await expect(page.locator(".guide__container")).toContainText(/^.{500,}/);
});

test("Homepage : Hamburger Menu: Live Map", async ({ page }) => {
  await page.goto("/");
  await page.locator(HAMBURGER_MENU_LOCATOR).click();
  await page.getByRole("link", { name: "Live Map" }).click();
  await expect(page.locator("img").first()).toBeVisible();
  await expect(page.getByText("UTC")).toBeVisible();
});
