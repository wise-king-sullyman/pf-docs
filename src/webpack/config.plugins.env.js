const webpack = require('webpack');

const envVariables = ({
  isProd = false,
  pathPrefix = '',
  algolia = {},
  hasGdprBanner = false,
  hasFooter = false,
  hasVersionSwitcher = false,
  hasDesignGuidelines = false,
  hasPrerender = false
} = {}) =>
  new webpack.DefinePlugin({
    'process.env.pathPrefix': JSON.stringify(isProd ? pathPrefix : ''),
    'process.env.algolia': JSON.stringify(algolia),
    'process.env.hasGdprBanner': JSON.stringify(hasGdprBanner),
    'process.env.hasFooter': JSON.stringify(hasFooter),
    'process.env.hasVersionSwitcher': JSON.stringify(hasVersionSwitcher),
    'process.env.hasDesignGuidelines': JSON.stringify(hasDesignGuidelines),
    'process.env.prnum': JSON.stringify(
      process.env.CIRCLE_PR_NUMBER || process.env.PR_NUMBER || ''
    ),
    'process.env.prurl': JSON.stringify(process.env.CIRCLE_PULL_REQUEST || ''),
    'process.env.PRERENDER': hasPrerender
  });

module.exports = {
  envVariables
};
