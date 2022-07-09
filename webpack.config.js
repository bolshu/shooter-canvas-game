const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distPath = path.resolve(__dirname, 'dist');

const config = {
  entry: './src/index.ts',
  output: {
    path: distPath,
    filename: 'bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  },
  devServer: {
    static: {
      directory: distPath,
    },
    port: 9000,
    open: true
  },
};

module.exports = config;
