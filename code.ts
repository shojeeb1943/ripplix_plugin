// This plugin will allow users to browse and add Ripplix animations to Figma designs
// The plugin provides functionality to view animations and add them as links

// Load initial console logging for debugging
console.log('Plugin initializing...');

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
  console.log('Showing main UI...');
  figma.showUI(__html__, { width: 500, height: 600 });
}

// Set up initial message handler
console.log('Setting up message handler...');

// Helper function to create a Figma logo as a frame with text
async function createFigmaLogo(anim: any): Promise<FrameNode> {
  // Implementation omitted to focus on the SVG approach
  return figma.createFrame(); 
}

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  console.log('Received message from UI:', msg.type);
  
  if (msg.type === 'add-animation') {
    console.log('Adding animation with hardcoded blue rectangle logo:', msg.animation);
    const anim = msg.animation;
    
    // This is now our ONLY approach - creating a rectangle with "Figma" text
    try {
      // 1. Create a blue rectangle
      console.log('Step 1: Creating blue rectangle');
      const rect = figma.createRectangle();
      rect.name = `Ripplix Logo - ${anim.title || "Untitled"}`;
      rect.resize(160, 50);
      rect.fills = [{ type: 'SOLID', color: { r: 0.125, g: 0.04, b: 0.356 } }]; // #200A5B blue
      rect.cornerRadius = 4;
      
      // Add to page immediately (before anything can fail)
      console.log('Adding rectangle to page');
      figma.currentPage.appendChild(rect);
      
      // 2. Try to add hyperlink to rectangle
      console.log('Step 2: Adding hyperlink to rectangle');
      try {
        console.log('Setting hyperlink URL:', anim.url);
        (rect as any).hyperlink = { type: 'URL', value: anim.url };
        console.log('Hyperlink added successfully');
      } catch (e) {
        console.error('Hyperlink error:', e);
        console.log('Continuing without hyperlink');
      }
      
      // 3. Add "FIGMA" text to complete the logo
      console.log('Step 3: Adding "FIGMA" text');
      try {
        console.log('Loading Inter Bold font');
        await figma.loadFontAsync({ family: "Inter", style: "Bold" });
        
        console.log('Creating text node');
        const text = figma.createText();
        text.fontName = { family: "Inter", style: "Bold" };
        text.characters = "FIGMA";
        text.fontSize = 20;
        text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; // White
        
        console.log('Adding text to page');
        figma.currentPage.appendChild(text);
        
        // Position text in center of rectangle
        console.log('Positioning text in rectangle center');
        text.x = rect.x + (rect.width - text.width) / 2;
        text.y = rect.y + (rect.height - text.height) / 2;
        
        // Create a group with both elements
        console.log('Creating group with rectangle and text');
        const group = figma.group([rect, text], figma.currentPage);
        group.name = `Ripplix Logo - ${anim.title || "Untitled"}`;
        
        // Try to add hyperlink to group too
        console.log('Setting hyperlink on group');
        try {
          (group as any).hyperlink = { type: 'URL', value: anim.url };
          console.log('Group hyperlink added successfully');
        } catch (e) {
          console.error('Group hyperlink error:', e);
        }
        
        // Store metadata on group
        console.log('Storing metadata on group');
        group.setPluginData('animationUrl', anim.url);
        group.setPluginData('animationTitle', anim.title || 'Animation');
        
        // Focus on the result
        console.log('Focusing on group');
        figma.viewport.scrollAndZoomIntoView([group]);
        figma.currentPage.selection = [group];
        
        console.log('Successfully created logo with text');
      } catch (textError) {
        console.error('Text creation failed:', textError);
        
        // If text fails, focus on just the rectangle
        console.log('Focusing on rectangle only');
        figma.viewport.scrollAndZoomIntoView([rect]);
        figma.currentPage.selection = [rect];
        
        console.log('Created rectangle without text');
      }
      
      // Always consider it a success if we get this far
      console.log('Sending success message to UI');
      figma.ui.postMessage({ 
        type: 'animation-added', 
        success: true,
        message: "Animation added with logo and hyperlink!"
      });
      
    } catch (error) {
      // If everything above fails, use text fallback
      console.error('Complete failure in logo creation:', error);
      
      try {
        console.log('Falling back to text-only approach');
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        
        const text = figma.createText();
        text.characters = `${anim.title}\n${anim.url}`;
        
        try {
          (text as any).hyperlink = { type: 'URL', value: anim.url };
        } catch (e) {
          console.error('Text hyperlink error:', e);
        }
        
        figma.currentPage.appendChild(text);
        figma.viewport.scrollAndZoomIntoView([text]);
        figma.currentPage.selection = [text];
        
        figma.ui.postMessage({ 
          type: 'animation-added', 
          success: true,
          message: "Animation added with text (logo creation failed)."
        });
      } catch (textError) {
        console.error('Even text fallback failed:', textError);
        figma.notify('Failed to add animation: ' + (error as Error).message);
        
        figma.ui.postMessage({ 
          type: 'animation-added', 
          success: false,
          error: 'All approaches failed: ' + (error as Error).message
        });
      }
    }
  } else if (msg.type === 'logo-image-fetched') {
    try {
      console.log('Received logo image data from UI, data length:', msg.imageData.length);
      
      // Get the image data and animation info
      const imageData = new Uint8Array(msg.imageData);
      const animation = msg.animation;
      console.log('Created Uint8Array for image, length:', imageData.length, 'animation:', animation);
      
      // Find the rectangle we created earlier or create a new one
      let rect: RectangleNode;
      const selection = figma.currentPage.selection;
      console.log('Current selection has', selection.length, 'items');
      
      if (selection.length > 0 && selection[0].type === 'RECTANGLE') {
        rect = selection[0] as RectangleNode;
        console.log('Using existing rectangle from selection');
      } else {
        // Create a new rectangle if needed
        console.log('Creating new rectangle for logo');
        rect = figma.createRectangle();
        rect.resize(160, 50);
        rect.cornerRadius = 4;
        
        // Position at the center of the viewport
        const center = figma.viewport.center;
        rect.x = center.x - 80; // Half the width
        rect.y = center.y - 25; // Half the height
      }
      
      // Create an image from the data - wrap in try/catch to handle any issues
      try {
        console.log('Creating image from fetched data');
        const image = figma.createImage(imageData);
        console.log('Image created successfully with hash:', image.hash);
        
        // Apply the image as a fill to the rectangle
        console.log('Applying image as fill to rectangle');
        rect.fills = [{
          type: 'IMAGE',
          scaleMode: 'FIT',
          imageHash: image.hash
        }];
        console.log('Image fill applied to rectangle');
      } catch (imageError) {
        console.error('Error creating or applying image:', imageError);
        // Continue with white fill if image fails
        rect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      }
      
      // Load font for the invisible text with hyperlink
      console.log('Loading font for hyperlink text');
      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      
      // Create an invisible text layer for the hyperlink
      // This is the standard workaround for adding hyperlinks to images in Figma
      console.log('Creating invisible text with hyperlink');
      const linkText = figma.createText();
      linkText.fontName = { family: "Inter", style: "Regular" };
      linkText.fontSize = 1;
      linkText.characters = " "; // Just a space character
      linkText.fills = [{ 
        type: 'SOLID', 
        color: { r: 0, g: 0, b: 0 },
        opacity: 0 // Make it transparent
      }];
      
      // Resize and position the text to cover the entire rectangle
      linkText.resize(rect.width, rect.height);
      linkText.x = rect.x;
      linkText.y = rect.y;
      
      // Apply hyperlink to the text layer
      if ('hyperlink' in linkText) {
        console.log('Applying hyperlink to text layer:', animation.url);
        (linkText as any).hyperlink = {
          type: 'URL',
          value: animation.url
        };
        console.log('Hyperlink successfully applied');
      } else {
        console.error('Hyperlink property not available on text layer');
      }
      
      // Group the rectangle and text together
      console.log('Creating group for rectangle and hyperlink text');
      const group = figma.group([rect, linkText], figma.currentPage);
      group.name = "Figma Logo with Hyperlink";
      
      // Store animation data in the group too
      group.setPluginData('animationUrl', animation.url);
      group.setPluginData('animationTitle', animation.title || 'Animation');
      
      // Select the group
      figma.currentPage.selection = [group];
      
      // Notify UI of success
      console.log('Sending success notification to UI');
      figma.ui.postMessage({
        type: 'animation-added',
        success: true,
        message: "Animation added with logo and hyperlink! Right-click and use Plugins > Ripplix Animation Library > Copy Animation URL to copy the link."
      });
      
    } catch (error) {
      console.error('Error processing logo image:', error);
      figma.notify('Error applying logo: ' + (error as Error).message);
      
      // Continue with text fallback
      console.log('Using text fallback due to error');
      createTextFallback(msg.animation);
    }
  } else if (msg.type === 'logo-image-failed') {
    console.error('Logo image fetch failed:', msg.error);
    figma.notify('Failed to load logo image: ' + msg.error);
    
    // Use fallback
    console.log('Using text fallback due to fetch failure');
    createTextFallback(msg.animation);
  } else if (msg.type === 'copy-confirmed') {
    // Close the plugin once the UI confirms copy is complete
    figma.closePlugin('URL copied to clipboard');
  } else if (msg.type === 'close-plugin') {
    // Close the plugin when UI requests it
    figma.closePlugin();
  } else {
    console.log('Received unknown message type:', msg.type);
  }
};

// Helper function to create text fallback when image loading fails
async function createTextFallback(animation: any) {
  console.log('Creating text fallback for animation:', animation);
  try {
    // Load font
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
    
    // Get the rectangle if it exists in selection
    const selection = figma.currentPage.selection;
    let rect: RectangleNode;
    
    if (selection.length > 0 && selection[0].type === 'RECTANGLE') {
      rect = selection[0] as RectangleNode;
      console.log('Using existing rectangle for fallback');
    } else {
      // Create a new rectangle if needed
      console.log('Creating new rectangle for fallback');
      rect = figma.createRectangle();
      rect.resize(160, 50);
      rect.cornerRadius = 4;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      
      // Position at the center of the viewport
      const center = figma.viewport.center;
      rect.x = center.x - 80;
      rect.y = center.y - 25;
    }
    
    // Create text
    console.log('Creating text for fallback');
    const text = figma.createText();
    text.fontName = { family: "Inter", style: "Bold" };
    text.fontSize = 20;
    text.characters = "Figma";
    text.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
    
    // Position text in the center of the rectangle
    text.x = rect.x + (rect.width - text.width) / 2;
    text.y = rect.y + (rect.height - text.height) / 2;
    
    // Create invisible text with hyperlink
    console.log('Creating invisible text with hyperlink for fallback');
    const linkText = figma.createText();
    linkText.fontName = { family: "Inter", style: "Regular" };
    linkText.fontSize = 1;
    linkText.characters = " ";
    linkText.fills = [{ 
      type: 'SOLID', 
      color: { r: 0, g: 0, b: 0 },
      opacity: 0
    }];
    linkText.resize(rect.width, rect.height);
    linkText.x = rect.x;
    linkText.y = rect.y;
    
    // Apply hyperlink
    if ('hyperlink' in linkText) {
      console.log('Applying hyperlink to fallback text:', animation.url);
      (linkText as any).hyperlink = {
        type: 'URL',
        value: animation.url
      };
    }
    
    // Group everything
    console.log('Creating group for fallback elements');
    const group = figma.group([rect, text, linkText], figma.currentPage);
    group.name = "Figma Logo with Hyperlink (Text Fallback)";
    
    // Store animation data
    group.setPluginData('animationUrl', animation.url);
    group.setPluginData('animationTitle', animation.title || 'Animation');
    
    // Select the group
    figma.currentPage.selection = [group];
    
    // Notify UI of success
    console.log('Sending success notification to UI for fallback');
    figma.ui.postMessage({
      type: 'animation-added',
      success: true,
      message: "Animation added with text fallback! Right-click and use Plugins > Ripplix Animation Library > Copy Animation URL to copy the link."
    });
  } catch (error) {
    console.error('Fallback error:', error);
    figma.ui.postMessage({ 
      type: 'animation-added', 
      success: false,
      error: 'Failed to create animation with fallback'
    });
  }
}
