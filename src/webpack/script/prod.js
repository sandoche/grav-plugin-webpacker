/* global GravConfig */

const webpack = require('webpack')
const WebpackConfig = require(`../webpack.config`)
const opn = require('opn')

// PROD SCRIPT
// ––––––––––––––––––––––

// Define prod compiler
const prodCompiler = webpack(WebpackConfig)

// Build Callback
const buildCallback = (error, stats) => {
  // Handle errors
  if (error) throw error

  // Output build info in the console
  process.stdout.write(
    `${stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
      version: false,
      hash: false,
      timings: false,
      excludeAssets: /\.map$/
    })}\n`
  )

  // If open website is enabled
  if (GravConfig.openWebsite) {
    // open website
    opn(GravConfig.proxy).then(
      (() => {
        // If Bundle Analyzer is not enabled kill node process
        if (!GravConfig.openBundleAnalyzer) process.exit()
      })()
    )
  } else {
    // Kill node process
    process.exit()
  }
}

// Init Webpack build process
module.exports = () => prodCompiler.run(buildCallback)
