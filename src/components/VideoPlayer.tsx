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
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(err => {
          console.warn('Play failed:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  };
  
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
        onClick={togglePlay}
      />
    </div>
  );
};

export default VideoPlayer; 