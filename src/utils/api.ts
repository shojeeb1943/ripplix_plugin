import { Animation } from '../types';

const API_ENDPOINT = 'https://www.ripplix.com/wp-json/ripplix/v1/animations/';
const CACHE_KEY = 'ripplix_animations_cache';
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

/**
 * Fetch animations from the WordPress REST API
 */
export async function fetchAnimations(): Promise<Animation[]> {
  try {
    const response = await fetch(API_ENDPOINT);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching animations:', error);
    throw error;
  }
}

/**
 * Get animations with client-side caching to reduce API calls
 */
export async function getAnimationsWithCache(): Promise<Animation[]> {
  // Check if we have cached data
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    try {
      const { data, timestamp } = JSON.parse(cachedData);
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data as Animation[];
      }
    } catch (error) {
      console.warn('Error parsing cached data, fetching fresh data');
    }
  }
  
  // Fetch fresh data
  const animations = await fetchAnimations();
  
  // Update cache
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: animations,
    timestamp: Date.now()
  }));
  
  return animations;
} 