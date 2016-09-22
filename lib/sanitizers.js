var stringValidator  = require('validator');
var htmlSanitizer  = require('./htmlSanitizer.js');
var _  = require('lodash');

var sanitizers = module.exports = {
    /*
     * escape
     *
     * recursively escapes every string in provided data structure or a string itself
     * if primitive value is provided
     * mutates input value
     *
     * @param {mixed} this.val
     * @return {mixed}
     */
    escape: function escape() {

        return recursivelyIterate(this.val, function(str) {
            return stringValidator.escape(stringValidator.unescape(str));
        });
    },
    /*
     * sanitizeHtml
     *
     * recursively sanitizes strings in provided data structure according to defined
     * sanitizer options
     *
     * see https://github.com/punkave/sanitize-html for more details about options
     * which can be passed to this.filter
     *
     * @param {mixed} this.val
     * @param {Object} this.filter
     *
     * @return {mixed}
     */
    sanitizeHtml: function() {
        var filter = this.filter;

        return recursivelyIterate(this.val, function(str) {
            return  htmlSanitizer.sanitize(str, filter);
        });
    }
};


/**
 * recursivelyIterate
 *
 * @param {mixed} entity
 * @param {Function} callback - will be called for every string value in data entity, or only once if string value is passed in place of entity
 *
 * @return {mixed}
 */
function recursivelyIterate(entity, callback) {

    if (typeof entity === 'string'){
        entity = callback(entity);
    } else if( _.isPlainObject(entity) ) {

        var keys = Object.keys(entity);
        for (var i = 0, len = keys.length; i < len; i++) {
            entity[keys[i]] = recursivelyIterate(entity[keys[i]], callback);
        }
    } else if (entity instanceof Array) {
        for (var i = 0, len = entity.length; i < len; i++) {
            entity[i] = recursivelyIterate(entity[i], callback);
        }
    }
    return entity;
}
