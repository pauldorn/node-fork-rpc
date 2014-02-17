
var requirejs = require("requirejs");

var passedApiName = process.argv[2].toString();
requirejs([passedApiName, "./index.js"], function(passedApi, nodeForkRpc){
	nodeForkRpc.register(passedApi);
	process.send({ content:"This message alerts the parent process that the child is running."});
});

