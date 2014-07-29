

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

	function run(module, onReady, onBroadcast) {
		require(module).getApi(function(api){
			var child_process = require("child_process"), client = {}, fInfoList = getFunctionInfo(api), path = require("path"),
				child = child_process.fork(path.resolve(path.join(__dirname, "lib", "childRunner")), [module]), outstandingCalls = {}, ct = 0;


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
			child.on("message", function __once(e){
				child.removeListener("message", __once);
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
					if(e.msgNum === -1 && onBroadcast && typeof(onBroadcast) === 'function') {
						// broadcast message
						onBroadcast(e.topic, e.message);
						return;
					}
					callback = outstandingCalls[e.msgNum];
					delete outstandingCalls[e.msgNum];
					if(callback) {
						callback.apply(callback, e.args);
					}
				});
				onReady(client, child);
			});
		})

	}

	// Register's partner (client) is implicit, in that it is always this processes parent process.

	function register(api, onReady) {
		api.getApi(function(apiInstance){
			var fInfoList = getFunctionInfo(apiInstance), fNames = {};
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
				apiInstance[e.fName].apply(null, e.args);
			})
			onReady();
		}, true);// child process flag == true
	}

module.exports = {
	run:run,
	register: register
};
