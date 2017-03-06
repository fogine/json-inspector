#### FUTURE

* [FIXED] global variable `ValidatorError` leak in lib/assertions.js
* [ADDED] export `conditions` submodule out of th  module

#### v1.0.0-rc.2

* [FIXED] Don't assume 'toString' method is present on validated value. (Eg.: node-querystring parser does not include Object.prototype on parsed values)
* [FIXED] Express support - `getExpressInjector` - Don't share `ValidarManager` object between individual http requests

#### v1.0.0-rc.1

* [ADDED] new `$is: Boolean` option
* [ADDED] `keywordPrefix` validator option - makes it possible to change default schema definition keyword prefix (`$`)
* [ADDED] Browser support
* [FIXED] Resolving of `$or` conditions - see [#2](https://github.com/fogine/json-inspector/issues/2)

#### v1.0.0-beta

* [ADDED] `$nand`, `$nor` - negated versions of `$and` and `$or` operator keywords
* [ADDED] `$nullable` schema option - implements same "inheritance" concept as `$message`, `$required` options do

#### v1.0.0-alpha
