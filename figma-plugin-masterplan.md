# Ripplix Animation Library Figma Plugin Masterplan

## 1. Project Overview

### 1.1 Concept
A Figma plugin that provides Figma users access to Ripplix's curated library of UI animations, micro-interactions, and interaction flows. The plugin allows users to browse, search, filter, preview, and add animations to their Figma designs.

### 1.2 Objectives
- Create a seamless browsing experience for Ripplix animations within Figma
- Allow users to easily search and filter animations
- Provide preview functionality before adding animations to designs
- Insert animations as the Ripplix logo with hyperlinks to the full animation on the Ripplix website

### 1.3 Target Audience
- UI/UX designers
- Product designers
- Interaction designers
- Anyone using Figma for UI design who wants to incorporate or reference animations

## 2. Core Features and Functionality

### 2.1 Animation Browsing
- Grid layout display of animations
- Pagination or infinite scroll for browsing large numbers of animations
- Thumbnail/preview of each animation

### 2.2 Search and Filtering
- Search by title text
- Search by interaction type
- Filter by platform (web, mobile, etc.)
- Filter by interaction type

### 2.3 Animation Preview
- In-plugin playback of MP4 animations
- Animation metadata display (title, platform, interaction type, etc.)

### 2.4 Integration with Figma
- Add selected animation to Figma board as the Ripplix logo
- Automatically hyperlink the logo to the specific animation URL on the Ripplix website
- Allow multiple animations to be added in a single session (plugin remains open)

### 2.5 Responsive UI
- Plugin interface adapts to different Figma window sizes

## 3. Technical Architecture

### 3.1 Data Source: WordPress REST API Integration

#### 3.1.1 API Endpoint Details
- Endpoint URL: `https://www.ripplix.com/wp-json/ripplix/v1/animations/`
- Request Method: GET
- Authentication: None required (public endpoint)
- Response Format: JSON array of animation objects

#### 3.1.2 WordPress REST API Working Procedure
1. **Data Retrieval**: The WordPress custom endpoint you've created (`ripplix_get_animations_json()`) queries posts of type 'library'.
2. **Data Processing**: For each post, the function extracts:
   - Core WordPress data: ID, title, permalink
   - Custom fields (via ACF): video_url, app, platform, industry, interaction
   - Hardcoded logo URL
3. **API Registration**: The `ripplix_register_api_routes()` function registers the endpoint with WordPress's REST API system.
4. **Access Control**: The `'permission_callback' => '__return_true'` allows public access without authentication.
5. **Response Handling**: `rest_ensure_response()` properly formats the data for REST API output.

#### 3.1.3 Fetching Data in the Plugin
```javascript
// Fetch animations from WordPress REST API
async function fetchAnimations() {
  try {
    const response = await fetch('https://www.ripplix.com/wp-json/ripplix/v1/animations/');
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
```

#### 3.1.4 Client-Side Caching
```javascript
// Simple cache implementation
const CACHE_KEY = 'ripplix_animations_cache';
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

async function getAnimationsWithCache() {
  // Check if we have cached data
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      return data;
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
```

### 3.2 Recommended Technology Stack

#### 3.2.1 Frontend
- **HTML/CSS/JavaScript**: Core technologies for Figma plugins
- **React**: Recommended for building a responsive and interactive UI
  - Component structure optimized for grid layout and search/filter functionality
- **TypeScript**: For type safety and better code completion in Cursor AI

#### 3.2.2 Build System
- **Webpack**: Bundle and optimize code
- **Figma Plugin Template**: `https://github.com/figma/plugin-samples/tree/master/webpack-react`

### 3.3 Figma Plugin Structure

#### 3.3.1 File Structure
```
ripplix-figma-plugin/
├── src/
│   ├── ui.html        # HTML entry point for UI
│   ├── ui.tsx         # React component for UI
│   ├── code.ts        # Plugin logic that interfaces with Figma
│   ├── components/    # React components
│   │   ├── App.tsx            # Main application component
│   │   ├── AnimationGrid.tsx  # Grid layout for animations
│   │   ├── AnimationCard.tsx  # Individual animation preview card
│   │   ├── SearchBar.tsx      # Search input component
│   │   ├── Filters.tsx        # Filter controls component
│   │   └── VideoPlayer.tsx    # MP4 video preview component
│   ├── utils/         # Utility functions
│   │   ├── api.ts             # API fetching functions
│   │   ├── search.ts          # Search and filtering logic
│   │   └── figma.ts           # Figma API helper functions
│   └── types.ts       # TypeScript interfaces and types
├── webpack.config.js  # Webpack configuration
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── manifest.json      # Figma plugin manifest
```

#### 3.3.2 Figma Plugin Manifest Example
```json
{
  "name": "Ripplix Animation Library",
  "id": "1234567890",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "menu": [
    {"name": "Open Ripplix Library", "command": "open"}
  ]
}
```

## 4. Search and Filter Implementation

### 4.1 Search Functionality
```typescript
// Search function to filter animations by title and interaction
function searchAnimations(animations: Animation[], query: string): Animation[] {
  if (!query || query.trim() === '') {
    return animations;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  
  return animations.filter(animation => 
    animation.title.toLowerCase().includes(lowerQuery) || 
    animation.interaction.toLowerCase().includes(lowerQuery)
  );
}
```

### 4.2 Filter Implementation
```typescript
interface FilterOptions {
  platform: string[];
  interaction: string[];
}

// Filter function
function filterAnimations(animations: Animation[], filters: FilterOptions): Animation[] {
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
```

### 4.3 Combined Search and Filter
```typescript
function getFilteredAndSearchedAnimations(
  animations: Animation[], 
  searchQuery: string, 
  filters: FilterOptions
): Animation[] {
  const searchResults = searchAnimations(animations, searchQuery);
  return filterAnimations(searchResults, filters);
}
```

## 5. Video Preview Implementation

### 5.1 Video Player Component
```tsx
import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, autoPlay = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current) {
      if (autoPlay) {
        videoRef.current.play().catch(err => {
          console.warn('Auto-play failed:', err);
        });
      }
    }
  }, [videoUrl, autoPlay]);
  
  return (
    <div className="video-container">
      <video 
        ref={videoRef}
        src={videoUrl}
        loop
        muted
        playsInline
        controls={false}
        className="video-player"
        onClick={() => {
          if (videoRef.current?.paused) {
            videoRef.current.play();
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;
```

## 6. Figma Integration

### 6.1 Adding Logo to Figma
```typescript
// code.ts - This runs in Figma's plugin environment
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'add-animation') {
    const animation = msg.animation;
    
    // Load the SVG logo
    const logoUrl = animation.logo;
    
    try {
      // Create a node for the image
      const node = figma.createNodeFromSvg(logoUrl);
      
      // Position the node at the center of the viewport
      const center = figma.viewport.center;
      node.x = center.x - node.width / 2;
      node.y = center.y - node.height / 2;
      
      // Set a hyperlink
      node.hyperlink = {
        type: "URL",
        value: animation.url
      };
      
      // Select the created node
      figma.currentPage.selection = [node];
      
      // Notify the UI
      figma.ui.postMessage({ 
        type: 'animation-added',
        success: true 
      });
    } catch (error) {
      console.error('Error adding animation:', error);
      figma.ui.postMessage({ 
        type: 'animation-added',
        success: false,
        error: error.message 
      });
    }
  }
};
```

### 6.2 Alternative Approach Using Image
```typescript
// If SVG loading doesn't work well, use this approach with images
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'add-animation') {
    const animation = msg.animation;
    
    try {
      // Create a rectangle first (placeholder)
      const rect = figma.createRectangle();
      rect.resize(100, 40);
      
      // Position at center of viewport
      const center = figma.viewport.center;
      rect.x = center.x - rect.width / 2;
      rect.y = center.y - rect.height / 2;
      
      // Set hyperlink
      rect.hyperlink = {
        type: "URL",
        value: animation.url
      };
      
      // Set a fill for the rectangle (brand color or image fill after fetching image bytes)
      rect.fills = [{
        type: 'SOLID',
        color: { r: 0.2, g: 0.4, b: 0.9 }
      }];
      
      // Select the created node
      figma.currentPage.selection = [rect];
      
      figma.ui.postMessage({ type: 'animation-added', success: true });
    } catch (error) {
      console.error('Error adding animation:', error);
      figma.ui.postMessage({ 
        type: 'animation-added', 
        success: false, 
        error: error.message 
      });
    }
  }
};
```

## 7. Data Model

### 7.1 TypeScript Interfaces
```typescript
// types.ts
export interface Animation {
  id: number;
  title: string;
  url: string;
  video_url: string;
  app: string;
  platform: string;
  industry: string;
  interaction: string;
  logo: string;
}

export interface AppState {
  animations: Animation[];
  filteredAnimations: Animation[];
  searchQuery: string;
  filters: {
    platform: string[];
    interaction: string[];
  };
  selectedAnimation: Animation | null;
  isLoading: boolean;
  error: string | null;
}
```

### 7.2 State Management (React Context Example)
```typescript
// context/AnimationContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Animation, AppState } from '../types';
import { fetchAnimations } from '../utils/api';

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

// Define actions
type Action = 
  | { type: 'SET_ANIMATIONS', payload: Animation[] }
  | { type: 'SET_SEARCH_QUERY', payload: string }
  | { type: 'SET_FILTERS', payload: { platform: string[], interaction: string[] } }
  | { type: 'SET_SELECTED_ANIMATION', payload: Animation | null }
  | { type: 'SET_LOADING', payload: boolean }
  | { type: 'SET_ERROR', payload: string | null };

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
    default:
      return state;
  }
}

// Provider component
export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  useEffect(() => {
    const loadAnimations = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const data = await fetchAnimations();
        dispatch({ type: 'SET_ANIMATIONS', payload: data });
        dispatch({ type: 'SET_ERROR', payload: null });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
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
```

## 8. Grid Layout Implementation

### 8.1 CSS Grid Layout
```css
.animation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 16px;
  max-width: 100%;
}

.animation-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.animation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.video-container {
  position: relative;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  width: 100%;
  background: #f5f5f5;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.animation-info {
  padding: 12px;
}

.animation-title {
  font-weight: 600;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.animation-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}

.meta-tag {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.add-button {
  margin-top: auto;
  padding: 8px;
  background: #0d99ff;
  color: white;
  border: none;
  border-radius: 0 0 8px 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-button:hover {
  background: #0a7fd6;
}
```

### 8.2 AnimationGrid Component
```tsx
// components/AnimationGrid.tsx
import React from 'react';
import AnimationCard from './AnimationCard';
import { Animation } from '../types';
import { useAnimations } from '../context/AnimationContext';
import { getFilteredAndSearchedAnimations } from '../utils/search';

const AnimationGrid: React.FC = () => {
  const { state } = useAnimations();
  const { animations, searchQuery, filters, isLoading, error } = state;
  
  if (isLoading) {
    return <div className="loading">Loading animations...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  const filteredAnimations = getFilteredAndSearchedAnimations(
    animations,
    searchQuery,
    filters
  );
  
  if (filteredAnimations.length === 0) {
    return <div className="no-results">No animations found. Try adjusting your search or filters.</div>;
  }
  
  return (
    <div className="animation-grid">
      {filteredAnimations.map(animation => (
        <AnimationCard key={animation.id} animation={animation} />
      ))}
    </div>
  );
};

export default AnimationGrid;
```

### 8.3 AnimationCard Component
```tsx
// components/AnimationCard.tsx
import React from 'react';
import VideoPlayer from './VideoPlayer';
import { Animation } from '../types';
import { useAnimations } from '../context/AnimationContext';

interface AnimationCardProps {
  animation: Animation;
}

const AnimationCard: React.FC<AnimationCardProps> = ({ animation }) => {
  const { dispatch } = useAnimations();
  
  const handleAddClick = () => {
    // Send message to plugin code
    parent.postMessage({
      pluginMessage: {
        type: 'add-animation',
        animation
      }
    }, '*');
  };
  
  return (
    <div className="animation-card">
      <div className="video-container">
        <VideoPlayer videoUrl={animation.video_url} />
      </div>
      <div className="animation-info">
        <h3 className="animation-title">{animation.title}</h3>
        <div className="animation-meta">
          {animation.platform && (
            <span className="meta-tag platform">{animation.platform}</span>
          )}
          {animation.interaction && (
            <span className="meta-tag interaction">{animation.interaction}</span>
          )}
        </div>
      </div>
      <button className="add-button" onClick={handleAddClick}>
        Add to Figma
      </button>
    </div>
  );
};

export default AnimationCard;
```

## 9. Main App Component

```tsx
// components/App.tsx
import React from 'react';
import SearchBar from './SearchBar';
import Filters from './Filters';
import AnimationGrid from './AnimationGrid';
import { AnimationProvider } from '../context/AnimationContext';

const App: React.FC = () => {
  return (
    <AnimationProvider>
      <div className="app-container">
        <header className="app-header">
          <img 
            src="https://www.ripplix.com/wp-content/uploads/2024/12/Logo-of-Ripplix-Retina.svg" 
            alt="Ripplix Logo" 
            className="logo"
          />
          <h1>Animation Library</h1>
        </header>
        
        <div className="search-filter-container">
          <SearchBar />
          <Filters />
        </div>
        
        <main className="main-content">
          <AnimationGrid />
        </main>
      </div>
    </AnimationProvider>
  );
};

export default App;
```

## 10. Entrypoint Files

### 10.1 UI Entrypoint (ui.tsx)
```tsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './styles.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// Handle messages from the plugin code
window.onmessage = (event) => {
  const message = event.data.pluginMessage;
  if (message && message.type === 'animation-added') {
    if (message.success) {
      // Show success message
      console.log('Animation added successfully');
    } else {
      // Show error message
      console.error('Failed to add animation:', message.error);
    }
  }
};
```

### 10.2 Plugin Code Entrypoint (code.ts)
```typescript
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 500, height: 600 });

// Called when a message is received from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'add-animation') {
    const animation = msg.animation;
    
    try {
      // Create a rectangle first (placeholder)
      const rect = figma.createRectangle();
      rect.resize(100, 40);
      
      // Position at center of viewport
      const center = figma.viewport.center;
      rect.x = center.x - rect.width / 2;
      rect.y = center.y - rect.height / 2;
      
      // Set hyperlink
      rect.hyperlink = {
        type: "URL",
        value: animation.url
      };
      
      // Set a fill for the rectangle (brand color or image fill)
      rect.fills = [{
        type: 'SOLID',
        color: { r: 0.2, g: 0.4, b: 0.9 }
      }];
      
      // Select the created node
      figma.currentPage.selection = [rect];
      
      figma.ui.postMessage({ type: 'animation-added', success: true });
    } catch (error) {
      console.error('Error adding animation:', error);
      figma.ui.postMessage({ 
        type: 'animation-added', 
        success: false, 
        error: error.message 
      });
    }
  }
};
```

## 11. Resources and References

### 11.1 Figma Plugin Development
- [Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
- [Figma Plugin Samples](https://github.com/figma/plugin-samples)

### 11.2 WordPress REST API
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [REST API Endpoints Reference](https://developer.wordpress.org/rest-api/reference/)
