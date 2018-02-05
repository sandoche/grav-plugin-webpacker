/* global GravConfig */
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const mqpacker = require('css-mqpacker')
const sortCSSmq = require('sort-css-media-queries')
const cssnext = require('postcss-cssnext')
const cssnano = require('cssnano')

// MODULES CONFIG
// ––––––––––––––––––––––

module.exports = () => {
  const modules = {
    rules: [
      // Linters
      // ––––––––––––––––––––––

      {
        test: /\.js$/,
        enforce: 'pre',
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'eslint-loader',
            options: {
              emitWarning: true
            }
          }
        ]
      },

      // Loaders
      // ––––––––––––––––––––––

      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.(scss|sass|css)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
                importLoaders: 2
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                sourceMap: true,
                plugins: () => [
                  mqpacker({
                    sort: sortCSSmq
                  }),
                  cssnext({
                    features: {
                      customProperties: {
                        warnings: false
                      }
                    }
                  }),
                  cssnano()
                ]
              }
            },
            {
              loader: 'resolve-url-loader'
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                attempts: 1
              }
            }
          ]
        })
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[hash].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              enabled: GravConfig.prod,
              bypassOnDebug: true
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'fonts/[name].[hash].[ext]'
            }
          }
        ]
      }
    ]
  }

  return modules
}
