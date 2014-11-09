"use strict";

global.mod = require ("../lib");

var assert = mod ("assert");
var path = mod ("path");

//A mark provides a relative point from which modules can be required
mod.mark ({
  f: "d/e/f",
  mod1: "a/b/c/mod1",
  mod2: "d/e/f/mod2",
  util: "a/b/c/mod1"
});

var mod1 = mod ("mod1");
assert.strictEqual (mod1, "mod2");

//The module can be also loaded as usual from the current file's directory
assert.strictEqual (mod1, mod ("./a/b/c/mod1"));

//External and built-in modules can be also required
assert.strictEqual (mod ("mod3"), "mod3");
assert.strictEqual (mod ("assert"), assert);

//Resolve
assert.strictEqual (mod.resolve ("."), __filename);
assert.strictEqual (mod.resolve ("fs"), "fs");

//Marks with the same name as a core module are ignored
assert.strictEqual (mod.resolve ("util"), "util");

var mod1Path = __dirname + "/a/b/c/mod1.js".replace (/\//g, path.sep);
assert.strictEqual (mod.resolve ("mod1"), mod1Path);
assert.strictEqual (mod.resolve ("./a/b/c/mod1"), mod1Path);