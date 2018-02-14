/* global GravConfig WebpackerPath */

const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const WebpackNotifierPlugin = require('webpack-build-notifier')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const chalk = require('chalk')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const AssetsPlugin = require('assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

// PLUGINS CONFIG
// ––––––––––––––––––––––

module.exports = () => {
  let plugins = []

  // Common Plugins
  // ––––––––––––––––––––––

  // Better error feedback in the console
  plugins.push(new FriendlyErrorsWebpackPlugin())

  // Check for duplicate content
  plugins.push(new DuplicatePackageCheckerPlugin())

  // Support for webpack 3 scope hoisting
  if (GravConfig.prod) {
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin())
  }

  // Code splitting for Commons modules
  if (GravConfig.commons) {
    plugins.push(
      // Move modules used in multiple assets to a separate commons.js file in order to support long-term caching. This will avoid hash recreation for other files when only application files are changed
      new webpack.optimize.CommonsChunkPlugin({
        name: 'commons',
        filename: GravConfig.dev ? 'js/[name].js' : 'js/[name].[hash].js',
        minChunks: 2
      })
    )
  }

  // Code splitting for node_modules vendors
  if (GravConfig.vendors) {
    plugins.push(
      // Move node_modules vendors to a separate vendors.js file in order to support long-term caching. This will avoid hash recreation for other files when only application files are changed
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendors',
        filename: GravConfig.dev ? 'js/[name].js' : 'js/[name].[hash].js',
        minChunks: module => {
          // This prevents stylesheet resources with the .css .sass .scss extension from being moved from their original chunk to the vendor chunk
          if (module.resource && /^.*\.(css|sass|scss)$/.test(module.resource)) {
            return false
          }
          return module.context && module.context.indexOf('node_modules') !== -1
        }
      })
    )
  }

  // Code splitting for webpack runtime code
  if (GravConfig.manifest) {
    plugins.push(
      // Move modules used in multiple assets to a separate commons.js file in order to support long-term caching. This will avoid hash recreation for other files when only application files are changed
      new webpack.optimize.CommonsChunkPlugin({
        name: 'manifest',
        filename: GravConfig.dev ? 'js/[name].js' : 'js/[name].[hash].js',
        minChunks: Infinity
      })
    )
  }

  // Provide Styletint support
  plugins.push(new StyleLintPlugin())

  // Plugin to extract S|A|CSS code from JS
  plugins.push(
    new ExtractTextPlugin({
      filename: 'css/[name].[contenthash].css',
      disable: GravConfig.dev,
      allChunks: true
    })
  )

  // Provide OS Notifier
  if (GravConfig.osNotify) {
    plugins.push(
      new WebpackNotifierPlugin({
        title: GravConfig.appName,
        sound: GravConfig.osNotifySound,
        logo: path.resolve(WebpackerPath, 'img/logo.png'),
        successIcon: path.resolve(WebpackerPath, 'img/success.png'),
        warningIcon: path.resolve(WebpackerPath, 'img/warning.png'),
        failureIcon: path.resolve(WebpackerPath, 'img/failure.png'),
        compileIcon: path.resolve(WebpackerPath, 'img/compile.png')
      })
    )
  }

  // Create a server with a Bundle Analyzer
  if (GravConfig.openBundleAnalyzer) {
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerHost: 'localhost',
        analyzerPort: GravConfig.bundleAnalyzerPort,
        logLevel: 'silent'
      })
    )
  }

  // Development plugins
  // ––––––––––––––––––––––

  if (GravConfig.dev) {
    plugins.push(
      // enable HMR globally
      new webpack.HotModuleReplacementPlugin(),

      // Prints more readable module names in the browser console on HMR updates
      new webpack.NamedModulesPlugin()
    )
  }

  // Production plugins
  // ––––––––––––––––––––––

  if (GravConfig.prod) {
    plugins.push(
      // Progress bar plugin for console
      new ProgressBarPlugin({
        format: `  ${chalk.green.bold('BUILD')} ${chalk.yellow('█:bar█')} ${chalk.green.bold(':percent')} ${chalk.bold('(:elapsed seconds)')}`,
        complete: '█',
        incomplete: '░',
        clear: true
      }),

      // Cleanup dist folder before saving new build
      new CleanWebpackPlugin(['*'], {
        root: GravConfig.outputPath,
        beforeEmit: true,
        verbose: false
      }),

      // Will cause hashes to be based on the relative path of the module, generating a four character string as the module id
      new webpack.HashedModuleIdsPlugin(),

      // Minify JS
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
        uglifyOptions: {
          ecma: 6,
          compress: {
            drop_console: true
          },
          output: {
            beautify: false,
            comments: false
          }
        }
      }),

      // Ganerate webpacker.json file that contain path reference to all builded assets
      new AssetsPlugin({
        filename: 'webpacker.json',
        path: GravConfig.outputPath
      }),

      // Stop build if on error
      new webpack.NoEmitOnErrorsPlugin()
    )
  }

  return plugins
}
