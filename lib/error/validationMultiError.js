var util = require('util');

/**
 * Error Class ValidationMultiError
 * */
function ValidationMultiError(message, errors) {

    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;

    this.message = message;
    this.errors = errors;
}

util.inherits(ValidationMultiError, Error);
exports = module.exports = ValidationMultiError;
