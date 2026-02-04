# Google Meet Layout Switcher

A browser extension that adds a quick layout switcher button to Google Meet's call controls bar.

![Chrome](https://img.shields.io/badge/Chrome-MV3-green)
![Firefox](https://img.shields.io/badge/Firefox-MV2-orange)

## Features

- **Quick Access**: Layout button integrated directly into the call controls bar
- **One-Click Switching**: Switch layouts without navigating through menus
- **All Layouts Supported**:
  - Auto (dynamic)
  - Tiled (legacy)
  - Spotlight
  - Sidebar
- **Native Look**: Matches Google Meet's design language

## Installation

### Chrome Web Store
*Coming soon*

### Firefox Add-ons
*Coming soon*

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
4. Click "This Firefox" → "Load Temporary Add-on"
5. Select `dist/firefox-build/manifest.json`

## Usage

1. Join a Google Meet call
2. Look for the layout button (grid icon) on the left side of the call controls
3. Click to see layout options
4. Select your preferred layout

## Building

```bash
./build.sh
```

This creates two packages in `dist/`:
- `google-meet-layout-switcher-chrome.zip` - For Chrome Web Store
- `google-meet-layout-switcher-firefox.zip` - For Firefox Add-ons

## Project Structure

```
├── content.js          # Main extension code
├── build.sh            # Build script
├── chrome/
│   └── manifest.json   # Chrome MV3 manifest
├── firefox/
│   └── manifest.json   # Firefox MV2 manifest
├── shared/
│   └── icons/          # Extension icons
└── dist/               # Build output
```

## Privacy

This extension:
- Does NOT collect any user data
- Does NOT make any external network requests
- Only runs on `meet.google.com`
- Only interacts with the Google Meet UI to change layouts

## License

MIT License
