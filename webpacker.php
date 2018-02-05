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
    // Load WebpackAssets class
    require_once(__DIR__ . '/classes/WebpackAssets.php');

    // Enable the main event we are interested in
    $this->enable([
      'onTwigSiteVariables' => ['onTwigSiteVariables', 0]
    ]);

    // Check if plugin is enabled and if we are admin
    if (!$this->isAdmin() && $this->config['plugins.webpacker.enabled']) {

      // Load WebpackTwigExtension class
      require_once(__DIR__ . '/classes/WebpackTwigExtension.php');

      // Enable the main event we are interested in
      $this->enable([
        'onTwigExtensions' => ['onTwigExtensions', 0]
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

    // If we are not in admin
    if (!$this->isAdmin()) {

      $webpackAssets = new WebpackAssets;

      // Add menifest asset if enabled
      if ($webpackerConfig['manifest']) {
        $webpackAssets->add('manifest.js', 10, 'inline', null, null);
      }

      // Add vendors asset if enabled
      if ($webpackerConfig['vendors']) {
        $webpackAssets->add('vendors.js', 10, false, null, null);
      }

      // Add commons asset if enabled
      if ($webpackerConfig['commons']) {
        $webpackAssets->add('commons.js', 10, false, null, null);
      }

    // If we are in admin and WebpackerPlugin is in development mode
    } elseif ($webpackerConfig['mode'] === 'development') {

      $twig = $this->grav['twig'];

      // Get protocol from WebpackerPlugin config
      $protocol = $webpackerConfig['https'] ? 'https' : 'http';

      // Define the new frontend base url for development mode
      $new_base_url_relative_frontend = "$protocol://localhost:3000";

      $admin_class_variables = [
        'base_url_relative_frontend' => $new_base_url_relative_frontend,
      ];

      // Merge Twig variable to overide base_url_relative_frontend with new one
      $twig->twig_vars = array_merge($twig->twig_vars, $admin_class_variables);
    }
  }
}
