"use strict";

var assert = require ("assert");
var mod = require ("../../../../lib");

//Two different marks are configured, the module can be loaded relative to two
//different points
var mod2 = mod ("f/mod2.js");
assert.strictEqual (mod2, mod ("mod2"));

//The module can be also loaded as usual from the current file's directory
assert.strictEqual (mod2, mod ("../../../d/e/f/mod2"));

module.exports = mod2;