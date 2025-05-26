import { getObjectType } from "./getObjectType";
import { typeMap } from "./typeMap";
import useDebounce from "../hooks/useDebounce";


// Gets triggered once on the initial render of the homepage. sets the initialSuggestions for the dropdown.
// Thence onwards, it's triggered on every keystroke.
export const formatSuggestions = (searchSuggestions) => {
  
  return Object.keys(searchSuggestions).map((eachItem) => ({
    stId: searchSuggestions[eachItem].stId, // id - this is the unique identifier for the searchTrack index.
    id: searchSuggestions[eachItem].id,

    // Check if flightID exists, 
    ...(searchSuggestions[eachItem].flightID && {
    // and if it does, add the flightID property to the object--> flightID: its associated value.
    flightID: searchSuggestions[eachItem].flightID}),

    // label - this is what the user will see in the dropdown. It will be the flightID if it exists, otherwise it will be the airport code and name.
    label:
        // if doc['display'] starts with GJS, it's a UA flight. This is causing issues with submits.
        searchSuggestions[eachItem].display
        ?searchSuggestions[eachItem].type === 'flight' 
        && searchSuggestions[eachItem].display.startsWith('GJS')
            
        ? `UA${searchSuggestions[eachItem].display.slice(3)} (${searchSuggestions[eachItem].display})`
        : searchSuggestions[eachItem].display                      // else  if it doesnt start with GJS, it other airline.
        : `${searchSuggestions[eachItem].code} - ${searchSuggestions[eachItem].name}`,    // else if flightID doesnt exist, it's an airport.

    // type - could be `airport`, `flight`, `gate`. - this is what /Details.jsx will use to request appropriate data from backend.
    type: searchSuggestions[eachItem].type

    // count: searchSuggestions[eachItem].count, // Optional
    // fuzzyFind: searchSuggestions[eachItem].fuzzyFind // Optional (if available)
}))};


export const matchingSuggestion = (suggestions, inputValue) => {
  if (!inputValue) return suggestions.slice(0,5);         // If inputValue is empty(initial state), return the first 5 suggestions
  if (!suggestions || !Array.isArray(suggestions)) {      // If suggestions is not an array or is empty, return an empty array
    return [];
  }
  const lowercaseInputValue = inputValue.toLowerCase();

  // Filter local data and only show upto 5 suggestions for drop down view.
   return suggestions
    .filter(s => s.label.toLowerCase().includes(lowercaseInputValue))
    .slice(0, 5);
};


/**
 * Asynchronously fetches and filters search suggestions based on the input value.
 * Is triggered after every inputValue change - keystroke.
 * It attempts to gather enough suggestions by fetching additional pages from the backend
 * until a minimum threshold is met or no more pages are available.
 *
 * @param {Array} currentSuggestions - Existing suggestions to filter and base further searches on.
 * @param {string} inputValue - The input value used to filter the suggestions.
 * @param {string} userEmail - The user's email used for authentication or authorization in the search service.
 * @param {Object} searchService - The service responsible for fetching search suggestions.
 * @returns {Promise<Object>} - An object containing the filtered suggestions, the current page, and a boolean indicating if more pages are available.
 * @throws Will log an error message if fetching suggestions fails.
 */

export const fetchAndFilterSuggestions = async ({
  currentSuggestions,
  inputValue,
  userEmail,
  searchService,
}) => {
  // First filter the current suggestions based on the input value so if raw suggestions are not available, we can still show matches.
  let filteredSuggestions = matchingSuggestion(currentSuggestions, inputValue);
  try {
    // Fetching popular suggestions based on the input value and email. This will replace the current filteredSuggestions with fresh data.
    let rawSuggestions = await searchService.fetchPopularSuggestions(
      userEmail,
      inputValue,
    );
    if ((!rawSuggestions || rawSuggestions.length === 0) && inputValue.length >= 3) {
      // TODO: Need to add debounce here to avoid too many requests - and request through the parse query.
      console.log("No suggestions found, fetching from parse query");
      // TODO: The idea is to use instant fetch when suggestions are available and when suggestions run out and inputValue.length >= 3 then the debounce makes sense to avoid too many requests from backend.
      // const debouncedInputValue = useDebounce(inputValue, 1000);
      const rawSuggestions = await searchService.fetchPopularSuggestions(
        userEmail,
        inputValue,
        // debouncedInputValue,   // Using the `debouncedInputValue` instead of regular `inputValue` to avoid too many requests
      );
      filteredSuggestions = matchingSuggestion(rawSuggestions, inputValue);
      // console.log("rawSuggestions:", rawSuggestions);

    } else if (rawSuggestions && rawSuggestions.length > 0) {
      rawSuggestions = formatSuggestions(rawSuggestions);
      filteredSuggestions = matchingSuggestion(rawSuggestions, inputValue);
      // console.log("rawSuggestions:", rawSuggestions);
    }
    
  } catch (error) {
    console.error("Error fetching suggestions:", error);
  }
  
  return {
    newSuggestions: filteredSuggestions,
  };
};