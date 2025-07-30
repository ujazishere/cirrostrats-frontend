import { test, expect, Page } from "@playwright/test";

/**
 * Test a search suggestion that we expect to have 5 options
 * @param query - The query typed into the search bar
 * @returns A function to be used as a playwright test
 */
function shouldHave5Options({ query }: { query: string }) {
  return async ({ page }: { page: Page }) => {
    await page.goto("/");
    await page.getByRole("combobox").click();
    await page.getByRole("combobox").fill(query);
    await expect(page.getByRole("option")).toHaveCount(5);
  };
}

/**
 * Test a search suggestion that should contain a specific expected option
 * @param query - The query typed into the search bar
 * @param expectedOption - The specific option text that should appear in the results
 * @returns A function to be used as a playwright test that verifies the expected option is visible
 */
function shouldHaveSpecificResult({
  query,
  expectedOption,
}: {
  query: string;
  expectedOption: string;
}) {
  return async ({ page }: { page: Page }) => {
    await page.goto("/");
    await page.getByRole("combobox").click();
    await page.getByRole("combobox").fill(query);
    await expect(
      page.getByRole("option", { name: expectedOption })
    ).toBeVisible();
  };
}

test(
  "Search Suggestions : 5 Options : EWR",
  shouldHave5Options({ query: "EWR" })
);

test(
  "Search Suggestions : 5 Options : UA",
  shouldHave5Options({ query: "UA" })
);

test(
  "Search Suggestions : 5 Options : DAL4",
  shouldHave5Options({ query: "DAL4" })
);

test(
  "Search Suggestions : Specific Result : JFK",
  shouldHaveSpecificResult({
    query: "JFK",
    expectedOption: "JFK - John F Kennedy International Airport",
  })
);

test(
  "Search Suggestions : Specific Result : BOS",
  shouldHaveSpecificResult({
    query: "BOS",
    expectedOption: "BOS - General Edward Lawrence Logan International Airport",
  })
);

test(
  "Search Suggestions : Specific Result : Gate EWR - C101",
  shouldHaveSpecificResult({
    query: "EWR",
    expectedOption: "EWR - C101 Departures",
  })
);

test(
  "Search Suggestions : Specific Result : Gate EWR - C82",
  shouldHaveSpecificResult({
    query: "C82",
    expectedOption: "EWR - C82 Departures",
  })
);
