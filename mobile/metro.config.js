const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite web worker imports .wasm directly — Metro needs it as an asset
config.resolver.assetExts.push('wasm');

module.exports = config;
