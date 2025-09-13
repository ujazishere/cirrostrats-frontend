// Defines and exports a function to transform raw suggestion data from an API into a consistent format for the UI.
export const formatSuggestions = (rawSuggestions) => {
  // This is a guard clause that checks if the input is a valid, non-empty array. If not, it returns an empty array to prevent errors.
  if (!rawSuggestions || !Array.isArray(rawSuggestions)) return [];
  
  // TODO: search duplicate bug - `search query stid bug`  -- Investigate in backend and add unique id to backend's source collection instead of just sic stId?
  // Maps over each item in the raw suggestions array to create a new array of formatted objects.
  return rawSuggestions.map((item) => ({
    // Directly maps the station ID.
    stId: item.stId,
    // Conditionally adds the 'r_id' property to the new object only if it exists on the original item.
    ...(item.r_id && { r_id: item.r_id }),            // gates dont have id so making id optional.
    // Conditionally adds the 'gate' property.
    ...(item.gate && { gate: item.gate }),      // For gates
    // Conditionally adds the 'airport' property.
    ...(item.airport && { airport: item.airport }),      // For gates
    // Conditionally adds the 'flightID' property.
    ...(item.flightID && { flightID: item.flightID }),
    // fuzz_find_search_text: item.fuzz_find_search_text,   // Trying to get fuzz find from backend to mathc and use instead of label.
    // TODO serach matching: 
      // account for fuzzfund - label vs display -- show display on frontend but use label for search matching? since it may have fuzz find labels in array?
      // fuzzfind on airports - Some airports dont show up - need to account for large airport file with icao and iata codes names and location.
    // Directly maps the 'display' property from the original item.
    display: item.display,
    // This logic constructs the 'label' property, which is crucial for searching and displaying.
    label: item.display
      // If a 'display' property exists, use it as the base for the label.
      ? (
        // If the item is of type 'flight', apply special formatting to the airline code.
        item.type === 'flight'
          // This series of checks standardizes various airline codes (e.g., GJS, DAL) into more common two-letter codes (e.g., UA, DL).
          ? (
            item.display.startsWith('GJS')
              ? `UA${item.display.slice(3)} (${item.display})`
              : item.display.startsWith('DAL')
                ? `DL${item.display.slice(3)} (${item.display})`
                : item.display.startsWith('AAL')
                  ? `AA${item.display.slice(3)} (${item.display})`
                  : item.display.startsWith('UAL')
                    ? `UA${item.display.slice(3)} (${item.display})`
                    : item.display.startsWith('UCA')
                      ? `UA${item.display.slice(3)} (${item.display})`
                    // If no specific airline code matches, use the display value as is.
                    : item.display
          )
          // If the item is not a flight, use its 'display' value directly as the label.
          : item.display)
      // If no 'display' property exists, create a fallback label using the item's code and name.
      : `${item.code} - ${item.name}`,
    // Directly maps the 'type' of the suggestion (e.g., 'flight', 'airport').
    type: item.type
  }));
};

// Defines and exports a function that filters a list of suggestions based on a user's query.
export const matchingSuggestions = (suggestionPool, query) => {
  // TODO VHP: Matching suggestions to include fuzz find matching based on added properties to the search items from backnend sic.
  // If there is no query, return the first 5 suggestions from the pool as a default.
  if (!query) return suggestionPool.slice(0, 5);
  // A guard clause to ensure the suggestion pool is a valid array, returning an empty array if not.
  if (!suggestionPool || !Array.isArray(suggestionPool)) return [];
  
  // Converts the user's query to lowercase for case-insensitive matching.
  const lowercaseQuery = query.toLowerCase();
  // Filters the suggestion pool and returns a new array.
  return suggestionPool
    // The filter keeps only the suggestions whose lowercase label includes the lowercase query string.
    .filter(s => s.label.toLowerCase().includes(lowercaseQuery))
    // Slices the result to return a maximum of 5 matching suggestions.
    .slice(0, 5);
};