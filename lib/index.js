'use strict';

var path = require('path');

var nativeModules = Object.keys(process.binding('natives'));

var callSites = function () {
  var prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function (err, stack) {
    return stack;
  };
  var error = new Error();
  Error.captureStackTrace(error, callSites);
  var stack = error.stack;
  Error.prepareStackTrace = prepareStackTrace;
  return stack;
};

var callerDirname = function (index) {
  return path.dirname(callSites()[index].getFileName());
};

var isRoot = function (pathname) {
  return path.dirname(pathname) === pathname;
};

var head = function (modname) {
  var arr = modname.split('/');
  return {
    head: arr.shift(),
    trail: arr.join('/')
  };
};

var searchModule = function (dir, modname, fn) {
  var top = isRoot(dir);
  try {
    return fn(dir + (top ? '' : '/') + 'node_modules/' + modname);
  } catch (err) {
    if (top) return null;
    return searchModule(path.dirname(dir), modname);
  }
};

var nativeRequire = function (dir, name, fn) {
  try {
    // Directory names don't throw any error
    // resolveLoose never throws here, since path.normalize is used
    return fn(dir + '/' + name);
  } catch (err) {
    // External or core module

    // Cannot use require() to load a module from a node_modules directory
    // because it takes the directory of this file instead of the directory of
    // the file that calls this library (dir). Therefore, the module must be
    // searched manually
    var obj = searchModule(dir, name, fn);
    if (obj) return obj;

    // If the module is not found, require() will perform a last search in core
    // modules, NODE_PATH and other directories
    // http://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
    return fn(name);
  }
};

var mod = function (marks, level, name, fn) {
  name = name.replace(/\\/g, '/');
  var mark = marks[name];
  var obj;
  if (!mark) {
    obj = head(name);
    mark = marks[obj.head];
  }
  return mark
      ? fn(path.resolve(mark.dir, mark.path) + (obj ? '/' + obj.trail : ''))
      : nativeRequire(callerDirname(level), name, fn);
};

var mark = function (marks, level, newMarks) {
  var dir = callerDirname(level);
  for (var m in newMarks) {
    if (!newMarks.hasOwnProperty(m)) continue;

    // Built-in modules have preference over marks and external modules with the
    // same name
    if (~nativeModules.indexOf(m)) continue;

    marks[m] = {
      path: newMarks[m].replace(/\\/g, '/'),
      // Dirname of the file that has executed this function
      dir: dir
    };
  }
};

var resolve = function (marks, level, modname) {
  return mod(marks, level, modname, require.resolve);
};

var resolveLoose = function (marks, level, name) {
  return mod(marks, level, name, path.normalize);
};

module.exports = function () {
  var marks = {};

  var fn = function (name) {
    return mod(marks, 3, name, require);
  };
  fn.mark = function (newMarks) {
    return mark(marks, 3, newMarks);
  };
  fn.resolve = function (modname) {
    return resolve(marks, 4, modname);
  };
  fn.resolveLoose =  function (name) {
    return resolveLoose(marks, 4, name);
  };

  return fn;
};