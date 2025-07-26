import { test, expect } from "@playwright/test";
import { navigateToDetailsPage } from "../utils/details";

// A simple test for the skeleton of the flight page, not verifying any content
test("Details : Flight : Raw : UA4433", async ({ page }) => {
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: "GJS4433",
  });
  await expect(page.locator(".flight-card-content > div")).toBeVisible({
    timeout: 10000, // Higher timeout because flights can take a while to load
  });
  await expect(page.getByRole("heading", { name: "Route" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View on SkyVector" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Departure" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Destination" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "D-ATIS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "TAF" })).toBeVisible();
});
