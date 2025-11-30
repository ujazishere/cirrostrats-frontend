import { Metadata } from "../../../types";

interface RawSuggestion {
  _id: string;
  referenceId?: string;
  display?: string;
  displaySimilarity?: string;
  type: string;
  metadata?: object;
}

export const formatRawSearchResults = (rawResults: any[]): FormattedSuggestion[] => {
  if (!rawResults || !Array.isArray(rawResults)) return [];

  return rawResults.map((item) => {
    // Attempt to find a unique ID from metadata if the DB _id is missing
    const uniqueId =
      item._id ||
      item.metadata?.ICAOFlightID ||
      item.metadata?.ICAOAirportCode ||
      `generated-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: uniqueId,
      referenceId: item.referenceId || undefined, 
      display: item.display,
      label: item.display || "Unknown", 
      type: item.type,
      metadata: item.metadata || {},
    };
  });
};

export interface FormattedSuggestion {
  id: string;
  referenceId?: string;
  display?: string;
  // displaySimilarity?: string;
  label: string;
  type: string;
  metadata?: Metadata;
  isRecent?: boolean;
  timestamp?: number;
}

export const formatSuggestions = (
  rawSuggestions: RawSuggestion[],
): FormattedSuggestion[] => {
  if (!rawSuggestions || !Array.isArray(rawSuggestions)) return [];

  // TODO search: duplicate bug - `search query id bug`  -- Investigate in backend and add unique id to backend's source collection instead of just sic id?
  //  problem is that the  search index collection ID is clashing due to the fall back to non-popular searches within airport.
  // take for example Denver, it may be an airport within the popular items from search index collection and also exist in the airports collection, hence the ID conflict.
  // console.log('rawSuggestios', rawSuggestions);
  return rawSuggestions.map((item) => ({
    id: item._id,
    referenceId:
      item.referenceId ||
      (item.metadata &&
        typeof item.metadata === "object" &&
        "gate" in item.metadata
        ? (item.metadata as { gate?: string }).gate || item._id
        : item._id),
    display: item.display,
    // TODO search suggestion label formatting for flights:
      // move this to backend to reduce frontend processing save it in sic for frequent popular searches and exhaustion searches runs thru IATA/ICAO codes and airline codes to generate appropriate combination labels. e.g JBU4646 -> B64646 (JBU4646)
    label: item.display || '',
    metadata: item.metadata,
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


export const findExactMatch = (
  suggestions: FormattedSuggestion[],
  term: string,
): FormattedSuggestion | undefined => {
  const lowerTerm = term.toLowerCase();

  if (suggestions.length === 0) return ;

  return suggestions.find((suggestion: FormattedSuggestion) => {
    const meta = suggestion.metadata as Metadata;

    // 1. Universal Check: ICAOFlightID Match
    if (meta && meta.ICAOFlightID?.toLowerCase() === lowerTerm) {
      return true;
    }

    if (meta && meta.IATAFlightID?.toLowerCase() === lowerTerm) {
      return true;
    }

    if (meta && meta.ICAOAirportCode?.toLowerCase() === lowerTerm) {
      console.log('ICAOairportCode match found in findExactMatch', meta.ICAOAirportCode);
      return true;
    }

    if (meta && meta.IATAAirportCode?.toLowerCase() === lowerTerm) {
      return true;
    }
    // 2. Flight Check: Digit Only Match (e.g. "4433" matches "UA4433")
    if (suggestion.type === "flight") {
      const digits = meta.ICAOFlightID?.replace(/\D/g, "")
      return digits === lowerTerm;
    }

    // TODO UJ: This function doesn't work currentky. Idea was ti fetch more from backend in the background and shoot it as possibleSimilarMatches
    // 3. Airport Check: ICAO or IATA Code Match
    if (suggestion.type === "airport") {
      console.log('airport match found in findExactMatch', meta.ICAOAirportCode, meta.IATAAirportCode, meta.ICAO);
      const airportIdentifier = meta.ICAOAirportCode || meta.IATAAirportCode || meta.ICAO;
      if (!airportIdentifier) return false;
      return airportIdentifier.toLowerCase() === lowerTerm;
    }

    // 4. Gate Check: Identifier Match
    if (suggestion.type === "gate") {
      const gateIdentifier = meta.gate;
      if (!gateIdentifier) return false;
      return gateIdentifier.toLowerCase() === lowerTerm;
    }

    return false;
  });
};

/**
 * Result type for string submission processing
 */
export type StringSubmissionResult =
  | { type: "exact_match"; value: FormattedSuggestion }
  | { type: "multiple_airports"; inputValue: string }
  | { type: "single_airport_match"; value: FormattedSuggestion }
  | { type: "recent_match"; value: FormattedSuggestion }
  | { type: "api_exact_match"; value: FormattedSuggestion }
  | { type: "api_ambiguous"; query: FormattedSuggestion; candidates: FormattedSuggestion[] }
  | { type: "api_no_results"; fallback: FormattedSuggestion }
  | { type: "api_error"; fallback: FormattedSuggestion };

/**
 * Checks localStorage for a recent match that could match the search term
 */
const findRecentMatch = (trimmedSubmitTerm: string): FormattedSuggestion | null => {
  try {
    const recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]",
    );
    // Find a recent search that could be a flight number match
    const recentMatch = recentSearches.find((item: any) => {
      if (item.type === "flight") {
        // Extract just the digits from the stored flight label or a display property if it exists
        const flightIdentifier = item.display || item.label;
        const digits = flightIdentifier.replace(/\D/g, "");
        return digits === trimmedSubmitTerm;
      }
      return false;
    });
    return recentMatch || null;
  } catch (error) {
    console.error("Could not check recent searches from localStorage:", error);
    return null;
  }
};

/**
 * Checks if there are multiple airport matches for a given search term
 */
const findAirportNameMatches = (
  suggestions: FormattedSuggestion[],
  trimmedSubmitTerm: string,
): FormattedSuggestion[] => {
  return suggestions.filter(
    (suggestion: FormattedSuggestion) =>
      suggestion.type === "airport" &&
      suggestion.label.toLowerCase().includes(trimmedSubmitTerm.toLowerCase()),
  );
};

/**
 * Processes API response and determines the result type
 */
const processApiResponse = (
  formattedResults: FormattedSuggestion[],
  trimmedSubmitTerm: string,
): StringSubmissionResult => {
  if (formattedResults && formattedResults.length > 0) {
    // Try to find an Exact Match (e.g. User typed "AA1010")
    const exactMatch = findExactMatch(formattedResults, trimmedSubmitTerm);

    if (exactMatch) {
      // SCENARIO A: Exact Match Found - Go straight to that flight
      return { type: "api_exact_match", value: exactMatch };
    } else {
      // SCENARIO B: Ambiguous Search (User typed "101", Backend returned "AA1010", "AA1012"...)
      const userQueryObject: FormattedSuggestion = {
        id: `raw-${Date.now()}`,
        label: trimmedSubmitTerm,
        type: "ambiguous",
        metadata: {},
      };
      return {
        type: "api_ambiguous",
        query: userQueryObject,
        candidates: formattedResults,
      };
    }
  } else {
    // SCENARIO C: No results at all (Backend returned [])
    const fallbackTerm: FormattedSuggestion = {
      id: `fallback-${Date.now()}`,
      label: trimmedSubmitTerm,
      type: "unknown",
      metadata: {},
    };
    return { type: "api_no_results", fallback: fallbackTerm };
  }
};

/**
 * Processes a raw string submission and determines the appropriate action.
 * This function handles all the complex logic for string submissions including:
 * - Exact matches in suggestions
 * - Multiple airport matches
 * - Recent search matches
 * - API calls and response processing
 * 
 * @param trimmedSubmitTerm - The trimmed search term
 * @param suggestions - Current suggestions from dropdown
 * @param fetchRawQuery - Function to fetch raw query from API
 * @returns Promise that resolves to a StringSubmissionResult indicating what action to take
 */
export const processStringSubmission = async (
  trimmedSubmitTerm: string,
  suggestions: FormattedSuggestion[],
  fetchRawQuery: (query: string) => Promise<any>,
): Promise<StringSubmissionResult> => {
  // Step 1: Check for exact match in suggestions
  const exactMatch = findExactMatch(suggestions, trimmedSubmitTerm);

  if (exactMatch) {
    // If exact match found, still fetch from API to get full data
    try {
      const rawReturn = await fetchRawQuery(trimmedSubmitTerm);
      const formattedResults = formatRawSearchResults(rawReturn);
      return processApiResponse(formattedResults, trimmedSubmitTerm);
    } catch (error) {
      console.error("Error fetching raw query data:", error);
      // Fallback to using the exact match from suggestions
      return { type: "exact_match", value: exactMatch };
    }
  }

  // Step 2: Check for airport name matches
  const airportNameMatches = findAirportNameMatches(suggestions, trimmedSubmitTerm);

  if (airportNameMatches.length > 1) {
    // Multiple airports found - user needs to select
    return { type: "multiple_airports", inputValue: trimmedSubmitTerm };
  } else if (airportNameMatches.length === 1) {
    // Single airport match found
    return { type: "single_airport_match", value: airportNameMatches[0] };
  }

  // Step 3: Check localStorage for recent matches
  const recentMatch = findRecentMatch(trimmedSubmitTerm);
  if (recentMatch) {
    return { type: "recent_match", value: recentMatch };
  }

  // Step 4: Fallback to API call
  const isNumeric = /^\d+$/.test(trimmedSubmitTerm);
  const finalQuery = isNumeric ? trimmedSubmitTerm.toUpperCase() : trimmedSubmitTerm;

  try {
    const rawReturn = await fetchRawQuery(finalQuery);
    const formattedResults = formatRawSearchResults(rawReturn);
    return processApiResponse(formattedResults, trimmedSubmitTerm);
  } catch (error) {
    console.error("Error fetching raw query data:", error);
    const fallbackTerm: FormattedSuggestion = {
      id: "",
      referenceId: "",
      label: trimmedSubmitTerm,
      type: "unknown",
      metadata: {},
    };
    return { type: "api_error", fallback: fallbackTerm };
  }
};