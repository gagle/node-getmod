'use strict';

var path = require('path');
var code = require('code');
var lab = module.exports.lab = require('lab').script();

var expect = code.expect;
var describe = lab.describe;
var it = lab.it;
var beforeEach = lab.beforeEach;

var getmod = require('../lib');

describe('getmod', function () {
  var mod;

  beforeEach(function (done) {
    mod = getmod();
    done();
  });

  describe('loading', function () {
    it('loads core modules', function (done) {
      expect(mod('assert')).to.be.equal(require('assert'));
      done();
    });

    it('loads relative path modules', function (done) {
      expect(mod('./c/d/mod2')).to.be.equal(require('./c/d/mod2'));
      done();
    });

    it('loads modules from node_modules', function (done) {
      expect(mod('foo')).to.be.equal(require('foo'));
      done();
    });

    it('throws an error when the module cannot be found', function (done) {
      expect(function () {
        mod('not-found');
      }).to.throw();
      done();
    });

    it('resolves marks that have been set in the directory as the call to ' +
        'the loading function', function (done) {
      mod.mark({
        baz: 'foo/bar/baz'
      });
      expect(mod('baz')).to.be.equal(require('./foo/bar/baz'));
      done();
    });

    it('resolves marks that have been set in a directory different from the ' +
        'call to the loading function', function (done) {
      mod.mark({
        mod2: 'c/d/mod2'
      });
      var mod1 = require('./a/b/mod1');

      expect(mod1(mod)).to.be.equal(require('./c/d/mod2'));
      done();
    });

    it('paths can be relative to marks', function (done) {
      mod.mark({
        d: 'c/d'
      });
      expect(mod('d/mod2')).to.be.equal(require('./c/d/mod2'));
      done();
    });

    it('multiple calls to mark() do not overwrite the previous marks',
        function (done) {
      mod.mark({
        baz: 'foo/bar/baz'
      });
      mod.mark({
        mod2: 'c/d/mod2'
      });
      expect(mod('baz')).to.be.equal(require('./foo/bar/baz'));
      expect(mod('mod2')).to.be.equal(require('./c/d/mod2'));
      done();
    });

    it('multiple calls to mark() from different directories are relative to ' +
        'that directories', function (done) {
      mod.mark({
        mod2: 'c/d/mod2'
      });
      require('./e/f/mod3')(mod);
      expect(mod('mod2')).to.be.equal(require('./c/d/mod2'));
      expect(mod('baz')).to.be.equal(require('./foo/bar/baz'));
      done();
    });

    it('properties not belonging to the object instance are ignored',
        function (done) {
      var Fn = function () {};
      Fn.prototype.qux = 'qux';
      mod.mark(new Fn());
      expect(function () {
        // Not found
        mod('qux');
      }).to.throw();
      done();
    });

    it('marks with the same name as a core module are ignored',
        function (done) {
      mod.mark({
        util: 'foo/bar/baz'
      });
      expect(mod('util')).to.be.equal(require('util'));
      done();
    });
  });

  describe('resolve', function () {
    it('returns the name of a core module', function (done) {
      expect(mod.resolve('util')).to.be.equal('util');
      done();
    });

    it('returns the absolute path of any relative path', function (done) {
      expect(mod.resolve('.')).to.be.equal(__filename);
      done();
    });

    it('returns the absolute path of a module from node_modules',
        function (done) {
      expect(mod.resolve('foo')).to.be.equal(require.resolve('foo'));
      done();
    });

    it('returns the absolute path of a mark', function (done) {
      mod.mark({
        mod2: 'c/d/mod2'
      });
      expect(mod.resolve('mod2')).to.be.equal(require.resolve('./c/d/mod2'));
      done();
    });

    it('returns the absolute path of a mark that have been set in a ' +
        'directory different from the call to the resolve function',
        function (done) {
      mod.mark({
        mod2: 'c/d/mod2'
      });
      var mod1 = require('./a/b/mod1');

      expect(mod1(mod.resolve)).to.be.equal(require.resolve('./c/d/mod2'));
      done();
    });
  });

  describe('resolveLoose', function () {
    it('returns the absolute path without validating whether it exists or not',
        function (done) {
      expect(mod.resolveLoose('util')).to.be.equal(__dirname + path.sep +
          'util');
      done();
    });
  });
});