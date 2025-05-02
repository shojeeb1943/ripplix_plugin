import { Animation, FilterOptions } from '../types';

/**
 * Search animations by title or interaction type
 */
export function searchAnimations(animations: Animation[], query: string): Animation[] {
  if (!query || query.trim() === '') {
    return animations;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return animations.filter(animation => 
    animation.title.toLowerCase().includes(lowerQuery) || 
    animation.interaction.toLowerCase().includes(lowerQuery) ||
    (animation.app && animation.app.toLowerCase().includes(lowerQuery)) ||
    (animation.industry && animation.industry.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Filter animations by platform and interaction type
 */
export function filterAnimations(animations: Animation[], filters: FilterOptions): Animation[] {
  return animations.filter(animation => {
    // If no platform filters are selected, include all
    const platformMatch = filters.platform.length === 0 || 
      filters.platform.includes(animation.platform);
    
    // If no interaction filters are selected, include all
    const interactionMatch = filters.interaction.length === 0 || 
      filters.interaction.includes(animation.interaction);
    
    return platformMatch && interactionMatch;
  });
}

/**
 * Combine search and filter functionality
 */
export function getFilteredAndSearchedAnimations(
  animations: Animation[], 
  searchQuery: string, 
  filters: FilterOptions
): Animation[] {
  const searchResults = searchAnimations(animations, searchQuery);
  return filterAnimations(searchResults, filters);
}

/**
 * Get unique values for a property across all animations
 */
export function getUniqueValues(animations: Animation[], property: keyof Animation): string[] {
  const values = animations
    .map(animation => animation[property] as string)
    .filter(value => value && value.trim() !== '');
    
  return [...new Set(values)].sort();
} 