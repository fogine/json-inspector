
var ValidatorManager = require('./validatorManager.js');
var Validator        = require('./validator.js');
var _                = require('lodash');
var assertions       = require('./assertions.js');

module.exports = getExpressInjector;

/*
 * getExpressInjector
 *
 * returns middleware which injects validation support to express app
 *
 * @param {Object}   [options]
 * @param {Object}   [options.definitions]
 * @param {Object}   [options.expressVersion=4]
 * @param {Object}   [options.customAssertions]
 * @param {Object}   [options.context={}]
 * @param {boolean}  [options.required=false]
 * @param {string}   [options.message="Invalid data for %p ,got: %v"]
 * @param {boolean}  [options.failOnFirstErr=false]
 * @param {boolean}  [options.nullable=false]
 * @param {Function} [options.validationError=ValidationError]
 * @param {string}   [options.comparisonOperator="and"] - one of the property names from `conditions` list. Determines default comarison operator between multiple assertions in `where` filter object *
 * @return {function}
 */
function getExpressInjector(options) {

    var valManager = new ValidatorManager();

    options = options || {};

    // validator definitions
    var definitions = options.definitions;

    // custom validator assertions like hasLengthOf etc..
    var customAssertions = options.customAssertions;

    delete options.definitions;
    delete options.customAssertions;

    addCustomAssertions(customAssertions || {});

    validatorMiddleware.options = options;
    validatorMiddleware.validatorManager = valManager;

    return validatorMiddleware;

    function validatorMiddleware(req, res, next) {

        //builds new Validators from validator json schema definitions
        if (_.isPlainObject(definitions)) {
            registerValidators(definitions, valManager, req);
        }

        var expressValidator = req.validator = {};
        expressValidator.options = options;

        req.validatorManager = valManager;

        /**
         * define
         *
         * define new validator
         *
         * builds Validator object and registers it in internal register
         *
         * @param {mixed} data
         * @param {Function|Object} validator - Funtion => function returning object schema definition. Object => schema definition
         *
         * @return {Validator}
         */
        expressValidator.define = function defineValidator(name, validator) {
            var val = new Validator(validator, options, valManager);
            val.options.context.req = req;
            valManager.add(name, val);
            return val;
        };

        /**
         * validateData
         *
         * @param {string|Function|Object} validator - string => registered validator's name. Funtion => function returning object schema definition. Object => schema definition
         * @param {mixed} data
         * @param {Object} customSchema
         * @param {Object} opt
         *
         * @throws {ValidatorError}
         * @return {Validator}
         */
        expressValidator.validateData = function validateData(validator, data, customSchema, opt) {
            var val;
            if (typeof validator === 'string') {
                val = valManager.get(validator);
            } else {
                val = new Validator(validator, options, valManager);
                val.options.context.req = req;
            }

            return val.validate(data, customSchema, opt);
        };

        /**
         * validateQuery
         *
         * @param {string|Function|Object} validator - string => registered validator's name. Funtion => function returning object schema definition. Object => schema definition
         * @param {Object} customSchema
         * @param {Object} opt
         *
         * @return {Validator}
         */
        expressValidator.validateQuery = function validateQuery(validator, customSchema, opt) {
            return req.validator.validateData(validator, req.query, customSchema, opt);
        };

        /**
         * validateBody
         *
         * @param {string|Function|Object} validator - string => registered validator's name. Funtion => function returning object schema definition. Object => schema definition
         * @param {Object} customSchema
         * @param {Object} opt
         *
         * @return {Validator}
         */
        expressValidator.validateBody = function validateBody(validator, customSchema, opt) {
            return req.validator.validateData(validator, req.body, customSchema, opt);
        };

        /**
         * validateParams
         *
         * @param {string|Function|Object} validator - string => registered validator's name. Funtion => function returning object schema definition. Object => schema definition
         * @param {Object} customSchema
         * @param {Object} opt
         *
         * @return {Validator}
         */
        expressValidator.validateParams = function validateParams(validator, customSchema, opt) {
            return req.validator.validateData(validator, req.params, customSchema, opt);
        };

        return next();
    }

    /*
     * addCustomAssertions
     *
     * @param {Object} validators
     * @return {undefined}
     */
    function addCustomAssertions(validators) {
        Object.keys(validators).forEach(function(name) {
            var fn = validators[name];
            assertions[name] = fn;
        });
    }

    /**
     * registerValidators
     *
     * @param {Object} definitions
     * @param {ValidatorManager} valManager
     * @return {undefined}
     */
    function registerValidators(definitions, valManager, req) {
        var valNames = Object.keys(definitions);

        for (var i = 0, len = valNames.length; i < len; i++) {
            var name = valNames[i];
            var def = definitions[valNames[i]];

            if (def instanceof Validator) {
                valManager.add(name, def);
            } else if (['object', 'function'].indexOf(typeof def) !== -1) {
                var validator = new Validator(def, options, valManager);
                validator.options.context.req = req;
                valManager.add(name, validator);
            }
        }
    }
}
