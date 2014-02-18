
var passedApiName = process.argv[2].toString();
var nodeForkRpc = require("../index.js");
var passedApi = require(passedApiName);
nodeForkRpc.register(passedApi);
process.send({ content:"This message alerts the parent process that the child is running."});

