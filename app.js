// Start sails and pass it command line arguments
var express = require('express');
require('sails').lift(require('optimist').argv);
var app = module.exports = express();
app.use(require('prerender-node').set('prerenderToken', 'toId3gs33teeQt7Ln7XR'));