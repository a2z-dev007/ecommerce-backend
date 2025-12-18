const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const baseUrl = './';
const paths = tsConfig.compilerOptions.paths;

tsConfigPaths.register({
  baseUrl,
  paths,
});