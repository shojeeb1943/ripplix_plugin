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