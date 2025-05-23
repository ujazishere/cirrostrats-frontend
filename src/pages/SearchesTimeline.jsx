import React, { useEffect, useState } from "react";
import SearchGraph from "../components/utility/SearchTimeline";

const SearchesTimeline = () => {
  const [rawData, setRawData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetch(`${apiUrl}/searches/timeline`)
      .then(res => res.json())
      .then(json => setRawData(json))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {/* <h1 className="text-xl font-bold p-4">Search Count by Term</h1> */}
      {rawData.length > 0 ? <SearchGraph rawData={rawData} /> : <p>Loading...</p>}
    </div>
  );
};

export default SearchesTimeline;
