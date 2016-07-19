var stringValidator  = require('validator');
var _  = require('lodash');

var $isMap = {};
$isMap[Object] = 'Object';
$isMap[Array]  = 'Array';
$isMap[String] = 'String';
$isMap[Number] = 'Number';
$isMap[null]   = 'null';

var assertions = module.exports = {
    $is: function() {
        if (this.filter === Object || this.filter === $isMap[Object]) {
            this.success = _.isPlainObject(this.val);
        } else if (this.filter === Array || this.filter === $isMap[Array]) {
            this.success = this.val instanceof Array;
        } else if (this.filter === String || this.filter === $isMap[String]) {
            this.success = this.val instanceof String || typeof this.val === 'string';
        } else if (this.filter === Number || this.filter === $isMap[Number]) {
            this.success = this.val instanceof Number || typeof this.val === 'number';
        } else if (this.filter === null) {
            this.success = this.val === null;
        } else {
            //TODO - proper error object
            throw new Error('Invalid `$is` assertion option value');
        }

        transformErrMessage.call(this, function(context) {
            var type = this.filter;
            var messageType = '$is';

            if (type === null) {
                messageType = '$isNull';
            }

            if (typeof this.filter !== 'string') {
                type = $isMap[type];
            }

            context.type = type;
            return this.message(messageType, context);
        });

        return this;
    },
    $isAfter: function() {
        try {
            this.success = stringValidator.isAfter(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.date = this.filter;
                return this.message('$isAfter', context);
            });
        }
        return this;
    },
    $isAlpha: function() {
        try {
            this.success = stringValidator.isAlpha(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.locale = this.filter;
                return this.message('$isAlpha', context);
            });
        }

        return this;
    },
    $isAlphanumeric: function() {
        try {
            this.success = stringValidator.isAlphanumeric(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.locale = this.filter;
                return this.message('$isAlphanumeric', context);
            });
        }
    },
    $isAscii: function() {
        try {
            this.success = stringValidator.isAscii(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isAscii', context);
            });
        }
    },
    $isBase64: function() {
        try {
            this.success = stringValidator.isBase64(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isBase64');
            });
        }
    },
    $isBefore: function() {
        try {
            this.success = stringValidator.isBefore(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.date = this.filter;
                return this.message('$isBefore', context);
            });
        }
    },
    $isBoolean: function() {
        try {
            this.success = stringValidator.isBoolean(this.val + '');
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isBoolean', context);
            });

        }
    },
    $hasByteLength: function() {
        try {
            this.success = stringValidator.isByteLength(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {

                var messageType = minMaxOrBoth({
                    both: 'between.byte',
                    min: 'min.byte',
                    max: 'max.byte',
                }, this.filter, context);

                return this.message(messageType, context);
            });
        }
    },
    $isCreditCard: function() {
        try {
            this.success = stringValidator.isCreditCard(this.val);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isCreditCard', context);
            });

        }
    },
    $isCurrency: function() {
        try {
            this.success = stringValidator.isCurrency(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                if (_.isPlainObject(this.filter)) {
                    _.assign(context, this.filter);
                }

                return this.message('$isCurrency', context);
            });
        }
    },
    $isDataURI: function() {
        try {
            this.success = stringValidator.isDataURI(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isDataURI', context);
            });
        }
    },
    $isDate: function() {
        try {
            this.success = stringValidator.isDate(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isDate', context);
            });
        }
    },
    $isDecimal: function() {
        try {
            this.success = stringValidator.isDecimal(this.val + '');
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isDecimal', context);
            });
        }
    },
    $isDivisibleBy: function() {
        try {
            this.success = stringValidator.isDivisibleBy(this.val + '', this.filter);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.number = this.filter;
                return this.message('$isDivisibleBy', context);
            });
        }
    },
    $isEmail: function() {
        try {
            this.success = stringValidator.isEmail(this.val, this.filter  || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                if (_.isPlainObject(this.filter)) {
                    _.assign(context, this.filter);
                }

                return this.message('$isEmail', context);
            });
        }
    },
    $isFQDN: function() {
        try {
            this.success = stringValidator.isFQDN(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }


        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                if (_.isPlainObject(this.filter)) {
                    _.assign(context, this.filter);
                }

                return this.message('$isFQDN', context);
            });
        }
    },
    $isFloat: function() {
        try {
            this.success = stringValidator.isFloat(this.val + '', this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {

                var messageType;

                if (   _.isPlainObject(this.filter)
                        && (this.filter.min || this.filter.max)
                   ) {
                    messageType = minMaxOrBoth({
                        both: 'between.number',
                        min: 'min.number',
                        max: 'max.number',
                    }, this.filter, context);
                } else {
                    messageType = '$isFloat';
                }

                return this.message(messageType, context);
            });

        }
    },
    $isFullWidth: function() {
        try {
            this.success = stringValidator.isFullWidth(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isFullWidth', context);
            });
        }
    },
    $isHalfWidth: function() {
        try {
            this.success = stringValidator.isHalfWidth(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isHalfWidth', context);
            });
        }
    },
    $isHexColor: function() {
        try {
            this.success = stringValidator.isHexColor(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isHexColor', context);
            });
        }
    },
    $isHexadecimal: function() {
        try {
            this.success = stringValidator.isHexadecimal(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isHexadecimal', context);
            });
        }
    },
    $isIP: function() {
        try {
            this.success = stringValidator.isIP(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.version = this.filter;
                return this.message('$isIP', context);
            });
        }
    },
    $isISBN: function() {
        try {
            this.success = stringValidator.isISBN(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.version = this.filter;
                return this.message('$isISBN', context);
            });
        }
    },
    //
    $isInt: function() {
        try {
            this.success = stringValidator.isInt(this.val + '', this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {

                var messageType;

                if (   _.isPlainObject(this.filter)
                        && (this.filter.min || this.filter.max)
                   ) {
                    messageType = minMaxOrBoth({
                        both: 'between.number',
                        min: 'min.number',
                        max: 'max.number',
                    }, this.filter, context);
                } else {
                    messageType = '$isInt';
                }

                return this.message(messageType, context);
            });
        }
    },
    $isJSON: function() {
        try {
            this.success = stringValidator.isJSON(this.val );
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                return this.message('$isJSON', context);
            });
        }
    },
    $hasLengthOf: function() {
        if (this.val instanceof Array) {
            var defaults = {
                min: 0,
                max: undefined
            };
            this.filter = _.assign(defaults, this.filter || undefined);

            var length = this.val.length;
            this.success = length >= this.filter.min;
            if (this.success !== false && this.filter.max !== undefined) {
                this.success = length <= this.filter.max;
            }

            transformErrMessage.call(this, function(context) {

                var messageType = minMaxOrBoth({
                    both: 'between.array',
                    min: 'min.array',
                    max: 'max.array',
                }, this.filter, context);

                return this.message(messageType, context);
            });

        } else {
            try {
                this.success = stringValidator.isLength(this.val, this.filter || undefined);
                transformErr.call(this);
            } catch (e) {
                transformErr.call(this);
                throw e;
            }

            function transformErr() {
                transformErrMessage.call(this, function(context) {

                    var messageType = minMaxOrBoth({
                        both: 'between.string',
                        min: 'min.string',
                        max: 'max.string',
                    }, this.filter, context);

                    return this.message(messageType, context);
                });
            }
        }
        return this;
    },
    $isNumeric: function() {
        this.success = isNumeric(this.val);

        transformErrMessage.call(this, function(context) {
            return this.message('$isNumeric', context);
        });

        return this;
    },
    $isURL: function() {
        try {
            this.success = stringValidator.isURL(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                if (_.isPlainObject(this.filter)) {
                    _.assign(context, this.filter);
                }

                return this.message('$isURL', context);
            });
        }
    },
    $isUUID: function() {
        try {
            this.success = stringValidator.isUUID(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.version = this.filter;
                return this.message('$isUUID', context);
            });
        }
    },
    $matches: function() {
        try {
            this.success = stringValidator.matches(this.val, this.filter || undefined);
            transformErr.call(this);
        } catch (e) {
            transformErr.call(this);
            throw e;
        }

        return this;

        function transformErr() {
            transformErrMessage.call(this, function(context) {
                context.pattern = this.filter;
                return this.message('$matches', context);
            });
        }
    },
    $isEmpty: function() {
        this.success = this.val === null || this.val === undefined || this.val === '';

        transformErrMessage.call(this, function(context) {
            return this.message('$isEmpty', context);
        });

        return this;
    },
    $gt: function() {
        var filter = inspectRef(this.filter, this.overallData);
        this.success = isNumeric(this.val) && isNumeric(filter);

        if (this.success === true) {
            this.val = parseFloat(this.val);
            this.filter = parseFloat(this.filter);
            this.success = this.val > filter;
        }

        transformErrMessage.call(this, function(context) {
            context.min = filter;
            return this.message('$gt', context);
        });

        return this;
    },
    $gte: function() {
        var filter = inspectRef(this.filter, this.overallData);
        this.success = isNumeric(this.val) && isNumeric(filter);

        if (this.success === true) {
            this.success = this.val >= filter;
        }

        transformErrMessage.call(this, function(context) {
            context.min = filter;
            return this.message('$gte', context);
        });

        return this;
    },
    $lt: function() {
        var filter = inspectRef(this.filter, this.overallData);
        this.success = isNumeric(this.val) && isNumeric(filter);

        if (this.success === true) {
            this.val = parseFloat(this.val);
            this.filter = parseFloat(this.filter);
            this.success = this.val < filter;
        }

        transformErrMessage.call(this, function(context) {
            context.max = filter;
            return this.message('$lt', context);
        });

        return this;
    },
    $lte: function() {
        var filter = inspectRef(this.filter, this.overallData);
        this.success = isNumeric(this.val) && isNumeric(filter);

        if (this.success === true) {
            this.val = parseFloat(this.val);
            this.filter = parseFloat(this.filter);
            this.success = this.val <= filter;
        }

        transformErrMessage.call(this, function(context) {
            context.max = filter;
            return this.message('$lte', context);
        });

        return this;
    },
    $eq: function() {
        var filter = inspectRef(this.filter, this.overallData);
        this.success = this.val == filter;

        transformErrMessage.call(this, function(context) {
            context.value = filter;
            return this.message('$eq', context);
        });

        return this;
    },
    $ne: function() {
        var filter = inspectRef(this.filter, this.overallData);
        this.success = this.val != filter;

        transformErrMessage.call(this, function(context) {
            context.value = filter;
            return this.message('$ne', context);
        });

        return this;
    },
    $between: function() {
        if (this.filter instanceof Array) {
            this.success = isNumeric(this.val)
                && isNumeric(this.filter[0])
                && isNumeric(this.filter[1]);
        } else {
            throw new Error('$between - invalid option data format. Expected array of two values');
        }

        if (this.success === true) {

            //string values are compared lexicographically, thus we need to
            //parse the values
            this.val = parseFloat(this.val);
            this.filter[0] = parseFloat(this.filter[0]);
            this.filter[1] = parseFloat(this.filter[1]);

            this.success = this.val >= this.filter[0] && this.val <= this.filter[1];
        }

        transformErrMessage.call(this, function(context) {
            context.min = this.filter[0];
            context.max = this.filter[1];
            return this.message('between.number', context);
        });

        return this;
    },
    $notBetween: function() {
        if (this.filter instanceof Array) {
            this.success = isNumeric(this.val)
                && isNumeric(this.filter[0])
                && isNumeric(this.filter[1]);
        } else {
            throw new Error('$notBetween - invalid option data format. Expected array of two values');
        }

        if (this.success === true) {

            //string values are compared lexicographically, thus we need to
            //parse the values
            this.val = parseFloat(this.val);
            this.filter[0] = parseFloat(this.filter[0]);
            this.filter[1] = parseFloat(this.filter[1]);

            this.success = this.val < this.filter[0] || this.val > this.filter[1];
        }

        transformErrMessage.call(this, function(context) {
            context.min = this.filter[0];
            context.max = this.filter[1];

            return this.message('not.between.number', context);
        });

        return this;
    },
    /*
     * $like
     *
     * behaves like sql `LIKE` operator
     * possible setup:
     * 1.   $like: { $any: ['%cat', 'hat%']}
     * 2.   $like: "%some-string%"
     *
     * @param {Object|string} [this.filter]
     * @param {string}        [this.value]
     * @param {object}        [this.assertions]
     *
     * @return {object}
     */
    $like: function() {
        if (_.isPlainObject(this.filter) && this.filter.$any instanceof Array) {
            for (var i = 0, len = this.filter.$any.length; i < len; i++) {
                var context = {
                    val        : this.val,
                    filter     : this.filter.$any[i]
                };
                var result = like.call(context);
                if (result) {
                    this.success = true;
                    return this;
                }
            }
            this.success = false;
        } else if(!_.isObject(this.filter)) {
            this.success = like.call(this);
        } else {
            throw new Error('Invalid `$like` option value format');
        }

        //if success is false and `this.message` is a function, the function is called and message is
        //replaced with function's result
        transformErrMessage.call(this, function(context) {
            var messageType = '$like';
            context.format = this.filter;

            if (_.isPlainObject(this.filter) && this.filter.$any instanceof Array) {
                messageType = '$like_$any';
                context.format = this.filter.$any.join(' | ');
            }

            return this.message(messageType, context);
        });

        return this;

        function like() {
            var extendLeft = this.filter.charAt(0) === "%";
            var extendRight = this.filter.charAt(this.filter.length -1) === "%";

            var filter = this.filter;
            if (extendLeft) filter = filter.substr(1);
            if (extendRight) filter = filter.substr(0, filter.length -1);

            var existsAt = this.val.indexOf(filter);

            if (existsAt === -1) {
                return false;
            } else if (!extendLeft && existsAt > 0) {
                return false;
            } else if (!extendRight && (existsAt + filter.length) < this.val.length ) {
                return false;
            }

            return true;
        }
    },
    $notLike: function() {
        var messageBck = this.message;

        this.success = !this.assertions.$like.call(this).success;
        this.message = messageBck;

        transformErrMessage.call(this, function(context) {
            var messageType = 'not.$like';
            context.format = this.filter;

            if (_.isPlainObject(this.filter) && this.filter.$any instanceof Array) {
                messageType = 'not.$like_$any';
                context.format = this.filter.$any.join(' | ');
            }

            return this.message(messageType, context);
        });

        return this;
    },
    /*
     * $iLike
     *
     * case insensetive `$like` version
     *
     * @param {Object|string} [this.filter]
     * @param {string}        [this.value]
     * @param {object}        [this.assertions]
     *
     * @return {object}
     */
    $iLike: function() {
        var messageBck = this.message;
        this.val = this.val.toLowerCase();

        if (_.isPlainObject(this.filter) && this.filter.$any instanceof Array) {
            this.filter.$any.forEach(function(any, index, array) {
                array[index] = any.toLowerCase();
            });
        } else {
            this.filter = this.filter.toLowerCase();
        }

        this.success = this.assertions.$like.call(this).success;
        this.message = messageBck;

        transformErrMessage.call(this, function(context) {
            var messageType = '$iLike';
            context.format = this.filter;

            if (_.isPlainObject(this.filter) && this.filter.$any instanceof Array) {
                messageType = '$iLike_$any';
                context.format = this.filter.$any.join(' | ');
            }

            return this.message(messageType, context);
        });

        return this;
    },
    $notILike: function() {
        var messageBck = this.message;

        this.success = !this.assertions.$iLike.call(this).success;
        this.message = messageBck;

        transformErrMessage.call(this, function(context) {
            var messageType = 'not.$iLike';
            context.format = this.filter;

            if (_.isPlainObject(this.filter) && this.filter.$any instanceof Array) {
                messageType = 'not.$iLike_$any';
                context.format = this.filter.$any.join(' | ');
            }

            return this.message(messageType, context);
        });

        return this;
    },
    $in: function() {
        var filter = this.filter;
        var val = this.val;

        if (_.isPlainObject(this.filter)) {
            filter = Object.keys(this.filter);
            val = val + '';
        }
        this.success = filter.indexOf(val) !== -1;

        transformErrMessage.call(this, function(context) {
            return this.message('$in', context);
        });

        return this;
    },
    $notIn: function() {
        var messageBck = this.message;

        this.success = !this.assertions.$in.call(this).success;
        this.message = messageBck;

        transformErrMessage.call(this, function(context) {
            return this.message('not.$in', context);
        });

        return this;
    }
};

/*
 * inspectRef
 *
 * @param {mixed} filter
 * @param {Object} data
 */
function inspectRef(filter, data) {
    if (_.isPlainObject(filter) && filter.hasOwnProperty('$ref')) {
        return _.get(data, filter.$ref);
    }

    return filter;
}


/**
 * isNumeric
 *
 * checks if string is valid integer or float value
 *
 * @param {mixed} value
 *
 * @return {boolean}
 */
function isNumeric(value) {
    return stringValidator.isNumeric(value + '')
        || stringValidator.isFloat(value + '')
}


/**
 * transformErrMessage
 *
 * @param {Function} callback
 * @param {Assertion} this
 *
 * @return {undefined}
 */
function transformErrMessage(callback) {
    if (   (this.success !== true || (this.success === true && this.negated) )
        && typeof this.message === 'function'
    ) {
        this.message = callback.call(this, {
            attr: this.propPath,
            negated: this.negated || false
        });
    }
}


/**
 * getFirstSecondOrBoth
 *
 * util function used in `transformErrMessage` callback fn
 *
 * @param {Object} def
 * @param {Object} opt
 * @param {Object} context
 *
 * @return {string}
 */
function minMaxOrBoth(def, opt, context) {
    var out = def.both;

    if (_.isPlainObject(opt)) {
        context.min = opt.min;
        context.max = opt.max;

        if (opt.max === undefined) {
            delete context.max;
            messageType = def.min;
        }

        if (opt.min === undefined && opt.max !== undefined) {
            delete context.min;
            messageType = def.max;
        }
    }

    return out;
}
