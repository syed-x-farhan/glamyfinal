import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);

  const search = async (query) => {
    setSearchQuery(query);
    setError(null);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/products/search`, {
        params: { query },
        withCredentials: true
      });
      
      const formattedResults = response.data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        url: item.url || item.image,
      }));
      
      setSearchResults(formattedResults);
    } catch (err) {
      console.error('Search error:', err);
      setError("An error occurred while fetching results.");
    }
  };

  return (
    <SearchContext.Provider value={{ searchQuery, searchResults, search, error }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => useContext(SearchContext);
