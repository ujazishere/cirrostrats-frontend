import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trackSearch } from "./useTrackSearch";
import searchService from "../api/searchservice";
import { FormattedSuggestion } from "../utils/searchUtils";

/*
This file manages UI interactions (click, submit, keyboard events)
houses all input handlers.
It's a custom hook, so we can reuse all this logic in other components if we need to.
*/

interface UseInputHandlersReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValue: FormattedSuggestion | null;
  setSelectedValue: (value: FormattedSuggestion | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  showingMultipleAirports: boolean;
  handleSubmit: (
    e: any,
    submitTerm: any,
    userEmail: string,
    suggestions?: FormattedSuggestion[],
  ) => void;
  handleValue: (value: FormattedSuggestion | null) => void;
  handleInputChange: (
    event: any,
    newInputValue: string,
    userEmail: string,
  ) => void;
  handleFocus: () => void;
  handleBlur: (event: any) => void;
  handleKeyDown: (event: any) => void;
  handleOptionSelect: (option: FormattedSuggestion | null) => void;
}

const useInputHandlers = (): UseInputHandlersReturn => {
  // navigate is from react-router-dom, used to programmatically change pages
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  // inputValue is what the user is currently typing in teh search box
  const [inputValue, setInputValue] = useState<string>("");
  // selectedValue holds the full object when a user clicks a suggestion from the dropdown
  const [selectedValue, setSelectedValue] =
    useState<FormattedSuggestion | null>(null);
  // open controls whether the dropdown is visible or not
  const [open, setOpen] = useState<boolean>(false);

  const [showingMultipleAirports, setShowingMultipleAirports] =
    useState<boolean>(false);

  // This is for debouncing, which means we wait for the user to stop typing before firing an API call.
  // We're keeping this line commented out for now but the import is there if we need it.
  // const debouncedInputValue = useDebounce(inputValue, 300); // Keep this line

  // Simple handler to update the selected value state.
  const handleValue = (value: FormattedSuggestion | null): void => {
    setSelectedValue(value);
  };

  // This function runs every time the user types something in the input field.
  const handleInputChange = (
    _event: any,
    newInputValue: string,
    _userEmail: string,
  ): void => {
    // TODO search: user based popular searches
    // Here the user should have their own most popular search terms displayed on the top in blue in the dropdown.
    setInputValue(newInputValue);
    // We could track every keystroke for analytics, but it's a bit much.
    // trackSearch(userEmail, newInputValue); // Keep this line if you want to track keystrokes
  };

  /**
   * @function saveSearchToLocalStorage
   * @description Takes a search term object, sanitizes it, and saves it to a capped list of recent searches in the browser's localStorage.
   * This helps us show "Recent Searches" to the user.
   * @param {object} term - The search term object to be saved. Should have at least a 'label' property.
   */
  const saveSearchToLocalStorage = (term: any): void => {
    // --- NEW LOCAL STORAGE LOGIC ---
    // Get the current time as a numerical timestamp. This is used to track how old searches are.
    const currentTime = new Date().getTime();
    // Define the maximum number of recent searches to keep in storage. We dont want to fill up their storage.
    const MAX_RECENT_SEARCHES = 2;

    // Initialize an empty array to hold the list of recent searches.
    let recentSearches = [];
    try {
      // Attempt to retrieve and parse the existing list of searches from localStorage.
      // If 'recentSearches' doesn't exist in storage, it defaults to an empty array string '[]'.
      // The '||' operator is a nice fallback here.
      recentSearches = JSON.parse(
        localStorage.getItem("recentSearches") || "[]",
      );
    } catch (error) {
      // If the data in localStorage is corrupted (maybe the user edited it?), it could crash the app.
      // This catch block prevents that and just resets it.
      // If the data in localStorage is corrupted and cannot be parsed, log the error and reset to an empty array.
      console.error("Error parsing recent searches from localStorage:", error);
      recentSearches = [];
    }

    // Prepare a clean object 'termToStore' that will be saved.
    // We do this to avoid saving extra junk into local storage that we dont need.
    let termToStore: any = {};
    // Ensure the provided 'term' is a valid object with a 'label' before proceeding.
    if (typeof term === "string") {
      // Sometimes we just get a raw string, so we make an object out of it.
      termToStore = {
        label: term,
        type: "raw_string", // You can specify a type for raw strings
      };
    } else if (term && term.label) {
      // Construct the object using only the properties we need.
      // The spread syntax conditionally adds properties only if they exist on the source 'term' object.
      termToStore = {
        ...(term.id && { id: term.id }),
        ...(term.referenceId && { referenceId: term.referenceId }),
        label: term.label,
        type: term.type,
      };
    } else {
      // If the term is invalid, log a warning and exit the function to avoid saving bad data.
      console.warn("Unexpected term format for storage:", term);
      return;
    }

    // Filter out any duplicates from the existing list before adding the new term.
    // We don't want the same search showing up multiple times.
    recentSearches = recentSearches.filter((item: any) => {
      // Priority 1: If both the new term and an existing item have an 'id', compare them. This is the most reliable check.
      if (termToStore.id && item.id) {
        return item.id !== termToStore.id;
      }
      // Priority 2: If IDs aren't available, compare their labels in a case-insensitive way.
      if (item.label && termToStore.label) {
        return item.label.toLowerCase() !== termToStore.label.toLowerCase();
      }
      // If a comparison can't be made, keep the item by default.
      return true;
    });

    // Add the new, cleaned search term to the beginning of the array.
    recentSearches.unshift({ ...termToStore, timestamp: currentTime });

    // If the list now exceeds the maximum allowed size, trim it.
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
      // .slice(0, MAX_RECENT_SEARCHES) creates a new array containing only the first N items.
      recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }

    // Save the final, updated array back to localStorage. It must be converted to a JSON string.
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    // --- END NEW LOCAL STORAGE LOGIC ---
  };

  /**
   * @function triggerSearchBarShake
   * @description Triggers a shake animation on the search bar to indicate an error or multiple options available
   */
  const triggerSearchBarShake = () => {
    const searchContainer =
      document.querySelector(".search-container") ||
      document.querySelector(".searchbar-container") ||
      document.querySelector(".search-autocomplete");

    if (searchContainer) {
      // Add shake class
      searchContainer.classList.add("shake-animation");

      // Remove shake class after animation completes
      setTimeout(() => {
        searchContainer.classList.remove("shake-animation");
      }, 600); // Animation duration should match CSS animation
    }
  };

  /**
  /**
   * @function showMultipleAirportsMessage
   * @description Shows a temporary message to user indicating they need to select from dropdown options
   */
  const showMultipleAirportsMessage = () => {
    // Set flag to prevent input clearing
    setShowingMultipleAirports(true);

    // Create or update message element
    let messageElement = document.querySelector(".multiple-airports-message");

    if (!messageElement) {
      messageElement = document.createElement("div");
      messageElement.className = "multiple-airports-message";

      // Insert the message below the search container
      const searchContainer =
        document.querySelector(".search-container") ||
        document.querySelector(".searchbar-container");
      if (searchContainer) {
        searchContainer.appendChild(messageElement);
      }
    }

    // Set message content
    messageElement.textContent =
      "Multiple airports found. Please select one from the dropdown.";
    (messageElement as HTMLElement).style.display = "block";

    // Auto-hide message after 3 seconds and reset flag
    setTimeout(() => {
      if (messageElement) {
        (messageElement as HTMLElement).style.display = "none";
      }
      setShowingMultipleAirports(false);
    }, 3000);
  };





  /**
   * @function handleSubmit
   * @description Handles the search submission event. It intelligently determines whether the user
   * selected an item from the dropdown or submitted a raw text query by pressing Enter.
   * @param {Event} e - The form submission or click event.
   * @param {object|string} submitTerm - The term being searched. Can be a full object from the dropdown or a raw string.
   * @param {string} userEmail - The email of the current user for tracking purposes.
   * @param {Array<object>} suggestions - The list of suggestion objects currently displayed in the dropdown.
   */
  const handleSubmit = (
    e: any,
    submitTerm: any,
    userEmail: string,
    suggestions: FormattedSuggestion[] = [],
  ): void => {
    // Prevent the default browser action for the event (e.g., page reload on form submit).
    if (e) e.preventDefault();
    // Guard clause: Exit if the search term is empty, null, or just whitespace. No point in searching for nothing.
    if (
      !submitTerm ||
      (typeof submitTerm === "string" && !submitTerm.trim()) ||
      (typeof submitTerm === "object" && !submitTerm?.label)
    ) {
      return;
    }

    // TODO serach: SearchTracking is not working for other airliners from JMS - like delta/american and such.
    // Call a tracking function to log the search event for analytics.
    trackSearch(userEmail, submitTerm);

    // Check if the submitted term is a structured object (meaning it was selected from the dropdown).
    console.log("submitTerm", submitTerm);
    if (typeof submitTerm === "object" && submitTerm.referenceId) {
      // --- Case 1: A dropdown item was explicitly selected ---
      // The term is already in the correct format, this is the easy path.
      console.log("Submitting selected term:", submitTerm);
      saveSearchToLocalStorage(submitTerm);
      // Navigate to the details page, passing the search object in the route's state.
      navigate("/details", { state: { searchValue: submitTerm } });
      // Update the Autocomplete component's value to reflect the selection.
      setSelectedValue(submitTerm);
    } else if (typeof submitTerm === "string") {
      // This is the tricky part, when user just types something and hits enter...
      // --- Case 2: A raw string was submitted (e.g., by typing and pressing Enter) ---
      const trimmedSubmitTerm = submitTerm.trim(); // trimming leading and trailing white spaces

      // previously we were checking if the first suggestion matched the submit term. Not doing it anymore.
      // const topSuggestion = suggestions && suggestions.length > 0 ? suggestions[0] : null;

      // NEW IMPROVED LOGIC: Check if there's an exact match in ANY of the current suggestions
      // This now handles airports, gates, and flights properly. Much smarter.
      const exactMatch = suggestions.find((suggestion: FormattedSuggestion) => {
        // Check for exact label match (case-insensitive) - works for all types
        console.log("suggestion", suggestions);
        if (
          suggestion.display
          // suggestion.display.toLowerCase() === trimmedSubmitTerm.toLowerCase()
        ) {
          return true;
        }

        // For flights: check digit-only match (e.g., user types "4433" and it matches "UA4433")
        // TODO search: This data structure inconsistency needs to be addrtessed.
        if (suggestion.type === "flight") {
          const digits = suggestion.display
            ? suggestion.display.replace(/\D/g, "")
            : "";
          // console.log(
          //   "Checking flight digit match:",
          //   digits,
          //   "vs",
          //   trimmedSubmitTerm
          // );
          return digits === trimmedSubmitTerm;
        }

        // TODO search: This data structure inconsistency needs to be addrtessed.
        // For airports: check identifier match (e.g., "EWR" matches "EWR - Newark Liberty...")
        if (suggestion.type === "airport") {
          console.log("suggestion", suggestion);
          const airportIdentifier = (suggestion.metadata as { ICAO?: string })?.ICAO;
          // console.log(
          //   "Checking airport identifier match:",
          //   airportIdentifier,
          //   "vs",
          //   trimmedSubmitTerm
          // );
          if (!airportIdentifier) return false;
          return (
            suggestion.display
            // airportIdentifier.toLowerCase() === trimmedSubmitTerm.toLowerCase()
          );
        }

        // TODO search: This data structure inconsistency needs to be addrtessed.
        // For gates: check identifier match (e.g., "C101" matches from "EWR - C101 departures")
        if (suggestion.type === "gate") {
          const gateIdentifier = suggestion.label
            .split(" - ")[1]
            ?.split(" ")[0]; // Extract gate number
          // console.log(
          //   "Checking gate identifier match:",
          //   gateIdentifier,
          //   "vs",
          //   trimmedSubmitTerm
          // );
          return (
            gateIdentifier &&
            gateIdentifier.toLowerCase() === trimmedSubmitTerm.toLowerCase()
          );
        }

        return false;
      });
      console.log('exactMatch', exactMatch);
      if (exactMatch) {
        // If an exact match is found in suggestions, use it as the definitive search term. Hooray!
        // console.log("Found exact match in suggestions:", exactMatch);
        saveSearchToLocalStorage(exactMatch);
        navigate("/details", { state: { searchValue: exactMatch } });
        setSelectedValue(exactMatch);
      } else {
        // NEW: Check if it could be a partial airport name match (e.g., "Newark" matches "EWR - Newark Liberty...")
        const airportNameMatches = suggestions.filter(
          (suggestion: FormattedSuggestion) =>
            (suggestion.type === "airport") &&
            suggestion.label
              .toLowerCase()
              .includes(trimmedSubmitTerm.toLowerCase()),
        );

        // NEW FEATURE: Check if there are multiple airport matches for the same city/name
        if (airportNameMatches.length > 1) {
          console.log(
            "Multiple airport matches found for city:",
            trimmedSubmitTerm,
            airportNameMatches,
          );

          // Trigger shake animation on search bar
          triggerSearchBarShake();

          // Show user message to select from dropdown
          showMultipleAirportsMessage();

          setOpen(true); // Keep dropdown open to show options

          setSelectedValue(null);

          setInputValue(trimmedSubmitTerm);

          // Do not navigate - force user to select from dropdown
          return;
        } else if (airportNameMatches.length === 1) {
          // Found an airport that contains the search term in its name
          console.log("Found airport name match:", airportNameMatches[0]);
          saveSearchToLocalStorage(airportNameMatches[0]);
          navigate("/details", {
            state: { searchValue: airportNameMatches[0] },
          });
          setSelectedValue(airportNameMatches[0]);
        } else {    // check within localStorage
          // --- START: FIX FOR RACE CONDITION ---
          // Before falling back to the API, check localStorage for a recent successful match.
          // This prevents failures when the user re-searches something faster than suggestions can load.
          let recentMatch = null;
          try {
            const recentSearches = JSON.parse(
              localStorage.getItem("recentSearches") || "[]",
            );
            // Find a recent search that could be a flight number match
            recentMatch = recentSearches.find((item: any) => {
              if (item.type === "flight") {
                // Extract just the digits from the stored flight label or a display property if it exists
                const flightIdentifier = item.display || item.label;
                const digits = flightIdentifier.replace(/\D/g, "");
                return digits === trimmedSubmitTerm;
              }
              return false;
            });
          } catch (error) {
            console.error(
              "Could not check recent searches from localStorage:",
              error,
            );
          }

          if (recentMatch) {
            // If we found a match in recent history, use that! This is our successful path.
            // console.log("Found exact match in localStorage:", recentMatch);
            saveSearchToLocalStorage(recentMatch); // This also bumps it to the top of the recents list
            navigate("/details", {
              state: { searchValue: recentMatch },
            });
            setSelectedValue(recentMatch);
          } else {
            // --- END: FIX FOR RACE CONDITION ---

            // Fallback: If no suggestions were visible or matched (e.g., the search was too fast or yielded no results),
            // we revert to calling the API to try and resolve the raw query. This is our last hope.

            // Check if the search term is a number-only string
            const isNumeric = /^\d+$/.test(trimmedSubmitTerm);
            let finalQuery = trimmedSubmitTerm;

            // If it's a number, assume it's a flight number and prepend a common carrier code
            // This is the core fix to prevent the API from failing on raw numbers like '414'
            if (isNumeric) {
              // For the sake of this fix, we'll assume a common carrier like 'UA'
              // In a production environment, you might want a more robust way to handle this
              // based on context or user history.
              finalQuery = `UA${trimmedSubmitTerm}`;
              // console.log(
              //   `Pre-processing numeric flight query. Sending '${finalQuery}' to API.`
              // );
            }

            // console.log(
            //   "No matches in suggestions or localStorage, calling fetchRawQuery for:",
            //   finalQuery
            // );
            searchService
              .fetchRawQuery(finalQuery)
              .then((rawReturn) => {
                // Determine the final term: use the API result if valid, otherwise create a basic object from the raw text.

                // TODO uj: this raw return contains essential info thru parse query. save it in local storage as is.
                // May have to account for this in the search interface.
                // const finalTerm = rawReturn && rawReturn.label ? rawReturn : { label: trimmedSubmitTerm };
                // Save the result (either from the API or the raw text) to local storage.
                if (rawReturn) {
                  // The API gave us something useful
                  // console.log("fetchRawQuery returned:", rawReturn);
                  saveSearchToLocalStorage(rawReturn); // The value passed to the details page is the API response
                  navigate("/details", {
                    state: { searchValue: rawReturn },
                  });
                  setSelectedValue(rawReturn);
                } else {
                  // If API returns null/undefined, create a fallback term so the app doesn't break
                  // console.log(
                  //   "fetchRawQuery returned null, using fallback term"
                  // );
                  const fallbackTerm = {
                    id: "",
                    referenceId: "",
                    label: trimmedSubmitTerm,
                    type: "unknown",
                  };
                  saveSearchToLocalStorage(fallbackTerm);
                  navigate("/details", {
                    state: { searchValue: fallbackTerm },
                  });
                  setSelectedValue(fallbackTerm);
                }
              })
              .catch((error) => {
                // Handle API errors gracefully instead of letting them break the user experience
                console.error("Error fetching raw query data:", error); // Create a fallback term and proceed with navigation, so the user isnt stuck.
                const fallbackTerm = {
                  id: "",
                  referenceId: "",
                  label: trimmedSubmitTerm,
                  type: "unknown",
                };
                saveSearchToLocalStorage(fallbackTerm);
                navigate("/details", {
                  state: { searchValue: fallbackTerm },
                });
                setSelectedValue(fallbackTerm);
              });
          }
        }
      }
    }
  };





  // This handles what happens when the user clicks INTO the search bar
  const handleFocus = () => {
    // These were from an old implementation, keeping them for reference
    // setIsExpanded(true);
    // setOpen(searchTerm.length > 0);
    setOpen(true);

    // This big object is a list of all the UI elements we want to hide or change
    // when the search bar is active, to give it that "full screen" feel.
    const elements = {
      navbar: ".navbar",
      searchbar: ".searchbar-container",
      title: ".hero-title",
      googleButton: ".google-button",
      featurecard: ".features-grid",
      footer: ".footer",
      gatecard: ".gate-card",
      flightdetailscard: ".flight-details-card",
      WeatherTabs: ".weather-tabs-container",
      FeaturesSection: ".features-section",
      AirportCard: ".weather-cards",
      title2: ".hero-title-2",
      navlinks: ".nav-links-container",
      clearrrr: ".route-tab-content",
      nas: ".nas-section",
      flightInfoContainer: ".flight-info-container",
      datetab: ".date-tabs-container",
      gateCardContainer: ".departure-gate-container",
      feedbackTriggerLink: ".feedback-trigger-container",
    };

    // Loop through all the elements and add the correct CSS class
    Object.entries(elements).forEach(([key, selector]) => {
      const element = document.querySelector(selector);
      if (element) {
        if (key === "searchbar") {
          element.classList.add("expanded"); // Make search bar bigger
        } else {
          element.classList.add("hidden"); // Hide everything else
        }
      }
    });
  };

  // This runs when the user clicks OUT of the search bar
  const handleBlur = (event: any): void => {
    // Small delay to allow click events on options to fire first
    // Without this, the dropdown would disappear before a click is registered.
    setTimeout(() => setOpen(false), 100);

    // This condition checks if the new focused element is outside the search component.
    // It prevents the blur effect from happening if you're just clicking around inside the component (like on the dropdown).
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setTimeout(() => {
        // setIsExpanded(false);
        const elements = {
          navbar: ".navbar",
          searchbar: ".searchbar-container",
          title: ".hero-title",
          googleButton: ".google-button",
          featurecard: ".features-grid",
          footer: ".footer",
          gatecard: ".gate-card",
          flightdetailscard: ".flight-details-card",
          WeatherTabs: ".weather-tabs-container",
          FeaturesSection: ".features-section",
          data: ".data-content",
          AirportCard: ".weather-cards",
          title2: ".hero-title-2",
          navlinks: ".nav-links-container",
          clearrrr: ".route-tab-content",
          nas: ".nas-section",
          flightInfoContainer: ".flight-info-container",
          datetab: ".date-tabs-container",
          gateCardContainer: ".departure-gate-container",
        };

        // Basically the reverse of handleFocus, we remove the classes to bring the UI back to normal.
        Object.entries(elements).forEach(([key, selector]) => {
          const element = document.querySelector(selector);
          if (element) {
            if (key === "searchbar") {
              element.classList.remove("expanded");
            } else {
              element.classList.remove("hidden");
            }
          }
        });
      }, 300); // A longer delay here to make the transition smoother.
    }
  };

  // // This will be called when the user presses the Tab key -- works with inlinePrediction
  const handleKeyDown = (_event: any): void => {
    // This whole block is for an inline auto-suggestion feature (like Google search).
    // Note: inlinePrediction and filteredSuggestions are not directly available in this hook.
    // If you intend to use them here, they would need to be passed as arguments or derived.
    // Keeping existing logic as-is, assuming these might be part of a larger context or commented out for now.
    // if (event.key === "Tab" && inlinePrediction) {
    //   event.preventDefault();
    //   const newInputValue = inputValue + inlinePrediction;
    //   setInputValue(newInputValue);
    //   const matchingSuggestion = filteredSuggestions.find(
    //     (suggestion) => suggestion.label.toLowerCase() === newInputValue.toLowerCase()
    //   );
    //   if (matchingSuggestion) {
    //     setSelectedValue(matchingSuggestion);
    //   }
    // }
  };

  // This handles a direct click on one of the dropdown options.
  const handleOptionSelect = (option: FormattedSuggestion | null): void => {
    // These variables are from an older version of the code, not used here.
    // setSelectedOption(option); // This variable is not defined in this scope
    // setSearchTerm(option?.label || ""); // This variable is not defined in this scope
    setOpen(false); // Close the dropdown after selection

    // Handle navigation based on selection type
    if (option) {
      if (option.type === "Airport") {
        navigate(`/airport/${option.airportCacheReferenceId}`);
      } else if (option.type === "Flight") {
        navigate(`/flight/${option.airportCacheReferenceId}`);
      } else if (option.type === "Gate") {
        navigate(`/gate/${option.airportCacheReferenceId}`);
      }
    }
  };

  // This is the public API of our hook. We return all the states and handlers
  // that a component will need to use to make the search bar work.
  return {
    open,
    setOpen,
    selectedValue,
    setSelectedValue,
    inputValue,
    setInputValue,
    showingMultipleAirports,
    handleSubmit,
    handleValue,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handleOptionSelect,
  };
};

export default useInputHandlers;
