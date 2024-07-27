// components/SearchBar.js
import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    // Mock search results; replace with real search logic
    const results = [
      {
        key: "Gurleens House",
        location: { lat: 49.123970, lng: -122.829210 },
        info: {
          name: "Gurleen's House",
          rating: 4.5,
          requiresID: true,
          openingHours: "9:00 AM - 9:00 PM",
        },
      },
    ];
    onSearch(results);
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a place..."
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default SearchBar;
