"use strict";

var assert = require ("assert");
var mod = require ("../lib");

//A mark provides a relative point from which modules can be required
mod.mark ({
  "f": "d/e/f",
  "mod2": "d/e/f/mod2"
});

mod.load (__dirname + "/marks.json", function (error){
  if (error) return console.error (error);
  
  var mod1 = mod.get ("mod1");
  assert.strictEqual (mod1, "mod2");
  
  //The module can be also loaded as usual from the current file's directory
  assert.strictEqual (mod1, mod.get ("./a/b/c/mod1"));
});