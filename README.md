node-fork-rpc
=============

RPC Wrapper for NodeJS fork messages.
-------------------------------------

This simple wrapper allows you to call methods in your child process as though they were local to your parent process.

Limitations:  Parameters must be serializable!  No functions, sockets or any other type of system resource.

Features:  The last parameter you send will be checked to see if it is a function.  If it is, that function will be made available as a call back to your child process.

Install:
	npm install node-fork-rpc
	
Usage from Parent Process:
	
	var nodeFork = require('node-fork-rpc');
	
	var passedApi = require('passedApi');
	
	nodeFork.run("full path to passedApi", function(childProcessRef) {
		childProcessRef.one("One Tada", function(info) {
			console.log("One Got back:", info);
		});
		childProcessRef.two("Two Tada", function(info){
			console.log("Two got back:", info);
		});
	});

Usage for child process:


	var passedApi = require("passedApi"), nodeFork = require("node-fork-rpc");
	
	nodeFork.register(passedApi);


Passed Api:


	module.exports = {
		getApi: function(register, isChild){
			register({
				one: function(doOne, callback) {
					console.log("One Boo", arguments);
					callback("One boo calling back");
				},
				two: function(doTwo, callback) {
					console.log("Two Boo", arguments);
					callback("Two boo calling back");
				}
			})
		}
	}
