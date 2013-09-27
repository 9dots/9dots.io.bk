/**
 * Post
 *
 * @module      :: Model
 * @description :: Post base model.
 *
 */

var marked = require('marked');
var fs = require('fs');
var path = require('path');
var Mustache = require('mustache');
var type2Layout = require('../../lib/type2Layout');
var knox = require('knox');

var client = knox.createClient({
    key: 'AKIAJBZSOLCLYZHNTUYA'
  , secret: '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'
  , bucket: 'posts.9dots.io'
});

marked.setOptions({breaks: true});

module.exports = {
	adapter: 'mongo',
  attributes: {
  	
  	id: 'STRING',

  	type: {
  		type: 'STRING',
  		defaultsTo: 'lesson'
  	},
  	author: 'STRING',
  	views: {
  		type: 'INTEGER',
  		defaultsTo: 0
  	},
  	published: {
  		type: 'BOOLEAN',
  		defaultsTo: false
  	},
  	title: {
  		type: 'STRING',
  		minLength: 3,
  		maxLength: 50
  	},
  	
  	blurb: {
  		type: 'STRING',
  		minLength: 3,
  		maxLength: 140
  	},
  	standards: 'ARRAY',
    objective: 'STRING',
  	content: 'STRING',
    
    render: function(cb) {
    	var metadata = this.toObject();
			metadata.content = metadata.content && marked(metadata.content);

			var layout = type2Layout(metadata.type);
			fs.readFile(path.join(__dirname, '../../lib', layout + '.html'), function(err, data) {
				if (err) return cb(err);
				cb(null, Mustache.render(data.toString(), {data: metadata}));
			});
    },

  	push: function(cb) {
  		var self = this;
		  this.render(function(err, string) {
		    if (err) return cb(err);
	      client.putBuffer(
	      	string, self.id + '.html', {'Content-Type': 'text/html'}, function(err) {
			      cb(err);
			  });
		  });
  	}

  },

  afterCreate: function(values, next) {
  	var post = new Post._model(values);
  	post.push(function(err) {
  		if (err) throw err;
  		next();
  	});
  },

  afterUpdate: function(values, next) {
  	var post = new Post._model(values);
  	post.push(function(err) {
  		if (err) throw err;
  		next();
  	});
  }

};
