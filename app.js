// Start sails and pass it command line arguments
var express = require('express');
var app = module.exports = express();
require('sails').lift(require('optimist').argv);
app.use(require('prerender-node').set('prerenderToken', 'toId3gs33teeQt7Ln7XR'));