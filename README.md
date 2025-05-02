# Ripplix Animation Library Figma Plugin

A Figma plugin that provides Figma users access to Ripplix's curated library of UI animations, micro-interactions, and interaction flows.

## Features

- Browse Ripplix's animation library directly within Figma
- Search and filter animations by platform, interaction type, and more
- Preview animations before adding them to your design
- Add animations as links to the Ripplix website

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org) (v14 or newer recommended)
- [Figma Desktop App](https://www.figma.com/downloads/)

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the plugin:
   ```
   npm run build
   ```

### Development Mode

For development with hot reloading:
```
npm run dev
```

### Troubleshooting PowerShell Execution Policy

If you encounter this error:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Use one of these solutions:

1. **Temporary Solution**: Run PowerShell as Administrator and execute:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   Then run your npm commands in the same window.

2. **Permanent Solution**: Run PowerShell as Administrator and execute:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
   This will allow you to run npm scripts without issues.

### Alternative: Manual Build

If you can't resolve the PowerShell issue, you can manually copy the updated JavaScript files:

1. Copy the contents of the `src` directory to your plugin directory
2. In Figma, use the "Import plugin from manifest" option and select the manifest.json file

## Loading the Plugin in Figma

1. Open the Figma desktop app
2. Create a new file or open an existing one
3. Right-click and select "Plugins" > "Development" > "Import plugin from manifest..."
4. Navigate to this project directory and select the `manifest.json` file

## Using the Plugin

1. In Figma, click on "Plugins" > "Ripplix Animation Library"
2. Browse or search for animations
3. Click "Add to Figma" to add an animation to your design
4. The animation will be added as a Ripplix logo with a hyperlink to the full animation

To copy the animation URL of an inserted animation:
1. Select the animation frame in Figma
2. Right-click and select "Plugins" > "Ripplix Animation Library" > "Copy Animation URL"

## API Integration

The plugin retrieves animations from the Ripplix WordPress REST API at:
```
https://www.ripplix.com/wp-json/ripplix/v1/animations/
```

## License

MIT
