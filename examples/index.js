
var requirejs = require("requirejs");

console.log("Got here");
requirejs(["../index", "path"], function(nodeFork, path){
	nodeFork.run(path.resolve("./examples/passedApi"), function(client){
		client.one("One Tada", function(info) {
			console.log("One Got back:", info);
		});
		client.two("Two Tada", function(info){
			console.log("Two got back:", info);
		});
	});

});
