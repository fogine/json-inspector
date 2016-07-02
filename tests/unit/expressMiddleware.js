var sinon                     = require('sinon');
var chai                      = require('chai');
var expect                    = chai.expect;
var sinonChai                 = require("sinon-chai");
var assertions                = require('../../assertions.js');
var Validator                 = require('../../validator.js');
var ValidatorManager          = require('../../validatorManager.js');
var expressMiddleware         = require('../../expressMiddleware.js');
var expressInjectorMiddleware = require('../../expressInjectorMiddleware.js');
var ValidationError           = require('../../error/validationError.js');
var ValidationMultiError      = require('../../error/validationMultiError.js');

chai.use(sinonChai);
chai.should();

describe('expressInjectorMiddleware', function() {

    it('should return validatorMiddleware function', function() {

        var middleware = expressInjectorMiddleware({});
        middleware.should.be.an.instanceof(Function);
        middleware.should.have.property('validatorManager').that.is.an.instanceof(ValidatorManager);
    })

    it('should register provided customAssertions (overwrite already defined assertion if it already exists)', function() {

        var $isAssertionBackup = assertions.$is;
        var customAssertions = {
            $is: function() {
                //stuff
                return this;
            },
            $providesMeaningOfLife: function() {
                //? :(
                return this;
            }
        };

        var middleware = expressInjectorMiddleware({
            customAssertions: customAssertions
        });

        assertions.should.have.property('$is').that.is.equal(customAssertions.$is);
        assertions.should.have.property('$providesMeaningOfLife').that.is.equal(customAssertions.$providesMeaningOfLife);
        assertions.$is = $isAssertionBackup;
    });


    describe('validatorMiddleware', function() {

        it('should register provided validator definitions', function() {
            var definitions = {
                '#user_validator': {
                    username: {$is: String},
                    email: {$isEmail: undefined}
                },
                "#another_validator": new Validator({}),
                '#file_validator': {
                    meta: {
                        name: {
                            $is: String
                        }
                    },
                    data: {
                        $isBase64: undefined
                    }
                }
            };

            var middleware = expressInjectorMiddleware({
                definitions: definitions
            });
            var req = {};
            var res = {};
            var next = function() {};
            middleware(req, res, next);

            middleware.validatorManager.get('#user_validator').should.be.an.instanceof(Validator);
            middleware.validatorManager.get('#file_validator').should.be.an.instanceof(Validator);
        })

        it('should bind `validator` object to `req` object', function() {
            var middleware = expressInjectorMiddleware();
            var req = {};
            var res = {};
            var next = function() {};
            middleware(req, res, next);

            req.should.have.property('validator').that.is.a('object');
            req.validator.should.have.property('define').that.is.a('function');
            req.validator.should.have.property('validateData').that.is.a('function');
            req.validator.should.have.property('validateQuery').that.is.a('function');
            req.validator.should.have.property('validateBody').that.is.a('function');
            req.validator.should.have.property('validateParams').that.is.a('function');
        })

        describe('req.validator', function() {
            before(function() {
                var middleware = expressInjectorMiddleware();
                var req = {};
                var res = {};
                var next = function() {};
                middleware(req, res, next);

                this.req = req;
                this.res = res;
                this.validatorManager = middleware.validatorManager;
            })

            describe('req.validator.define', function() {
                it('should initiate and register new validator with provided schema definition', function() {
                    var validator = this.req.validator.define('#user', {
                        username: {$is: String}
                    });

                    validator.should.be.an.instanceof(Validator);
                    this.validatorManager.get('#user').should.be.equal(validator);
                })

                it('should allow schema definition to be a function', function() {
                    var validator = this.req.validator.define('#app', function() {
                        return {
                            name: {$isAlphanumeric: 'en-US'}
                        };
                    });

                    validator.should.be.an.instanceof(Validator);
                    this.validatorManager.get('#app').should.be.equal(validator);
                })
            });

            describe('req.validator.validateData', function() {
                beforeEach(function() {
                    this.validateSpy = sinon.spy(Validator.prototype, 'validate');
                });

                afterEach(function() {
                    this.validateSpy.restore();
                });

                it('should validate provided data according to provided validation schema', function() {

                    var data = {
                        name: 3413
                    };

                    var validator = this.req.validator.validateData({
                        name: {$is: String}
                    }, data);

                    this.validateSpy.should.have.been.calledOnce;
                    this.validateSpy.should.have.been.calledWith(data, undefined, undefined);
                    validator.should.have.property('success', false);
                })

                it('should use registered validator if string name of the registered validator is provided instead of validation schema', function() {
                    var data = {
                        username: 'happie'
                    };

                    var validator = this.req.validator.validateData('#user', data);

                    this.validateSpy.should.have.been.calledOnce;
                    this.validateSpy.should.have.been.calledWith(data, undefined, undefined);
                    validator.should.have.property('success', true);
                })
            });

            describe('req.validator.validateQuery', function() {
                beforeEach(function() {
                    this.validateSpy = sinon.spy(Validator.prototype, 'validate');
                });

                afterEach(function() {
                    this.validateSpy.restore();
                });

                it('should call req.validation.validateQuery with `req.query` data object', function() {
                    this.req.query = {
                        username: 'happie'
                    };

                    var validator = this.req.validator.validateQuery('#user');

                    this.validateSpy.should.have.been.calledOnce;
                    this.validateSpy.should.have.been.calledWith(this.req.query, undefined, undefined);
                    validator.should.have.property('success', true);
                })
            });

            describe('req.validator.validateBody', function() {
                beforeEach(function() {
                    this.validateSpy = sinon.spy(Validator.prototype, 'validate');
                });

                afterEach(function() {
                    this.validateSpy.restore();
                });

                it('should call req.validation.validateBody with `req.body` data object', function() {
                    this.req.body = {
                        username: 'happie'
                    };

                    var validator = this.req.validator.validateBody('#user');

                    this.validateSpy.should.have.been.calledOnce;
                    this.validateSpy.should.have.been.calledWith(this.req.body, undefined, undefined);
                    validator.should.have.property('success', true);
                })
            });

            describe('req.validator.validateParams', function() {
                beforeEach(function() {
                    this.validateSpy = sinon.spy(Validator.prototype, 'validate');
                });

                afterEach(function() {
                    this.validateSpy.restore();
                });

                it('should call req.validation.validateParams with `req.params` data object', function() {
                    this.req.params = {
                        username: 'happie'
                    };

                    var validator = this.req.validator.validateParams('#user');

                    this.validateSpy.should.have.been.calledOnce;
                    this.validateSpy.should.have.been.calledWith(this.req.params, undefined, undefined);
                    validator.should.have.property('success', true);
                })
            });
        })
    })
});

describe('expressMiddleware', function() {
    before(function() {
        var middleware = expressInjectorMiddleware();
        var req = {};
        var res = {};
        var next = sinon.spy();
        middleware(req, res, next);

        this.req = req;
        this.res = res;
        this.next= next;
        this.validatorManager = middleware.validatorManager;
    });

    beforeEach(function() {
        this.next.reset();
        this.validateDataSpy = sinon.spy(this.req.validator, 'validateData');
    })

    afterEach(function() {
        this.req.query = {};
        this.req.body = {};
        this.req.params = {};
        this.req.url = '';

        this.validateDataSpy.restore();
    })

    it('should return a function middleware', function() {
        var middleware = expressMiddleware({
            someprop: {$is: String}
        }, 'query');

        middleware.should.be.a('function');
    })

    it('should call `req.validator.validateData` with req.query data to be validated', function() {
        var validationSchema = {
            name: {$is: String}
        };

        var middleware = expressMiddleware(validationSchema, 'query');

        this.req.query = {
            name: 'David'
        };

        middleware(this.req, this.res, this.next);

        this.validateDataSpy.should.have.been.calledOne;
        this.validateDataSpy.should.have.been.calledWith(validationSchema, this.req.query);
        this.next.should.have.been.calledOnce;
        this.next.should.have.been.calledWithExactly();
    })

    it('should call next(err) if validation fails', function() {
        var validationSchema = {
            name: {$is: String}
        };

        var middleware = expressMiddleware(validationSchema, 'query');

        this.req.query = {
            name: 143214
        };

        middleware(this.req, this.res, this.next);

        this.validateDataSpy.should.have.been.calledOne;
        this.validateDataSpy.should.have.been.calledWith(validationSchema, this.req.query);
        this.next.should.have.been.calledOnce;
        expect(this.next.args[0][0]).to.be.an.instanceof(ValidationError);
    })

    it('should support express v5.x which introduced `req.query` getter only', function() {
        var injectorMiddleware = expressInjectorMiddleware({
            expressVersion: 5
        });

        var req = {};
        var res = {};
        var next = sinon.spy();
        injectorMiddleware(req, res, next);

        var validationSchema = {
            name: {$is: String}
        };

        var middleware = expressMiddleware(validationSchema, 'query');

        req.query = {
            name: 'David'
        };

        middleware(req, res, next);

        req.should.have.property('url', '/?name=David');
    })
});
