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

// Cache for SVG data to avoid repeated fetching
const svgCache = new Map();

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'add-animation') {
    try {
      const animation = msg.animation;
      
      // Try to create SVG first - fallback to text ONLY if this completely fails
      let svgSuccess = false;
      
      try {
        // Get the SVG URL prioritizing product_logo over logo
        const logoUrl = animation.product_logo || animation.logo || "https://www.ripplix.com/wp-content/uploads/2025/04/Logo-figma.svg";
        console.log("Using logo URL:", logoUrl);
        
        // Use cached SVG data if available to improve performance
        let svgString = '';
        
        if (svgCache.has(logoUrl)) {
          console.log("Using cached SVG data");
          svgString = svgCache.get(logoUrl);
        } else {
          // Fetch the SVG content with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          try {
            const response = await fetch(logoUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch SVG: ${response.status}`);
            }
            
            svgString = await response.text();
            
            // Cache the SVG data for future use
            svgCache.set(logoUrl, svgString);
          } catch (fetchError) {
            console.error("Error fetching SVG:", fetchError);
            // Use a simplified embedded SVG as fallback
            svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="20" fill="#1E0A8C"/><text x="16" y="22" font-family="Poppins" font-size="20" fill="white" text-anchor="middle">R</text></svg>';
          }
        }
        
        // Ensure the SVG has proper namespace
        if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
          svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        
        // Create the vector nodes from SVG
        const svgNode = figma.createNodeFromSvg(svgString);
        console.log("Created SVG node type:", svgNode.type);
        
        if (!svgNode) {
          throw new Error("Failed to create SVG node");
        }
        
        // Create a frame to contain the SVG with proper layout settings
        const container = figma.createFrame();
        container.layoutMode = "NONE";
        container.name = `Ripplix: ${animation.title || 'Animation'}`;
        container.fills = []; // Transparent background
        
        // Resize frame to fit SVG with small padding
        const padding = 4;
        container.resize(
          svgNode.width + padding * 2,
          svgNode.height + padding * 2
        );
        
        // Center the SVG in the frame
        svgNode.x = padding;
        svgNode.y = padding;
        
        // Add the SVG to the container
        container.appendChild(svgNode);
        
        // Position at the center of the viewport
        const center = figma.viewport.center;
        container.x = center.x - container.width / 2;
        container.y = center.y - container.height / 2;
        
        // Apply hyperlink to the container using the newer API first
        try {
          // @ts-ignore - Using newer Figma API
          container.hyperlink = { type: "URL", value: animation.url };
        } catch (hyperlinkError) {
          console.log("Hyperlink API not supported, using relaunchData instead:", hyperlinkError);
          container.setRelaunchData({ open: animation.url });
        }
        
        // Store the animation metadata
        container.setPluginData('animationUrl', animation.url);
        container.setPluginData('animationTitle', animation.title || '');
        
        // Add to current page
        figma.currentPage.appendChild(container);
        
        // Select the created node and focus viewport on it
        figma.currentPage.selection = [container];
        figma.viewport.scrollAndZoomIntoView([container]);
        
        // Mark that SVG creation was successful
        svgSuccess = true;
        
        // Notify UI
        figma.ui.postMessage({ 
          type: 'animation-added', 
          success: true,
          message: "Animation link added! Right-click to access the URL."
        });
        
      } catch (svgError) {
        // Log the SVG error for debugging
        console.error('SVG creation failed, will fall back to text:', svgError);
      }
      
      // ONLY create text if SVG creation completely failed
      if (!svgSuccess) {
        console.log("Using text fallback since SVG creation failed");
        
        // Fallback: Create a simple colored rectangle with the hyperlink
        // First, load the necessary fonts
        await figma.loadFontAsync({ family: "Poppins", style: "Bold" });
        await figma.loadFontAsync({ family: "Poppins", style: "Regular" });
        
        // Create a container frame
        const frame = figma.createFrame();
        frame.resize(32, 32);
        frame.cornerRadius = 20;
        
        // Position at center of viewport
        const center = figma.viewport.center;
        frame.x = center.x - frame.width / 2;
        frame.y = center.y - frame.height / 2;
        
        // Style the frame with Figma colors
        frame.fills = [{
          type: 'SOLID',
          color: { r: 0.1, g: 0.04, b: 0.36 } // Figma purple
        }];
        
        // Add the text "F" as a fallback for the Figma logo
        const logoText = figma.createText();
        logoText.fontName = { family: "Poppins", style: "Bold" };
        logoText.fontSize = 16;
        logoText.characters = "R";
        logoText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        
        // Center the text in the frame
        logoText.x = (frame.width - logoText.width) / 2;
        logoText.y = (frame.height - logoText.height) / 2;
        
        // Add text to the frame
        frame.appendChild(logoText);
        
        // Apply hyperlink
        try {
          // @ts-ignore - Using newer Figma API
          frame.hyperlink = { type: "URL", value: animation.url };
        } catch (hyperlinkError) {
          console.log("Hyperlink API not supported, using relaunchData instead");
          frame.setRelaunchData({ open: animation.url });
        }
        
        // Store the animation data
        frame.setPluginData('animationUrl', animation.url);
        frame.setPluginData('animationTitle', animation.title || '');
        
        // Add to current page
        figma.currentPage.appendChild(frame);
        figma.currentPage.selection = [frame];
        figma.viewport.scrollAndZoomIntoView([frame]);
        
        // Notify UI
        figma.ui.postMessage({ 
          type: 'animation-added', 
          success: true,
          message: "Animation link added (fallback mode)! Right-click to access the URL."
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
  } else if (msg.type === 'copy-confirmed') {
    // Close the plugin once the UI confirms copy is complete
    figma.closePlugin('URL copied to clipboard');
  } else if (msg.type === 'close-plugin') {
    // Close the plugin when UI requests it
    figma.closePlugin();
  }
}; 