import { test, expect } from "@playwright/test";
import { navigateToDetailsPage } from "../utils/details";

// TODO: add test for 414, ua1, 1 raw click 1, 

// A simple test for the skeleton of the flight page, not verifying any content
// ua1 and anything that is prepended with `UA` will work becaus of the regex processing in the backend.
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

// --- NEW TEST CASE ---
// This test verifies that searching for an invalid flight number ("00000")
// correctly displays the "no data" feedback message to the user.
test("Details : Flight : Invalid Raw : 00000", async ({ page }) => {
  // 1. Navigate using the raw query "00000"
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: "00000",
  });

  // 2. Locate the expected "no data" message
  const noDataMessage = page.getByText(
    "No flight data could be found for this search."
  );

  // 3. Assert that the message is visible on the page.
  // A generous timeout is used because the application must first attempt
  // to fetch data before it can conclude that none is available.
  await expect(noDataMessage).toBeVisible({ timeout: 15000 });
});
