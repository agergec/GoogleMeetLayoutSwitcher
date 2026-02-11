# Google Meet Layout Switcher

A browser extension that adds a quick layout switcher button to Google Meet's call controls bar.

![Chrome](https://img.shields.io/badge/Chrome-MV3-green)
![Firefox](https://img.shields.io/badge/Firefox-MV2-orange)
![Edge](https://img.shields.io/badge/Edge-MV3-blue)
![Safari](https://img.shields.io/badge/Safari-MV3-lightgrey)
![Tampermonkey](https://img.shields.io/badge/Tampermonkey-userscript-yellow)

## Features

- **Quick Access**: Layout button integrated directly into the call controls bar
- **One-Click Switching**: Switch layouts without navigating through menus
- **All Layouts Supported**:
  - Auto (dynamic)
  - Tiled (legacy)
  - Spotlight
  - Sidebar
- **Native Look**: Matches Google Meet's design language with SVG icons
- **Dark & Light Theme**: Automatically adapts to your Google Meet theme
- **Multi-Language Support**: Works with Google Meet in English, German, Spanish, French, Turkish, Italian, Portuguese, Dutch, Japanese, Korean, and Chinese

## Installation

### Chrome Web Store
*Coming soon*

### Firefox Add-ons
[Firefox Add-On URL](https://addons.mozilla.org/tr/firefox/addon/google-meet-layout-switcher/)

### Edge Add-ons
*Coming soon*

### Safari
*Coming soon*

### Tampermonkey
Install the userscript directly from `dist/google-meet-layout-switcher.user.js`

### Manual Installation

#### Chrome
1. Download or clone this repository
2. Run `./build.sh` to create packages
3. Open `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the `dist/chrome-build` folder

#### Firefox
1. Download or clone this repository
2. Run `./build.sh` to create packages
3. Open `about:debugging`
4. Click "This Firefox" -> "Load Temporary Add-on"
5. Select `dist/firefox-build/manifest.json`

#### Edge
1. Download or clone this repository
2. Run `./build.sh` to create packages
3. Open `edge://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the `dist/edge-build` folder

#### Safari
1. Download or clone this repository
2. Run `./build.sh` to create packages
3. If Xcode is available, an Xcode project will be generated at `dist/safari-xcode/`
4. Otherwise, use `dist/safari-build/` with Xcode's Safari Extension App template

## Usage

1. Join a Google Meet call
2. Look for the layout button (grid icon) on the left side of the call controls
3. Click to see layout options
4. Select your preferred layout

## Debug Mode

To enable debug logging, open the browser console on a Google Meet page and run:

```js
localStorage.setItem('gm-layout-debug', '1');
```

You will see `[GMLayout]` prefixed log messages in the console. To disable:

```js
localStorage.removeItem('gm-layout-debug');
```

## Building

```bash
./build.sh
```

This creates packages in `dist/`:
- `google-meet-layout-switcher-chrome.zip` - For Chrome Web Store
- `google-meet-layout-switcher-firefox.zip` - For Firefox Add-ons
- `google-meet-layout-switcher-edge.zip` - For Edge Add-ons
- `safari-build/` - Safari extension files (Xcode project if available)
- `google-meet-layout-switcher.user.js` - Tampermonkey userscript

## Project Structure

```
├── content.js              # Main extension code (shared across all platforms)
├── build.sh                # Build script
├── chrome/
│   └── manifest.json       # Chrome MV3 manifest
├── firefox/
│   └── manifest.json       # Firefox MV2 manifest
├── edge/
│   └── manifest.json       # Edge MV3 manifest
├── safari/
│   └── manifest.json       # Safari MV3 manifest
├── tampermonkey/
│   ├── header.txt          # Userscript metadata header
│   └── google-meet-layout-switcher.user.js  # Complete userscript
├── shared/
│   └── icons/              # Extension icons
└── dist/                   # Build output
```

## Privacy

This extension:
- Does NOT collect any user data
- Does NOT make any external network requests
- Only runs on `meet.google.com`
- Only interacts with the Google Meet UI to change layouts

## License

MIT License
