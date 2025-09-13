import axios from "axios";

// Defines an object 'searchService' to encapsulate all search-related API calls.
const searchService = {

  /**
   * Fetch most searched items.
   * @param {string} userEmail
   * @param {string} inputValue
   */
  // Defines an asynchronous function to fetch popular search suggestions.
  fetchPopularSuggestions: async (userEmail, inputValue="",) => {
    // Retrieves the base API URL from the environment variables for the current environment.
    const apiUrl = import.meta.env.VITE_API_URL;
    // A try...catch block to handle potential errors during the API request.
    try {
      // Performs an asynchronous GET request using axios to the suggestions endpoint.
      // It includes the user's email as part of the URL path and the search query as a URL parameter.
      const response = await axios.get(`${apiUrl}/searches/suggestions/${userEmail}?query=${inputValue}`)
      // If the request is successful, it returns the data payload from the API response.
      return response.data;
    } catch (error) {
      // If an error occurs during the API call, it is caught here.
      // The error is logged to the console for debugging purposes.
      console.error("Error fetching suggestions:", error);
    }
  },


  /**
   * Fetch raw query
   * @param {string} query
   */
  // Defines a function to fetch results for a raw, direct search query.
  fetchRawQuery: (query) => {
    // Retrieves the base API URL from the environment variables.
    const apiUrl = import.meta.env.VITE_API_URL;
    // Performs a GET request using axios to the query endpoint.
    // The search term is passed as a URL parameter named 'search'.
    return axios.get(`${apiUrl}/query?search=${query}`)
      // Uses a promise-based .then() to handle the successful response.
      .then(response => {
        // Returns the data payload from the API response when the promise resolves.
        return response.data;
      });
  }
};

// Exports the searchService object to be used in other parts of the application.
export default searchService;
