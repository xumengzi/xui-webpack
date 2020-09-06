// 读取配置
const options = require('./webpack.config.js');

const webpack = require('./lib/webpack.js');

new webpack(options).run()
