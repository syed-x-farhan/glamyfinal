import React, { useState } from 'react';
import './Search.css';
import { useSearch } from '../context/search_context';
import NoItemsFound from '../components/NoItemsFound';
import { useNavigate } from 'react-router-dom';

const Search = () => {
    const { searchQuery, searchResults, search, error } = useSearch();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (event) => {
        const value = event.target.value;
        setIsLoading(true);
        try {
            await search(value);
        } catch (err) {
            console.error("Error during search:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!searchQuery.trim()) {
            return;
        }
        setIsLoading(true);
        try {
            await search(searchQuery);
        } catch (err) {
            console.error("Error during search submit:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCardClick = (item) => {
        navigate(`/product/${item.id}`);
    };

    return (
        <div>
            <div className="search-container">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for brands, clothing, or categories..."
                        aria-label="Search for clothing"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <button type="submit" className="search-button" aria-label="Search">
                        Search
                    </button>
                </form>
            </div>

            {isLoading ? (
                <div className="loading">Loading...</div>
            ) : error ? (
                <div className="error-message">An error occurred. Please try again.</div>
            ) : (
                <div className="results-grid">
                    {searchResults.length > 0 ? (
                        searchResults.map((item, index) => (
                            <div className="card" key={index} onClick={() => handleCardClick(item)}>
                                <img src={item.url || item.image} alt={item.name} />
                                <h4>{item.name}</h4>
                                <p>{item.price}</p>
                            </div>
                        ))
                    ) : (
                        <NoItemsFound />
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
