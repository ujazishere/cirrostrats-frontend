import { getObjectType } from "./getObjectType";
import { typeMap } from "./typeMap";

export const formatSuggestions = (searchSuggestions) => {
  return Object.keys(searchSuggestions).map((eachItem) => ({
// export const formattedSuggestions = Object.keys(searchSuggestions).map(eachItem => ({
    id: searchSuggestions[eachItem]._id,
    label: searchSuggestions[eachItem].flightNumber
        ? searchSuggestions[eachItem].flightNumber.startsWith('GJS')
        ? `UA${searchSuggestions[eachItem].flightNumber.slice(3)} (${searchSuggestions[eachItem].flightNumber})`
        : searchSuggestions[eachItem].flightNumber
        : `${searchSuggestions[eachItem].name} (${searchSuggestions[eachItem].code})`,
    type: typeMap[getObjectType(searchSuggestions[eachItem])],
    // count: searchSuggestions[eachItem].count, // Optional
    // fuzzyFind: searchSuggestions[eachItem].fuzzyFind // Optional (if available)
}))};

export const matchingSuggestion = (initialSuggestions, inputValue) => {
  if (!inputValue) return initialSuggestions;
  const lowercaseInputValue = inputValue.toLowerCase();

  // Filter local data
  return initialSuggestions.filter(
    (searches) =>
      searches.label.toLowerCase().includes(lowercaseInputValue)
  );
};


export const fetchAndFilterSuggestions = async ({
  currentSuggestions,
  inputValue,
  userEmail,
  page,
  searchService,
  minRequiredResults = 1,
  maxPagesFetch = 5,
  
}) => {
  // First filter the current suggestions
  let filteredSuggestions = matchingSuggestion(currentSuggestions, inputValue);
  let currentPage = page;
  let hasMorePages = true;      // declaring more pages in backend

    //*****_____VVI____***** 
  // ****Keep fetching more pages until it stacks more than 10 matches in filtered suggestions***
  // TODO: searching `aid` causes infinite while loop. it breaks after exhausting backend pages but keeps getting triggered.
  while (filteredSuggestions.length < 10 && hasMorePages) {
    // sleep(delayBetweenFetches);
    try {
      // Increment page for next fetch
      currentPage += 1; // First page has already been fetched during initial fetch.
      
      // Fetch the next page of data
      let rawSuggestions = await searchService.fetchMostSearched(
          userEmail, 
          "",           //TODO: if hasMorePages is false(pages exhausted), serve actual input value to fetch outside of the mostPopularSearches.
          currentPage,  // page number for backend
          10            // pageSize for backend
        );
      rawSuggestions = formatSuggestions(rawSuggestions);
    //   clg.log('rawSuggestions', rawSuggestions.length);
        
      // If empty results(rawSuggestions) returned from backend, no more pages left
      if (!rawSuggestions || rawSuggestions.length === 0) {
        console.log('breaking, exhausted backend pages',rawSuggestions, rawSuggestions.length);
        hasMorePages = false;
        currentPage = 0;
        break;
      } {
        console.log('rawSuggestions', rawSuggestions.length);}
      
      // Filter the new suggestions and add to existing results
      const newFilteredSuggestions = matchingSuggestion(rawSuggestions, inputValue);
      filteredSuggestions = [...filteredSuggestions, ...newFilteredSuggestions];
      console.log('currentPage', currentPage);
      console.log('filt', filteredSuggestions.length, filteredSuggestions);
      
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      hasMorePages = false;
      break
    }
  }
  return {
    newSuggestions:filteredSuggestions,
    currentPage,
    hasMorePages
  };
};