const webpack = require('webpack');
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/web/main.ts',
  output: {
    path: __dirname+'/out/web/',
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(scss|sass|css)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // you can specify a publicPath here
              // by default it use publicPath in webpackOptions.output
              publicPath: '../'
            }
          },
          'css-loader', // translates CSS into CommonJS
          'sass-loader' // compiles Sass to CSS, using Node Sass by default
        ]
      },
      {
        test: /\.ts$|\.tsx$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'src', 'web', 'tsconfig.json'),
              //transpileOnly: true
            },
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/web/index.html',
        to: './',
      },
      {
        from: 'src/web/img/**/*',
        to: './img/',
        flatten: true,
      },
    ]),
  ],
};