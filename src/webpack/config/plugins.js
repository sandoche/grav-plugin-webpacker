/* global GravConfig WebpackerPath */

// Webpack
const webpack = require('webpack')

// Tools libraries
const path = require('path')
const chalk = require('chalk')

// Plugins libraries
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const WebpackNotifierPlugin = require('webpack-build-notifier')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const JarvisPlugin = require('webpack-jarvis')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const WebpackAssetsManifest = require('webpack-assets-manifest')

// PLUGINS CONFIG
// ––––––––––––––––––––––

module.exports = () => {
  let plugins = []

  // Development plugins
  // ––––––––––––––––––––––

  if (GravConfig.dev) {
    plugins.push(
      // enable HMR globally
      new webpack.HotModuleReplacementPlugin()
    )
  }

  // Production plugins
  // ––––––––––––––––––––––

  if (GravConfig.prod) {
    plugins.push(
      // Terminal Progress bar
      new ProgressBarPlugin({
        format: `  ${chalk.green.bold('BUILD')} ${chalk.yellow('█:bar█')} ${chalk.green.bold(':percent')} ${chalk.bold('(:elapsed seconds)')}`,
        complete: '█',
        incomplete: '░',
        clear: true
      }),

      // Support for webpack 3 scope hoisting
      new webpack.optimize.ModuleConcatenationPlugin(),

      // Will cause hashes to be based on the relative path of the module, generating a four character string as the module id
      new webpack.HashedModuleIdsPlugin(),

      // Plugin to extract S|A|CSS code from JS
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
        chunkFilename: 'css/[id].[contenthash].css'
      }),

      // Cleanup dist folder before saving new build
      new CleanWebpackPlugin(['*'], {
        root: GravConfig.outputPath,
        beforeEmit: true,
        verbose: false,
        exclude: ['.gitkeep']
      }),

      // Ganerate webpacker.json file that contain path reference to all builded assets
      new WebpackAssetsManifest({
        output: 'webpacker.json',
        publicPath: true,
        transform (assets, manifest) {
          const date = new Date()
            .toISOString()
            .replace(/T/, ' ')
            .replace(/\..+/, '')

          // Theme infos
          const { key, value } = manifest.hooks.customize.call({
            key: '___BUILD_INFORMATIONS___',
            value: {
              date: date,
              theme: `${GravConfig.themeName} - v${GravConfig.themeVersion}`,
              description: GravConfig.themeDescription
            }
          })

          assets[key] = value
        },
        customize (entry, original, manifest, asset) {
          // Prevent adding sourcemap to the manifest
          if (entry.key.toLowerCase().endsWith('.map')) {
            return false
          }
        }
      })
    )
  }

  // Common Plugins
  // ––––––––––––––––––––––

  // Better error feedback in the console
  plugins.push(new FriendlyErrorsWebpackPlugin())

  // Provide Styletint support
  plugins.push(new StyleLintPlugin())

  // Provide access to environment from assets
  plugins.push(
    new webpack.DefinePlugin({
      WEBPACKER_DEV: GravConfig.dev,
      WEBPACKER_PROD: GravConfig.prod
    })
  )

  // Provide OS Notification
  if (GravConfig.osNotify) {
    plugins.push(
      new WebpackNotifierPlugin({
        title: GravConfig.appName,
        sound: GravConfig.osNotifySound,
        suppressCompileStart: false,
        logo: path.resolve(WebpackerPath, 'img/logo.png'),
        successIcon: path.resolve(WebpackerPath, 'img/success.png'),
        warningIcon: path.resolve(WebpackerPath, 'img/warning.png'),
        failureIcon: path.resolve(WebpackerPath, 'img/failure.png'),
        compileIcon: path.resolve(WebpackerPath, 'img/compile.png')
      })
    )
  }

  // Create a server with Jarvis Webpack Dashboard
  if (GravConfig.openJarvis) {
    plugins.push(
      new JarvisPlugin({
        port: GravConfig.jarvisPort,
        keepAlive: true
      })
    )
  }

  // Create a server with Bundle Analyzer
  if (GravConfig.openBundleAnalyzer) {
    plugins.push(
      new BundleAnalyzerPlugin({
        analyzerHost: 'localhost',
        analyzerPort: GravConfig.bundleAnalyzerPort,
        logLevel: 'silent'
      })
    )
  }

  return plugins
}
