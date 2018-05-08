const path = require('path');
const { argv } = require('yargs');
const env = require('./utils/env');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const StringReplacePlugin = require('string-replace-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const sandboxUrl = 'http://sandbox7.feedly.com';

module.exports = () => {
  console.log(arguments);
  return {
    entry: {
      options: path.join(__dirname, 'src', 'options.main.ts'),
      background: path.join(__dirname, 'src', 'scripts', 'background.ts'),
      // popup: path.join(__dirname, 'src', 'scripts', 'popup.ts'),
      // options: path.join(__dirname, 'src', 'scripts', 'options.ts'),
    },
    output: {
      path: path.join(__dirname, 'build'),
      filename: 'scripts/[name].js',
    },
    resolve: {
      extensions: ['.js', '.ts', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': path.join(__dirname, 'src')
      }
    },
    module: {
      rules: [
        {
          test: /feedly\.api\.ts/,
          exclude: /node_modules/,
          loader: StringReplacePlugin.replace({
            replacements: [
              {
                pattern: /http(?:s)?:\/\/(?:www\.)?cloud\.feedly\.com/gi,
                replacement: match => (argv.sandbox ? sandboxUrl : match),
              },
            ],
          }),
        },
        {
          test: /background\.ts/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'echo-loader',
            },
            {
              loader: StringReplacePlugin.replace({
                replacements: [
                  {
                    pattern: /http(?:s)?:\/\/(?:www\.)?feedly\.com/gi,
                    replacement: match => (argv.sandbox ? sandboxUrl : match),
                  },
                ],
              }),
            },
          ],
        },
        {
          test: /\.vue$/,

          use: [
            {
              loader: 'vue-loader',
              options: {
                loaders: {
                  scss: [
                    {
                      loader: 'vue-style-loader'
                    },
                    {
                      loader: 'css-loader'
                    },
                    {
                      loader: 'sass-loader'
                    }
                  ]
                }
              }
            }
          ]
        },
        {
          test: /.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'echo-loader',
            },
            {
              loader: 'ts-loader',
              options: {
                appendTsSuffixTo: [/\.vue$/],
                compilerOptions: {
                  paths: {
                    'background': background
                  }
                }
              }
            },
            {
              loader: 'preprocess-loader',
              options: {
                BROWSER: argv.browser,
              },
            },
          ],
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'echo-loader',
            },
            {
              loader: 'preprocess-loader',
              options: {
                BROWSER: argv.browser,
              },
            },
            {
              loader: 'html-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: 'echo-loader',
            },
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
            },
          ]
        }
      ],
    },
    plugins: [
      new StringReplacePlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
        BROWSER: JSON.stringify(argv.browser),
        CLIENT_ID: JSON.stringify(argv.clientId),
        CLIENT_SECRET: JSON.stringify(argv.clientSecret),
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'popup.html'),
        filename: 'popup.html',
        chunks: ['popup'],
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'background.html'),
        filename: 'background.html',
        chunks: ['background'],
      }),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'options.main.html'),
        filename: 'options.html',
        chunks: ['options'],
      }),
      // new HtmlWebpackPlugin({
      //   template: path.join(__dirname, 'src', 'options.html'),
      //   filename: 'options.html',
      //   chunks: ['options'],
      // }),
      // new CopyWebpackPlugin([
      //   {
      //     from: path.resolve(__dirname, 'src'),
      //     to: path.resolve(__dirname, 'build'),
      //     ignore: ['**/scripts/**/*', '*.html', 'manifest.json', '**/components/**/*', 'App.vue'],
      //     verbose: true,
      //   },
      // ]),
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, 'static'),
          to: path.resolve(__dirname, 'build'),
          verbose: true,
        },
      ]),
      // new WriteFilePlugin(),
      // new BundleAnalyzerPlugin(),
    ],
    devtool: 'inline-cheap-source-map',
  }
};
