var sinon                     = require('sinon');
var chai                      = require('chai');
var expect                    = chai.expect;
var sinonChai                 = require("sinon-chai");
var Validator                 = require('../../lib/validator.js');
var ValidatorError           = require('../../lib/error/validatorError.js');
var ValidationMultiError      = require('../../lib/error/validationMultiError.js');

chai.use(sinonChai);
chai.should();

describe('Validator', function() {
    it('should throw a ValidatorError when instantiting new validator unsupported schema format', function() {
        var invalidSchemas = [
            null,
            undefined,
            new Date(),
            [],
            'dafsd'
        ];

        invalidSchemas.forEach(function(schema) {
            function test() {
                var validator = new Validator(schema);
            }

            expect(test).to.throw(ValidatorError);
        })
    })
})
