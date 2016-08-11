var sinon                     = require('sinon');
var chai                      = require('chai');
var expect                    = chai.expect;
var sinonChai                 = require("sinon-chai");
var assertions                = require('../../lib/assertions.js');
var Validator                 = require('../../lib/validator.js');
var ValidatorError            = require('../../lib/error/validatorError.js');
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

    describe('`keywordPrefix` option', function() {

        before(function() {
            this.gt = sinon.spy(assertions, 'gt');
            this.gte = sinon.spy(assertions, 'gte');
            this.lt = sinon.spy(assertions, 'lt');
            this.lte = sinon.spy(assertions, 'lte');
            this.eq = sinon.spy(assertions, 'eq');
            this.ne = sinon.spy(assertions, 'ne');
            this.like = sinon.spy(assertions, 'like');
            this.notLike = sinon.spy(assertions, 'notLike');
            this.iLike = sinon.spy(assertions, 'iLike');
            this.notILike = sinon.spy(assertions, 'notILike');

            var ref = {$$ref: 'val'};

            this.schema = {
                prop1: {
                    $$gt: ref
                },
                prop2: {
                    $$gte: ref
                },
                prop3: {
                    $$lt: ref
                },
                prop4: {
                    $$lte: ref
                },
                prop5: {
                    $$eq: ref
                },
                prop6: {
                    $$ne: ref
                },
                prop7: {
                    $$like: {$$any: ['%valid%']}
                },
                prop8: {
                    $$notLike: {$$any: ['%invalid%']}
                },
                prop9: {
                    $$iLike: {$$any: ['%VALID%']}
                },
                prop10: {
                    $$notILike: {$$any: ['%INVALID%']}
                }
            };


        });

        it('should properly parse validation schema according to `keywordPrefix` option', function() {
            var keywordPrefix = '$$';

            var data = {
                prop1: 6,
                prop2: 5,
                prop3: 4,
                prop4: 5,
                prop5: 5,
                prop6: 4,
                prop7: 'testvalidtest',
                prop8: 'valid',
                prop9: 'testvalidtest',
                prop10: 'valid',
                val: 5
            };

            var validator = new Validator(this.schema, {keywordPrefix: '$$'});

            validator.validate(data);

            validator.should.have.property('success', true, validator.error);
            validator.should.have.property('error', null);

            this.gt.should.have.calledOnce;
            this.gte.should.have.been.calledOnce;
            this.lt.should.have.been.calledOnce;
            this.lte.should.have.been.calledOnce;
            this.eq.should.have.been.calledOnce;
            this.ne.should.have.been.calledOnce;
            this.like.should.have.callCount(4);
            this.notLike.should.have.been.calledOnce;
            this.iLike.should.have.been.calledTwice;
            this.notILike.should.have.been.calledOnce;

            var gtContext       = this.gt.thisValues[0];
            var gteContext      = this.gte.thisValues[0];
            var ltContext       = this.lt.thisValues[0];
            var lteContext      = this.lte.thisValues[0];
            var eqContext       = this.eq.thisValues[0];
            var neContext       = this.ne.thisValues[0];
            var likeContext     = this.like.thisValues[0];
            var notLikeContext  = this.notLike.thisValues[0];
            var iLikeContext    = this.iLike.thisValues[0];
            var notILikeContext = this.notILike.thisValues[0];

            gtContext.should.have.property('keywordPrefix', keywordPrefix);
            gteContext.should.have.property('keywordPrefix', keywordPrefix);
            ltContext.should.have.property('keywordPrefix', keywordPrefix);
            lteContext.should.have.property('keywordPrefix', keywordPrefix);
            eqContext.should.have.property('keywordPrefix', keywordPrefix);
            neContext.should.have.property('keywordPrefix', keywordPrefix);
            likeContext.should.have.property('keywordPrefix', keywordPrefix);
            notLikeContext.should.have.property('keywordPrefix', keywordPrefix);
            iLikeContext.should.have.property('keywordPrefix', keywordPrefix);
            notILikeContext.should.have.property('keywordPrefix', keywordPrefix);
        })
    })
})
