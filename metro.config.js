const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper handling of font files and assets
config.resolver.assetExts.push('ttf', 'otf', 'woff', 'woff2');

// Add support for API routes
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

module.exports = config;