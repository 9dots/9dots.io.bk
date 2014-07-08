/**
 * PostController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

	all: function(req, res) {
		Post.find()
			.where({published: true})
			.exec(function(err, posts) {
				if (err) res.send(err, 500);
				else res.json(posts);
			});
	},

	unpublished: function(req, res) {
		Post.find()
			.where({published: false, author: req.param('author')})
			.exec(function(err, posts) {
				if (err) res.send(err, 500);
				else res.json(posts)
			});
	},

	view: function(req, res) {
		Post.update({id: req.param('id')}, {$inc: {views: 1}}, function(err, posts) {
			if (err) res.send(err, 500);
			else res.send();
		});

	},

	lessons: function(req, res) {
		Post.find()
			.where({type: 'lesson'})
			.exec(function(err, lessons) {
				if (err) res.send(err, 500);
				else res.json(lessons);
			});
	},

	units: function(req, res) {
		Post.find()
			.where({type: 'unit'})
			.exec(function(err, lessons) {
				if (err) res.send(err, 500);
				else res.json(lessons);
			});
	},

	webhook: function(req, res) {
	  var filesChanged = {};
	  var filesRemoved = {};
	  var repo = req.body.repository;
	  _.each(req.body.commits, function(commit) {
	    _.each(commit.added.concat(commit.modified), function(file) {
	    	var id = repo.owner.name + '-' + file.split('.')[0];
	    	Post.findOne({id: id}).done(function(err, post) {
	    		if (err) {
	    			Post.create({id: id}).done(function(err, post) {
	    				post.updateFromGithub(repo.owner.name, repo.name);
	    			})
	    		} else {
	    			post.updateFromGithub(repo.owner.name, repo.name);
	    		}
	    	});
	    });

	    _.each(commit.removed, function(file) {
	    	var id = repo.owner.name + '-' + file.split('.')[0];
	    	Post.delete(id);
	    });
	  });
	 	res.send(200);
	}
  
  

};
