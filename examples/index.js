"use strict";

global.mod = require ("../lib");

//A mark provides a relative point from which modules can be required
mod.mark ({
  api: "api/v1",
  db: "db"
});

var user = mod ("api/resources/user");

user.create ({
  username: "foo",
  password: "bar",
  email: "baz"
}, function (error, user){
  if (error) return console.error (error);
  console.log (user);
});