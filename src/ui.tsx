import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import './styles.css';

// Component for showing the copy URL message
const CopyUrlMessage = ({ url }: { url: string }) => {
  const handleCopyClick = () => {
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      // Notify the plugin that copy is confirmed
      parent.postMessage({ 
        pluginMessage: { type: 'copy-confirmed' } 
      }, '*');
    }).catch(err => {
      console.error('Failed to copy URL:', err);
    });
  };

  return (
    <div className="copy-message">
      <p>Copy Ripplix animation URL:</p>
      <div className="url-container">
        <input type="text" value={url} readOnly className="url-input" />
        <button onClick={handleCopyClick} className="copy-button">Copy</button>
      </div>
    </div>
  );
};

// Determine what component to render based on URL parameters
const Main = () => {
  const [copyUrl, setCopyUrl] = useState<string | null>(null);
  
  // Listen for messages from the plugin code
  useEffect(() => {
    window.onmessage = (event) => {
      const message = event.data.pluginMessage;
      
      if (!message) return;
      
      if (message.type === 'copy-to-clipboard') {
        // Try to copy text directly
        navigator.clipboard.writeText(message.text).then(() => {
          // Notify the plugin that copy is confirmed
          parent.postMessage({ 
            pluginMessage: { type: 'copy-confirmed' } 
          }, '*');
        }).catch(() => {
          // If direct copy fails, we'll show the UI with the message
          console.log('Direct copy failed, using UI instead');
        });
      } else if (message.type === 'show-copy-message') {
        setCopyUrl(message.url);
      } else if (message.type === 'animation-added') {
        if (message.success) {
          // Show success message
          console.log('Animation added successfully:', message.message);
        } else {
          // Show error message
          console.error('Failed to add animation:', message.error);
        }
      }
    };
  }, []);

  // Show different content based on what we need to display
  if (copyUrl) {
    return <CopyUrlMessage url={copyUrl} />;
  }
  
  // Default: show the main app
  return <App />;
};

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
); 