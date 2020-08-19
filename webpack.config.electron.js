const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');
const json = require('./package.json');

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const optimized = mode === 'production';

const optimization = {
  minimize: optimized,
  minimizer: [new TerserPlugin()],
};

module.exports = {
  entry: ['./main/electron.ts'],
  mode,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
      'process.env.VERSION': JSON.stringify(json.version),
    }),
  ],
  devtool: 'source-map',
  target: 'electron-main',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  output: {
    filename: 'electron.js',
    path: path.resolve(__dirname, 'public'),
  },
  externals: [
    nodeExternals({
    }),
    // 'utf-8-validate', 'bufferutil',
  ],
  node: {
    __dirname: false,
  },
  optimization,
};
