/* eslint-disable */
const {
  when, whenDev, whenProd, whenTest, ESLINT_MODES, POSTCSS_MODES,
} = require('@craco/craco');
const webpack = require('webpack');
const path = require('path');
const json = require('./package.json');

module.exports = {
  reactScriptsVersion: 'react-scripts',
  webpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
        'process.env.VERSION': JSON.stringify(json.version),
      }),
    ],
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.target = 'electron-renderer';
      webpackConfig.resolve.alias['@common'] = path.resolve(__dirname, 'src/common/');
      return webpackConfig;
    }
  },
  eslint: {
    mode: ESLINT_MODES.file
  }
};