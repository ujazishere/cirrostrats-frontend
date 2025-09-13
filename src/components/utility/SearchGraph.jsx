// Imports the React library and the useState hook for component creation and state management.
import React, { useState } from 'react';
// Imports specific icon components from the lucide-react library for the user interface.
import { ChevronDown, ChevronRight, Clock, MapPin } from 'lucide-react';

/**
 * @function SearchGraph
 * @description A React component that visualizes raw search activity data.
 * It processes the data, displays it as a collapsible list of search terms,
 * and provides a summary of the overall search activity.
 * @param {object} props - The component's props.
 * @param {Array<object>} props.rawData - The raw search data array from the backend.
 * Each object typically contains an '_id' and a dynamic key representing the search term.
 * @returns {JSX.Element} The rendered search visualization component.
 */
// Defines the SearchGraph functional component, which destructures rawData from its props.
const SearchGraph = ({ rawData }) => {
  // --- DATA TRANSFORMATION ---
  // This section processes the raw data into a more structured and usable format for rendering.
  // The .map() method creates a new, transformed array, leaving the original rawData prop unmodified.
  const data = rawData.map(item => {
    // Dynamically find the key that represents the search term by excluding the '_id' key.
    // This is necessary because the search term key itself is part of the data, not a fixed property name.
    const labelKey = Object.keys(item).find(key => key !== '_id');
    // Get the array of timestamps associated with that search term.
    const timestamps = item[labelKey];

    // Format each raw timestamp string into a more readable "HH:MM" format.
    // This nested .map() transforms each individual timestamp within the search term's array.
    const formattedTimes = timestamps.map(timestamp => {
      // Creates a Date object from the ISO timestamp string.
      const date = new Date(timestamp);
      // toLocaleTimeString formats the time portion of the date according to locale-specific conventions.
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false // Use 24-hour format.
      });
    });

    // Sort the formatted times chronologically for a clean display.
    // This is an in-place sort, which is safe as formattedTimes is a newly created array.
    formattedTimes.sort();

    // Return a new, structured object for each search term.
    // This new object structure is standardized and easier for the JSX to consume.
    return {
      name: labelKey, // The search term itself.
      count: timestamps.length, // The number of times this term was searched.
      times: formattedTimes, // The formatted "HH:MM" timestamps.
      rawTimestamps: timestamps, // Keep the original timestamps for other uses (like showing the date).
      isAirport: labelKey.includes(' - ') // A simple heuristic to guess if the term is an airport code.
    };
  });

  // Sort the entire dataset by search count in descending order, so the most popular items appear first.
  // The sort function `(a, b) => b.count - a.count` achieves descending order by returning a positive number if `b` is larger than `a`.
  data.sort((a, b) => b.count - a.count);

  // --- STATE MANAGEMENT ---
  // `useState` is used to manage the component's internal state.
  // Here, we track which list items are expanded. A `Set` is used for efficient add/delete/check operations.
  const [expandedItems, setExpandedItems] = useState(new Set());

  // --- EVENT HANDLERS ---
  /**
   * Toggles the expanded/collapsed state of a specific list item by its index.
   * @param {number} index - The index of the item to toggle.
   */
  // Defines the function that will handle clicks on the collapsible item headers.
  const toggleExpanded = (index) => {
    // Create a new Set from the current state to ensure immutability.
    // This is a core React principle: state should be treated as immutable.
    const newExpanded = new Set(expandedItems);
    // Checks if the item's index is already in the Set.
    if (newExpanded.has(index)) {
      newExpanded.delete(index); // If already expanded, collapse it.
    } else {
      newExpanded.add(index); // If collapsed, expand it.
    }
    // Update the state with the new Set, triggering a re-render.
    setExpandedItems(newExpanded);
  };

  // --- CALCULATIONS ---
  // Use the .reduce() method to efficiently sum up the counts of all items.
  // `reduce` iterates over the array, accumulating a single value (the sum). `0` is the initial value for the sum.
  const totalSearches = data.reduce((sum, item) => sum + item.count, 0);

  // --- RENDER LOGIC ---
  // The return statement contains the JSX that defines the component's UI.
  return (
      // Main container with styling for width, centering, padding, and background color.
      <div className="max-w-4xl mx-auto p-6 bg-white">
        {/* Component Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search World</h1>
        </div>

        {/* List of Search Items */}
        <div className="space-y-2">
          {/* Map over the processed data to render each search term as a collapsible item. */}
          {/* This is the main loop that generates the list of search entries from the `data` array. */}
          {data.map((item, index) => {
            // Check if the current item's index is in the expanded Set.
            // Using .has() on a Set is a highly efficient O(1) operation.
            const isExpanded = expandedItems.has(index);
            
            return (
              // The `key` prop is crucial for React's rendering performance and identity tracking.
              // It helps React identify which items have changed, are added, or are removed.
              <div key={item.name} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Always-visible header, which is also a button to toggle expansion. */}
                <button
                  // The onClick handler calls the toggle function, passing the specific index of this item.
                  onClick={() => toggleExpanded(index)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-center gap-3">
                    {/* Chevron icon that changes based on the expanded state. */}
                    <div className="flex-shrink-0">
                      {/* A ternary operator is used for conditional rendering of the ChevronDown or ChevronRight icon. */}
                      {isExpanded ? (
                        <ChevronDown size={20} className="text-gray-600" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-600" />
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Badge showing the count for this specific search term. */}
                    {/* This UI element is often called a "badge" or "pill". */}
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {item.count}
                    </span>
                  </div>
                </button>

                {/* This block is conditionally rendered only if `isExpanded` is true. */}
                {/* This is a "short-circuit" conditional render; the content is rendered only if the condition before && is true. */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-white border-t border-gray-100">
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Clock size={14} />
                        Activity Times
                      </h4>
                    </div>
                    
                    {/* A grid to display all the formatted timestamps for this item. */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {/* Another .map() call to render each individual time entry for the expanded item. */}
                      {item.times.map((time, timeIndex) => (
                        <div
                          key={timeIndex}
                          className="bg-gray-50 px-3 py-2 rounded text-center text-sm font-mono text-gray-700 border"
                        >
                          {time}
                        </div>
                      ))}
                    </div>

                    {/* Provides context by showing the full date of the first search recorded for this term. */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        {/* The raw timestamp is formatted into a full, human-readable date string here. */}
                        Showing times from {new Date(item.rawTimestamps[0]).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Section */}
        {/* This section provides an overview of the entire dataset. */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Total Uniques:</span>
              <span className="ml-2 text-blue-900">{data.length}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Total Searches:</span>
              <span className="ml-2 text-blue-900">{totalSearches}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Average per Unique:</span>
              {/* The .toFixed(1) method formats the calculated average to one decimal place. */}
              <span className="ml-2 text-blue-900">{(totalSearches / data.length).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

// Exports the component to be used in other parts of the application.
export default SearchGraph;