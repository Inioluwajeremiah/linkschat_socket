const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// @ points to the root of the project
config.resolver.alias = {
  "@": "./src",
};

module.exports = config;
