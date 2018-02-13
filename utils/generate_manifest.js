const fileSystem = require('fs');
const path = require('path');
const preprocess = require('preprocess');

const manifest = fileSystem.readFileSync('src/manifest.json').toString();
const manifestPath = path.join(__dirname, '../build/manifest.json');

const processed = preprocess.preprocess(manifest, null, { type: 'js' });

const json = JSON.parse(processed);

fileSystem.writeFileSync(
  manifestPath,
  JSON.stringify(json, null, 4),
);
