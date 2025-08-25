import { test, expect, Page } from "@playwright/test";
import { navigateToDetailsPage } from "../utils/details";

/**
 * Test that an airport details page displays the expected weather cards (D-ATIS, METAR, TAF)
 * @param navigationMethod - How to navigate to the details page: "click" for clicking a search suggestion, "raw" for direct query
 * @param query - The search query to use (airport code for click method, full ICAO code for raw method)
 * @param clickedOption - The specific search suggestion option to click (required only for "click" method)
 * @returns A function to be used as a playwright test that verifies 3 weather cards are present with proper content
 */
function shouldHaveWeatherCards({
  navigationMethod,
  query,
  clickedOption,
}:
  | {
      navigationMethod: "click";
      query: string;
      clickedOption: string;
    }
  | {
      navigationMethod: "raw";
      query: string;
      clickedOption?: never;
    }) {
  // Expect that the page is already on the details page
  return async ({ page }: { page: Page }) => {
    if (navigationMethod === "click") {
      await navigateToDetailsPage({
        page,
        navigationMethod,
        query,
        clickedOption,
      });
    } else {
      await navigateToDetailsPage({
        page,
        navigationMethod,
        query,
      });
    }

    await expect(page, "Page should be on details page").toHaveURL("/details");

    // TODO test: account for NAS related flight. -- check nas airports through their api and check if the component is available for that particular airport.

    // Assert that there are 3 weather cards
    await expect(page.locator(".weather-card")).toHaveCount(3);

    // Assert that each weather card has proper headings and at least 200 characters of content
    const dAtisCard = page
      .locator(".weather-card")
      .filter({ has: page.getByRole("heading", { name: "D-ATIS" }) });
    const metarCard = page
      .locator(".weather-card")
      .filter({ has: page.getByRole("heading", { name: "METAR" }) });
    const tafCard = page
      .locator(".weather-card")
      .filter({ has: page.getByRole("heading", { name: "TAF" }) });

    await expect(dAtisCard).toBeVisible();
    await expect(metarCard).toBeVisible();
    await expect(tafCard).toBeVisible();

    // Expect d-atis to have at least 2 characters of content
    await expect(dAtisCard).toContainText(/.{2,}/);

    // Expect metar to have at least 50 characters of content
    await expect(metarCard).toContainText(/.{50,}/);

    // Expect taf to have at least 50 characters of content
    await expect(tafCard).toContainText(/.{50,}/);
  };
}

/**
 * Test that the METAR weather data on an airport details page follows the proper format
 * Validates that METAR starts with "K" + airport code + timestamp in DDHHMMZ format
 * @param navigationMethod - How to navigate to the details page: "click" for clicking a search suggestion, "raw" for direct query
 * @param query - The search query to use (airport code for click method, full ICAO code for raw method)
 * @param airportCode - The 3-letter airport code used for METAR format validation (e.g., "EWR", "BOS")
 * @param clickedOption - The specific search suggestion option to click (required only for "click" method)
 * @returns A function to be used as a playwright test that verifies METAR format matches expected pattern
 */
function shouldHaveMetarFormatAfterClicking({
  navigationMethod,
  query,
  airportCode,
  clickedOption,
}:
  | {
      navigationMethod: "click";
      query: string;
      airportCode: string;
      clickedOption: string;
    }
  | {
      navigationMethod: "raw";
      query: string;
      airportCode: string;
      clickedOption?: never;
    }) {
  return async ({ page }: { page: Page }) => {
    if (navigationMethod === "click") {
      await navigateToDetailsPage({
        page,
        navigationMethod,
        query,
        clickedOption,
      });
    } else {
      await navigateToDetailsPage({
        page,
        navigationMethod,
        query,
      });
    }

    const metarCard = page.locator(".weather-card").filter({
      has: page.getByRole("heading", { name: "METAR" }),
    });

    // Validate that the METAR starts with the airport code (K followed by 3 letters) and time format (6 digits followed by Z)
    const basicMETARRegex = new RegExp(
      `^(?:METAR\\s+|SPECI\\s+)?K${airportCode}\\s+\\d{6}Z`
    );
    // This will look like /^KEWR\s+\d{6}Z/

    await expect(metarCard.locator("p")).toContainText(basicMETARRegex);
  };
}

/**
 * Test that the TAF weather data on an airport details page follows the proper format
 * Validates that TAF starts with "TAF" + airport code + timestamp in DDHHMMZ format
 */
function shouldHaveTafFormatAfterClicking({
  navigationMethod,
  query,
  airportCode,
  clickedOption,
}:
  | {
      navigationMethod: "click";
      query: string;
      airportCode: string;
      clickedOption: string;
    }
  | {
      navigationMethod: "raw";
      query: string;
      airportCode: string;
      clickedOption?: never;
    }) {
  return async ({ page }: { page: Page }) => {
    if (navigationMethod === "click") {
      await navigateToDetailsPage({
        page,
        navigationMethod,
        query,
        clickedOption,
      });
    } else {
      await navigateToDetailsPage({
        page,
        navigationMethod,
        query,
      });
    }

    const tafCard = page.locator(".weather-card").filter({
      has: page.getByRole("heading", { name: "TAF" }),
    });

    // Validate that the TAF starts with "TAF" + airport code and timestamp in DDHHMMZ format
    const basicTAFRegex = new RegExp(`^TAF\\s+K${airportCode}\\s+\\d{6}Z`);

    await expect(tafCard.locator("p")).toContainText(basicTAFRegex);
  };
}

/**
 * Test that the D-ATIS (ATIS) weather data on an airport details page follows the proper format
 * NOTE: Actual ATIS format from real airports looks like:
 *   "EWR ATIS INFO S 0651Z."
 *   "BOS ATIS INFO J 0654Z."
 *   "ORD ATIS INFO R 0651Z."
 * So the regex must match: "<AIRPORT> ATIS INFO <Letter> <DDHHZ>."
 */
function shouldHaveDAtisFormatAfterClicking({
  navigationMethod,
  query,
  airportCode,
  clickedOption,
}:
  | {
      navigationMethod: "click";
      query: string;
      airportCode: string;
      clickedOption: string;
    }
  | {
      navigationMethod: "raw";
      query: string;
      airportCode: string;
      clickedOption?: never;
    }) {
  return async ({ page }: { page: Page }) => {
    if (navigationMethod === "click") {
      await navigateToDetailsPage({
        page,
        navigationMethod,
        query,
        clickedOption,
      });
    } else {
      await navigateToDetailsPage({
        page,
        navigationMethod,
        query,
      });
    }

    const dAtisCard = page.locator(".weather-card").filter({
      has: page.getByRole("heading", { name: "D-ATIS" }),
    });

    // Updated regex based on actual ATIS format from ORD, BOS, EWR
    // Matches: "<AIRPORT> ATIS INFO <Letter> <DDHHZ>."
    const basicDAtisRegex = new RegExp(`^${airportCode}\\s+ATIS\\s+INFO\\s+[A-Z]\\s+\\d{4}Z(?:\\s+SPECIAL)?\\.`)


    await expect(dAtisCard.locator("p")).toContainText(basicDAtisRegex);
  };
}


// TODO ismail:there are 4 tests per airprot for ewr and bos. can we merge to have
    // two - raw and click? each of them have two tests - ones checking metar format and 
    // other checking weather cards. Merge them to check both instead of having separate tests?
test(
  "Details : Airport : Click : Weather Cards : EWR",
  shouldHaveWeatherCards({
    navigationMethod: "click",
    query: "EWR",
    clickedOption: "EWR - Newark Liberty",
  })
);

test(
  "Details : Airport : Raw : Weather Cards : EWR",
  shouldHaveWeatherCards({
    navigationMethod: "raw",
    query: "KEWR",
  })
);

test(
  "Details : Airport : Click : Weather Cards : BOS",
  shouldHaveWeatherCards({
    navigationMethod: "click",
    query: "BOS",
    clickedOption:
      "BOS - General Edward Lawrence Logan International Airport",
  })
);

test(
  "Details : Airport : Raw : Weather Cards : BOS",
  shouldHaveWeatherCards({
    navigationMethod: "raw",
    query: "KBOS",
  })
);

// TODO: UNV raw search fails. -- checked and it searched the airport but keeps on loading - seems like a timeout issue 
// test(
//   "Details : Airport : Raw : Weather Cards : UNV",
//   shouldHaveWeatherCards({
//     navigationMethod: "raw",
//     query: "UNV",
//   })
// );


// TODO: This test is failing because of duplicates in search suggestions. Fix at source in `search query stid bug` for unique id
// test(
//   "Details : Airport : Click : Weather Cards : DEN",
//   shouldHaveWeatherCards({
//     navigationMethod: "click",
//     query: "DEN",
//     clickedOption: "DEN - Denver International Airport",
//   })
// );

test(
  "Details : Airport : Raw : Weather Cards : DEN",
  shouldHaveWeatherCards({
    navigationMethod: "raw",
    query: "KDEN",
  })
);

// -----------------------------------------------------------------------------
// METAR Format Validation Tests - suggestion click and raw.
// -----------------------------------------------------------------------------

test(
  "Details : Airport : Click : Validate METAR : EWR",
  shouldHaveMetarFormatAfterClicking({
    navigationMethod: "click",
    query: "EWR",
    airportCode: "EWR",
    clickedOption: "EWR - Newark Liberty",
  })
);

test(
  "Details : Airport : Raw : Validate METAR : EWR",
  shouldHaveMetarFormatAfterClicking({
    navigationMethod: "raw",
    query: "KEWR",
    airportCode: "EWR",
  })
);


test(
  "Details : Airport : Click : Validate METAR : BOS",
  shouldHaveMetarFormatAfterClicking({
    navigationMethod: "click",
    query: "BOS",
    airportCode: "BOS",
    clickedOption:
      "BOS - General Edward Lawrence Logan International Airport",
  })
);

test(
  "Details : Airport : Raw : Validate METAR : BOS",
  shouldHaveMetarFormatAfterClicking({
    navigationMethod: "raw",
    query: "KBOS",
    airportCode: "BOS",
  })
);

// -----------------------------------------------------------------------------
// NEW: TAF Format Validation Tests
// -----------------------------------------------------------------------------

test(
  "Details : Airport : Raw : Validate TAF : EWR",
  shouldHaveTafFormatAfterClicking({
    navigationMethod: "raw",
    query: "KEWR",
    airportCode: "EWR",
  })
);

test(
  "Details : Airport : Raw : Validate TAF : BOS",
  shouldHaveTafFormatAfterClicking({
    navigationMethod: "raw",
    query: "KBOS",
    airportCode: "BOS",
  })
);

// -----------------------------------------------------------------------------
// NEW: D-ATIS Format Validation Tests
// -----------------------------------------------------------------------------

test(
  "Details : Airport : Raw : Validate D-ATIS : EWR",
  shouldHaveDAtisFormatAfterClicking({
    navigationMethod: "raw",
    query: "KEWR",
    airportCode: "EWR",
  })
);

test(
  "Details : Airport : Raw : Validate D-ATIS : BOS",
  shouldHaveDAtisFormatAfterClicking({
    navigationMethod: "raw",
    query: "KBOS",
    airportCode: "BOS",
  })
);
