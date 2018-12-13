const webpack = require('webpack');

module.exports = {
  entry: './out/web/main.js',
  output: {
    path: __dirname+'/out/web/',
    filename: 'bundle.js'
  },
};