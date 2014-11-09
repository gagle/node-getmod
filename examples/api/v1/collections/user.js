"use strict";

//MongoDB collection, for instance
//Configure the schema and expose the User model
var db = mod ("db");

var User = module.exports = function (settings){
  this._settings = settings;
};

User.prototype.save = function (cb){
  cb (this._settings);
};