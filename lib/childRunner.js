
var passedApiName = process.argv[2].toString();
var nodeForkRpc = require("../index.js");
var passedApi = require(passedApiName);
nodeForkRpc.register(passedApi, function(){
	function broadcast(topic, message) {
		process.send({
			msgNum:-1,
			topic: topic,
			message: message
		});
	}
	passedApi.init(broadcast);
	process.send({ content:"This message alerts the parent process that the child is running."});
});
