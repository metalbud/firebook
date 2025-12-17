/**
 * metro.config.js
 * For Expo projects, we use expo/metro-config to customize defaults.
 */

const { getDefaultConfig } = require("expo/metro-config");
const exclusionList = require("metro-config/src/defaults/exclusionList");

const defaultConfig = getDefaultConfig(__dirname);

// Use blockList (formerly blacklistRE) to exclude specific files
defaultConfig.resolver.blockList = exclusionList([/PickerWindows\.js/]);

module.exports = defaultConfig;
