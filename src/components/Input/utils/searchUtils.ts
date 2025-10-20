interface RawSuggestion {
  stId: string;
  r_id?: string;
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
  r_id?: string;
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

  // TODO: search duplicate bug - `search query stid bug`  -- Investigate in backend and add unique id to backend's source collection instead of just sic stId?
  return rawSuggestions.map((item) => ({
    stId: item.stId,
    ...(item.r_id && { r_id: item.r_id }), // gates dont have id so making id optional.
    ...(item.gate && { gate: item.gate }), // For gates
    ...(item.airport && { airport: item.airport }), // For gates
    ...(item.flightID && { flightID: item.flightID }),
    // fuzz_find_search_text: item.fuzz_find_search_text,   // Trying to get fuzz find from backend to mathc and use instead of label.
    // TODO serach matching:
    // account for fuzzfund - label vs display -- show display on frontend but use label for search matching? since it may have fuzz find labels in array?
    // fuzzfind on airports - Some airports dont show up - need to account for large airport file with icao and iata codes names and location.
    display: item.display,
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
  if (!query) return suggestionPool.slice(0, 5);
  if (!suggestionPool || !Array.isArray(suggestionPool)) return [];

  const lowercaseQuery = query.toLowerCase();
  return suggestionPool
    .filter((s) => s.label.toLowerCase().includes(lowercaseQuery))
    .slice(0, 5);
};
