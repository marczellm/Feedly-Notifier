var fileSystem = require("fs-extra"),
    path = require("path"),
    argv = require('yargs').argv;

process.env.BROWSER = argv.browser || 'chrome'; 

fileSystem.emptyDirSync(path.join(__dirname, "../build"));

require("./generate_manifest");
