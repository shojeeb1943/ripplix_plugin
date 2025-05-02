import React from 'react';
import VideoPlayer from './VideoPlayer';
import { Animation } from '../types';
import { addAnimationToCanvas } from '../utils/figma';

interface AnimationCardProps {
  animation: Animation;
}

const AnimationCard: React.FC<AnimationCardProps> = ({ animation }) => {
  const handleAddClick = () => {
    addAnimationToCanvas(animation);
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
          {animation.app && (
            <span className="meta-tag app">{animation.app}</span>
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