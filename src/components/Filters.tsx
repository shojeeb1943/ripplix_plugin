import React, { useState, useEffect } from 'react';
import { useAnimations } from '../context/AnimationContext';
import { getUniqueValues } from '../utils/search';

const Filters: React.FC = () => {
  const { state, dispatch } = useAnimations();
  const { animations, filters } = state;
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const platforms = getUniqueValues(animations, 'platform');
  const interactions = getUniqueValues(animations, 'interaction');
  
  const handlePlatformChange = (platform: string) => {
    const updatedPlatforms = filters.platform.includes(platform)
      ? filters.platform.filter(p => p !== platform)
      : [...filters.platform, platform];
      
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        ...filters,
        platform: updatedPlatforms
      }
    });
  };
  
  const handleInteractionChange = (interaction: string) => {
    const updatedInteractions = filters.interaction.includes(interaction)
      ? filters.interaction.filter(i => i !== interaction)
      : [...filters.interaction, interaction];
      
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        ...filters,
        interaction: updatedInteractions
      }
    });
  };
  
  const clearFilters = () => {
    dispatch({
      type: 'SET_FILTERS',
      payload: {
        platform: [],
        interaction: []
      }
    });
  };
  
  const hasActiveFilters = filters.platform.length > 0 || filters.interaction.length > 0;
  
  return (
    <div className="filters-container">
      <div className="filters-header">
        <button 
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          Filters {hasActiveFilters && <span className="filter-badge">{filters.platform.length + filters.interaction.length}</span>}
        </button>
        
        {hasActiveFilters && (
          <button 
            className="clear-filters"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="filters-content">
          {platforms.length > 0 && (
            <div className="filter-section">
              <h3>Platform</h3>
              <div className="filter-options">
                {platforms.map(platform => (
                  <label key={platform} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.platform.includes(platform)}
                      onChange={() => handlePlatformChange(platform)}
                    />
                    <span>{platform}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {interactions.length > 0 && (
            <div className="filter-section">
              <h3>Interaction Type</h3>
              <div className="filter-options">
                {interactions.map(interaction => (
                  <label key={interaction} className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.interaction.includes(interaction)}
                      onChange={() => handleInteractionChange(interaction)}
                    />
                    <span>{interaction}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Filters; 