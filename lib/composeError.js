var sanitizers = require('./sanitizers.js');

/*
 * composeError
 *
 * @param {Object}   options
 * @param {mixed}    options.val
 * @param {String}   options.propPath
 * @param {String}   options.message
 * @param {Function} options.ErrorConstructor
 *
 * @return {Error}
 */
module.exports.compose = function(options) {
    var ErrorConstructor = options.ErrorConstructor;

    var val = sanitizers.escape.call({val: options.val});
    if (typeof val === 'object') {
        val = JSON.stringify(val);
    } else if (typeof val !== 'string') {
        val = val + '';
    }
    var message = options.message.replace(/%p/, options.propPath);
    message = message.replace(/%v/, val);

    var error = new ErrorConstructor(options.propPath, message, val);
    return error;
};
