'use strict';

const core = require('./webpack.core');
const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const exists = require('exists-file').sync;

const CWD = process.cwd();
const PACKAGE = require(path.join(CWD, 'package.json'));
const SRC_FILE = path.join(CWD, PACKAGE.config.appBuildEntry);
const SRC = path.dirname(SRC_FILE);
const HtmlPlugin = require('html-webpack-plugin');
const USER_TEMPLATE = path.join(SRC, 'template.ejs');

module.exports = merge(core, {
  entry: ['babel-polyfill', 'whatwg-fetch', SRC_FILE],
  devtool: 'source-map',
  plugins: [
    new HtmlPlugin(merge({
      template: exists(USER_TEMPLATE) ?
          USER_TEMPLATE :
          path.join(__dirname, '../src/template.ejs'),
      hash: true,
      xhtml: true
    }, PACKAGE.config.html || {})),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.bundle.js'
    }),
    new webpack.HotModuleReplacementPlugin(),
    // https://github.com/MoOx/eslint-loader#noerrorsplugin
    new webpack.NoErrorsPlugin()
  ],
  eslint: {
    configFile: path.join(__dirname, 'eslint.dev.js')
  },
  devServer: {
    contentBase: path.join(process.cwd(), 'src'),

    // Enable history API fallback so HTML5 History API based
    // routing works. This is a good default that will come
    // in handy in more complicated setups.
    historyApiFallback: true,

    hot: true,
    progress: true,

    // Display only errors to reduce the amount of output.
    stats: 'errors-only'
  }
});