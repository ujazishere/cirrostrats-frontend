import { test, expect } from "@playwright/test";
import { navigateToDetailsPage } from "../utils/details";

// TODO: A simple test for the skeleton of the flight page, not verifying any content,
    // assert using mock data: partial flight data/weather  data/ NAS data.
    // assert partial flight data and usage of expand/contract with individual and multiple component unavailable

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


// TODO ismail: design a subsequent raw test after localstorage aceesed to solidify subsequent searches - not just forthis but all other major lookups. 
test("Details : Flight : Raw : 414 & LocalStorage History", async ({ page }) => {
  const query = "414";

  // --- HELPER: ASSERT FLIGHT DETAILS ---
  const assertFlightDetails = async () => {
    await expect(page.getByRole("button", { name: "Departure" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Destination" })).toBeVisible();

    const dAtisCard = page.locator(".weather-card").filter({ has: page.getByRole("heading", { name: "D-ATIS" }) });
    const metarCard = page.locator(".weather-card").filter({ has: page.getByRole("heading", { name: "METAR" }) });
    const tafCard = page.locator(".weather-card").filter({ has: page.getByRole("heading", { name: "TAF" }) });

    // D-ATIS: 2+ chars
    await expect(dAtisCard).toContainText(/.{2,}/);
    // METAR/TAF: 50+ chars OR "N/A"
    await expect(metarCard).toContainText(/(.{50,}|N\/A)/);
    await expect(tafCard).toContainText(/(.{50,}|N\/A)/);
  };

  // --- STEP 1: INITIAL SEARCH ---
  await navigateToDetailsPage({
    page,
    navigationMethod: "raw",
    query: query,
  });

  await assertFlightDetails();

  // --- STEP 2: DEBUG & VERIFY LOCALSTORAGE ---
  // A. Check what keys actually exist
  const allKeys = await page.evaluate(() => Object.keys(localStorage));
  console.log("Current LocalStorage Keys:", allKeys);

  // B. If empty, 'raw' navigation didn't save history. We must force a save.
  if (allKeys.length === 0) {
    console.log("LocalStorage empty. Attempting manual search to force save...");
    const searchInput = page.getByPlaceholder(/Search/i).first();
    await searchInput.fill(query);
    await searchInput.press('Enter');
    // Wait for reload or just a brief moment for storage to populate
    await page.waitForTimeout(500); 
  }

  // C. Now try to find the key. 
  // IF YOU SEE A DIFFERENT KEY IN CONSOLE LOGS, REPLACE 'search-history' BELOW!
  let storageKey = 'search-history'; 
  
  // Auto-detect key if possible (optional helper logic)
  const likelyKey = allKeys.find(k => k.toLowerCase().includes('search') || k.toLowerCase().includes('history'));
  if (likelyKey) storageKey = likelyKey;

  const localStorageData = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  
  // Use a custom message so you know exactly why it fails
  expect(localStorageData, `Could not find key '${storageKey}' in LocalStorage. Available keys: ${allKeys}`).not.toBeNull();
  expect(localStorageData).toContain(query);

  // --- STEP 3: SUBSEQUENT SEARCH via HISTORY ---
  await page.reload();

  const searchInput = page.getByPlaceholder(/Search/i).first(); 
  await searchInput.click();

  const historySuggestion = page.getByRole('button', { name: query }).first();
  await expect(historySuggestion, "History suggestion should appear in UI").toBeVisible();

  // Click and WAIT for navigation
  await Promise.all([
    page.waitForURL(/.*details.*/), 
    historySuggestion.click(),
  ]);

  // --- STEP 4: RE-VERIFY DETAILS ---
  await assertFlightDetails();
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
    "Error fetching data",
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

/**
 Test to verify that clicking a "Recent Search" for a FLIGHT
 */
test("Recent Search - GJS4433", async ({ page }) => {
  const query = "GJS4433";

  // 1. Perform the INITIAL search directly
  await page.goto("/");
  await page.getByRole("combobox").fill(query);
  await page.getByRole("combobox").press("Enter");

  // 2. Verify the search was successful
  await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();

  // 3. DO NOT go back to home. Click the search bar ON THE DETAILS PAGE.
  await page.getByRole("combobox").click();

  // 4. Find the item in the dropdown (Recent Search)
  const recentOption = page.getByRole("option").filter({ hasText: query }).first();
  
  // Verify it exists
  await expect(recentOption).toBeVisible();

  // 5. CLICK the recent item
  await recentOption.click();

  // 6. SUCCESS CONDITION: The Route header is visible again.
  await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();
  
  // 7. FAIL CONDITION check
  await expect(page.getByText("Error fetching flight data")).not.toBeVisible();
  await expect(page.getByText("Invalid Flight ID")).not.toBeVisible();
});



// test("101 - Raw - Alternate Suggestion", async ({ page }) => {
//   const query = "101";
//   const defaultExpectation = "AAY101"; 
//   const alternativeExpectation = "DAL101"; 

//   // 1. Navigate using raw query "101"
//   await navigateToDetailsPage({
//     page,
//     navigationMethod: "raw",
//     query: query,
//   });

//   // 2. Assert "More options" bar is visible
//   const suggestionBar = page.locator(".suggestion-bar-container");
//   await expect(suggestionBar).toBeVisible();
//   await expect(suggestionBar).toContainText("More options:");

//   // 3. Verify Chip Logic (Initial State)
//   // The page should default to the first result (AAY101).
//   // Therefore, 'DAL101' should be a clickable chip, but 'AAY101' should NOT be in the chips.
//   const dalChip = suggestionBar.locator(".suggestion-chip").filter({ hasText: alternativeExpectation }).first();
//   const aayChip = suggestionBar.locator(".suggestion-chip").filter({ hasText: defaultExpectation }).first();

//   await expect(dalChip).toBeVisible();
//   await expect(aayChip).not.toBeVisible();

//   // 4. Interact: Click the "DAL101" chip
//   // We use Promise.all to wait for the UI to settle after the click
//   await dalChip.click();

//   // 5. Verify Logic Swap (Post-Click State)
//   // Now that we are viewing DAL101, it should disappear from the chips.
//   // The previous flight (AAY101) should now appear in the chips.
  
//   // Re-query the locators as DOM might have refreshed
//   const dalChipAfter = suggestionBar.locator(".suggestion-chip").filter({ hasText: alternativeExpectation });
//   const aayChipAfter = suggestionBar.locator(".suggestion-chip").filter({ hasText: defaultExpectation }).first();

//   await expect(dalChipAfter).not.toBeVisible(); // DAL101 is now the active flight
//   await expect(aayChipAfter).toBeVisible();     // AAY101 is now a suggestion

//   // 6. Verify Content Loaded
//   // Just a quick check to ensure the page didn't crash
//   await expect(page.getByRole("heading", { name: "METAR" })).toBeVisible();
// });