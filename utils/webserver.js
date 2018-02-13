const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('../webpack.config');
const env = require('./env');
const path = require('path');

require('./prepare');

/* eslint-disable no-restricted-syntax */
for (const entryName in config.entry) {
  config.entry[entryName] =
    [
      `webpack-dev-server/client?http://localhost:${env.PORT}`,
      'webpack/hot/dev-server',
    ].concat(config.entry[entryName]);
}
/* eslint-enable no-restricted-syntax */

config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins || []);

const compiler = webpack(config);

const server =
  new WebpackDevServer(compiler, {
    hot: true,
    contentBase: path.join(__dirname, '../build'),
    headers: { 'Access-Control-Allow-Origin': '*' },
  });

server.listen(env.PORT);
