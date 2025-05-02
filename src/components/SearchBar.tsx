import React, { useState, useEffect } from 'react';
import { useAnimations } from '../context/AnimationContext';

const SearchBar: React.FC = () => {
  const { state, dispatch } = useAnimations();
  const [inputValue, setInputValue] = useState(state.searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: inputValue });
    }, 300);
    
    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, dispatch]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search animations..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="search-input"
      />
      {inputValue && (
        <button 
          className="clear-search" 
          onClick={() => setInputValue('')}
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar; 