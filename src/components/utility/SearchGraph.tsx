import React, { useState } from "react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";

interface RawDataItem {
  _id?: string;
  [key: string]: any;
}

interface SearchGraphProps {
  rawData: RawDataItem[];
}

const SearchGraph: React.FC<SearchGraphProps> = ({ rawData }) => {
  // Transform the raw data and format timestamps
  const data = rawData.map((item) => {
    const labelKey = Object.keys(item).find((key) => key !== "_id"); // labelKey is the search term.
    if (!labelKey) return null;
    const timestamps = item[labelKey];
    // Format timestamps to HH:MM
    const formattedTimes = timestamps.map((timestamp: any) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    });

    // Sort times for better display
    formattedTimes.sort();

    return {
      name: labelKey,
      count: timestamps.length,
      times: formattedTimes,
      rawTimestamps: timestamps,
      isAirport: labelKey.includes(" - "), // Determine if it's an airport or flight code
    };
  });

  // Sort data by count (highest first) for better visual hierarchy
  const filteredData = data.filter((item) => item !== null);
  filteredData.sort((a: any, b: any) => b.count - a.count);

  // State to track which items are expanded
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Toggle expansion state
  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Calculate total searches
  const totalSearches = filteredData.reduce(
    (sum: number, item: any) => sum + item.count,
    0,
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Search World</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600"></div>
      </div>

      <div className="space-y-2">
        {filteredData.map((item: any, index: number) => {
          const isExpanded = expandedItems.has(index);

          return (
            <div
              key={item.name}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header - always visible */}
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-gray-600" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-600" />
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      {/* This section is for displaying location icon based on the type -  */}
                      {/* {item.isAirport ? (
                          <MapPin size={16} className="text-blue-600" />
                        ) : (
                          <div className="w-4 h-4 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">
                            F
                          </div>
                        )} */}
                      <h3 className="font-semibold text-gray-800">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {/* {item.count} record{item.count !== 1 ? 's' : ''} */}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {/* Total Searches of an item - length of timestamps */}
                    {item.count}
                  </span>
                </div>
              </button>

              {/* Expanded content - timestamps */}
              {isExpanded && (
                <div className="px-4 py-3 bg-white border-t border-gray-100">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Clock size={14} />
                      Activity Times
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {item.times.map((time: any, timeIndex: number) => (
                      <div
                        key={timeIndex}
                        className="bg-gray-50 px-3 py-2 rounded text-center text-sm font-mono text-gray-700 border"
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Show date info for context */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Showing times from{" "}
                      {new Date(item.rawTimestamps[0]).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Total Uniques:</span>
            <span className="ml-2 text-blue-900">{filteredData.length}</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Total Searches:</span>
            <span className="ml-2 text-blue-900">{totalSearches}</span>
          </div>
          <div>
            <span className="text-blue-700 font-medium">
              Average per Unique:
            </span>
            <span className="ml-2 text-blue-900">
              {(totalSearches / filteredData.length).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchGraph;
