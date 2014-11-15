getmod
======

#### Module loader with aliases ####

[![npm version][npm-version-image]][npm-url]
[![Travis][travis-image]][travis-url]

[![npm install][npm-install-image]][npm-url]

This module tries to solve and improve the module loading. In big projects it's very common to have `require()`s with relative paths like `require("../../../models/user");`. This is a mess for big projects. Furthermore, if you move or rename a directory or file, you need to modify each of these paths to point to the new location. The paths are relative from the current file, this is very portable but it's not scalable.

This is a common problem known by the Node.js community: [Better local require() paths for Node.js][better-require]. There are some solutions that seem to work but I personally dislike all of them, especially the one which uses the `node_modules` directory to store the modules of your app. My advice is to use `node_modules` only for external modules.

The way this module avoids the relative paths is by using... relative paths that shorten the paths and make them relative from where you want. Think about them as marks, aliases, checkpoints, namespaces, etc.

#### Marking a directory ####

Suppose you have this tree structure:

```
.
├ a
| └ b
|   └ c
|     └ c.js
├ d
| └ e
|   └ f
|     └ f.js
└ app.js
```

From `c.js` if you need to load `f.js`, the require is quite long: `require("../../d/e/f/f.js");`. What about making the relative paths relative from `.`? Put a mark named `my-mark` pointing to the directory `d`:

```javascript
//app.js
var mod = require ("getmod");

mod.mark ({
  "my-mark": "d"
});

//c.js
var f = mod ("my-mark/e/f/f.js");
```

Instead of `my-mark`, name the mark as `d` and you'll have a very descriptive path: `mod("d/e/f/f.js")`.

#### Marking a file ####

Marks can also point to a file. For example, you have a module you'd like to load with a very short path because it's pretty important, like a module that tells the status of your server:

```javascript
mod.mark ({
  //The ending .js is optional, like in require()
  status: "path/to/the/status/module"
});

//Anywhere in your app
var status = mod ("status");
```

#### Replacing require ####

You can also use this library to load any file without marks and to load external and core modules. Therefore, you can completely replace the `require()` function like so:

```javascript
//The very first line in the entry point of your app
global.mod = require ("getmod");
```

Now you can use `mod()` from anywhere in your app.

#### Functions ####

- [_module_(moduleName) : Any](#require)
- [_module_.mark(marks) : undefined](#mark)
- [_module_.resolve(moduleName) : String](#resolve)

---

<a name="require"></a>
___module_(moduleName) : Any__

Loads the module. It returns whatever is exported, just like the built-in `require()` function. Paths can be any of these:

- Mark: `mod("my-mark/file.js")`
- System path: `mod("./a/b/c/file.js")`
- External module: `mod("express")`
- Core module: `mod("fs")`

If the module name is the same as any core module, the core module will be loaded, just the same behaviour as with external modules with the same name as a core module.

<a name="mark"></a>
___module_.mark(marks) : undefined__

Configures relative paths. It takes the directory of the current file as the point from which the paths are relative. It can be called multiple times.

```javascript
//cwd = /foo/bar

// ./app.js
mod.mark ({
  c: "a/b/c"
});

// ./random/path/app.js
mod.mark ({
  f: "d/e/f"
});

//Anywhere in your app
mod.resolve ("c"); // /foo/bar/a/b/c
mod.resolve ("f"); // /foo/bar/random/path/d/e/f
```

<a name="require"></a>
___module_.resolve(moduleName) : String__

Returns the absolute path of the module, just like the built-in `require()` function, but it also resolves modules names relative to marks.

```javascript
//cwd = /foo/bar

mod.mark ({
  a: "a/b/c.js"
});

mod.resolve ("c"); // /foo/bar/a/b/c.js
```

[npm-version-image]: http://img.shields.io/npm/v/getmod.svg
[npm-install-image]: https://nodei.co/npm/getmod.png?mini=true
[npm-url]: https://npmjs.org/package/getmod
[travis-image]: http://img.shields.io/travis/gagle/node-getmod.svg
[travis-url]: https://travis-ci.org/gagle/node-getmod
[better-require]: https://gist.github.com/branneman/8048520