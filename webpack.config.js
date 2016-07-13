var path = require("path");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'iuap-insight.js',
    path: "./lib"
  },
  resolve: {
    extension: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
}
