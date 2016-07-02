var util = require('util');

/**
 * Error Class ValidatorError
 * */
function ValidatorError(message, errors) {

    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;

    this.message = message;
    this.errors = errors;
}

util.inherits(ValidatorError, Error);
exports = module.exports = ValidatorError;
