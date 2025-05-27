import { useState, useEffect } from "react";
import { getObjectType } from "../utils/getObjectType";
import { typeMap } from "../utils/typeMap";
import { formatSuggestions, matchingSuggestion, fetchAndFilterSuggestions } from "../utils/formatSuggestions";
import useDebounce from "./useDebounce";
import searchService from "../api/searchservice";
// import useTrackSearch from "./useTrackSearch"

/**
 * @function useSearch
 * @description Centralized State Management Hook. Role: Manages all search-related state and logic.
 *      Responsibilities: Combines smaller hooks (useDebounce, useFetchData, etc.).
 *      Exposes state and handlers to the parent component
 * @param {*} userEmail 
 * @param {*} isLoggedIn 
 * @param {*} debouncedInputValue 
 * @returns 
 */
export default function useSearchSuggestions(userEmail, isLoggedIn, inputValue, debouncedInputValue, dropOpen) {
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [freshSuggestions, setFreshSuggestions] = useState([]);
  // const searchSuggestions = await searchService.fetchMostSearched(userEmail);

  // Initial fetch : Triggered only once on the initial render of the homepage.
  useEffect(() => {
    /**
     * Fetches most searched items from backend, formats suggestions,
     * and assigns them to initialSuggestions state.
     * Only triggers once on the initial render of the homepage.
   * @async
   * @function
   * @returns {Promise<void>}
   */
    const fetchPopularSuggestions = async () => {
      // fetches most searched from backend
      const searchSuggestions = await searchService.fetchPopularSuggestions(userEmail, inputValue);
      // Formats suggestions, assigns value,label, type, etc.
      const formattedSuggestions = formatSuggestions(searchSuggestions);
      setInitialSuggestions(formattedSuggestions);
    };

    fetchPopularSuggestions();
  }, [userEmail]);


  // This function matches suggestions with dropdown for the live inputValue in search and updates the filteredSuggestions state based on matches
  useEffect(() => {
    const newfilteredSuggestions = matchingSuggestion(initialSuggestions, inputValue);
    setFilteredSuggestions(newfilteredSuggestions);
    // TODO: Here the suggestions 

    if (dropOpen && newfilteredSuggestions.length < 5) {
      updateSuggestions();
    };

  }, [inputValue, dropOpen]);

  const updateSuggestions = async () =>{
    console.log('updating suggestions');
    setIsLoading(true);
    try {
      const { newSuggestions } = 
        await fetchAndFilterSuggestions({
          currentSuggestions: filteredSuggestions,
          inputValue,
          userEmail,
          searchService
        });
        // updating the state
        setFreshSuggestions(newSuggestions);
        setFilteredSuggestions([]);
        setFilteredSuggestions(newSuggestions);

    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    filteredSuggestions
  };
}

  // const debouncedInputValue = useDebounce(inputValue, 1000); // 1 second debounce

//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (debouncedInputValue.length < 3) return;
      
//       setIsLoading(true);
//       try {
//         let rawSuggestions = await searchService.fetchPopularSuggestions(
//           userEmail,
//           debouncedInputValue
//         );

//         if (!rawSuggestions || rawSuggestions.length === 0) {
//           rawSuggestions = await searchService.fetchFromParseQuery(
//             userEmail,
//             debouncedInputValue
//           );
//         }

//         setFilteredSuggestions(
//           rawSuggestions 
//             ? matchingSuggestion(formatSuggestions(rawSuggestions), debouncedInputValue)
//             : []
//         );
//       } catch (error) {
//         console.error("Error fetching suggestions:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchSuggestions();
//   }, [debouncedInputValue, userEmail, filteredSuggestions]);

//   return {
//     suggestions,
//     isLoading,
//     setInputValue,
//     inputValue
//   };
// };


  // // FetchMore -- This function is supposed to be triggered when the suggestions are running out. 
  // // The idea is to always have something in the dropdown.
  // useEffect(() => {
  //   const updateSuggestions = async () =>{
  //     // console.log('debouncedInputValue', debouncedInputValue);
  //     // if (filteredSuggestions.length < 9) {      // if suggestions are less than 2 and debouncedInputValue is not empty
  //     //   console.log('updating suggestions');
  //     //   setPage(page + 0);
  //     //   console.log('page', page);
  //     //   const updatedSuggestions = await searchService.fetchMostSearched(userEmail, inputValue, page, 49); // fetch more suggestions
  //     //   // if updatedSuggestions is less than 49, increment page. 
  //     //   const formattedSuggestions = formatSuggestions(updatedSuggestions);
  //     // }
  //   }

  //   updateSuggestions();
  // }, [filteredSuggestions]);







