import React, { useEffect, useState } from "react";
import SearchGraph from "../components/utility/SearchGraph";

const SearchesPage = () => {
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/searches/all")
      .then(res => res.json())
      .then(json => setRawData(json))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold p-4">Search Count by Term</h1>
      {rawData.length > 0 ? <SearchGraph rawData={rawData} /> : <p>Loading...</p>}
    </div>
  );
};

export default SearchesPage;
