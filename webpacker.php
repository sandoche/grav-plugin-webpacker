<?php
namespace Grav\Plugin;

use Grav\Common\Plugin;
use Grav\Plugin\Webpacker\WebpackerTwigExtension;
use Grav\Plugin\Webpacker\WebpackAssets;

/**
 * Class WebpackerPlugin
 * @package Grav\Plugin
 */
class WebpackerPlugin extends Plugin
{
  /**
   * @return array
   *
   * The getSubscribedEvents() gives the core a list of events
   *     that the plugin wants to listen to. The key of each
   *     array section is the event that the plugin listens to
   *     and the value (in the form of an array) contains the
   *     callable (or function) as well as the priority. The
   *     higher the number the higher the priority.
   */
  public static function getSubscribedEvents()
  {
    return [
      'onPluginsInitialized' => ['onPluginsInitialized', 0]
    ];
  }

  /**
   * Initialize the plugin
   */
  public function onPluginsInitialized()
  {
    // Don't proceed if we are in the admin plugin
    if ($this->isAdmin()) return;

    // Check if plugin is enabled
    if ($this->config['plugins.webpacker.enabled']) {

      // Load classes
      require_once(__DIR__ . '/classes/WebpackAssets.php');
      require_once(__DIR__ . '/classes/WebpackTwigExtension.php');

      // Enable the main event we are interested in
      $this->enable([
        'onTwigExtensions' => ['onTwigExtensions', 0],
        'onTwigSiteVariables' => ['onTwigSiteVariables', 0]
      ]);
    }
  }

  /**
   * On Twig Extentions Hook
   */
  public function onTwigExtensions()
  {
    $this->grav['twig']->twig->addExtension(new WebpackerTwigExtension);
  }

  /**
   * On Twig Site Variables Hook
   */
  public function onTwigSiteVariables()
  {
    $webpackerConfig = $this->config['plugins.webpacker'];

    $webpackAssets = new WebpackAssets;

    if ($webpackerConfig['manifest']) {
      $webpackAssets->add('manifest.js', 10, 'inline', null, null);
    }

    if ($webpackerConfig['vendors']) {
      $webpackAssets->add('vendors.js', 10, false, null, null);
    }

    if ($webpackerConfig['commons']) {
      $webpackAssets->add('commons.js', 10, false, null, null);
    }
  }
}
