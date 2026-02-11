#!/bin/bash

# Build script for Google Meet Layout Switcher
# Creates separate zip packages for Chrome Web Store, Firefox Add-ons,
# Edge Add-ons, Safari, and Tampermonkey

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
echo "Building Edge extension..."
# Create Edge package (Chromium-based, identical to Chrome MV3)
EDGE_BUILD="$BUILD_DIR/edge-build"
mkdir -p "$EDGE_BUILD/icons"

cp "$SCRIPT_DIR/edge/manifest.json" "$EDGE_BUILD/"
cp "$SCRIPT_DIR/content.js" "$EDGE_BUILD/"
cp "$SHARED_DIR/icons/"*.png "$EDGE_BUILD/icons/"

cd "$EDGE_BUILD"
zip -r "$BUILD_DIR/google-meet-layout-switcher-edge.zip" . -x "*.DS_Store"
echo "✓ Edge package: dist/google-meet-layout-switcher-edge.zip"

echo ""
echo "Building Safari extension..."
# Create Safari build directory
SAFARI_BUILD="$BUILD_DIR/safari-build"
mkdir -p "$SAFARI_BUILD/icons"

cp "$SCRIPT_DIR/safari/manifest.json" "$SAFARI_BUILD/"
cp "$SCRIPT_DIR/content.js" "$SAFARI_BUILD/"
cp "$SHARED_DIR/icons/"*.png "$SAFARI_BUILD/icons/"

# Check if we can convert to Xcode project (macOS only)
if command -v xcrun &> /dev/null; then
    echo "  Converting to Safari Web Extension Xcode project..."
    xcrun safari-web-extension-converter "$SAFARI_BUILD" \
        --project-location "$BUILD_DIR/safari-xcode" \
        --app-name "Google Meet Layout Switcher" \
        --bundle-identifier "com.agergec.google-meet-layout-switcher" \
        --no-open \
        --no-prompt 2>/dev/null && \
    echo "✓ Safari Xcode project: dist/safari-xcode/" || \
    echo "⚠ Safari converter failed. Manual steps:"
else
    echo "⚠ xcrun not available. To build for Safari:"
fi
echo "  1. Open Xcode"
echo "  2. File → New → Project → Safari Extension App"
echo "  3. Copy dist/safari-build/ contents into the extension resources"
echo "✓ Safari build files: dist/safari-build/"

echo ""
echo "Building Tampermonkey userscript..."
# Generate userscript by concatenating header + content.js
cat "$SCRIPT_DIR/tampermonkey/header.txt" "$SCRIPT_DIR/content.js" > "$BUILD_DIR/google-meet-layout-switcher.user.js"
echo "✓ Tampermonkey script: dist/google-meet-layout-switcher.user.js"

echo ""
echo "Build complete!"
echo ""
echo "To submit:"
echo "  Chrome Web Store:  https://chrome.google.com/webstore/devconsole"
echo "  Firefox Add-ons:   https://addons.mozilla.org/developers/"
echo "  Edge Add-ons:      https://partner.microsoft.com/dashboard/microsoftedge"
echo "  Safari:            Submit via Xcode → App Store Connect"
echo "  Tampermonkey:      Install dist/google-meet-layout-switcher.user.js directly"
