
var child_process = require("child_process");

function getFunctionInfo(api) {
	var functionInfo = [];

	Object.keys(api).forEach(function(fName){
		var args = api[fName].toString().match(/^\s*function(?:\s+\w*)?\s*\(([\s\S]*?)\)/);
		args = args ? (args[1] ? args[1].trim ().split (/\s*,\s*/) : []) : null;

		functionInfo.push( {
			fName: fName,
			args: args
		});
		
	});
	return functionInfo;
}

function run(api, module) {
	var client = {}, fInfoList = getFunctionInfo(api),
		child = child_process.fork(module), outstandingCalls = {}, ct = 0;

	fInfoList.forEach(function(fInfo){
		client[fInfo.fName] = function(){
			var args = Array.prototype.slice.call(arguments, 0), callback;
			if(typeof(args[args.length-1]) === 'function'){
				callback = args[args.length-1];
				args = args.slice(0, args.length-1);
			} else {
				callback = false;
			}
			var e = {
				fName: fInfo.fName,
				args: args,
				msgNum: ct++
			}
			outstandingCalls[e.msgNum] = callback;
			child.send(e);
		}
	});
	child.on("message", function(e){
		var callback;
		if(e.msgNum === undefined){
			console.log("Error: No message number in child response");
			return;
		}
		if(outstandingCalls[e.msgNum] === undefined) {
			console.log("Error: Wrong message number in child response");
			return;
		}
		callback = outstandingCalls[e.msgNum];
		delete outstandingCalls[e.msgNum];
		if(callback) {
			callback.call(callback, e.args);
		}
	});
	return client;
}

function register(api) {
	var fInfoList = getFunctionInfo(api), fNames = {};
	fInfoList.forEach(function (fInfo){
		// wrap each function so that it can get called from an incoming message.
		fNames[fInfo.fName] = true;
	});
	process.on("message", function(e){
		if(e.fName === undefined) {
			console.log("Error, no function name in RPC");
			return;
		}
		if(fNames[e.fName] === undefined) {
			console.log("Error, unknown function name in RPC");
			return;
		}
		e.args.push(function(){
			var args = Array.prototype.slice.call(arguments, 0);
			process.send({
				msgNum: e.msgNum,
				args: args
			})
		})
		api[e.fName].apply(null, e.args);
	})
}

module.exports = {
	run:run,
	register: register
};

/*
 var args = Array.prototype.slice.call(arguments, 2);
 return function() {
 var e = {
 rpc: functionName,
 msgNum: msgCounter++,
 args: args
 };
 messages[e.msgNum] = callback;
 child.send(e);
 };
 };

 child.on("message", function(e) {
 // Upon receiving a message, determine what call it comes from and execute the callback, removing it from the messages object.
 if(e.msgNum === undefined) {
 console.log("Error: Missing message number");
 return;
 }
 var callback = messages[e.msgNum];
 if(callback === undefined) {
 console.log("Error: Bad message number");
 return;
 }
 delete messages[e.msgNum];
 callback.apply(null, e.args);
 */