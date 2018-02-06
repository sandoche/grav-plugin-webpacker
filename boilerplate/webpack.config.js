const path = require('path')
const webpacker = require('grav-plugin-webpacker')

// Your entry files (put them all in user/active_theme/src)
const entryFiles = ['scss/entry/app.scss', 'js/entry/app.js']

// The path to Grav USER folder
const userPath = path.resolve(__dirname, '../../')

// Init Webpacker
webpacker(entryFiles, userPath)
