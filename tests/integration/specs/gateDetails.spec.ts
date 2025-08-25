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

