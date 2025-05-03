// This plugin creates a Figma logo with a hyperlink
figma.showUI(__html__, { width: 320, height: 320 });

// Function to create a Figma logo placeholder
async function createFigmaLogo(animationUrl: string) {
  // Create an SVG node
  const logo = figma.createNodeFromSvg('<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 16C16 13.7909 17.7909 12 20 12C22.2091 12 24 13.7909 24 16C24 18.2091 22.2091 20 20 20C17.7909 20 16 18.2091 16 16Z" fill="#1ABCFE"/><path d="M8 24C8 21.7909 9.79086 20 12 20H16V24C16 26.2091 14.2091 28 12 28C9.79086 28 8 26.2091 8 24Z" fill="#0ACF83"/><path d="M16 4V12H20C22.2091 12 24 10.2091 24 8C24 5.79086 22.2091 4 20 4H16Z" fill="#FF7262"/><path d="M8 8C8 10.2091 9.79086 12 12 12H16V4H12C9.79086 4 8 5.79086 8 8Z" fill="#F24E1E"/><path d="M8 16C8 18.2091 9.79086 20 12 20H16V12H12C9.79086 12 8 13.7909 8 16Z" fill="#A259FF"/></svg>');
  
  // Set hyperlink
  logo.setRelaunchData({ url: animationUrl });
  
  return logo;
}

// Handle messages from the UI
figma.ui.onmessage = async msg => {
  if (msg.type === 'create-figma-logo') {
    const animationUrl = msg.animationUrl || 'https://www.ripplix.com/animation/example';

    // Create the Figma logo with hyperlink
    const logo = await createFigmaLogo(animationUrl);
    
    // Add to current page
    figma.currentPage.appendChild(logo);
    
    // Create a text label
    const label = figma.createText();
    // Load the font before setting characters
    try {
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      label.characters = "View on Ripplix";
      label.fontSize = 12;
      label.x = logo.x + logo.width + 8;
      label.y = logo.y + (logo.height / 2) - 6;
      label.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
      
      // Add the text to the page
      figma.currentPage.appendChild(label);
      
      // Group the elements
      const group = figma.group([logo, label], figma.currentPage);
      
      // Select the group
      figma.currentPage.selection = [group];
      
      // Zoom to it
      figma.viewport.scrollAndZoomIntoView([group]);
    } catch (error) {
      // If font loading fails, just use the logo without the text
      console.error("Font loading failed:", error);
      
      // Select just the logo
      figma.currentPage.selection = [logo];
      
      // Zoom to it
      figma.viewport.scrollAndZoomIntoView([logo]);
    }
    
    // Notify the UI
    figma.ui.postMessage({ type: 'creation-success' });
  }
  
  if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
}; 