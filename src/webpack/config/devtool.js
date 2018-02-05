/* global GravConfig */

// DEVTOOL CONFIG
// ––––––––––––––––––––––

module.exports = () => {
  const devtool = GravConfig.dev ? 'cheap-module-eval-source-map' : 'source-map'

  return devtool
}
