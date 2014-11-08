"use strict";

var fs = require ("fs");
var path = require ("path");

var marks = null;

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

var merge = function (newMarks, dirname){
  if (!marks) marks = {};
  
  for (var mark in newMarks){
    marks[mark] = {
      path: newMarks[mark].replace ("\\", "/"),
      //Dirname of the file that has executed this function
      dir: dirname
    };
  }
};

var root = function (module){
  var arr = module.split ("/");
  return {
    dir: arr.shift (),
    trailing: arr.join ("/")
  };
};

var nativeRequire = function (module, dirname){
  try{console.log(path.join (dirname, module))
    return require (path.join (dirname, module));
  }catch (e){
    //External or built-in module
    throw new Error ("External and built-in modules must be loaded with " +
        "'require()'");
  }
};

module.exports.load = function (marksFile, cb){
  var dirname = callerDirname ();
  
  fs.readFile (marksFile, { encoding: "utf8" }, function (error, data){
    if (error) return cb (error);
    
    try{
      merge (JSON.parse (data), dirname);
      cb ();
    }catch (e){
      cb (e);
    }
  });
};

module.exports.mark = function (newMarks){
  merge (newMarks, callerDirname ());
};

module.exports.get = function (module){
  module = module.replace ("\\", "/");
  var obj;
  var mark = marks[module] || (obj = root (module), marks[obj.dir]);
  return mark
      ? require (path.resolve (mark.dir, mark.path) +
          (obj ? "/" + obj.trailing : ""))
      : nativeRequire (module, callerDirname ());
};