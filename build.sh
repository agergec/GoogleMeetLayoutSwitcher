#!/bin/bash

# Build script for Google Meet Layout Switcher
# Creates separate zip packages for Chrome Web Store and Firefox Add-ons

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/dist"
SHARED_DIR="$SCRIPT_DIR/shared"

# Clean and create build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

echo "Building Chrome extension..."
# Create Chrome package
CHROME_BUILD="$BUILD_DIR/chrome-build"
mkdir -p "$CHROME_BUILD/icons"

cp "$SCRIPT_DIR/chrome/manifest.json" "$CHROME_BUILD/"
cp "$SCRIPT_DIR/content.js" "$CHROME_BUILD/"
cp "$SHARED_DIR/icons/"*.png "$CHROME_BUILD/icons/"

cd "$CHROME_BUILD"
zip -r "$BUILD_DIR/google-meet-layout-switcher-chrome.zip" . -x "*.DS_Store"
echo "✓ Chrome package: dist/google-meet-layout-switcher-chrome.zip"

echo ""
echo "Building Firefox extension..."
# Create Firefox package
FIREFOX_BUILD="$BUILD_DIR/firefox-build"
mkdir -p "$FIREFOX_BUILD/icons"

cp "$SCRIPT_DIR/firefox/manifest.json" "$FIREFOX_BUILD/"
cp "$SCRIPT_DIR/content.js" "$FIREFOX_BUILD/"
cp "$SHARED_DIR/icons/"*.png "$FIREFOX_BUILD/icons/"

cd "$FIREFOX_BUILD"
zip -r "$BUILD_DIR/google-meet-layout-switcher-firefox.zip" . -x "*.DS_Store"
echo "✓ Firefox package: dist/google-meet-layout-switcher-firefox.zip"

echo ""
echo "Copying Tampermonkey userscript..."
# Copy Tampermonkey userscript to dist
cp "$SCRIPT_DIR/tampermonkey/google-meet-layout-switcher.user.js" "$BUILD_DIR/"
echo "✓ Tampermonkey script: dist/google-meet-layout-switcher.user.js"

echo ""
echo "Build complete!"
echo ""
echo "To submit:"
echo "  Chrome Web Store: https://chrome.google.com/webstore/devconsole"
echo "  Firefox Add-ons:  https://addons.mozilla.org/developers/"
echo "  Tampermonkey:      Install dist/google-meet-layout-switcher.user.js directly"
