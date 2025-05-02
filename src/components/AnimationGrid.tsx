import React from 'react';
import AnimationCard from './AnimationCard';
import { useAnimations } from '../context/AnimationContext';

const AnimationGrid: React.FC = () => {
  const { state } = useAnimations();
  const { filteredAnimations, isLoading, error } = state;
  
  if (isLoading) {
    return <div className="loading">Loading animations...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
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