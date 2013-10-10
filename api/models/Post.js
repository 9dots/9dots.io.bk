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
var https = require('https');
var jsyaml = require('js-yaml');

var client = knox.createClient({
    key: 'AKIAJBZSOLCLYZHNTUYA'
  , secret: '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'
  , bucket: 'posts.9dots.io'
});

var timeouts = {};

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
  	},

    updateFromGithub: function(owner, repo) {
      var self = this;
      if (timeouts[this.id])
        clearTimeout(timeouts[this.id]);
      // give github time to update
      timeouts[this.id] = setTimeout(function() {
        self._pullGithubData(owner, repo);
        clearTimeout(timeouts[self.id]);
      }, 60000);
    },

    _pullGithubData: function(owner, repo) {
      var self = this;
      var file = this.id.split('-')[1];
      var p = '/' + owner + '/' + repo + '/master/' + file + '.md';
      var req = https.get("https://raw.github.com" + p, function(res) {
        var buffer = [];
        res.on('data', function(chunk) {
          buffer.push(chunk);
        });
        res.on('end', function() {
          var metadata = {};
          var content = Buffer.concat(buffer).toString().replace(/^(---\n)((.|\n)*?)\n---\n?/, function (match, dashes, frontmatter) {
            try {
              metadata = jsyaml.load(frontmatter);
            } catch(e) {
              console.log('ERROR encoding YAML');
            }
            return '';
          }).trim();
          metadata.content = content;
          Post.update({id: self.id}, metadata, function(err) {
            if (err)
              console.log('ERROR saving metadata');
          });
        });
      });

      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
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
  },

  delete: function(id) {
    clearTimeout(timeouts[id]);
    Post.destroy({id: id}).done(function(err) {
      if (err)
        console.log('Error destroying ' + id + ': ' + err);
    });
  }

};
