interface RawSuggestion {
  stId: string;
  airportCacheReferenceId?: string;
  gate?: string;
  airport?: string;
  flightID?: string;
  display?: string;
  type: string;
  code?: string;
  name?: string;
}

export interface FormattedSuggestion {
  stId: string;
  airportCacheReferenceId?: string;
  gate?: string;
  airport?: string;
  flightID?: string;
  display?: string;
  label: string;
  type: string;
  isRecent?: boolean;
  timestamp?: number;
}

export const formatSuggestions = (
  rawSuggestions: RawSuggestion[],
): FormattedSuggestion[] => {
  if (!rawSuggestions || !Array.isArray(rawSuggestions)) return [];

  // TODO search: duplicate bug - `search query stid bug`  -- Investigate in backend and add unique id to backend's source collection instead of just sic stId?
  //  problem is that the  search index collection ID is clashing due to the fall back to non-popular searches within airport.
  // take for example Denver, it may be an airport within the popular items from search index collection and also exist in the airports collection, hence the ID conflict.
  return rawSuggestions.map((item) => ({
    stId: item.stId,
    ...(item.airportCacheReferenceId && { airportCacheReferenceId: item.airportCacheReferenceId }), // gates dont have id so making id optional.
    ...(item.gate && { gate: item.gate }), // For gates
    ...(item.airport && { airport: item.airport }), // For gates
    ...(item.flightID && { flightID: item.flightID }),
    // fuzz_find_search_text: item.fuzz_find_search_text,   // Trying to get fuzz find from backend to mathc and use instead of label.
    // TODO serach matching:
    // account for fuzzfund - label vs display -- show display on frontend but use label for search matching? since it may have fuzz find labels in array?
    // fuzzfind on airports - Some airports dont show up - need to account for large airport file with icao and iata codes names and location.
    display: item.display,
    // TODO search suggestion label formatting for flights:
      // move this to backend to reduce frontend processing save it in sic for frequent popular searches and exhaustion searches runs thru IATA/ICAO codes and airline codes to generate appropriate combination labels. e.g JBU4646 -> B64646 (JBU4646)
    label: item.display
      ? item.type === "flight"
        ? item.display.startsWith("GJS")
          ? `UA${item.display.slice(3)} (${item.display})`
          : item.display.startsWith("DAL")
            ? `DL${item.display.slice(3)} (${item.display})`
            : item.display.startsWith("AAL")
              ? `AA${item.display.slice(3)} (${item.display})`
              : item.display.startsWith("UAL")
                ? `UA${item.display.slice(3)} (${item.display})`
                : item.display.startsWith("UCA")
                  ? `UA${item.display.slice(3)} (${item.display})`
                  : item.display
        : item.display
      : `${item.code} - ${item.name}`,

    type: item.type,
  }));
};

export const matchingSuggestions = (
  suggestionPool: FormattedSuggestion[],
  query: string,
): FormattedSuggestion[] => {
  // TODO VHP: Matching suggestions to include fuzz find matching based on added properties to the search items from backnend sic.
  // TODO Search: UA435 doesn't show up in suggestions right away it shows all 4 digit ones. Need to fix that. 
      // One fix would be for it to not show(leave it as is) but then when it is submitted it shows up higher in rank and then shows up above next time.
  if (!query) return suggestionPool.slice(0, 5);
  if (!suggestionPool || !Array.isArray(suggestionPool)) return [];

  // TODO Search - this s.label may be used to match within array of fuzz find search texts from backend instead of label alone?
  const lowercaseQuery = query.toLowerCase();
  return suggestionPool
    .filter((s) => s.label.toLowerCase().includes(lowercaseQuery))
    .slice(0, 5);
};
