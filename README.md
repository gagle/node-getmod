getmod
======

#### Module loader with aliases ####

[![npm version][npm-version-image]][npm-url]
[![Travis][travis-image]][travis-url]

[![npm install][npm-install-image]][npm-url]

This module tries to solve and improve the module loading. It's very common to have `require()`'s with relative paths like `../../../foo/bar`.

This is a well-known problem known by the Node.js community: [Better local require() paths for Node.js][better-require]. There are some solutions that seem to work but I personally dislike most of them, especially the one which uses the `node_modules` directory to store the modules of your app. My advice is to only use `node_modules` for external modules, __never__ for storing you own modules.

**I'm not going to use this module. This is just a proof of concept. The cleanest way to solve the relative paths is by prefixing them with the `__root` variable. In fact, in my opinion Node.js should consider adding it, as it's perfectly aligned with the `__filename` and `__dirname` approach.**

The way this module avoids the relative paths is by using more relative paths that shorten the paths and make them relative from anywhere. Think about them as marks, aliases, checkpoints, etc.

#### Marking a directory ####

Suppose you have this tree structure:

```
.
├ a
| └ b
|   └ c
|     └ file1.js
├ d
| └ e
|   └ f
|     └ file2.js
└ app.js
```

From `file1.js` if you need to load `file2.js`, the path is quite long: `require('../../d/e/f/file2')`. What about making the relative paths relative from `.`? Put a mark named `my-mark` pointing to the directory `d`:

```javascript
// app.js
global.mod = require('getmod')();

mod.mark({
  'my-mark': 'd'
});

// file1.js
var f = mod('my-mark/e/f/file2');
```

Instead of `my-mark`, name the mark as `d` and you'll have a very descriptive path: `mod('d/e/f/file2')`.

#### Marking a file ####

Marks can also point to a file. For example, you have a module you'd like to load with a very short path because it's pretty important, like a module that tells the status of your server:

```javascript
mod.mark({
  // The ending ".js" is optional, like in require()
  status: 'path/to/the/status/module'
});

// Anywhere in your app
var status = mod('status');
```

#### Replacing `require()` ####

You can also use this library to load:

- Any file without marks.
- External and core modules.

Therefore, you can completely replace the `require()` function like so:

```javascript
//The very first line in the entry point of your app
global.mod = require('getmod')();
```

Now you can use `mod()` from anywhere instead of `require()`. In fact, this is the way to use this library.

#### Functions ####

- [_module_() : Function](#create)
- [mod() : Any](#load)
- [mod.mark(marks) : undefined](#mark)
- [mod.resolve(name) : String](#resolve)
- [mod.resolveLoose(name) : String](#resolveLoose)

---

<a name="create"></a>
___module_() : Function__

Creates a new namespace for the marks.

```javascript
var mod = require('getmod')();
```

<a name="load"></a>
__mod(name) : Any__

Loads the module. It returns whatever is exported, just like the built-in `require()` function. Paths can be any of these:

- Mark: `mod('my-mark/file.js')`
- System path: `mod('./a/b/c/file.js')`
- External module: `mod('express')`
- Core module: `mod('fs')`

If the module name has a mark and is the same as any core module, ie: `util`, the core module will be loaded, just the same behaviour as with external modules with the same name as a core module.

<a name="mark"></a>
__mod.mark(marks) : undefined__

Puts marks that point to relative paths. It takes the directory of the current file the reference from which the paths are relative. It can be called multiple times.

```javascript
//cwd = /foo/bar

// ./file1.js
mod.mark({
  c: 'a/b/c'
});

// ./random/path/file2.js
mod.mark({
  f: 'd/e/f'
});

//Anywhere in your app
mod.resolve('c'); // /foo/bar/a/b/c
mod.resolve('f'); // /foo/bar/random/path/d/e/f
```

<a name="resolve"></a>
__mod.resolve(name) : String__

Returns the absolute path of the module, just like the built-in `require()` function, but it also resolves marks.

```javascript
//cwd = /foo/bar

mod.mark({
  file: 'a/b/c/file.js'
});

mod.resolve('file'); // /foo/bar/a/b/c/file.js
```

<a name="resolveLoose"></a>
___module_.resolveLoose(name) : String__

Same as `resolve()` but without any restrictions. The `name` can be anything including marks, even if the path doesn't exist it is still resolved.

```javascript
//cwd = /foo/bar

mod.mark({
  file: 'a/b/c/file.js'
});

mod.resolveLoose('file'); // /foo/bar/a/b/c/file.js
mod.resolveLoose('./a/b/c/file'); // /foo/bar/a/b/c/file
mod.resolveLoose('a/b/c/file'); // /foo/bar/a/b/c/file
mod.resolveLoose('random/path'); // /foo/bar/random/path
```

[npm-version-image]: http://img.shields.io/npm/v/getmod.svg
[npm-install-image]: https://nodei.co/npm/getmod.png?mini=true
[npm-url]: https://npmjs.org/package/getmod
[travis-image]: http://img.shields.io/travis/gagle/node-getmod.svg
[travis-url]: https://travis-ci.org/gagle/node-getmod
[better-require]: https://gist.github.com/branneman/8048520