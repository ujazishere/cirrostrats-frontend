import { test, expect } from "@playwright/test";
import { navigateToDetailsPage } from "../utils/details";

// TODO: A simple test for the skeleton of the flight page, not verifying any content,
    // assert using mock data: partial flight data/weather  data/ NAS data.

// TODO search: simulate various submit types - button click, return key, dropdown select - for each, perform exact match submit, multiple city match(chicago,miami) submit

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
    page.getByRole("link", { name: "View on SkyVector" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Departure" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Destination" })).toBeVisible();
  // TODO test: account for route -- route from flightaware with fall back to jms - caution if fallback warning/`test fail` if fallback fails too.
  //       account for NAS related flight. -- check nas airports
  await expect(page.getByRole("heading", { name: "D-ATIS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "TAF" })).toBeVisible();

  // --- NEW ASSERTS: Verify weather card content is non-empty ---
  const dAtisCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "D-ATIS" }) });
  const metarCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "METAR" }) });
  const tafCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "TAF" }) });

  await expect(dAtisCard).toContainText(/.{2,}/); // Expect at least 2 characters for D-ATIS
  await expect(metarCard).toContainText(/.{50,}/); // Expect at least 50 characters for METAR
  await expect(tafCard).toContainText(/.{50,}/); // Expect at least 50 characters for TAF
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
    page.getByRole("link", { name: "View on SkyVector" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Departure" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Destination" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "D-ATIS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "TAF" })).toBeVisible();

  // --- NEW ASSERTS ---
  const dAtisCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "D-ATIS" }) });
  const metarCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "METAR" }) });
  const tafCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "TAF" }) });

  await expect(dAtisCard).toContainText(/.{2,}/);
  await expect(metarCard).toContainText(/.{50,}/);
  await expect(tafCard).toContainText(/.{50,}/);

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
  // TODO: commented out becasue sometimes flightstats dont have the route. Make this optional in the test? - flakey?
  // await expect(page.getByRole("heading", { name: "Route" })).toBeVisible();
  // await expect(
    // page.getByRole("link", { name: "View on SkyVector" }),
  // ).toBeVisible();
  await expect(page.getByRole("button", { name: "Departure" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Destination" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "D-ATIS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "TAF" })).toBeVisible();

  // --- NEW ASSERTS ---
  const dAtisCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "D-ATIS" }) });
  const metarCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "METAR" }) });
  const tafCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "TAF" }) });

  await expect(dAtisCard).toContainText(/.{2,}/);
  await expect(metarCard).toContainText(/.{50,}/);
  await expect(tafCard).toContainText(/.{50,}/);
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
  // TODO test: This is assuming UA- fix at source for fallback to UA.
  const noDataMessage = page.getByText(
    "Error fetching flight data: Could not retrieve data for flight UA0000",
  );

  // 3. Assert that the message is visible on the page.
  // A generous timeout is used because the application must first attempt
  // to fetch data before it can conclude that none is available.
  await expect(noDataMessage).toBeVisible({ timeout: 15000 });
});

test("Details : Flight : Raw : b62584", async ({ page }) => {
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: "b62584",
  });
  // TODO: route is not gonna show up for FlightStats flight data returns with IATA code - Need to integrate IATA with ICAO from JMS to get route from JMS in order for this test to pass
  // await expect(page.getByRole("heading", { name: "Route" })).toBeVisible();
  // TODO : This probably flightID needs to be associated with jms or flightaware for a skyvectorroute return.
  // await expect(
  //   page.getByRole("link", { name: "View on SkyVector" })
  // ).toBeVisible();
  await expect(page.getByRole("button", { name: "Departure" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Destination" })).toBeVisible();
  // TODO ismail: I attempted this assert but this is wrong it should not pass since there is no weather available of now: just assert METAR should suffice..
  await expect(page.getByRole("heading", { name: "D-ATIS" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "TAF" })).toBeVisible();

  // --- NEW ASSERTS ---
  const dAtisCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "D-ATIS" }) });
  const metarCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "METAR" }) });
  const tafCard = page
    .locator(".weather-card")
    .filter({ has: page.getByRole("heading", { name: "TAF" }) });

  await expect(dAtisCard).toContainText(/.{2,}/);
  await expect(metarCard).toContainText(/.{50,}/);
  await expect(tafCard).toContainText(/.{50,}/);

  // subsequent search for
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: "b62584",
  });
  await expect(page.getByRole("heading", { name: "Route" })).toBeVisible();
});
