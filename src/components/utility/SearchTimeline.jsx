// Imports the React library and the useState hook for creating components and managing state.
import React, { useState } from 'react';
// Imports specific icon components from the lucide-react library for the user interface.
import { ChevronDown, ChevronRight, Clock, MapPin } from 'lucide-react';

// Defines the SearchTimeline functional component, which accepts rawData as a prop.
const SearchTimeline = ({ rawData }) => {
  // Sort data by timestamp (newest first)
  // Creates a new copy of the rawData array using the spread syntax (...) to avoid mutating the original prop.
  const sortedData = [...rawData].sort((a, b) => 
    // The sort comparator function subtracts the timestamp of 'a' from 'b'.
    // This results in a descending sort order, placing the newest items first.
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  // A helper function to format a timestamp string into a "DD HHMM" UTC format.
  const formatUTCDateTime = (timestamp) => {
  // Parse the timestamp as UTC (important for correct date interpretation)
  const date = new Date(timestamp);
  
  // Get UTC components directly
  // Retrieves the day, hours, and minutes components relative to UTC, ignoring the local timezone.
  const day = String(date.getUTCDate()).padStart(2, '0');       // DD (01-31)
  const hours = String(date.getUTCHours()).padStart(2, '0');    // HH (00-23)
  const minutes = String(date.getUTCMinutes()).padStart(2, '0'); // MM (00-59)
  
  // Concatenates the components into the final desired string format.
  return `${day} ${hours}${minutes}`;  // Format: "DD HHMM" (UTC)
  };
  // A helper function to create a display string from the first available data field in a search entry.
  const getDisplayValue = (entry) => {
    // Find first non-timestamp field with a value
    // Gets an array of all keys in the entry object, excluding 'timestamp'.
    const fields = Object.keys(entry).filter(k => k !== 'timestamp');
    // Finds the first key in the filtered array that has a truthy value.
    const field = fields.find(k => entry[k]);
    // Returns a formatted string with the key and its value, or a default string if no field was found.
    return field ? `${field}: ${entry[field]}` : 'Search entry';
  };

  // The return statement contains the JSX structure that defines the component's UI.
  return (
    // This is the main container for the entire timeline component, styled using inline styles.
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* This is the header/title for the timeline component. */}
      <h2 style={{
        fontSize: '1.5rem',
        marginBottom: '10px',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Clock size={20} /> Search Timeline
      </h2>

      {/* This div acts as the container for the timeline itself, with the vertical line created by the left border. */}
      <div style={{
        borderLeft: '2px solid #e0e0e0',
        paddingLeft: '20px'
      }}>
        {/* The .map() method iterates over the sorted data array to render each search entry. */}
        {sortedData.map((item, index) => (
          // A container for each individual entry on the timeline.
          // The 'key' prop is essential for React to efficiently update the list.
          <div key={index} style={{
            // marginBottom: '24px',
            position: 'relative'
          }}>
            {/* Timeline dot */}
            {/* This div represents the circular marker on the timeline's vertical line. */}
            <div style={{
              position: 'absolute',
              left: '-26px', // Positions the dot precisely on the vertical line.
              top: '4px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              // The dot's color changes based on whether the entry is a flight search ('fid_st').
              backgroundColor: item.fid_st ? '#3b82f6' : '#10b981',
              border: '2px solid white'
            }} />

            {/* This div is the main content "card" for a single timeline entry. */}
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {/* This section displays the primary information about the search. */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '3px'
              }}>
                <span style={{ fontWeight: '600', color: '#1e40af' }}>
                {/* TODO: Also account for other fields - extended suggestions fetch are not accounted for - SWA, JBU and such*/}
                {/* This block of nested ternary operators checks for different types of search data in a specific order of priority. */}
                {item.fid_st 
                  ? `Flight: ${item.fid_st}` 
                  : item.airport_st 
                    ? `Airport: ${item.airport_st}` 
                    : item.rst 
                      ? `Raw: ${item.rst}` 
                      : item['Terminal/Gate'] 
                        ? `Terminal/Gate: ${item['Terminal/Gate']}` 
                        : 'Unknown'}
                </span>
              </div>

              {/* This section displays the timestamp of the search event. */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.875rem',
                color: '#64748b'
              }}>
                <Clock size={12} />
                {
                // This chain of methods formats the timestamp into a specific "DD HHMMZ" format.
                // new Date(item.timestamp).getUTCDate() + ' ' +
                  new Date(item.timestamp).toDateString().toString().slice(8,10)+ ' ' + // Extracts the day (e.g., "13")
                  new Date(item.timestamp).toTimeString().toString().slice(0,2) + // Extracts the hour (e.g., "20")
                  new Date(item.timestamp).toTimeString().toString().slice(3,5) + 'Z' // Extracts the minute (e.g., "37") and adds a 'Z' for UTC.
                  }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Exports the component so it can be used in other parts of the application.
export default SearchTimeline;