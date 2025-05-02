import { Animation } from '../types';

/**
 * Add an animation to the Figma canvas as a logo with hyperlink
 */
export function addAnimationToCanvas(animation: Animation): void {
  // Send a message to the plugin code
  parent.postMessage({
    pluginMessage: {
      type: 'add-animation',
      animation
    }
  }, '*');
} 