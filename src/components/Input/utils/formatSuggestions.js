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