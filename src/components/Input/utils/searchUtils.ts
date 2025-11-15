interface RawSuggestion {
  _id: string;
  referenceId?: string;
  display?: string;
  displaySimilarity?: string;
  type: string;
  metadata?: object;
}

export interface FormattedSuggestion {
  id: string;
  referenceId?: string;
  display?: string;
  // displaySimilarity?: string;
  label: string;
  type: string;
  metadata?: object;
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
    referenceId: item.referenceId,
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
