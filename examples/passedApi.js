
module.exports = {
	getApi: function(register){
		register({
			one: function(doOne, callback) {
				console.log("One Boo", arguments);
				callback("One boo calling back");
			},
			two: function(doTwo, callback) {
				console.log("Two Boo", arguments);
				callback("Two boo calling back");
			}
		});
	}
};

