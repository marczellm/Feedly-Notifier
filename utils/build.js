const webpack = require('webpack');
const path = require('path');
const zipdir = require('zip-dir');
const config = require('../webpack.config');

require('./prepare');

const createZipFile = () => {
  const distPath = path.join(__dirname, '../build');
  zipdir(distPath, { saveTo: `${distPath}/feedly-notifier.zip` }, (err) => {
    if (err) throw err;
  });
};

webpack(
  config,
  (err) => {
    if (err) { throw err; }
    createZipFile();
  },
);
