var util = require('util');

/**
 * Error Class ValidationError
 * */
function ValidationError(param, message, value) {

    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;

    this.param = param;
    this.message = message;
    this.value = value;
}

util.inherits(ValidationError, Error);
exports = module.exports = ValidationError;
