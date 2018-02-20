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

  // If enabled open website then kill node process else just fill node process
  if (GravConfig.openWebsite) opn(GravConfig.proxy).then(process.exit())
  else process.exit()
}

// Init Webpack build process
module.exports = () => prodCompiler.run(buildCallback)
