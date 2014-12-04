"use strict";

var fs = require ("fs");
var path = require ("path");

var marks = {};
var nativeModules = Object.keys (process.binding ("natives"));

var startsWith = function (str, start){
  return !str.lastIndexOf (start, 0);
};

var callSites = function (){
  var prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = function (err, stack){
    return stack;
  };
  var error = new Error ();
  Error.captureStackTrace (error, callSites);
  var stack = error.stack;
  Error.prepareStackTrace = prepareStackTrace;
  return stack;
};

var callerDirname = function (index){
  return path.dirname (callSites ()[index].getFileName ());
};

var isRoot = function (p){
  return path.dirname (p) === p;
};

var root = function (moduleName){
  var arr = moduleName.split ("/");
  return {
    dir: arr.shift (),
    trailing: arr.join ("/")
  };
};

var loadModule = function (dir, moduleName){
  var top = isRoot (dir);
  try{
    return require (dir + (top ? "" : "/") + "node_modules/" + moduleName);
  }catch (e){
    if (top) return null;
    return loadModule (path.dirname (dir), moduleName);
  }
};

var nativeRequire = function (dir, name, fn){
  try{
    //Directory names don't throw any error
    return fn (dir + "/" + name);
  }catch (e){
    //External or built-in module
    
    //Cannot use require() to load a module from a node_modules directory
    //because it takes the directory of this file instead of the directory of
    //file that calls this library (dir). Therefore, the module must be
    //searched manually
    var obj = loadModule (dir, name);
    if (obj) return obj;
    
    //If the module is not found, require() will perform a last search in
    //NODE_PATH and other directories
    //http://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
    return fn (name);
  }
};

var mod = function (name, fn){
  name = name.replace (/\\/g, "/");
  var obj;
  var mark = marks[name] || (obj = root (name), marks[obj.dir]);
  return mark
      ? fn (path.resolve (mark.dir, mark.path) +
          (obj ? "/" + obj.trailing : ""))
      : nativeRequire (callerDirname (3), name, fn);
};

module.exports = function (name){
  return mod (name, require);
};

module.exports.mark = function (newMarks){
  var dir = callerDirname (2);
  for (var mark in newMarks){
    //Built-in modules have preference over marks and external modules with the
    //same name
    if (~nativeModules.indexOf (mark)) continue;
    
    marks[mark] = {
      path: newMarks[mark].replace (/\\/g, "/"),
      //Dirname of the file that has executed this function
      dir: dir
    };
  }
};

module.exports.resolve = function (moduleName){
  return mod (moduleName, require.resolve);
};

module.exports.resolveLoose = function (name){
  return mod (name, path.normalize);
};