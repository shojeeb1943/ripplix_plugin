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
      
      // Create a rectangle for our logo
      const rect = figma.createRectangle();
      
      // Set reasonable dimensions for the logo
      rect.resize(120, 40);
      
      // Position at center of viewport
      const center = figma.viewport.center;
      rect.x = center.x - rect.width / 2;
      rect.y = center.y - rect.height / 2;
      
      // Initially transparent while we fetch the SVG
      rect.fills = [];
      
      // Direct SVG URL
      const logoUrl = "https://www.ripplix.com/wp-content/uploads/2025/04/Logo-figma.svg";
      
      try {
        // Fetch SVG content directly from the plugin code
        const response = await fetch(logoUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.status}`);
        }
        
        // Get SVG text content
        const svgText = await response.text();
        
        // Convert SVG text to bytes using TextEncoder
        const encoder = new TextEncoder();
        const svgBytes = encoder.encode(svgText);
        
        // Create image
        const image = figma.createImage(svgBytes);
        
        // Set image as fill
        rect.fills = [{
          type: 'IMAGE',
          scaleMode: 'FIT',
          imageHash: image.hash
        }];
        
        // Apply hyperlink
        if ('hyperlink' in rect) {
          (rect as any).hyperlink = {
            type: 'URL',
            value: animation.url
          };
        }
        
        // Store animation data
        rect.setPluginData('animationUrl', animation.url);
        rect.setPluginData('animationTitle', animation.title);
        
        // Select the node
        figma.currentPage.selection = [rect];
        
        // Notify UI of success
        figma.ui.postMessage({
          type: 'animation-added',
          success: true,
          message: "Animation added! Right-click and use Plugins > Ripplix Animation Library > Copy Animation URL to copy the link."
        });
        
      } catch (imageError) {
        console.error('Error loading SVG image:', imageError);
        
        // Try alternative method - fetch the SVG through the UI instead
        figma.ui.postMessage({
          type: 'fetch-svg-for-plugin',
          url: logoUrl,
          animationData: animation,
          nodeId: rect.id
        });
      }
      
    } catch (error: unknown) {
      console.error('Error adding animation:', error);
      
      // Notify the UI of the error
      figma.ui.postMessage({ 
        type: 'animation-added', 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (msg.type === 'svg-data') {
    try {
      // Get data from the message
      const { svgData, animation, nodeId } = msg;
      
      // Find the node that was created earlier
      const rect = figma.getNodeById(nodeId) as RectangleNode;
      
      if (!rect) {
        throw new Error('Could not find rectangle node');
      }
      
      // Create image from bytes
      const image = figma.createImage(new Uint8Array(svgData));
      
      // Apply as fill
      rect.fills = [{
        type: 'IMAGE',
        scaleMode: 'FIT',
        imageHash: image.hash
      }];
      
      // Apply hyperlink
      if ('hyperlink' in rect) {
        (rect as any).hyperlink = {
          type: 'URL',
          value: animation.url
        };
      }
      
      // Store animation data
      rect.setPluginData('animationUrl', animation.url);
      rect.setPluginData('animationTitle', animation.title);
      
      // Select the node
      figma.currentPage.selection = [rect];
      
      // Notify UI of success
      figma.ui.postMessage({
        type: 'animation-added',
        success: true,
        message: "Animation added! Right-click and use Plugins > Ripplix Animation Library > Copy Animation URL to copy the link."
      });
      
    } catch (error) {
      console.error('Error applying SVG data:', error);
      createFallbackNode(msg.animation);
    }
  } else if (msg.type === 'svg-fetch-failed') {
    console.error('SVG fetch failed:', msg.error);
    createFallbackNode(msg.animation);
  } else if (msg.type === 'copy-confirmed') {
    // Close the plugin once the UI confirms copy is complete
    figma.closePlugin('URL copied to clipboard');
  } else if (msg.type === 'close-plugin') {
    // Close the plugin when UI requests it
    figma.closePlugin();
  }
};

// Helper function to create a fallback node when image loading fails
async function createFallbackNode(animation: any) {
  try {
    // Create a rectangle
    const rect = figma.createRectangle();
    rect.resize(120, 40);
    
    // Position at center of viewport
    const center = figma.viewport.center;
    rect.x = center.x - rect.width / 2;
    rect.y = center.y - rect.height / 2;
    
    // Set a solid color fill
    rect.fills = [{
      type: 'SOLID',
      color: { r: 0.05, g: 0.6, b: 1.0 } // Ripplix blue
    }];
    
    // Apply hyperlink
    if ('hyperlink' in rect) {
      (rect as any).hyperlink = {
        type: 'URL',
        value: animation.url
      };
    }
    
    // Load font for error text
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    
    // Create error text to indicate image failed
    const text = figma.createText();
    text.characters = "R";
    text.fontName = { family: "Inter", style: "Regular" };
    text.fontSize = 24;
    text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    
    // Center text in rectangle
    text.x = rect.x + (rect.width - text.width) / 2;
    text.y = rect.y + (rect.height - text.height) / 2;
    
    // Group elements
    const group = figma.group([rect, text], figma.currentPage);
    
    // Apply hyperlink to group
    if ('hyperlink' in group) {
      (group as any).hyperlink = {
        type: 'URL', 
        value: animation.url
      };
    }
    
    // Store animation data
    group.setPluginData('animationUrl', animation.url);
    group.setPluginData('animationTitle', animation.title);
    
    // Select the group
    figma.currentPage.selection = [group];
    
    // Notify UI of fallback success
    figma.ui.postMessage({
      type: 'animation-added',
      success: true,
      message: "Animation added with fallback style! Right-click and use Plugins > Ripplix Animation Library > Copy Animation URL to copy the link."
    });
    
  } catch (error) {
    console.error('Error creating fallback node:', error);
    figma.ui.postMessage({
      type: 'animation-added',
      success: false,
      error: 'Failed to create animation reference, even with fallback styling.'
    });
  }
}
