
var nodeFork = require("../index");
var path = require("path");

nodeFork.run(path.resolve("./examples/passedApi"), function(client){
	client.one("One Tada", function(info) {
		console.log("One Got back:", info);
	});
	client.two("Two Tada", function(info){
		console.log("Two got back:", info);
	});
});

