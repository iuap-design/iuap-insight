
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'iuap-insight.min.js',
      library: 'uis',
      libraryTarget: 'umd',
    },
    resolve: {
        extensions: ['.js', '.json']
    },
    module: {
        rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                      ['@babel/preset-env', { "modules": "umd" }]
                  ],
                  plugins: [
                      '@babel/plugin-transform-runtime',
                      "add-module-exports"
                    ]
                }
              }
            }
        ]
    }
};
