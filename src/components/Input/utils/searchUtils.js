export const formatSuggestions = (rawSuggestions) => {
  if (!rawSuggestions || !Array.isArray(rawSuggestions)) return [];
  
  // TODO: search duplicate bug - `search query stid bug`  -- Investigate in backend and add unique id to backend's source collection instead of just sic stId?
  return rawSuggestions.map((item) => ({
    stId: item.stId,
    ...(item.r_id && { r_id: item.r_id }),            // gates dont have id so making id optional.
    ...(item.gate && { gate: item.gate }),      // For gates
    ...(item.airport && { airport: item.airport }),      // For gates
    ...(item.flightID && { flightID: item.flightID }),
    label: item.display
      ? (
        item.type === 'flight'
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
                    : item.display
          )
          : item.display)
      : `${item.code} - ${item.name}`,
    type: item.type
  }));
};

export const matchingSuggestions = (suggestionPool, query) => {
  // TODO VHP: Matching suggestions to include fuzz find matching based on added properties to the search items from backnend sic.
  if (!query) return suggestionPool.slice(0, 5);
  if (!suggestionPool || !Array.isArray(suggestionPool)) return [];
  
  const lowercaseQuery = query.toLowerCase();
  return suggestionPool
    .filter(s => s.label.toLowerCase().includes(lowercaseQuery))
    .slice(0, 5);
};