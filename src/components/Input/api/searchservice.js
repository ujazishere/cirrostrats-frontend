import axios from "axios";

const searchService = {

  /**
   * Fetch most searched items.
   * @param {string} userEmail
   */
  fetchPopularSuggestions: async (userEmail, inputValue="", page=0, pageSize=10) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/searches/suggestions/${userEmail}?query=${inputValue}`)
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      // handle error, e.g., display error message to user
    }
    // const response = await axios.get(`${apiUrl}/searches/suggestions/${userEmail}`)
  },


  /**
   * Fetch raw query
   * @param {string} searchTerm
   * @param {string} userEmail
   * @param {boolean} isLoggedIn
   */
fetchRawQuery: (query) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return axios.get(`${apiUrl}/query?search=${query}`)
    .then(response => {
      return response.data;
    });
  }
};

export default searchService;

// Custom hook for debouncing input value changes
// const searchService = async ( debouncedInputValue,userEmail, isLoggedIn) => {
//     const apiUrl = import.meta.env.VITE_API_URL;
//     print('apiUrl', apiUrl);
//     //   if (isFetched || isLoading) return;

//     //   setIsLoading(true);
//       try {
//         const response = await axios.get(
//             axios.get(`${apiUrl}/searches/suggestions/${userEmail}`),
//         );

//         return response.data
//       } catch (error) {
//         console.error("Error fetching data from backend:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     }

// export default searchService
