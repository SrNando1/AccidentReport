const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.assetExt = config.resolver.assetExt || [];
config.resolver.sourceExt = config.resolver.sourceExt || [];

if (!config.resolver.assetExt.includes("pdf")) {
  config.resolver.assetExt.push("pdf");
}

module.exports = config;
