var ValidationError  = require('./error/validationError.js');
var sanitizers = require('./sanitizers.js');
var composeError = require('./composeError.js');
var _  = require('lodash');

var conditions = module.exports = {
    /*
     * $and
     *
     * returns true if all assertions are resolved
     *
     * @param {array} [this.pool]
     * @return {object}
     */
    $and: function() {
        var assertions = this.pool;

        //onSuccess hooks which will be run only if condition resolves to true
        var hooks = [];

        for (var i = 0, len = assertions.length; i < len; i++) {

            var assertion = assertions[i]();
            if (assertion.success === false) {
                if (assertion.hasOwnProperty('errors')) {
                    this.errors.push(assertion.errors);
                } else {
                    this.errors.push(composeError.compose({
                        ErrorConstructor: this.options.validationError,
                        val: assertion.val,
                        propPath: assertion.propPath,
                        message: assertion.message
                    }));
                }
                this.success = false;
                if (this.options.failOnFirstErr === true) {
                    return this;
                }
            } else {
                if (typeof assertion.onSuccess === 'function') {
                    hooks.push(assertion);
                }
                if (assertion.options && assertion.options.hasOwnProperty('sanitizers')) {
                    this.options.sanitizers = _.union(this.options.sanitizers, assertion.options.sanitizers);
                }
            }
        }

        for (var y = 0, len2 = hooks.length; y < len2; y++) {
            var onSuccess = hooks[y].onSuccess;
            onSuccess(hooks[y]);
        }
        if (this.success === undefined) {
            this.success = true;
        }
        return this;
    },

    /*
     * $or
     *
     * returns true if at least one assertion is resolved
     *
     * @param {array} [this.pool]
     * @return {object}
     */
    $or: function() {

        var assertions = this.pool;
        var numOfGenericErrors = 0;

        for (var i = 0, len = assertions.length; i < len; i++) {

            var assertion = assertions[i]();
            if ( assertion.success === true) {
                this.success = true;

                if (typeof assertion.onSuccess === 'function') {
                    assertion.onSuccess(assertion);
                }

                return this;
            //TODO errors for or conditions must be handled differently, now
            //only first error is showed... how to solve this?
            } else if (!numOfGenericErrors) {
                if (assertion.hasOwnProperty('errors')) {
                    this.errors.push(assertion.errors);
                } else {
                    this.errors.push(composeError.compose({
                        ErrorConstructor: this.options.validationError,
                        val: assertion.val,
                        propPath: assertion.propPath,
                        message: assertion.message
                    }));
                }
                numOfGenericErrors++;
            }
        }

        this.success = false;
        return this;
    }
};

