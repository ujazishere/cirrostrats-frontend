import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
interface SearchService {
  fetchPopularSuggestions: (
    userEmail: string,
    inputValue?: string
  ) => Promise<any>;
  fetchRawQuery: (query: string) => Promise<any>;
}

const searchService: SearchService = {
  /**
   * Fetch most searched items.
   * @param {string} userEmail
   * @param {string} inputValue
   */
  fetchPopularSuggestions: async (
    userEmail: string,
    inputValue: string = ""
  ): Promise<any> => {
    try {
      const response = await axios.get(
        `${apiUrl}/searches/suggestions/${userEmail}?query=${inputValue}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  },

  /**
   * Fetch raw query
   * @param query
   */
  fetchRawQuery: async (query: string): Promise<any> => {
    return axios.get(`${apiUrl}/query?search=${query}`).then(response => {
      return response.data;
    });
  },
};

export default searchService;
