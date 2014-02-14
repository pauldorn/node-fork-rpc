
var nodeFork = require('../index');

var passedApi = require('./passedApi');

var client = nodeFork.run(passedApi, 'examples/apiService');

client.one("One Tada", function(info) {
	console.log("One Got back:", info);
});
client.two("Two Tada", function(info){
	console.log("Two got back:", info);
});