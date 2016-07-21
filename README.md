# JSON Inspector

[![Build Status](https://travis-ci.org/fogine/json-inspector.svg?branch=master)](https://travis-ci.org/fogine/json-inspector)  [![Test Coverage](https://codeclimate.com/github/fogine/json-inspector/badges/coverage.svg)](https://codeclimate.com/github/fogine/json-inspector/coverage)  

Json Inspector is json data validator & sanitizer. It allows you to define validation rules for complex data structures by simple and descriptive way of defining json-compliant inspector schema.  
Currently only Node.js is supported. However Web browser support is on the roadmap.

Installation
----------------------
`npm install json-inspector@beta`



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
* [Documentation](https://github.com/fogine/json-inspector/wiki/Getting-started)
* [Changelog](./CHANGELOG.md)
* [Licence GPL v3](./LICENSE)
* [Copyright](./COPYRIGHT)

Simple schema example
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

Tests
-------------------

`npm run-script tests`
