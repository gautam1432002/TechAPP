const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add 'mjs' to explicitly support packages like lucide-react-native
config.resolver.sourceExts.unshift('mjs');

module.exports = config;
