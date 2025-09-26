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


// TODO: add test for C101 raw submit