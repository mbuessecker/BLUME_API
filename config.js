'use strict';

// Hierarchical node.js configuration with command-line arguments, environment
// variables, and files.
const nconf = module.exports = require('nconf');
const path = require('path');

nconf
// 1. Command-line arguments
 .argv()
 // 2. Environment variables
 .env([
   'API_KEY_GOOGLE',
 ])
 // 3. Config file
 .file({ file: path.join(__dirname, 'config.json') })
 // 4. Defaults
 .defaults({
   NODE_ENV: 'development'
 });