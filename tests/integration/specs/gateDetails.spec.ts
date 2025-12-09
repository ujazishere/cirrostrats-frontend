import { test, expect } from "@playwright/test";
import { navigateToDetailsPage } from "../utils/details";

// A simple test for the skeleton of the gate page, not verifying any content
// searches C101 and selects an item from the dropdown.
test("Details : Gate : Click : C101", async ({ page }) => {
  await navigateToDetailsPage({
    page,
    navigationMethod: "click",
    query: "C101",
    clickedOption: "EWR - C101 Departures",
  });
  // TODO ismail: assert that the data is for the latest date using visible date header on the page.
  // Maybe do that for all on a separate isolated test so its not intensive on all?
  //  - metar taf datis, sscheduled date for the flight, etc.
  await expect(page.getByRole("heading", { name: "Gate C101" })).toBeVisible();
  await expect(page.getByText("Flight")).toBeVisible();
  await expect(page.getByText("Scheduled")).toBeVisible();
  await expect(page.locator("div.flight-row-card").first()).toBeVisible();
});

// Commenting this test out because the raw search query for gates is currently broken once that is fixed just comment this back and it should work.
// test("Details : Gate : Raw : C102", async ({ page }) => {
//   await navigateToDetailsPage({
//     page,
//     navigationMethod: "raw",
//     query: "C102",
//   });

//   await expect(page.getByRole("heading", { name: "Gate C102" })).toBeVisible();
//   await expect(page.getByText("Flight")).toBeVisible();
//   await expect(page.getByText("Scheduled")).toBeVisible();
//   await expect(page.locator("div.flight-row-card").first()).toBeVisible();
// });

/**
 Test to verify that clicking a "Recent Search" for a GATE
 */
test("Recent Saerch - C101", async ({ page }) => {
  const query = "C101";
  const fullOptionLabel = "EWR - C101 Departures";

  // 1. Perform the INITIAL search from Homepage
  await page.goto("/");
  await page.getByRole("combobox").click();
  await page.getByRole("combobox").fill(query);

  // Wait for dropdown options
  await page.waitForFunction(
    () => document.querySelectorAll('[role="option"]').length > 0,
    { timeout: 10000 }
  );

  // Click the specific gate option
  await page.getByRole("option", { name: fullOptionLabel }).click();

  // 2. Verify we are on the details page
  await expect(page).toHaveURL("/details");
  await expect(page.getByRole("heading", { name: "Gate C101" })).toBeVisible();

  // 3. DO NOT go back to home. Open the search bar ON THE DETAILS PAGE.
  await page.getByRole("combobox").click();

  // 4. Select the 1st item from the dropdown (Recent Search)
  const firstOption = page.getByRole("option").first();
  
  // Verify it's the correct recent item
  await expect(firstOption).toContainText("C101"); 
  
  // 5. CLICK the recent item again
  await firstOption.click();

  // 6. VERIFY SUCCESS (Data should reload without error)
  await expect(page).toHaveURL("/details");
  await expect(page.getByRole("heading", { name: "Gate C101" })).toBeVisible();
  await expect(page.locator("div.flight-row-card").first()).toBeVisible();

  // 7. Explicitly ensure NO error message is shown
  await expect(page.getByText("No departure information is available for this gate.")).not.toBeVisible();
  await expect(page.getByText("Error fetching gate data")).not.toBeVisible();
});

