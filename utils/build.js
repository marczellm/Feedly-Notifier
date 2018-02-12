var webpack = require("webpack"),
    path = require('path'),
    del = require('del'),
    zipdir = require('zip-dir'),
    config = require("../webpack.config");

require("./prepare");

webpack(
  config,
    function (err) { 
        if (err) { throw err; }
        createZipFile();
    }
);

function createZipFile() {
    let distPath = path.join(__dirname, "../build");
    zipdir(distPath, { saveTo: distPath + '/feedly-notifier.zip' }, function (err, buffer) {
        if (err) throw err;
    })
}
