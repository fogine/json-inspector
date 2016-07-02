var _                    = require('lodash');
var queryString          = require('qs');
var stringValidator      = require('validator');
var ValidatorError       = require('./error/validatorError.js');
var ValidationError      = require('./error/validationError.js');
var ValidationMultiError = require('./error/validationMultiError.js');
var assertions           = require('./assertions.js');
var sanitizers           = require('./sanitizers.js');
var conditions           = require('./conditions.js');

var InternalProps = ['$message', '$required', '$forEach', '$sanitize'];
InternalProps = _.union(InternalProps, Object.keys(sanitizers), Object.keys(assertions), Object.keys(conditions));

module.exports = Validator;


/**
 * Validator
 *
 * @param {Object}          [options]
 * @param {Object}          [options.context={}]
 * @param {boolean}         [options.required=false]
 * @param {boolean}         [options.filterData=true]
 * @param {boolean}         [options.failOnUnexpectedData=false] - applies only if `filterData=true`
 * @param {string|Function} [options.message="Invalid data for %p ,got: %v"]
 * @param {boolean}         [options.failOnFirstErr=false]
 * @param {boolean}         [options.nullAsEmpty=false]
 * @param {Function}        [options.validationError=ValidationError] - returned only if single error occured (or `failOnFirstErr=true`)
 * @param {Function}        [options.validationMultiError=ValidationMultiError] - returned if multiple errors occured
 * @param {string}          [options.comparisonOperator="$and"] - one of the property names form `conditions` list. Determines default comarison operator between multiple assertions in `where` filter object (most certainly you dont want to change this)
 */
function Validator(schema, options, valManager) {
    var defaults = {
        context              : {},
        required             : false,
        sanitizers           : [],
        message              : 'Invalid data for %p, got: "%v"',
        filterData           : true,
        failOnUnexpectedData : false,
        failOnFirstErr       : false,
        validationError      : ValidationError,
        validationMultiError : ValidationMultiError,
        comparisonOperator   : '$and'
    };

    this.options = _.merge(defaults, options || {});

    this.schema = schema || {};
    this.validatorManager = valManager;
    this.options.context = {
        validatorManager: valManager,
        getSchemaFor: function(validator, customSchema) {
            var schema = valManager.get(validator).getSchema(customSchema);
            return schema;
        }
    };
    //validate method gradually builds data tree of successfuly validated data properties
    //so that data can be run through filter, deleting all unexpected data entities or entities
    //which did not pass the validation
    this.dataTree = {};
    this.error = null;
    this.pool = [];
    //data being validated
    this.data = null;
    this.success;

    if (!_.isPlainObject(schema) && typeof schema !== 'function' ) {
        throw new ValidatorError('validator schema must be an object or a function.')
    }
}

/*
 * getSchema
 *
 * @param  {Object} [customSchema] - schema definition which will be merged into the schema of the validator
 * @return {Object}
 */
Validator.prototype.getSchema = function(customSchema) {
    var schema;

    if (typeof this.schema === 'function') {
        schema = this.schema.apply(this.options.context);
    } else {
        schema = this.schema;
    };

    if (customSchema) {
        //'schema' must be cloned recursively!
        schema = _.cloneDeep(schema);

        _.mergeWith(schema, customSchema, function(objValue, srcValue) {
            //array value overwrites value in schema definition
            if (srcValue instanceof Array) {
                return srcValue;
            }
        });
    }

    return schema;
};

/*
 * validate
 *
 * returns validator report object
 *
 * @param {array}    data - data being validated
 * @param {object}   [customSchema] - schema definition which will be merged into the original schema of the validator
 * @param {object}   [options]
 * @param {boolean}  [options.filterData=true]
 * @param {boolean}  [options.failOnUnexpectedData=false] - applies only if `filterData=true`, it will failt the validation process if data include unexpected data (data which are not described by a validator schema)
 * @param {Array}    [options.only] - if an array is provided, only listed properties are validated. Any data which are not listed in the array will be filtered out (if `filterData` != false)
 * @param {boolean}  [options.failOnFirstErr=false]
 * @param {boolean}  [options.nullAsEmpty=false]
 * @param {Function} [options.validationError=ValidationError]
 * @param {Function} [options.validationMultiError=ValidationMultiError]
 *
 * @return {Validator}
 */
Validator.prototype.validate = function(data, customSchema, options) {
    var self = this;
    options = options || {};

    this.error = null; //TODO ?
    this.pool = [];
    this.dataTree = [];
    this.success = undefined;
    this.data = data;
    //must be cleared
    this.options.sanitizers = [];
    options.sanitizers = [];

    options = _.defaults(options, this.options);
    options.propPath = '';

    var schema = this.getSchema(customSchema);

    if (options.only instanceof Array) {
        schema = this.reduceSchema(schema, options.only)
    }

    var report =  this.build(data, schema, options, data, null, this.dataTree)();
    report.errors = _.flattenDeep(report.errors);

    this.error = this._transformErrors(report.errors, options);
    this.pool = report.pool;
    this.success = report.success;
    this.sanitizers = report.options.sanitizers;

    //filter out unexpected data
    if (    this.success === true
        &&  options.filterData === true
        && (_.isPlainObject(data) || data instanceof Array)
    ) {
        var errors = [];
        this.filterData(data, this.dataTree, function(unexpectedDataItem, index, data) {
            if (options.failOnUnexpectedData === true) {
                var escapedIndex = stringValidator.escape(index);
                var error = new options.validationError('Unexpected data property: ' + escapedIndex);

                self.success = false;
                errors.push(error);

                throw error;
            }

            delete data[index];
        });

        this.error = this._transformErrors(errors, options);
    }

    //run sanitizers if the validator has succeeded
    if (this.success === true) {
        this.runSanitizers();
    }

    return this;
};


/**
 * _transformErrors
 *
 * @param {Array<ValidationError>} errors
 * @param {Object} options
 * @param {Object} options.validationError
 * @param {Object} options.validationMultiError
 *
 * @return {ValidationError|ValidationMultiError|Object} - returns instance of user defined constructor if an user overwriten validationError/validationMultiError constructors
 */
Validator.prototype._transformErrors = function(errors, options) {
    var len = errors.length;

    if (len === 1) {
        return errors.pop();
    } else if (len > 1) {
        var errorMessage = '';
        for (var i = 0, len = errors.length; i < len; i++) {
            errorMessage += errors[i].message + '\n';
        }
        return new options.validationMultiError(errorMessage, errors);
    } else {
        return null;
    }
};

/*
 * reduceSchema
 *
 * @param {Object} schema - validator schema defitions
 * @param {Array} filter - collection of validator keys which should be extracted from the `schema`
 * @return {Object} reduced schema
 */
Validator.prototype.reduceSchema = function(schema, filter) {
    var out = {};
    for (var i = 0, len = filter.length; i < len; i++) {
        if (schema.hasOwnProperty(filter[i])) {
            out[filter[i]] = schema[filter[i]];
        }
    }
    return out;
}

/*
 * filterData
 *
 * @param {Object|Array} data - data being validated
 * @param {Object|Array} filter
 * @param {function} callback - function which is run for every unexpected data item
 * @return {Object|Array}
 */
Validator.prototype.filterData = function(data, filter, callback) {

    if (_.isPlainObject(data)) {
        var allowedKeys = Object.keys(filter);
        var dataKeys = Object.keys(data);

        var allowedDataKeys = [];
        for (var i = 0, len = dataKeys.length; i < len; i++) {
            if (allowedKeys.indexOf(dataKeys[i]) === -1) {
                try {
                    callback.call(this, data[dataKeys[i]], dataKeys[i], data);
                } catch(e) {
                    return;
                }
            } else {
                allowedDataKeys.push(dataKeys[i]);
            }
        }
        for (var y = 0, len = allowedDataKeys.length; y < len; y++) {
            var dataItem = data[allowedDataKeys[y]];
            var key = allowedDataKeys[y];

            if (   typeof dataItem === 'object'
                && dataItem !== null
                && (_.isPlainObject(filter[key]) || filter[key] instanceof Array)
            ) {
                this.filterData(dataItem, filter[key], callback);
            }
        }
    }

    if (data instanceof Array) {
        for (var z = 0, len = data.length; z < len; z++) {
            if (_.isObject(data[z])
                    && (_.isPlainObject(filter[z]) || filter[z] instanceof Array)
               ) {
                this.filterData(data[z], filter[z], callback);
            }
        }
    }
}

/*
 * runSanitizers
 * @return {undefined}
 */
Validator.prototype.runSanitizers = function() {

    for (var i = 0, len = this.sanitizers.length; i < len; i++) {
        this.sanitizers[i]();
    }
};

/*
 * buildCondition
 *
 * @param {array}  pool
 * @param {string} condType - see `conditions` list for available property values
 * @param {object} options
 * @return {Function}
 */
Validator.prototype.buildCondition = function(pool, condType, options) {
    var context = {
        errors: [],
        pool: pool,
        options: options
    };

    return function bulkAssert() {
        if (!context.pool.length) {
            context.success = true;
            return context;
        }
        return conditions[condType].call(context);
    }
}

/*
 * buildAssertion
 *
 * @param {mixed}  val - data value which is being inspected
 * @param {mixed}  filterValue - value of one filter from `where` filter object
 * @param {string} assertType - see `assertions` list for available assertions
 * @return {function}
 */
Validator.prototype.buildAssertion = function(val, filterValue, assertType, options) {
    var context = {
        val           : val,
        filter        : filterValue,
        assertions    : assertions,
        sanitizers    : sanitizers,
        propPath      : options.propPath,
        message       : options.message,
        onSuccess     : options.onSuccess,
        overallData   : options.overallData,
        parentTreeObj : options.parentTreeObj
    };
    return function() {
        try {
            return assertions[assertType].call(context);
        } catch(e) {
            context.success = false;
            return context;
        }
    }
}

/*
 * build
 *
 * build array of assertion functions
 *
 * @param {Object} data
 * @param {Object} where - filter object
 * @param {Object}   [options]
 * @param {string}   [options.propPath='']
 * @param {Array}    [options.sanitizers=[]]
 * @param {object}   [options.filterData=true]
 * @param {boolean}  [options.failOnUnexpectedData=false] - applies only if `filterData=true`
 * @param {Array}    [options.only] - if an array is provided, only listed properties are validated. Any data which are not listed in the array will be filtered out (if `filterData` != false)
 * @param {boolean}  [options.failOnFirstErr=false]
 * @param {boolean}  [options.nullAsEmpty=false]
 * @param {Function} [options.validationError=ValidationError]
 * @param {String} [options.propPath] - path to current property being validated. In dot notation
 * @param {Object|Array} parentDataObj - object which contains value of `data` property OR `data` === parentDataOb
 * @param {String|Integer} parentProp - `parentDataObj[parentProp]` === `data`
 * @return {Function}
 */
Validator.prototype.build = function(data, where, options, parentDataObj, parentProp, parentTreeObj) {

    var self = this;

    var pool = [];
    var objectAssertionWrapperPool = [];

    // loop through all assertion statements recursively
    Object.keys(where).forEach(function(prop) {
        if (where[prop] instanceof Validator) {
            where[prop] = where[prop].getSchema();
        }

        if (assertions.hasOwnProperty(prop)) {//builds single assertion
            var required = where.hasOwnProperty('$required') ? where.$required : options.required;
            if (required === false) {
                if (data === undefined) return;

                if (options.nullAsEmpty === true && data === null) {
                    _.set(parentTreeObj, options.propPath, parentProp);
                    return;
                }
            }

            pool.push( self.buildAssertion(data, where[prop], prop, {
                propPath: options.propPath,
                overallData: self.data,
                message: where.$message || options.message,
                parentTreeObj: parentTreeObj,
                onSuccess: function(context){
                    var currVal = _.get(context.parentTreeObj, options.propPath);
                    if (!_.isPlainObject(currVal) && !(currVal instanceof Array)) {
                        _.set(context.parentTreeObj, options.propPath, parentProp);
                    }
                }
            }));

        } else if (sanitizers.hasOwnProperty(prop)) {// builds sanitizer fn for current data
            self.addSanitizer(prop, where, parentDataObj, parentProp, options);
        } else if (prop === '$sanitize') {// builds sanitizer fn for current data
            options.sanitizers.push(function() {
                if (parentProp !== null) {
                    parentDataObj[parentProp] = where[prop].call(options.context, parentDataObj[parentProp], parentDataObj);
                } else {//top level sanitizer => does not have any parent object
                    where[prop].call(options.context, parentDataObj);
                }
            });
        } else if (conditions.hasOwnProperty(prop)) { // yields new pool of assertions
            if (where[prop] instanceof Array) {
                var subPool = [];
                where[prop].forEach(function(subWhere) {
                    var opt = _.assign({}, options, {
                        required: subWhere.hasOwnProperty('$required') ? subWhere.$required : options.required,
                        message: subWhere.$message || options.message
                    });
                    subPool.push(self.build(data, subWhere, opt, parentDataObj, parentProp, parentTreeObj));
                });
                pool.push(self.buildCondition(subPool, prop, options));
            } else if(_.isPlainObject(where[prop])) {
                var opt = _.assign({}, options, {
                    comparisonOperator: prop,
                    required: where[prop].hasOwnProperty('$required') ? where[prop].$required : options.required,
                    message: where[prop].$message || where.$message || options.message
                });
                pool.push(self.build(data, where[prop], opt, parentDataObj, parentProp, parentTreeObj));
            }
        } else if (prop === '$message' || prop === '$required') {
            return;
        } else if (prop === '$forEach') {// yields new pool of assertions for every item of an array
            var fun = self.buildArrayCondition(prop, data, where, options, parentTreeObj);
            if (fun instanceof Function) {
                pool.push(fun);
            }
        // builds validators for object's properties
        // yields new pool of assertions
        } else if (_.isPlainObject(where[prop]) )  {

            var required = where.hasOwnProperty('$required') ? where.$required : options.required;

            if (required !== true) {
                if (data === undefined) return;

                if (options.nullAsEmpty === true && data === null) {
                    _.set(parentTreeObj, options.propPath, {});
                    return;
                }
            }

            if (!objectAssertionWrapperPool.length) {
                objectAssertionWrapperPool.push( self.buildAssertion(data, Object, '$is', {
                    propPath: options.propPath,
                    message: where.$message || options.message,
                    parentTreeObj: parentTreeObj
                }));
                //this is faster way than defining "onSuccess" callback which would
                //set the property but if and only if it is not set already
                if (_.isPlainObject(data)) {
                    if (options.propPath) {
                        _.set(parentTreeObj, options.propPath, {});
                    }
                }
            }

            //
            var fun = self.buildObjectCondition(prop, data, where, options, parentTreeObj);
            if (fun instanceof Function) {
                pool.push(fun);
            }
        }
    });

    //return condition fn
    var cond = self.buildCondition(pool, options.comparisonOperator, options);

    if (objectAssertionWrapperPool.length) {
        objectAssertionWrapperPool.push(cond);
        return self.buildCondition(objectAssertionWrapperPool, '$and', options);
    }

    return cond;
}

/*
 * addSanitizer
 *
 * mutates options.sanitizers array
 *
 * @param {string} sanitizerProp - one of the properties from `sanitizers` Map
 * @param {Object} where
 * @param {Object|Array} parentDataObj
 * @param {string} parentProp
 * @param {Object} options
 *
 * @return {undefined}
 */
Validator.prototype.addSanitizer = function(sanitizerProp, where, parentDataObj, parentProp, options) {
    var val;

    if (parentProp === null) {
        //top level sanitizer does not have any parent object
        val = parentDataObj;
    } else {
        if (!parentDataObj.hasOwnProperty(parentProp)) {
            //when data does not has such property, do not run the sanitizer for that property
            return;
        }
        val = parentDataObj[parentProp];
    }

    var context = {
        filter           : where[sanitizerProp],
        getSchemaFor     : options.context.getSchemaFor,
        req              : options.context.req,
        validatorManager : options.context.validatorManager,
        val              : val
    };

    options.sanitizers.push(function() {
        var result = sanitizers[sanitizerProp].call(context);
        if (parentProp !== null) {
            parentDataObj[parentProp] = result;
        }
    });
}

/*
 * buildObjectCondition
 *
 * @param {string} prop
 * @param {object} data
 * @param {object} where - filter object
 * @param {object} [options]
 * @param {string} [options.propPath] - path to current property being validated. In dot notation
 * @return {Function}
 */
Validator.prototype.buildObjectCondition = function(prop, data, where, options, parentTreeObj) {
    var path = options.propPath ? options.propPath + '.' + prop : prop;

    var required = where.hasOwnProperty('$required') ? where.$required : options.required;

    //validate property of an object
    required = where[prop].hasOwnProperty('$required') ? where[prop].$required : required;

    if (_.isPlainObject(data)) {
        var opt = _.assign({}, options, {
            propPath      : path,
            required      : required,
            message       : where.$message || options.message
        });
        return this.build(data && data[prop], where[prop], opt, data, prop, parentTreeObj);
    }
}

/*
 * buildArrayCondition
 *
 * @param {string} prop = '$forEach'
 * @param {object} data
 * @param {object} where - filter object
 * @param {object} [options]
 * @param {string} [options.propPath] - path to current property being validated. In dot notation
 * @return {Function}
 */
Validator.prototype.buildArrayCondition = function(prop, data, where, options, parentTreeObj) {
    var andCondPool = [];

    if (options.required === false && data === undefined) {
        return;
    }
    var required = where[prop].hasOwnProperty('$required') ? where[prop].$required : options.required;

    andCondPool.push( this.buildAssertion(data, Array, '$is', {
        propPath: options.propPath,
        message: where.$message || options.message
    }));
    _.set(parentTreeObj, options.propPath, []);

    if ( data instanceof Array ) {
        for (var i = 0, len = data.length; i < len; i++) {
            var opt = _.assign({}, options, {
                comparisonOperator: options.comparisonOperator,
                required: required,
                propPath: options.propPath + '.[' + i + ']',
                message: where[prop].$message || where.$message || options.message
            });
            andCondPool.push(this.build(data[i], where[prop], opt, data, i, parentTreeObj));
        }
    }

    return this.buildCondition(andCondPool, '$and', options);
}
