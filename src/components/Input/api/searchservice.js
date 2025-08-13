import axios from "axios";

const searchService = {

  /**
   * Fetch most searched items.
   * @param {string} userEmail
   * @param {string} inputValue
   */
  fetchPopularSuggestions: async (userEmail, inputValue="",) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/searches/suggestions/${userEmail}?query=${inputValue}`)
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  },


  /**
   * Fetch raw query
   * @param {string} query
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