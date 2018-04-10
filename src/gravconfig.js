// Tools libraries
const zipObject = require('lodash/zipObject')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const cli = require('yargs').argv

// HELPERS
// ––––––––––––––––––––––

const parseYaml = (userPath, yamlFile) => {
  const configPath = `${userPath}/config`
  const yamlPath = path.resolve(configPath, yamlFile)
  const yamlContents = fs.readFileSync(yamlPath, 'utf8')

  return yaml.load(yamlContents)
}

const uriEncode = object => {
  return encodeURIComponent(JSON.stringify(object))
}

const prependPath = (destination, pathsArray) => {
  const newPaths = []

  for (let i = 0; i < pathsArray.length; i++) {
    const oldPath = pathsArray[i]
    const newPath = path.resolve(destination, oldPath)

    newPaths[i] = newPath
  }

  return newPaths
}

// GRAV CONFIG
// ––––––––––––––––––––––

class GravConfig {
  // GravConfig constructor
  constructor (entryFiles, userPath) {
    // Grav Webpacker plugin config
    const plugin = parseYaml(userPath, 'plugins/webpacker.yaml')

    // Grav system config
    const system = parseYaml(userPath, 'system.yaml')

    // Active theme
    const activeTheme = system.pages.theme

    // Path
    const _outputPath = path.resolve(userPath, `themes/${activeTheme}/assets`)
    const _publicPath = `/user/themes/${activeTheme}/assets/`

    // Assets entry
    const _entry = (() => {
      const sourcePath = path.resolve(userPath, `themes/${activeTheme}/src`)
      const entriesName = []
      const entriesPath = []
      const entries = prependPath(sourcePath, entryFiles)

      for (let i = 0; i < entries.length; i++) {
        const entryPath = entries[i]
        const entryExtension = path.extname(entryPath)

        entriesName[i] = path.basename(entryPath, entryExtension)
        entriesPath[i] = [entryPath]
      }

      return zipObject(entriesName, entriesPath)
    })()

    // Mode
    const webpackerMode = cli.mode ? cli.mode : plugin.mode
    const _dev = webpackerMode === 'development'
    const _prod = webpackerMode === 'production'

    // Development server
    const _proxy = plugin.proxy
    const _https = plugin.https
    const _httpModule = _https ? 'spdy' : null
    const _tunnel = plugin.tunnel
    const _consoleDisplayError = plugin.console_display.error
    const _consoleDisplayWarning = plugin.console_display.warning
    const _overlayDisplayError = plugin.overlay_display.error
    const _overlayDisplayWarning = plugin.overlay_display.warning

    // Overlay styles
    const overlayThemeColor = plugin.overlay_theme

    const overlayTheme = {
      dark: {
        background: '#1D1D26',
        color: '#CCCCCC'
      },
      light: {
        background: '#F9F9F9',
        color: '#1D1D26'
      }
    }

    const _overlayColors = uriEncode({
      reset: ['transparent', 'transparent'],
      black: '181818',
      red: 'E36049',
      green: 'B3CB74',
      yellow: 'FFD080',
      blue: '7CAFC2',
      magenta: '7FACCA',
      cyan: 'C3C2EF',
      lightgrey: 'EBE7E3',
      darkgrey: '6D7891'
    })

    const _overlayStyles = uriEncode({
      background: overlayTheme[overlayThemeColor].background,
      color: overlayTheme[overlayThemeColor].color,
      lineHeight: '20px',
      whiteSpace: 'pre',
      fontFamily: 'Menlo, Consolas, monospace',
      fontSize: '13px',
      position: 'fixed',
      zIndex: 9999999,
      padding: '15px',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      overflow: 'auto',
      dir: 'ltr',
      textAlign: 'left'
    })

    // Web browser
    const _openWebsite = plugin.open_website
    const _openUrl = plugin.open_url

    // Tools
    const _openBrowserSyncUI = plugin.open_browsersyncui
    const _openBundleAnalyzer = plugin.open_bundleanalyzer
    const _openJarvis = plugin.open_jarvis

    // Notifications
    const _osNotify = plugin.os_notify
    const _osNotifySound = plugin.os_notify_sound ? 'Submarine' : false
    const _browserSyncNotify = plugin.browsersync_notify

    // Code splitting
    const _manifest = plugin.manifest
    const _vendors = plugin.vendors
    const _commons = plugin.commons

    // Devtools
    const _devSourceMaps = plugin.dev_sourcemaps
    const _prodSourceMaps = plugin.prod_sourcemaps

    // Browsersync file to refresh
    const _filesToRefresh = prependPath(userPath, ['pages/**/*.md', `themes/${activeTheme}/templates/**/*.twig`])

    // Return Config array
    return {
      appName: 'webpacker',
      entry: _entry,
      mode: webpackerMode,
      dev: _dev,
      prod: _prod,
      proxy: _proxy,
      serverPort: 3001,
      browserSyncPort: 3002,
      bundleAnalyzerPort: 3003,
      jarvisPort: 3004,
      https: _https,
      httpModule: _httpModule,
      tunnel: _tunnel,
      outputPath: _outputPath,
      publicPath: _publicPath,
      openWebsite: _openWebsite,
      openUrl: _openUrl,
      consoleDisplayError: _consoleDisplayError,
      consoleDisplayWarning: _consoleDisplayWarning,
      overlayDisplayError: _overlayDisplayError,
      overlayDisplayWarning: _overlayDisplayWarning,
      displayErrorInConsole: true,
      displayErrorAsOverlay: true,
      overlayColors: _overlayColors,
      overlayStyles: _overlayStyles,
      osNotify: _osNotify,
      osNotifySound: _osNotifySound,
      browserSyncNotify: _browserSyncNotify,
      openBrowserSyncUI: _openBrowserSyncUI,
      openBundleAnalyzer: _openBundleAnalyzer,
      openJarvis: _openJarvis,
      manifest: _manifest,
      vendors: _vendors,
      commons: _commons,
      devSourceMaps: _devSourceMaps,
      prodSourceMaps: _prodSourceMaps,
      filesToRefresh: _filesToRefresh
    }
  }
}

// Export Grav Config
module.exports = GravConfig
