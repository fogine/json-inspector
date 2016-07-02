
var queryString = require('qs');

module.exports = getExpressMiddleware;
/*
 * getExpressMiddleware
 *
 * @param {string|Function|Object} valDef - string => registered validator's name. Funtion => function returning object schema definition. Object => schema definition
 * @param {string}  dataProp - query|body|params
 * @param {Object} [customSchema]
 * @param {Object} [options] - See Validator.validate options for more details
 * @return {Validator}
 */
function getExpressMiddleware(valDef, dataProp, customSchema, options) {
    options = options || {};

    return function(req, res, next) {

        var data = req[dataProp];

        var validator = req.validator.validateData(valDef, data, customSchema, options)
        if (validator.success === true) {
            if (dataProp === 'query' && req.validator.options.expressVersion >= 5) {
                var query = '/?' + queryString.stringify(data);
                req.url = query;
            }
            return next();
        }

        return next(validator.error);
    }
}
