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
  Error.prepareStackTrace = function (_, stack){
    return stack;
  };
  var error = new Error ();
  Error.captureStackTrace (error, callSites);
  var stack = error.stack;
  Error.prepareStackTrace = prepareStackTrace;
  return stack;
};

var callerDirname = function (){
  return path.dirname (callSites ()[2].getFileName ());
};

var isRoot = function (p){
  return path.dirname (p) === p;
};

var merge = function (newMarks, dir){
  for (var mark in newMarks){
    marks[mark] = {
      path: newMarks[mark].replace ("\\", "/"),
      //Dirname of the file that has executed this function
      dir: dir
    };
  }
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

var nativeRequire = function (dir, moduleName){
  try{
    return require (dir + "/" + moduleName);
  }catch (e){
    //External or built-in module
    
    //Built-in modules have preference over external modules with the same name
    if (~nativeModules.indexOf (moduleName)){
      return require (moduleName);
    }
    
    //Cannot use require() to load a module from a node_modules directory
    //because it takes the directory of this file instead of the directory of
    //file that calls this library (dir). Therefore, the module must be
    //searched manually
    var mod = loadModule (dir, moduleName);
    if (mod) return mod;
    
    //If the module is not found, require() will perform a last search in
    //NODE_PATH and other directories
    //http://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
    return require (moduleName);
  }
};

module.exports = function (moduleName){
  moduleName = moduleName.replace ("\\", "/");
  var obj;
  var mark = marks[moduleName] || (obj = root (moduleName), marks[obj.dir]);
  return mark
      ? require (path.resolve (mark.dir, mark.path) +
          (obj ? "/" + obj.trailing : ""))
      : nativeRequire (callerDirname (), moduleName);
};

module.exports.load = function (marksFile, cb){
  var dir = callerDirname ();
  
  fs.readFile (marksFile, { encoding: "utf8" }, function (error, data){
    if (error) return cb (error);
    
    try{
      merge (JSON.parse (data), dir);
      cb ();
    }catch (e){
      cb (e);
    }
  });
};

module.exports.mark = function (newMarks){
  merge (newMarks, callerDirname ());
};