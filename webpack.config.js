const path = require('path');
const RemoveWebpackPlugin = require('./remove-webpack-plugin/index.js');
module.exports = {
  entry: './src/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js',
  },
  plugins: [
    new RemoveWebpackPlugin(['dist'])
  ]
}