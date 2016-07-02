var sinon                     = require('sinon');
var chai                      = require('chai');
var expect                    = chai.expect;
var sinonChai                 = require("sinon-chai");
var Validator                 = require('../../lib/validator.js');
var ValidatorManager          = require('../../lib/validatorManager.js');
var ValidatorError            = require('../../lib/error/validatorError.js');

chai.use(sinonChai);
chai.should();

describe('ValidatorManager', function() {
    describe('get', function() {
        it('should throw a ValidatorError when a validator is not found', function() {
            var validatorManager = new ValidatorManager();

            function test() {
                return validatorManager.get('validator-name');
            }

            expect(test).to.throw(ValidatorError);
        });
    });

    describe('remove', function() {
        it('should remove registered validator from stack', function() {
            var validatorManager = new ValidatorManager();
            var validator = new Validator({});

            validatorManager.add('validator-name', validator);

            Object.keys(validatorManager.validators).length.should.be.equal(1);

            validatorManager.remove('validator-name');

            Object.keys(validatorManager.validators).length.should.be.equal(0);

        });
    })
})
