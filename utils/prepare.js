const fileSystem = require('fs-extra');
const path = require('path');
const { argv } = require('yargs');

process.env.BROWSER = argv.browser || 'chrome';

fileSystem.emptyDirSync(path.join(__dirname, '../build'));

require('./generate_manifest');
