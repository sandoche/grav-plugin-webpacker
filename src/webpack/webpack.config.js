/* global GravConfig */

// Webpack
const devtoolConfig = require('./config/devtool')
const resolveConfig = require('./config/resolve')
const modulesConfig = require('./config/modules')
const pluginsConfig = require('./config/plugins')

// WEBPACK CONFIG
// ––––––––––––––––––––––

const WebpackConfig = {
  // Turns OFF error when hints are found (an asset is over 250kb)
  performance: {
    hints: false
  },

  // List of input assets
  entry: GravConfig.entry,

  // Assets output configuration
  output: {
    path: GravConfig.outputPath,
    filename: GravConfig.dev ? 'js/[name].js' : 'js/[name].[hash].js',
    chunkFilename: GravConfig.dev ? 'js/chunk_[name].js' : 'js/chunk_[name].[chunkhash].js',
    publicPath: GravConfig.dev ? '/assets/' : GravConfig.publicPath
  },

  // Source maps configuration
  devtool: devtoolConfig(),

  // Modules resolving configuration
  resolve: resolveConfig(),

  // Modules configuration
  module: modulesConfig(),

  // Plugins configuration
  plugins: pluginsConfig()
}

module.exports = WebpackConfig
