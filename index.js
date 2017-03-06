var stringValidator           = require('validator');
var ValidationError           = require('./lib/error/validationError.js');
var ValidationMultiError      = require('./lib/error/validationMultiError.js');
var ValidatorManager          = require('./lib/validatorManager.js');
var Validator                 = require('./lib/validator.js');
var expressMiddleware         = require('./lib/expressMiddleware.js');
var expressInjectorMiddleware = require('./lib/expressInjectorMiddleware.js');
var composeError              = require('./lib/composeError.js');
var assertions                = require('./lib/assertions.js');
var sanitizers                = require('./lib/sanitizers.js');
var conditions                = require('./lib/conditions.js');


var validatorManager = new ValidatorManager;

/**
 * define
 *
 * initiates and registers new validator object in cache
 *
 * @param {string}          name - name of the validator
 * @param {Object|Function} schema - validation schema
 * @param {Object}          [options] - see Validator options for more details
 *
 * @return {Validator}
 */
module.exports.define = function(name, schema, options) {
    var validator = new Validator(schema, options, validatorManager);

    validatorManager.add(name, validator);

    return validator;
}


module.exports.Validator            = Validator;
module.exports.ValidationError      = ValidationError;
module.exports.ValidationMultiError = ValidationMultiError;
module.exports.ValidatorManager     = ValidatorManager;
module.exports.getExpressInjector   = expressInjectorMiddleware;
module.exports.getExpressMiddleware = expressMiddleware;
module.exports.error                = composeError;
module.exports.validators           = assertions;
module.exports.sanitizers           = sanitizers;
module.exports.conditions           = conditions;
