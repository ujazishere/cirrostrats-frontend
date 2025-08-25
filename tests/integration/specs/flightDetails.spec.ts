import { test, expect } from "@playwright/test";
import { navigateToDetailsPage } from "../utils/details";

// TODO: add test for "414", "1" with pressing enter, clicking search button, clicking suggestion if exact match available.

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

// New test for the query "414" - commented it out because 414 shows an error in test but works fine in local environment
test("Details : Flight : Raw : 414", async ({ page }) => {
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: "414",
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
  // subsequent search for
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: "414",
  });
  // TODO ismail This section fails - subsequent search for 414 does not work due to match in suggestions not accounting for local storage?
  await expect(page.getByRole("heading", { name: "Route" })).toBeVisible();
});

// New test for the query "ua1"
test("Details : Flight : Raw : UA1", async ({ page }) => {
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: "UA1",
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

//  Done TODO: added test for UA414, ua1, could not add for raw and click 1 because if you just search 1 and click enter or search it does not work (the feature is still broken and you mentioned that rarrely any user will just type 1 and enter)
