// This plugin will allow users to browse and add Ripplix animations to Figma designs
// The plugin provides functionality to view animations and add them as links

// Check which command was used to start the plugin
if (figma.command === 'copy-url') {
  // Handle the copy URL command
  const selection = figma.currentPage.selection;
  
  // Check if something is selected
  if (selection.length === 0) {
    figma.notify('Please select a Ripplix animation node first');
    figma.closePlugin();
    // Exit early
  } else {
    const selectedNode = selection[0];
    // Check if this node has animation URL data
    const animationUrl = selectedNode.getPluginData('animationUrl');
    
    if (animationUrl) {
      // Copy the URL to clipboard
      figma.ui.postMessage({ 
        type: 'copy-to-clipboard', 
        text: animationUrl 
      });
      
      // Show a mini UI to confirm URL copy
      figma.showUI(__html__, { visible: true, width: 300, height: 100 });
      figma.ui.postMessage({ 
        type: 'show-copy-message',
        url: animationUrl
      });
      
      // Will be closed by the UI once copy is confirmed
    } else {
      figma.notify('This is not a Ripplix animation node');
      figma.closePlugin();
    }
  }
} else {
  // Default behavior: show the main UI with animation library
  figma.showUI(__html__, { width: 500, height: 600 });
}

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'add-animation') {
    try {
      const animation = msg.animation;
      
      // First, load the necessary fonts
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      
      // Create a container frame
      const frame = figma.createFrame();
      frame.resize(220, 60);
      frame.cornerRadius = 8;
      
      // Position at center of viewport
      const center = figma.viewport.center;
      frame.x = center.x - frame.width / 2;
      frame.y = center.y - frame.height / 2;
      
      // Style the frame
      frame.fills = [{
        type: 'SOLID',
        color: { r: 0.05, g: 0.6, b: 1.0 } // Ripplix blue
      }];
      
      // Create a title text node
      const titleText = figma.createText();
      titleText.fontName = { family: "Inter", style: "Bold" };
      titleText.fontSize = 16;
      titleText.characters = "Ripplix Animation";
      titleText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      titleText.x = 12;
      titleText.y = 10;
      
      // Create a description text
      const descText = figma.createText();
      descText.fontName = { family: "Inter", style: "Regular" };
      descText.fontSize = 12;
      descText.characters = animation.title;
      descText.fills = [{ 
        type: 'SOLID', 
        color: { r: 1, g: 1, b: 1 },
        opacity: 0.8 
      }];
      descText.x = 12;
      descText.y = 32;
      
      // Add nodes to the frame
      frame.appendChild(titleText);
      frame.appendChild(descText);
      
      // Store the animation data
      frame.setPluginData('animationUrl', animation.url);
      frame.setPluginData('animationTitle', animation.title);
      
      // Select the created frame
      figma.currentPage.selection = [frame];
      
      // Notify the UI
      figma.ui.postMessage({ 
        type: 'animation-added', 
        success: true,
        message: "Animation added! Right-click and use Plugins > Ripplix Animation Library > Copy Animation URL to copy the link."
      });
      
    } catch (error: unknown) {
      console.error('Error adding animation:', error);
      
      // Notify the UI of the error
      figma.ui.postMessage({ 
        type: 'animation-added', 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (msg.type === 'copy-confirmed') {
    // Close the plugin once the UI confirms copy is complete
    figma.closePlugin('URL copied to clipboard');
  } else if (msg.type === 'close-plugin') {
    // Close the plugin when UI requests it
    figma.closePlugin();
  }
}; 