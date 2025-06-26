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
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        className="video-player"
        tabIndex={-1}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default VideoPlayer; 