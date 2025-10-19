import { Page } from "@playwright/test";

/**
 * Navigate to the details page by typing a query and clicking on a specific search suggestion
 * @param page - The Playwright page object
 * @param query - The search query to type into the search combobox
 * @param clickedOption - The exact text of the search suggestion option to click
 * @returns The page object after navigation is complete
 * @example
 * await clickToDetailsPage({
 *   page,
 *   query: "EWR",
 *   clickedOption: "EWR - Newark Liberty"
 * });
 */
export async function clickToDetailsPage({
  page,
  query,
  clickedOption,
}: {
  page: Page;
  query: string;
  clickedOption: string;
}) {
  await page.goto("http://localhost:5173/");
  await page.getByRole("combobox").click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("combobox").fill(query);
  // wait after passing query to prevent race condition.
  await page.waitForFunction(
    () => document.querySelectorAll('[role="option"]').length > 0,
    { timeout: 10000 },
  );
  await page.getByRole("option", { name: clickedOption }).click();
  return page;
}

/**
 * Navigate to the details page by typing a query directly and pressing Enter
 * Useful for direct navigation with full ICAO codes or specific identifiers
 * @param page - The Playwright page object
 * @param query - The direct query to type (e.g., "KEWR" for Newark airport)
 * @returns The page object after navigation is complete
 * @example
 * await rawQueryToDetailsPage({
 *   page,
 *   query: "KEWR"
 * });
 */
export async function rawQueryToDetailsPage({
  page,
  query,
}: {
  page: Page;
  query: string;
}) {
  await page.goto("http://localhost:5173/");
  await page.getByRole("combobox").fill(query);
  await page.getByRole("combobox").press("Enter");
  return page;
}

/**
 * Universal navigation function that can navigate to the details page using either click or raw query methods
 * This is a wrapper around clickToDetailsPage and rawQueryToDetailsPage that provides a unified interface
 * @param page - The Playwright page object
 * @param navigationMethod - The navigation method: "click" to select from suggestions, "raw" to type and press Enter
 * @param query - The search query (airport code for click method, full ICAO code for raw method)
 * @param clickedOption - The specific search suggestion to click (required only when navigationMethod is "click")
 * @returns The page object after navigation is complete
 * @throws Error if required parameters are missing for the selected navigation method
 * @example
 * // Navigate by clicking a suggestion
 * await navigateToDetailsPage({
 *   page,
 *   navigationMethod: "click",
 *   query: "EWR",
 *   clickedOption: "EWR - Newark Liberty"
 * });
 *
 * // Navigate by direct query
 * await navigateToDetailsPage({
 *   page,
 *   navigationMethod: "raw",
 *   query: "KEWR"
 * });
 */
export async function navigateToDetailsPage({
  page,
  navigationMethod,
  query,
  clickedOption,
}:
  | {
      query: string;
      page: Page;
      navigationMethod: "click";
      clickedOption: string;
    }
  | {
      query: string;
      page: Page;
      navigationMethod: "raw";
      clickedOption?: never;
    }) {
  if (navigationMethod === "click") {
    if (!clickedOption) {
      throw new Error(
        "clickedOption is required when navigationMethod is click",
      );
    }
    await clickToDetailsPage({ page, query, clickedOption });
  } else {
    if (!query) {
      throw new Error("query is required when navigationMethod is direct");
    }
    await rawQueryToDetailsPage({ page, query });
  }
  return page;
}
