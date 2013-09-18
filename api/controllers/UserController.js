/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {
	all: function(req, res) {
		User.find()
			.exec(function(err, users) {
				if (err) res.send(err, 500);
				else res.json(users);
			});
	}
};
