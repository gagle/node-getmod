"use strict";

var User = mod ("api/collections/user");

module.exports.create = function (settings, cb){
  new User (settings).save (function (error, user){
    if (error) return cb (error);
    cb (null, user);
  });
};