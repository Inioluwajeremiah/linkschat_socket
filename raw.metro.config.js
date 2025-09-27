// // const { getDefaultConfig } = require("metro-config");

// // module.exports = (async () => {
// //   const {
// //     resolver: { sourceExts, assetExts },
// //   } = await getDefaultConfig();

// //   return {
// //     transformer: {
// //       babelTransformerPath: require.resolve("react-native-svg-transformer"),
// //       getTransformOptions: async () => ({
// //         transform: {
// //           experimentalImportSupport: false,
// //           inlineRequires: true,
// //         },
// //       }),
// //     },
// //     resolver: {
// //       assetExts: assetExts.filter((ext) => ext !== "svg"),
// //       sourceExts: [...sourceExts, "svg"],
// //     },
// //   };
// // })();

// // const { getDefaultConfig } = require("expo/metro-config");

// // module.exports = (() => {
// //   const config = getDefaultConfig(__dirname);

// //   const { transformer, resolver } = config;

// //   config.transformer = {
// //     ...transformer,
// //     babelTransformerPath: require.resolve("react-native-svg-transformer"),
// //   };
// //   config.resolver = {
// //     ...resolver,
// //     assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
// //     sourceExts: [...resolver.sourceExts, "svg"],
// //   };

// //   return config;
// // })();

// // const { getDefaultConfig } = require("@expo/metro-config");

// // const config = getDefaultConfig(__dirname);

// // config.transformer.babelTransformerPath = require.resolve(
// //   "react-native-svg-transformer"
// // );
// // config.resolver.assetExts = config.resolver.assetExts.filter(
// //   (ext) => ext !== "svg"
// // );
// // config.resolver.sourceExts.push("svg");

// // module.exports = config;

// // metro.config.js
// const { getDefaultConfig } = require("@expo/metro-config");

// const config = getDefaultConfig(__dirname);

// // Extend asset and source extensions correctly
// config.resolver.assetExts = config.resolver.assetExts.filter(
//   (ext) => ext !== "svg"
// );
// config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

// config.transformer = {
//   ...config.transformer,
//   babelTransformerPath: require.resolve("react-native-svg-transformer"),
// };

// module.exports = config;
