/* global GravConfig */

// Plugins libraries
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// OPTIMIZATION CONFIG
// ––––––––––––––––––––––

module.exports = () => {
  const optimization = {
    // Code splitting for Commons modules
    // Code splitting for webpack runtime code
    // Move modules used in multiple assets to a separate commons.js file in order to support long-term caching. This will avoid hash recreation for other files when only application files are changed
    runtimeChunk: {
      name: 'manifest'
    },
    splitChunks: {
      cacheGroups: {
        // Move modules used in multiple assets to a separate commons.js file in order to support long-term caching. This will avoid hash recreation for other files when only application files are changed
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2
          // filename: GravConfig.dev ? 'js/[name].js' : 'js/[name].[hash].js'
        },
        // Code splitting for node_modules vendors
        // Move node_modules vendors to a separate vendors.js file in order to support long-term caching. This will avoid hash recreation for other files when only application files are changed
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
          // filename: GravConfig.dev ? 'js/[name].js' : 'js/[name].[hash].js'
        }
      }
    }
  }

  // Minify JS
  if (GravConfig.prod) {
    optimization.minimizer = [
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
      })
    ]
  }

  return optimization
}
