#!/usr/bin/env node
var spawn = require('child_process').spawn;

var child = spawn('mocha-phantomjs', [
    'http://localhost:9000/test-coverage/index.html',
    '--timeout', '25000',
    '--hooks', './phantom_hooks.js'
]);

