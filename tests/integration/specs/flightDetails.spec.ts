import { test, expect } from "@playwright/test";
import { navigateToDetailsPage } from "../utils/details";

// A simple test for the skeleton of the flight page, not verifying any content
test("Details : Flight : Raw : UA414", async ({ page }) => {
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: "UA414",
  });
  // Commented out because of the new tab feature -- TODO: ismail account for no tab 
  // await expect(page.locator(".flight-card-content > div")).toBeVisible({
  //  timeout: 10000, // Higher timeout because flights can take a while to load
  //}); 
  await expect(page.getByRole("heading", { name: "Route" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View on SkyVector" })
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Departure" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Destination" })).toBeVisible();
  // TODO test: account for route -- route from flightaware with fall back to jms - caution if fallback warning/`test fail` if fallback fails too.
  //       account for NAS related flight. -- check nas airports
  await expect(page.getByRole("heading", { name: "D-ATIS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "TAF" })).toBeVisible();
});
