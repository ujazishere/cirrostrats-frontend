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
    await page.waitForLoadState('networkidle');
    await page.getByRole("combobox").fill(query);
    // wait after passing query to prevent race condition.
    await page.waitForFunction(() => 
      document.querySelectorAll('[role="option"]').length > 0, 
      { timeout: 10000 }
    );
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
  expectedCount,
}: {
  query: string;
  expectedOption: string;
  expectedCount?: number;
}) {
return async ({ page }: { page: Page }) => {
    await page.goto("/");
    await page.getByRole("combobox").click();
    await page.waitForLoadState('networkidle');
    await page.getByRole("combobox").fill(query);
     // wait after passing query to prevent race condition.
    await page.waitForFunction(() => 
      document.querySelectorAll('[role="option"]').length > 0, 
      { timeout: 10000 }
    );
    await expect(
        page.getByRole("option", { name: expectedOption })
      ).toBeVisible();
    if (expectedCount !== undefined) {
      await expect(page.getByRole("option")).toHaveCount(expectedCount);
    }
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
  "Search Suggestions : 5 Options : RPA4",
  shouldHave5Options({ query: "RPA4" })
);

test(
  "Search Suggestions : 5 Options : SWA8",
  shouldHave5Options({ query: "SWA8" })
);

test(
  "Search Suggestions : 5 Options : JBU4",
  shouldHave5Options({ query: "JBU4" })
);

test(
  "Search Suggestions : 5 Options : DL1",
  shouldHave5Options({ query: "DL1" })
);

test(
  "Search Suggestions : 5 Options : AA10",
  shouldHave5Options({ query: "AA10" })
);

test(
  "Search Suggestions : 5 Options : AAL10",
  shouldHave5Options({ query: "AAL10" })
);

// Account for recent search to show up on top as well -- probably wont work with multiple workers.

test(
  "Search Suggestions : Specific Result : JFK",
  shouldHaveSpecificResult({
    query: "JFK",
    expectedOption: "JFK - John F Kennedy International Airport",
    expectedCount: 1,
  })
);

test(
  "Search Suggestions : Specific Result : BOS",
  shouldHaveSpecificResult({
    query: "BOS",
    expectedOption: "BOS - General Edward Lawrence Logan International Airport",
    expectedCount: 2,
  })
);


// TODO test: there is a dupicate of this test in gatedetails.spec.ts address in next cycle - this is not a duplication from gate details, this file just checkes if the item shows in search result and in the gate details spec page it clicks on that search result to check the components
test(
  "Search Suggestions : Specific Result : Gate EWR - C101",
  shouldHaveSpecificResult({
    query: "EWR",
    expectedOption: "EWR - C101 Departures",
    expectedCount: 5,
  })
);

test(
  "Search Suggestions : Specific Result : Gate EWR - C82",
  shouldHaveSpecificResult({
    query: "C82",
    expectedOption: "EWR - C82 Departures",
    expectedCount: 1,
  })
);
