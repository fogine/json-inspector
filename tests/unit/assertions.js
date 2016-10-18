var sinon               = require('sinon');
var chai                = require('chai');
var expect              = chai.expect;
var sinonChai           = require("sinon-chai");
var stringValidator     = require('validator');
var assertions          = require('../../lib/assertions.js');

chai.use(sinonChai);
chai.should();

describe('is', function() {
    it('should check for plain object', function() {
        var context = {
            filter: Object,
            val: {test: 'val'}
        };

        var resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.filter = 'Object';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = new String('test');
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);
    });

    it('should check for an array', function() {
        var context = {
            filter: Array,
            val: ['test', 1]
        };

        var resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.filter = 'Array';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = {test: 1};
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);

        context.val = 'test';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);
    });

    it('should check for a string', function() {
        var context = {
            filter: String,
            val: 'teststring'
        };

        var resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.filter = 'String';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = new String('test');
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = 1;
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);

        context.val = {test: '42'};
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);

    });

    it('should check for a number', function() {
        var context = {
            filter: Number,
            val: 2
        };

        var resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.filter = 'Number';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = new Number(3);
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = '3';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);

        context.val = {test: 3};
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);
    });

    it('should check for a Boolean', function() {
        var context = {
            filter: Boolean,
            val: true
        };

        var resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.filter = 'Boolean';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = false;
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = 'true';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);

        context.val = {};
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);
    });

    it('should check for a null value', function() {
        var context = {
            filter: null,
            val: null
        };

        var resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', true);

        context.val = 1;
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);

        context.val = 'null';
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);

        context.val = false;
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);

        context.val = {test: '42'};
        resolvedContext = assertions.is.call(context);
        resolvedContext.should.have.property('success', false);
    });

    it('should support a function as `message` option value', function() {
        var resolvedContext = assertions.is.call({
            filter: null,
            val: 'invalid',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isNull');
                context.type.should.be.equal('null');
                return assertionType;
            }
        });
        resolvedContext.message.should.be.equal('isNull');


        resolvedContext = assertions.is.call({
            filter: Number,
            val: 'invalid',
            message: function(assertionType, context) {
                assertionType.should.be.equal('is');
                context.type.should.be.equal('Number');
                return assertionType;
            }
        });
        resolvedContext.message.should.be.equal('is');


        resolvedContext = assertions.is.call({
            filter: Object,
            val: 'invalid',
            message: function(assertionType, context) {
                assertionType.should.be.equal('is');
                context.type.should.be.equal('Object');
                return assertionType;
            }
        });
        resolvedContext.message.should.be.equal('is');
    });

    it('should throw an error when unsupported filter option is given', function() {
        var invalid = [
            {val: 'test', filter: 'string'},
            {val: null, filter: 'null'},
            {val: 1, filter: 'number'},
            {val: [], filter: 'array'},
            {val: {}, filter: 'object'},
            {val: {}, filter: undefined},
            {val: {}},
            {}
        ];

        invalid.forEach(function(testVal, i) {
            function test() {
                assertions.is.call(testVal);
            }
            expect(test).to.throw(Error);
        });
    });
});

describe('isAfter', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isAfter');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isAfter` validator library', function() {

        var context = {
            filter: '2016-08-02',
            val: '2016-09-02'
        };

        var resolvedContext = assertions.isAfter.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: '2016-10-02',
            val: '2016-09-02',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isAfter');
                context.date.should.be.equal('2016-10-02');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isAfter.call(context);

        resolvedContext.message.should.be.equal('isAfter');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {

        shouldTransformFilterValueToUndefined('isAfter', {
            filter: '',
            val: '2016-09-02'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAfter', {
            filter: null,
            val: '2016-09-02'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAfter', {
            filter:  0,
            val: '2016-09-02'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAfter', {
            filter: false,
            val: '2016-09-02'
        }, this.spy);
    });
});

describe('isAlpha', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isAlpha');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isAlpha` validator', function() {
        var context = {
            filter: 'en-US',
            val: 'abcd'
        };

        var resolvedContext = assertions.isAlpha.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 'en-US',
            val: '1nv4l1d',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isAlpha');
                context.locale.should.be.equal('en-US');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isAlpha.call(context);

        resolvedContext.message.should.be.equal('isAlpha');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isAlpha', {
            filter: '',
            val: 'abcd'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAlpha', {
            filter:  null,
            val: 'abcd'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAlpha', {
            filter:  0,
            val: 'abcd'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAlpha', {
            filter: false,
            val: 'abcd'
        }, this.spy);
    });
});

describe('isAlphanumeric', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isAlphanumeric');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isAlphanumeric` validator', function() {
        var context = {
            filter: 'en-US',
            val: 'abcd123'
        };

        var resolvedContext = assertions.isAlphanumeric.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 'en-US',
            val: '!nvalid',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isAlphanumeric');
                context.locale.should.be.equal('en-US');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isAlphanumeric.call(context);

        resolvedContext.message.should.be.equal('isAlphanumeric');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isAlphanumeric', {
            filter: '',
            val: 'abcd123'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAlphanumeric', {
            filter:  null,
            val: 'abcd123'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAlphanumeric', {
            filter:  0,
            val: 'abcd123'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isAlphanumeric', {
            filter:  false,
            val: 'abcd123'
        }, this.spy);
    });
});

describe('isAscii', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isAscii');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isAscii` validator', function() {
        var context = {
            val: 'abcd123'
        };

        var resolvedContext = assertions.isAscii.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: '¢',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isAscii');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isAscii.call(context);

        resolvedContext.message.should.be.equal('isAscii');
    });
});

describe('isBase64', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isBase64');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isBase64` validator', function() {
        var context = {
            val: new Buffer("Hello World").toString('base64')
        };

        var resolvedContext = assertions.isBase64.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isBase64');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isBase64.call(context);

        resolvedContext.message.should.be.equal('isBase64');
    });
});

describe('isBefore', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isBefore');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isBefore` validator', function() {

        var context = {
            filter: '2016-10-02',
            val: '2016-09-02'
        };

        var resolvedContext = assertions.isBefore.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: '2016-08-02',
            val: '2016-09-02',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isBefore');
                context.date.should.be.equal('2016-08-02');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isBefore.call(context);

        resolvedContext.message.should.be.equal('isBefore');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isBefore', {
            filter: '',
            val: '2016-09-02'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isBefore', {
            filter:  null,
            val: '2016-09-02'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isBefore', {
            filter:  0,
            val: '2016-09-02'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isBefore', {
            filter:  false,
            val: '2016-09-02'
        }, this.spy);
    });
});

describe('isBoolean', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isBoolean');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isBoolean` validator', function() {
        var context = {
            val: 'false'
        };

        var resolvedContext = assertions.isBoolean.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isBoolean');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isBoolean.call(context);

        resolvedContext.message.should.be.equal('isBoolean');
    });

    it('should coerce string type of validated value before validation is forwarded to the external validator method', function() {
        var context = {
            val: false
        };

        var resolvedContext = assertions.isBoolean.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val.toString());
    });
});

describe('hasByteLength', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isByteLength');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `hasByteLength` validator', function() {

        var context = {
            filter: {min: 2, max: 2},
            val: 'ab'
        };

        var resolvedContext = assertions.hasByteLength.call(context);
        resolvedContext.should.have.property('success', true, 'hasByteLength returned unexpected unsuccessfull response');
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: {min: 2, max: 2},
            val: 'abcd',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('between.byte');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.hasByteLength.call(context);

        resolvedContext.message.should.be.equal('between.byte');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('hasByteLength', {
            filter: '',
            val: 'some-string'
        }, this.spy);

        shouldTransformFilterValueToUndefined('hasByteLength', {
            filter:  null,
            val: 'some-string'
        }, this.spy);

        shouldTransformFilterValueToUndefined('hasByteLength', {
            filter:  0,
            val: 'some-string'
        }, this.spy);

        shouldTransformFilterValueToUndefined('hasByteLength', {
            filter:  false,
            val: 'some-string'
        }, this.spy);
    });
});

describe('isCreditCard', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isCreditCard');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isCreditCard` validator', function() {

        var context = {
            val: '5555555555554444'
        };

        var resolvedContext = assertions.isCreditCard.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'abcd',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isCreditCard');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isCreditCard.call(context);

        resolvedContext.message.should.be.equal('isCreditCard');
    });
});

describe('isCurrency', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isCurrency');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isCurrency` validator', function() {

        var context = {
            filter: {},
            val: '5'
        };

        var resolvedContext = assertions.isCurrency.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: {},
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isCurrency');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isCurrency.call(context);

        resolvedContext.message.should.be.equal('isCurrency');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isCurrency', {
            filter: '',
            val: '5'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isCurrency', {
            filter:  null,
            val: '5'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isCurrency', {
            filter:  0,
            val: '5'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isCurrency', {
            filter:  false,
            val: '5'
        }, this.spy);
    });
});

describe('isDataURI', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isDataURI');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isDataURI` validator', function() {
        var context = {
            val: 'data:,Hello%2C%20World!'
        };

        var resolvedContext = assertions.isDataURI.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isDataURI');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isDataURI.call(context);

        resolvedContext.message.should.be.equal('isDataURI');
    });
});

describe('isDate', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isDate');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isDate` validator', function() {
        var context = {
            val: '2011-08-04'
        };

        var resolvedContext = assertions.isDate.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isDate');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isDate.call(context);

        resolvedContext.message.should.be.equal('isDate');
    });
});

describe('isDecimal', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isDecimal');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isDecimal` validator', function() {
        var context = {
            val: '12.12'
        };

        var resolvedContext = assertions.isDecimal.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isDecimal');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isDecimal.call(context);

        resolvedContext.message.should.be.equal('isDecimal');
    })

    it('should coerce string type of validated value before validation is forwarded to the external validator method', function() {
        var context = {
            val: .10
        };

        var resolvedContext = assertions.isDecimal.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val.toString());
    });
});

describe('isDivisibleBy', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isDivisibleBy');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isDivisibleBy` validator', function() {
        var context = {
            filter: 2,
            val: '4'
        };

        var resolvedContext = assertions.isDivisibleBy.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 4,
            val: 3,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isDivisibleBy');
                context.attr.should.be.equal('prop.path');
                context.number.should.be.equal(4);
                return assertionType;
            }
        };
        var resolvedContext = assertions.isDivisibleBy.call(context);

        resolvedContext.message.should.be.equal('isDivisibleBy');
    });

    it('should coerce string type of validated value before validation is forwarded to the external validator method', function() {
        var context = {
            filter: 2,
            val: 4
        };

        var resolvedContext = assertions.isDivisibleBy.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val.toString(), context.filter);
    });
});

describe('isEmail', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isEmail');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isEmail` validator', function() {

        var context = {
            filter: {},
            val: 'test@test.com'
        };

        var resolvedContext = assertions.isEmail.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: {},
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isEmail');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isEmail.call(context);

        resolvedContext.message.should.be.equal('isEmail');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isEmail', {
            filter: '',
            val: 'test@test.com'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isEmail', {
            filter:  null,
            val: 'test@test.com'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isEmail', {
            filter:  0,
            val: 'test@test.com'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isEmail', {
            filter:  false,
            val: 'test@test.com'
        }, this.spy);
    });
});

describe('isFQDN', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isFQDN');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isFQDN` validator', function() {

        var context = {
            filter: {},
            val: 'mymail.somecollege.edu'
        };

        var resolvedContext = assertions.isFQDN.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: {},
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isFQDN');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isFQDN.call(context);

        resolvedContext.message.should.be.equal('isFQDN');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isFQDN', {
            filter: '',
            val: 'mymail.somecollege.edu'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isFQDN', {
            filter:  null,
            val: 'mymail.somecollege.edu'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isFQDN', {
            filter:  0,
            val: 'mymail.somecollege.edu'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isFQDN', {
            filter:  false,
            val: 'mymail.somecollege.edu'
        }, this.spy);
    });
});

describe('isFloat', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isFloat');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isFloat` validator', function() {

        var context = {
            filter: {min: 1.5, max: 3.3},
            val: '3.3'
        };

        var resolvedContext = assertions.isFloat.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        //test1
        var context = {
            filter: {min: 2, max: 2},
            val: '3',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('between.number');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };

        var resolvedContext = assertions.isFloat.call(context);
        resolvedContext.message.should.be.equal('between.number');

        //test 2
        var context2 = {
            val: 'invalid',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isFloat');
                return assertionType;
            }
        };
        var resolvedContext2 = assertions.isFloat.call(context2);
        resolvedContext2.message.should.be.equal('isFloat');

    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isFloat', {
            filter: '',
            val: '3.3'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isFloat', {
            filter:  null,
            val: '3.3'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isFloat', {
            filter:  0,
            val: '3.3'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isFloat', {
            filter:  false,
            val: '3.3'
        }, this.spy);
    });

    it('should coerce string type of validated value before validation is forwarded to the external validator method', function() {
        var context = {
            filter: undefined,
            val: 4.4
        };

        var resolvedContext = assertions.isFloat.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val.toString(), context.filter);
    });
});

describe('isFullWidth', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isFullWidth');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isFullWidth` validator', function() {

        var context = {
            val: 'Ｅｎｔｅｒ  ｓｏｍｅ  ｔｅｘｔ'
        };

        var resolvedContext = assertions.isFullWidth.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isFullWidth');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isFullWidth.call(context);

        resolvedContext.message.should.be.equal('isFullWidth');
    });
});
describe('isHalfWidth', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isHalfWidth');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'ｔｅｘｔ',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isHalfWidth');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isHalfWidth.call(context);

        resolvedContext.message.should.be.equal('isHalfWidth');
    });

    it('should call external `isHalfWidth` validator', function() {

        var context = {
            val: 'Some text'
        };

        var resolvedContext = assertions.isHalfWidth.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });
});

describe('isHexColor', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isHexColor');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isHexColor` validator', function() {

        var context = {
            val: '#1f1f1f'
        };

        var resolvedContext = assertions.isHexColor.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isHexColor');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isHexColor.call(context);

        resolvedContext.message.should.be.equal('isHexColor');
    });
});

describe('isHexadecimal', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isHexadecimal');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isHexadecimal` validator', function() {

        var context = {
            val: '1f'
        };

        var resolvedContext = assertions.isHexadecimal.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isHexadecimal');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isHexadecimal.call(context);

        resolvedContext.message.should.be.equal('isHexadecimal');
    });
});

describe('isIP', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isIP');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isIP` validator', function() {

        var context = {
            filter: 4,
            val: '192.168.0.1'
        };

        var resolvedContext = assertions.isIP.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 4,
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isIP');
                context.attr.should.be.equal('prop.path');
                context.version.should.be.equal(4);
                return assertionType;
            }
        };
        var resolvedContext = assertions.isIP.call(context);

        resolvedContext.message.should.be.equal('isIP');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isIP', {
            filter: '',
            val: '192.168.0.1'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isIP', {
            filter:  null,
            val: '192.168.0.1'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isIP', {
            filter:  0,
            val: '192.168.0.1'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isIP', {
            filter:  false,
            val: '192.168.0.1'
        }, this.spy);
    });
});

describe('isISBN', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isISBN');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isISBN` validator', function() {

        var context = {
            filter: 13,
            val: '978-3-16-148410-0'
        };

        var resolvedContext = assertions.isISBN.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 13,
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isISBN');
                context.attr.should.be.equal('prop.path');
                context.version.should.be.equal(13);
                return assertionType;
            }
        };
        var resolvedContext = assertions.isISBN.call(context);

        resolvedContext.message.should.be.equal('isISBN');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isISBN', {
            filter: '',
            val: '978-3-16-148410-0'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isISBN', {
            filter:  null,
            val: '978-3-16-148410-0'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isISBN', {
            filter:  0,
            val: '978-3-16-148410-0'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isISBN', {
            filter:  false,
            val: '978-3-16-148410-0'
        }, this.spy);
    });
});

describe('isInt', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isInt');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isInt` validator', function() {

        var context = {
            filter: {min: 1, max: 20},
            val: '15'
        };

        var resolvedContext = assertions.isInt.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: {min: 2, max: 2},
            val: 5,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('between.number');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isInt.call(context);
        resolvedContext.message.should.be.equal('between.number');

        //test 2
        var context2 = {
            val: 'invalid',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isInt');
                return assertionType;
            }
        };
        var resolvedContext2 = assertions.isInt.call(context2);
        resolvedContext2.message.should.be.equal('isInt');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isInt', {
            filter: '',
            val: '15'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isInt', {
            filter:  null,
            val: '15'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isInt', {
            filter:  false,
            val: '15'
        }, this.spy);
    });

    it('should coerce string type of validated value before validation is forwarded to the external validator method', function() {
        var context = {
            filter: undefined,
            val: 15
        };

        var resolvedContext = assertions.isInt.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val.toString(), context.filter);
    });
});

describe('isJSON', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isJSON');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isJSON` validator', function() {

        var context = {
            val: '{"test": "value", "test2": 3, "test3": null}'
        };

        var resolvedContext = assertions.isJSON.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isJSON');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isJSON.call(context);

        resolvedContext.message.should.be.equal('isJSON');
    });
});

describe('hasLengthOf', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isLength');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `hasLengthOf` validator when validated value is a string', function() {

        var context = {
            filter: {},
            val: '5'
        };

        var resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        //testcase 1
        var context = {
            filter: {min: 2, max: 2},
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('between.string');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.message.should.be.equal('between.string');

        //testcase 2
        var context2 = {
            filter: {min: 2, max: 2},
            val: [],
            message: function(assertionType, context) {
                assertionType.should.be.equal('between.array');
                return assertionType;
            }
        };
        var resolvedContext2 = assertions.hasLengthOf.call(context2);
        resolvedContext2.message.should.be.equal('between.array');
    });

    it('should work with array values', function() {

        var context = {
            filter: undefined,
            val: ['val1', 'val2']
        };
        var resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', true);

        var context = {
            filter: {},
            val: ['val1', 'val2']
        };
        var resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', true);

        context = {
            filter: {min: 3},
            val: ['val1', 'val2']
        };
        resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', false);

        context = {
            filter: {min: 2},
            val: ['val1', 'val2']
        };
        resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', true);

        context = {
            filter: {max: 2},
            val: [1, 2]
        };
        resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', true);

        context = {
            filter: {max: 1},
            val: [1, 2]
        };
        resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', false);

        context = {
            filter: {min: 2, max: 2},
            val: [1, 2]
        };
        resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', true);

        context = {
            filter: {min: 2, max: 2},
            val: [1, 2, 3]
        };
        resolvedContext = assertions.hasLengthOf.call(context);
        resolvedContext.should.have.property('success', false);
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call (when validated value is of string type)', function() {
        shouldTransformFilterValueToUndefined('hasLengthOf', {
            filter: '',
            val: 'test'
        }, this.spy);

        shouldTransformFilterValueToUndefined('hasLengthOf', {
            filter:  null,
            val: 'test'
        }, this.spy);

        shouldTransformFilterValueToUndefined('hasLengthOf', {
            filter:  false,
            val: 'test'
        }, this.spy);
    });
});


describe('isNumeric', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isNumeric');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isNumeric` validator', function() {

        var context = {
            val: '-5'
        };

        var resolvedContext = assertions.isNumeric.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isNumeric');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isNumeric.call(context);

        resolvedContext.message.should.be.equal('isNumeric');
    });
});

describe('isURL', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isURL');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isURL` validator', function() {

        var context = {
            filter: {require_protocol: true},
            val: 'https://google.com'
        };

        var resolvedContext = assertions.isURL.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: {},
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isURL');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isURL.call(context);

        resolvedContext.message.should.be.equal('isURL');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isURL', {
            filter: '',
            val: 'https://google.com'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isURL', {
            filter:  null,
            val: 'https://google.com'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isURL', {
            filter:  0,
            val: 'https://google.com'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isURL', {
            filter:  false,
            val: 'https://google.com'
        }, this.spy);
    });
});

describe('isUUID', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'isUUID');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `isUUID` validator', function() {

        var context = {
            filter: 4,
            val: '4b94c16f-8b6a-4302-aa36-ac7bd447d690'
        };

        var resolvedContext = assertions.isUUID.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 4,
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isUUID');
                context.attr.should.be.equal('prop.path');
                context.version.should.be.equal(4);
                return assertionType;
            }
        };
        var resolvedContext = assertions.isUUID.call(context);

        resolvedContext.message.should.be.equal('isUUID');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('isUUID', {
            filter: '',
            val: '4b94c16f-8b6a-4302-aa36-ac7bd447d690'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isUUID', {
            filter:  null,
            val: '4b94c16f-8b6a-4302-aa36-ac7bd447d690'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isUUID', {
            filter:  0,
            val: '4b94c16f-8b6a-4302-aa36-ac7bd447d690'
        }, this.spy);

        shouldTransformFilterValueToUndefined('isUUID', {
            filter:  false,
            val: '4b94c16f-8b6a-4302-aa36-ac7bd447d690'
        }, this.spy);
    });
});

describe('matches', function() {
    beforeEach(function() {
        this.spy = sinon.spy(stringValidator, 'matches');
    });

    afterEach(function() {
        this.spy.restore();
    });

    it('should call external `matches` validator', function() {

        var context = {
            filter: /^1{1,3}a{3}I{3}$/,
            val: '111aaaIII'
        };

        var resolvedContext = assertions.matches.call(context);
        resolvedContext.should.have.property('success', true);
        this.spy.should.have.been.calledOnce;
        this.spy.should.always.have.been.calledWithExactly(context.val, context.filter);
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: /^test$/,
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('matches');
                context.attr.should.be.equal('prop.path');
                context.pattern.should.be.eql(/^test$/);
                return assertionType;
            }
        };
        var resolvedContext = assertions.matches.call(context);

        resolvedContext.message.should.be.equal('matches');
    });

    it('should replace falsy filter value with `undefined` on extarnal validator method call', function() {
        shouldTransformFilterValueToUndefined('matches', {
            filter: '',
            val: '111aaaIII'
        }, this.spy);

        shouldTransformFilterValueToUndefined('matches', {
            filter:  null,
            val: '111aaaIII'
        }, this.spy);

        shouldTransformFilterValueToUndefined('matches', {
            filter:  0,
            val: '111aaaIII'
        }, this.spy);

        shouldTransformFilterValueToUndefined('matches', {
            filter:  false,
            val: '111aaaIII'
        }, this.spy);
    });
});

describe('isEmpty', function() {
    it('should return true if validated value is one of (null, undefined, "") values', function() {
        var valid = [
            {},
            {val: undefined},
            {val: null},
            {val: ''}
        ];
        var invalid = [
            {val: 0},
            {val: '0'},
            {val: false},
            {val: {}},
            {val: []}
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.isEmpty.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal) {
            var resolvedContext = assertions.isEmpty.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('isEmpty');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.isEmpty.call(context);

        resolvedContext.message.should.be.equal('isEmpty');
    });
});

describe('gt', function() {
    it('should return true if and only if provided number value is grater than a number value passed as filter', function() {
        var valid = [
            {val: 0, filter: -1},
            {val: 4, filter: 0}
        ];
        var invalid = [
            {val: 0},
            {val: 2, filter: 4},
            {val: null, filter: 2},
            {val: 2, filter: null},
            {},
            {val: undefined, filter: 4},
            {val: 4, filter: undefined},
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.gt.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal) {
            var resolvedContext = assertions.gt.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 5,
            val: 1,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('gt');
                context.attr.should.be.equal('prop.path');
                context.min.should.be.equal(5);
                return assertionType;
            }
        };
        var resolvedContext = assertions.gt.call(context);

        resolvedContext.message.should.be.equal('gt');
    });

    it('should support an object with reference to another data field which is being validated as filter value', function() {
        var context = {
            val: 5,
            filter: {$ref: 'info.age'},
            keywordPrefix: '$',
            overallData: {info: {age: 3}}
        };
        var resolvedContext = assertions.gt.call(context);
        resolvedContext.should.have.property('success', true);


        context = {
            val: 5,
            filter: {$ref: 'pid'},
            keywordPrefix: '$',
            overallData: {pid: 2}
        };

        resolvedContext = assertions.gt.call(context);
        resolvedContext.should.have.property('success', true);
    });
});

describe('gte', function() {
    it('should return true if and only if provided number value is grater than or equal to a number value passed as filter', function() {
        var valid = [
            {val: 0, filter: -1},
            {val: 4, filter: 0},
            {val: 0, filter: 0},
        ];
        var invalid = [
            {val: 0},
            {val: 2, filter: 4},
            {val: null, filter: 2},
            {val: 2, filter: null},
            {},
            {val: undefined, filter: 4},
            {val: 4, filter: undefined}
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.gte.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal) {
            var resolvedContext = assertions.gte.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 5,
            val: 1,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('gte');
                context.attr.should.be.equal('prop.path');
                context.min.should.be.equal(5);
                return assertionType;
            }
        };
        var resolvedContext = assertions.gte.call(context);

        resolvedContext.message.should.be.equal('gte');
    });

    it('should support an object with reference to another data field which is being validated as filter value', function() {
        var context = {
            val: 5,
            filter: {$ref: 'info.age'},
            keywordPrefix: '$',
            overallData: {info: {age: 3}}
        };
        var resolvedContext = assertions.gte.call(context);
        resolvedContext.should.have.property('success', true);


        context = {
            val: 5,
            filter: {$ref: 'pid'},
            keywordPrefix: '$',
            overallData: {pid: 5}
        };

        resolvedContext = assertions.gte.call(context);
        resolvedContext.should.have.property('success', true);
    });
});

describe('lt', function() {
    it('should return true if and only if provided number value is lower than a number value passed as filter', function() {
        var valid = [
            {val: -1, filter: 0},
            {val: 0, filter: 4}
        ];
        var invalid = [
            {val: 0},
            {val: 4, filter: 2},
            {val: null, filter: 2},
            {val: 2, filter: null},
            {},
            {val: undefined, filter: 4},
            {val: 4, filter: undefined}
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.lt.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal) {
            var resolvedContext = assertions.lt.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 1,
            val: 5,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('lt');
                context.attr.should.be.equal('prop.path');
                context.max.should.be.equal(1);
                return assertionType;
            }
        };
        var resolvedContext = assertions.lt.call(context);

        resolvedContext.message.should.be.equal('lt');
    });

    it('should support an object with reference to another data field which is being validated as filter value', function() {
        var context = {
            val: 3,
            filter: {$ref: 'info.age'},
            keywordPrefix: '$',
            overallData: {info: {age: 5}}
        };
        var resolvedContext = assertions.lt.call(context);
        resolvedContext.should.have.property('success', true);


        context = {
            val: 2,
            filter: {$ref: 'pid'},
            keywordPrefix: '$',
            overallData: {pid: 5}
        };

        resolvedContext = assertions.lt.call(context);
        resolvedContext.should.have.property('success', true);
    });
});

describe('lte', function() {
    it('should return true if and only if provided number value is lower than or equal to a number value passed as filter', function() {
        var valid = [
            {val: -1, filter: 0},
            {val: 0, filter: 4},
            {val: 4, filter: 4}
        ];
        var invalid = [
            {val: 0},
            {val: 4, filter: 2},
            {val: null, filter: 2},
            {val: 2, filter: null},
            {},
            {val: undefined, filter: 4},
            {val: 4, filter: undefined}
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.lte.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal) {
            var resolvedContext = assertions.lte.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 1,
            val: 5,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('lte');
                context.attr.should.be.equal('prop.path');
                context.max.should.be.equal(1);
                return assertionType;
            }
        };
        var resolvedContext = assertions.lte.call(context);

        resolvedContext.message.should.be.equal('lte');
    });

    it('should support an object with reference to another data field which is being validated as filter value', function() {
        var context = {
            val: 3,
            filter: {$ref: 'info.age'},
            keywordPrefix: '$',
            overallData: {info: {age: 5}}
        };
        var resolvedContext = assertions.lte.call(context);
        resolvedContext.should.have.property('success', true);


        context = {
            val: 2,
            filter: {$ref: 'pid'},
            keywordPrefix: '$',
            overallData: {pid: 5}
        };

        resolvedContext = assertions.lte.call(context);
        resolvedContext.should.have.property('success', true);
    });
});

describe('eq', function() {
    it('should return true if and only if provided number value is equal to a number value passed as filter', function() {
        var valid = [
            {val: 4, filter: 4},
            {val: '', filter: ''},
            {val: undefined, filter: undefined},
            {},
            {val: null, filter: null}
        ];
        var invalid = [
            {val: 0},
            {val: 4, filter: 2},
            {val: 4, filter: 5},
            {val: null, filter: 2},
            {val: 2, filter: null},
            {val: {}, filter: {}},
            {val: undefined, filter: 4},
            {val: 4, filter: undefined}
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.eq.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal) {
            var resolvedContext = assertions.eq.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 5,
            val: 4,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('eq');
                context.attr.should.be.equal('prop.path');
                context.value.should.be.equal(5);
                return assertionType;
            }
        };
        var resolvedContext = assertions.eq.call(context);

        resolvedContext.message.should.be.equal('eq');
    });

    it('should support an object with reference to another data field which is being validated as filter value', function() {
        var context = {
            val: 5,
            filter: {$ref: 'info.age'},
            keywordPrefix: '$',
            overallData: {info: {age: 5}}
        };
        var resolvedContext = assertions.eq.call(context);
        resolvedContext.should.have.property('success', true);


        context = {
            val: 5,
            filter: {$ref: 'pid'},
            keywordPrefix: '$',
            overallData: {pid: 5}
        };

        resolvedContext = assertions.eq.call(context);
        resolvedContext.should.have.property('success', true);
    });
});

describe('ne', function() {
    it('should return true if and only if provided number value is not equal to a number value passed as filter', function() {
        var valid = [
            {val: -1, filter: 0},
            {val: 0, filter: 4},
            {val: null, filter: 2},
            {val: 2, filter: null},
            {val: undefined, filter: 4},
            {val: 4, filter: undefined},
            {val: 0},
        ];
        var invalid = [
            {val: 2, filter: 2},
            {},
            {val: undefined, filter: undefined},
            {val: null, filter: null}
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.ne.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal) {
            var resolvedContext = assertions.ne.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: 5,
            val: 5,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('ne');
                context.attr.should.be.equal('prop.path');
                context.value.should.be.equal(5);
                return assertionType;
            }
        };
        var resolvedContext = assertions.ne.call(context);

        resolvedContext.message.should.be.equal('ne');
    });

    it('should support an object with reference to another data field which is being validated as filter value', function() {
        var context = {
            val: 3,
            filter: {$ref: 'info.age'},
            keywordPrefix: '$',
            overallData: {info: {age: 5}}
        };
        var resolvedContext = assertions.ne.call(context);
        resolvedContext.should.have.property('success', true);


        context = {
            val: 2,
            filter: {$ref: 'pid'},
            keywordPrefix: '$',
            overallData: {pid: 5}
        };

        resolvedContext = assertions.ne.call(context);
        resolvedContext.should.have.property('success', true);
    });
});

describe('between', function() {
    it('should return true if and only if a validated value is a number between range of two defined numbers (including the defined numbers)', function() {
        var valid = [
            {val: 1, filter: [-1, 2]},
            {val: '1', filter: ['-1', '2']},
            {val: '0.1', filter: ['-1', '2']},
            {val: '1', filter: [1, 1]},
        ];
        var invalid = [
            {val: '1', filter: [-4, -1]},
        ];

        var invalidWhichThrowsError = [
            {val: 0},
            {val: 2, filter: null},
            {val: 4, filter: undefined},
            {},
            {val: undefined, filter: undefined},
            {val: null, filter: null}
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.between.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal) {
            var resolvedContext = assertions.between.call(testVal);
            resolvedContext.should.have.property('success', false);
        });

        invalidWhichThrowsError.forEach(function(testVal) {
            function test() {
                assertions.between.call(testVal);
            }
            expect(test).to.throw(Error);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: [2,3],
            val: 4,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('between.number');
                context.attr.should.be.equal('prop.path');
                context.min.should.be.equal(2);
                context.max.should.be.equal(3);
                return assertionType;
            }
        };
        var resolvedContext = assertions.between.call(context);

        resolvedContext.message.should.be.equal('between.number');
    });
});

describe('notBetween', function() {
    it('should return true if and only if a validated value is a number NOT between range of two defined numbers (including the defined numbers)', function() {
        var valid = [
            {val: 3, filter: [-1, 2]},
            {val: '-2', filter: ['-1', '2']},
            {val: '0.1', filter: ['0.3', '0.5']},
            {val: '2', filter: [1, 1]},
        ];
        var invalid = [
            {val: '0', filter: [-4, 1]},
        ];

        var invalidWhichThrowsError = [
            {val: 0},
            {val: 2, filter: null},
            {val: 4, filter: undefined},
            {},
            {val: undefined, filter: undefined},
            {val: null, filter: null}
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.notBetween.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            var resolvedContext = assertions.notBetween.call(testVal);
            resolvedContext.should.have.property('success', false);
        });

        invalidWhichThrowsError.forEach(function(testVal) {
            function test() {
                assertions.between.call(testVal);
            }
            expect(test).to.throw(Error);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: [2,3],
            val: 3,
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('not.between.number');
                context.attr.should.be.equal('prop.path');
                context.min.should.be.equal(2);
                context.max.should.be.equal(3);
                return assertionType;
            }
        };
        var resolvedContext = assertions.notBetween.call(context);

        resolvedContext.message.should.be.equal('not.between.number');
    });
});

describe('like', function() {
    it('should behave like sql `LIKE` operator (case sensitive)', function() {
        var valid = [
            {val: 'abcdefgh', filter: '%cdef%'},
            {val: 'abcdefgh', filter: 'abc%'},
            {val: 'abcdefgh', filter: '%efgh'},
        ];

        var invalid = [
            {val: 'abcdefgh', filter: '%cDef%'},
            {val: 'abcdefgh', filter: '%cZef%'},
            {val: 'abcdefgh', filter: '%cdef'},
            {val: 'yzabefgh', filter: '%cdef%'},
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.like.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            var resolvedContext = assertions.like.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: '%test%',
            val: 'invalid',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('like');
                context.attr.should.be.equal('prop.path');
                context.format.should.be.equal('%test%');
                return assertionType;
            }
        };
        var resolvedContext = assertions.like.call(context);

        resolvedContext.message.should.be.equal('like');
    });

    it('should accept an object with `$any` collection of filters in place of `filter`', function() {
        var valid = [
            {val: 'abcdefgh', filter: {$any: ['%yz%', 'abc%']}, keywordPrefix: '$'},
            {val: 'abcdefgh', filter: {$any: ['cdef%', '%gh']}, keywordPrefix: '$'},
            {val: 'abcd', filter: {$any: ['%abcd%']}, keywordPrefix: '$'},
        ];

        var invalid = [
            {val: 'abcdefgh', filter: {$any: ['cdef%', 'test']}, keywordPrefix: '$'},
        ];

        valid.forEach(function(testVal) {
            var resolvedContext = assertions.like.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            var resolvedContext = assertions.like.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });
});

describe('notLike', function() {
    it('should bahave like negated sql `LIKE` operator (case sensitive)', function() {
        var valid = [
            {val: 'abcdefgh', filter: '%cDef%'},
            {val: 'abcdefgh', filter: '%cZef%'},
            {val: 'yzabefgh', filter: '%cdef%'},
        ];

        var invalid = [
            {val: 'abcdefgh', filter: '%cdef%'},
            {val: 'abcdefgh', filter: 'abc%'},
            {val: 'abcdefgh', filter: '%efgh'},
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notLike.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notLike.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: '%invalid%',
            val: 'invalid',
            propPath: 'prop.path',
            assertions: assertions,
            message: function(assertionType, context) {
                assertionType.should.be.equal('not.like');
                context.attr.should.be.equal('prop.path');
                context.format.should.be.equal('%invalid%');
                return assertionType;
            }
        };
        var resolvedContext = assertions.notLike.call(context);

        resolvedContext.message.should.be.equal('not.like');
    });

    it('should accept an object with `$any` collection of filters in place of `filter`', function() {
        var valid = [
            {val: 'abcdefgh', filter: {$any: ['cdef%', 'test']}, keywordPrefix: '$'},
        ];

        var invalid = [
            {val: 'abcdefgh', filter: {$any: ['%yz%', 'abc%']}, keywordPrefix: '$'},
            {val: 'abcdefgh', filter: {$any: ['cdef%', '%gh']}, keywordPrefix: '$'},
            {val: 'abcd', filter: {$any: ['%abcd%']}, keywordPrefix: '$'},
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notLike.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notLike.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });
});

describe('iLike', function() {
    it('should behave like sql `LIKE` operator (case INsensetive)', function() {
        var valid = [
            {val: 'abcdefgh', filter: '%CDEF%', keywordPrefix: '$'},
            {val: 'abCdEFgh', filter: 'abC%', keywordPrefix: '$'},
            {val: 'abcdefgh', filter: '%efgh', keywordPrefix: '$'},
        ];

        var invalid = [
            {val: 'abcdefgh', filter: '%cZeF%', keywordPrefix: '$'},
            {val: 'yzAbEfGh', filter: '%CdEf%', keywordPrefix: '$'},
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.iLike.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.iLike.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var messageStub = sinon.stub().returns('iLike');
        var context = {
            filter: '%test%',
            val: 'invalid',
            propPath: 'prop.path',
            assertions: assertions,
            message: messageStub
        };
        var resolvedContext = assertions.iLike.call(context);
        messageStub.should.be.calledWith('iLike', {attr: 'prop.path', format: '%test%', negated: false})

        resolvedContext.message.should.be.equal('iLike');
    });

    it('should accept an object with `$any` collection of filters in place of `filter`', function() {
        var valid = [
            {val: 'abCdeFgh', filter: {$any: ['%YZ%', 'ABC%']}, keywordPrefix: '$'},
            {val: 'aBcdEfgh', filter: {$any: ['cDef%', '%gH']}, keywordPrefix: '$'},
            {val: 'abcD', filter: {$any: ['%aBCd%']}, keywordPrefix: '$'},
        ];

        var invalid = [
            {val: 'abcdEfgH', filter: {$any: ['cDeF%', 'tEst']}, keywordPrefix: '$'},
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.iLike.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.iLike.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });
});

describe('notILike', function() {
    it('should bahave like negated sql `LIKE` operator (case INsensitive)', function() {
        var valid = [
            {val: 'abcdefgh', filter: '%cZeF%'},
            {val: 'yzAbEfGh', filter: '%CdEf%'},
        ];

        var invalid = [
            {val: 'abcdefgh', filter: '%CDEF%'},
            {val: 'abCdEFgh', filter: 'abC%'},
            {val: 'abcdefgh', filter: '%efgh'},
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notILike.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notILike.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var messageStub = sinon.stub().returns('not.iLike');
        var context = {
            filter: '%invalid%',
            val: 'invalid',
            propPath: 'prop.path',
            assertions: assertions,
            message: messageStub
        };
        var resolvedContext = assertions.notILike.call(context);
        messageStub.should.be.calledWith('not.iLike', {attr: 'prop.path', format: '%invalid%', negated: false})

        resolvedContext.message.should.be.equal('not.iLike');
    });

    it('should accept an object with `$any` collection of filters in place of `filter`', function() {
        var valid = [
            {val: 'abcdEfgH', filter: {$any: ['cDeF%', 'tEst']}, keywordPrefix: '$'},
        ];

        var invalid = [
            {val: 'abCdeFgh', filter: {$any: ['%YZ%', 'ABC%']}, keywordPrefix: '$'},
            {val: 'aBcdEfgh', filter: {$any: ['cDef%', '%gH']}, keywordPrefix: '$'},
            {val: 'abcD', filter: {$any: ['%aBCd%']}, keywordPrefix: '$'},
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notILike.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notILike.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });
});

describe('in', function() {
    it('should return true if exact validated value is present in given arrray', function() {
        var valid = [
            {val: 'test', filter: ['test', 'adfsd', 'dsafasjk']},
        ];

        var invalid = [
            {val: 1, filter: ['1', 'test', '']},
            {val: 0, filter: ['1', 'test', '']},
            {val: undefined, filter: ['1', 'test', '']},
            {val: null, filter: ['1', 'test', '']},
            {val: false, filter: ['1', 'test', '']}
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.in.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.in.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: {prop1: 1, prop2:2},
            val: 'prop3',
            propPath: 'prop.path',
            message: function(assertionType, context) {
                assertionType.should.be.equal('in');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.in.call(context);

        resolvedContext.message.should.be.equal('in');
    });

    it('should return true if validated value exists as enumerable property in given object', function() {
        var valid = [
            {val: 'test', filter: {test: 'val', another: 'val2'}},
            {val: 1, filter: {"1": undefined}},
        ];

        var invalid = [
            {val: 1, filter: {other: 'val'}},
            {val: 'test', filter: {}},
            {val: undefined, filter: {}},
            {val: null, filter: {}},
            {val: false, filter: {}}
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.in.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.in.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });
});

describe('notIn', function() {
    it('should return true if validated value is NOT present in given array', function() {
        var valid = [
            {val: 1, filter: ['1', 'test', '']},
            {val: 0, filter: ['1', 'test', '']},
            {val: undefined, filter: ['1', 'test', '']},
            {val: null, filter: ['1', 'test', '']},
            {val: false, filter: ['1', 'test', '']}
        ];

        var invalid = [
            {val: 'test', filter: ['test', 'adfsd', 'dsafasjk']},
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notIn.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notIn.call(testVal);
            resolvedContext.should.have.property('success', false);
        });

    });

    it('should support a function as `message` option value', function() {

        var context = {
            filter: {prop1: 1, prop2: 2},
            val: 'prop1',
            propPath: 'prop.path',
            assertions: assertions,
            message: function(assertionType, context) {
                assertionType.should.be.equal('not.in');
                context.attr.should.be.equal('prop.path');
                return assertionType;
            }
        };
        var resolvedContext = assertions.notIn.call(context);

        resolvedContext.message.should.be.equal('not.in');
    });

    it('should return true if validated value does NOT exists as enumerable property in given object', function() {
        var valid = [
            {val: 1, filter: {other: 'val'}},
            {val: 'test', filter: {}},
            {val: undefined, filter: {}},
            {val: null, filter: {}},
            {val: false, filter: {}}
        ];

        var invalid = [
            {val: 'test', filter: {test: 'val', another: 'val2'}},
            {val: 1, filter: {"1": undefined}},
        ];

        valid.forEach(function(testVal) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notIn.call(testVal);
            resolvedContext.should.have.property('success', true);
        });

        invalid.forEach(function(testVal, i) {
            testVal.assertions = assertions;
            var resolvedContext = assertions.notIn.call(testVal);
            resolvedContext.should.have.property('success', false);
        });
    });
});

/**
 * shouldTransformFilterValueToUndefined
 *
 * @param {string} assertion
 * @param {Object} context
 * @param {Object} spy
 *
 * @return {undefined}
 */
function shouldTransformFilterValueToUndefined(assertion, context, spy) {
    var resolvedContext = assertions[assertion].call(context);
    spy.should.always.have.been.calledWithExactly(context.val, undefined);
}
