var stringValidator           = require('validator');
var ValidationError           = require('./error/validationError.js');
var ValidatorManager          = require('./validatorManager.js');
var Validator                 = require('./validator.js');
var expressMiddleware         = require('./expressMiddleware.js');
var expressInjectorMiddleware = require('./expressInjectorMiddleware.js');
var composeError              = require('./composeError.js');
var assertions                = require('./assertions.js');
var sanitizers                = require('./sanitizers.js');
var conditions                = require('./conditions.js');


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


module.exports.Validator            = require('./validator.js');
module.exports.ValidatorManager     = ValidatorManager;
module.exports.getExpressInjector   = expressInjectorMiddleware;
module.exports.getExpressMiddleware = expressMiddleware;
module.exports.error                = composeError;
module.exports.validators           = assertions;
module.exports.sanitizers           = sanitizers;
