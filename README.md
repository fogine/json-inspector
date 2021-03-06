# JSON Inspector

[![Build Status](https://travis-ci.org/fogine/json-inspector.svg?branch=master)](https://travis-ci.org/fogine/json-inspector)  [![Test Coverage](https://codeclimate.com/github/fogine/json-inspector/badges/coverage.svg)](https://codeclimate.com/github/fogine/json-inspector/coverage)  

This project is now **DEPRECATED**

Json Inspector is json data validator & sanitizer. It allows you to define validation rules for complex data structures by simple and descriptive way of defining json-compliant inspector schema.  

Installation
----------------------
`npm install json-inspector`  

 or  

`bower install json-inspector`  

... or you can `browserify` your own bundle for a browser, see `npm run-script build` in the `package.json`


Features
----------------------
* Complex data structures validation & sanitization
* Extremely simple schema definition
* Multilanguage support for error messages
* Filtering of data
* Custom assertion & sanitizer implementations (extensible)
* Conditional data validation (suitable for eg. complicated permission handling)
* [Express](http://expressjs.com/) support
* Referencing other schema definitions from within a schema
* And more! (see Documentation for all available options)

Resources
-------------------
* [Getting Started](https://github.com/fogine/json-inspector/wiki/Getting-started)
* [Documentation](https://github.com/fogine/json-inspector/wiki/Schema-definition)
* [Changelog](./CHANGELOG.md)
* [Licence GPL v3](./LICENSE)
* [Copyright](./COPYRIGHT)

Simple schema definition example
--------------------
```javascript
inspector.define('user', {
    username: {
        $nullable: true,
        $isAlphanumeric: 'en-US',
        $hasLengthOf: {max: 32}
    },
    email: {
        $required: true,
        $isEmail: {allow_display_name: true}
    },
    address: {
        street: {
            $is: String
        },
        zip: {
            $isInt: {min: 1}
        }
    },
    apps: {
        $forEach: {
            name: {
                $in: ['app1', 'app2']
            }
        }
    }
});
```

Cons
----------------------
The JsonInspector can't validate object's properties which have matching names with one of the schema definition `keywords` (those data properties are removed by default). This intentional design decision limits universality of the library in exchange for improved `schema` readability and simplicity (less code). The issue is partialy solved by the `keyword prefix` feature which allows you to dynamically change a prefix string of keywords (which defaults to the `$` character). In practice, you most probably won't ecnouter this limitation (if you were to, you would have known by now).   
If this limitation is a deal breaker, consider trying out the [ajv validation library](https://github.com/epoberezkin/ajv).


Tests
-------------------

`npm run-script tests`

  

**NOTE:** The most of the actual data validation is handed over to the [chriso validation library](https://github.com/chriso/validator.js).
