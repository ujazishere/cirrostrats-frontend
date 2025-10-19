# Integration Testing

### Watch the overview video in slack

https://cirrostrats.slack.com/archives/D096NCR4ZQT/p1753831443835899

## Overview

Integration testing is implemented using Playwright, which is a browser based testing framework that allows for testing user journeys.

End-to-end integration tests have been implemented with real data on the following user journeys:

- Homepage & Hamburger Navigation
- Search Suggestions for Airports, Gates, and Flights
- Details Pages for Airports, Gates, and Flights

## Installation

```bash
npm install # Install new dev dependencies on playwright
npx playwright install chromium # Install the chromium browser for testing
npx playwright install winldd # If windows
```

## Running Tests

The tests will run automatically upon deployment, and the deployment should fail if any tests fail.

To debug tests you can use some of Playwright's handy dev tools. It is recommended to read through the [Playwright documentation](https://playwright.dev/docs/writing-tests) to learn more.

Also, installing the [Playwright VSCode/Cursor extension](https://playwright.dev/docs/getting-started-vscode) makes it easier to run and create tests.

The following commands are available in the `package.json` file to run tests:

```bash
npm run test # Run all tests
npm run test:ui # Open the playwright test UI, great for running specific tests and seeing what's happening in the browser for development
npm run test:debug # Run a test in debug mode, allowing you to step through each action
npm run test:record # Record browser actions to be used in a test
```

## Test Structure

Playwright is written in TypeScript, which is a type-safe version of JavaScript.

The playwright config file is located in "tests/integration/playwright.config.ts".
This file has some options that specify where the tests are located and where the results are saved.

The specs directory contains the tests. Name a file with the format "<name>.spec.ts" for it to be recognized by Playwright.

Past test runs are saved in the "tests/integration/results" directory, and you can view reports, and videos or screenshots from failed tests.

## Creating Tests

When adding a new feature or updating an existing feature, a developer should create a new test to verify the new functionality. If the change breaks any existing tests, they should be updated to reflect the new functionality.

You'll need to create a new file in the "tests/integration/specs" directory, name it with the format "<name>.spec.ts".

View the existing tests for examples. You can see I've created helper builder functions like `shouldHaveSpecificResult` so it's easy to add a variety of tests of diferent data points for the same feature.

The Playwright recorder can be useful as a starting point, access it by using the `npm run test:record` command, in which case you'll need to copy the generated code int a new test file. You can also use the Playwright VSCode extension to record actions, which will create a file called "test-1.spec.ts" in the specs directory.

Usually the generated code is just a starting point which will need to be updated. AI is great at getting it to completion if you just write out what you want to verify.

## Future Improvements

So far, all the tests are using production data, which is great because it tests the whole application end-to-end.

However, features that rely on ephemeral data like the flight details will need to use mock data to verify the UI is working as expected based on this data. Because the environment variables will need to be changed, this will require a different configuration which has not been implemented yet.
