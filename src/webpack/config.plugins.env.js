const webpack = require('webpack');

const envVariables = ({
  isProd = false,
  pathPrefix = '',
  mode,
  algolia = {},
  hasGdprBanner = false,
  hasFooter = false,
  hasVersionSwitcher = false,
  hasDesignGuidelines = false,
  sideNavItems = [],
  topNavItems = []
} = {}) =>
  new webpack.DefinePlugin({
    // 'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.pathPrefix': JSON.stringify(isProd ? pathPrefix : ''),
    'process.env.algolia': JSON.stringify(algolia),
    'process.env.hasGdprBanner': JSON.stringify(hasGdprBanner),
    'process.env.hasFooter': JSON.stringify(hasFooter),
    'process.env.hasVersionSwitcher': JSON.stringify(hasVersionSwitcher),
    'process.env.hasDesignGuidelines': JSON.stringify(hasDesignGuidelines),
    'process.env.sideNavItems': JSON.stringify(sideNavItems),
    'process.env.topNavItems': JSON.stringify(topNavItems),
    'process.env.routes': JSON.stringify(['one', 'two', 'three']),
    'process.env.routes2': ['one', 'two', 'three'],
    'process.env.prnum': JSON.stringify(
      process.env.CIRCLE_PR_NUMBER || process.env.PR_NUMBER || ''
    ),
    'process.env.prurl': JSON.stringify(process.env.CIRCLE_PULL_REQUEST || '')
  });

module.exports = {
  envVariables
};
