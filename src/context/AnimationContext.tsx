import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Animation, AppState, FilterOptions } from '../types';
import { getAnimationsWithCache } from '../utils/api';
import { getFilteredAndSearchedAnimations } from '../utils/search';

// Initial state
const initialState: AppState = {
  animations: [],
  filteredAnimations: [],
  searchQuery: '',
  filters: {
    platform: [],
    interaction: []
  },
  selectedAnimation: null,
  isLoading: true,
  error: null
};

// Define action types
type Action = 
  | { type: 'SET_ANIMATIONS'; payload: Animation[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: FilterOptions }
  | { type: 'SET_SELECTED_ANIMATION'; payload: Animation | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'APPLY_FILTERS' };

// Create context
const AnimationContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Reducer function
function animationReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ANIMATIONS':
      return {
        ...state,
        animations: action.payload,
        filteredAnimations: action.payload
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: action.payload
      };
    case 'SET_SELECTED_ANIMATION':
      return {
        ...state,
        selectedAnimation: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'APPLY_FILTERS':
      return {
        ...state,
        filteredAnimations: getFilteredAndSearchedAnimations(
          state.animations,
          state.searchQuery,
          state.filters
        )
      };
    default:
      return state;
  }
}

// Provider component
export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  // Apply filters whenever search query or filters change
  useEffect(() => {
    dispatch({ type: 'APPLY_FILTERS' });
  }, [state.searchQuery, state.filters]);

  // Load animations on mount
  useEffect(() => {
    const loadAnimations = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const data = await getAnimationsWithCache();
        dispatch({ type: 'SET_ANIMATIONS', payload: data });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        console.error('Error loading animations:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error instanceof Error ? error.message : 'Unknown error' 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadAnimations();
  }, []);

  return (
    <AnimationContext.Provider value={{ state, dispatch }}>
      {children}
    </AnimationContext.Provider>
  );
};

// Custom hook for using the context
export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimations must be used within an AnimationProvider');
  }
  return context;
}; 