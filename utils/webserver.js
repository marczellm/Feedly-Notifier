const WebpackDevServer = require('webpack-dev-server');
const { argv } = require('yargs');
//const webpack = require('webpack');
//const config = require('../webpack.config');
//const path = require('path');

// /* eslint-disable no-restricted-syntax */
// for (const entryName in config.entry) {
//   config.entry[entryName] =
//     [
//       `webpack-dev-server/client?http://localhost:${3000}`,
//       'webpack/hot/dev-server',
//     ].concat(config.entry[entryName]);
// }
// /* eslint-enable no-restricted-syntax */

// config.plugins = [new webpack.HotModuleReplacementPlugin()].concat(config.plugins || []);

// const compiler = webpack(config);

// const server =
//   new WebpackDevServer(compiler, {
//     hot: true,
//     contentBase: path.join(__dirname, '../build'),
//     headers: { 'Access-Control-Allow-Origin': '*' },

//   });

// server.listen(3000);
