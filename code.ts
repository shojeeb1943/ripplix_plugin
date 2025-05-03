// This is a minimal test plugin

// Show UI
figma.showUI(__html__, { width: 300, height: 200 });

// Handle messages
figma.ui.onmessage = msg => {
  // Handle create rectangle
  if (msg.type === 'create-rectangle') {
    // Create rectangle
    const rect = figma.createRectangle();
    
    // Set properties
    rect.x = 50;
    rect.y = 50;
    rect.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.5, b: 1 } }];
    
    // Add to page
    figma.currentPage.appendChild(rect);
    
    // Select it
    figma.currentPage.selection = [rect];
    
    // Zoom to it
    figma.viewport.scrollAndZoomIntoView([rect]);
    
    // Notify UI
    figma.ui.postMessage({ type: 'creation-result', success: true });
  }
  
  // Handle close
  else if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};
