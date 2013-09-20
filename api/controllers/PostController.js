/**
 * PostController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
 console.log('test');

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
	}
  
  

};
