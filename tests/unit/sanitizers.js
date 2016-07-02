var sinon               = require('sinon');
var chai                = require('chai');
var expect              = chai.expect;
var sinonChai           = require("sinon-chai");
var stringValidator     = require('validator');
var htmlSanitizer       = require('../../lib/htmlSanitizer.js');
var sanitizers          = require('../../lib/sanitizers.js');

chai.use(sinonChai);
chai.should();

describe('$escape', function() {
    it('should call external unescape & escape sanitizer method for every data entity in provided data structure', function() {

        var escapeSpy = sinon.spy(stringValidator, 'escape');

        //data
        var dataStr = 'This is a <a href=""> link </a>';

        var dataObj = {
            obj: {prop: dataStr},
            arr: [dataStr],
            prop: dataStr,
        };

        //sanitize data
        var sanitizedStr = sanitizers.$escape.call({
            val: dataStr
        });
        escapeSpy.should.have.callCount(1);

        var sanitizedObj = sanitizers.$escape.call({
            val: dataObj
        });
        escapeSpy.should.have.callCount(4);

        var sanitizedArr = sanitizers.$escape.call({
            val: [dataStr]
        });
        escapeSpy.should.have.callCount(5);

        //assert sanitized
        sanitizedStr.should.not.be.equal(dataStr);

        sanitizedObj.should.have.property('obj').that.is.eql({prop: sanitizedStr});
        sanitizedObj.should.have.property('arr').that.is.eql([sanitizedStr]);
        sanitizedObj.should.have.property('prop').that.is.equal(sanitizedStr);

        sanitizedArr.should.be.eql([sanitizedStr]);
    });
})

describe('$sanitizeHtml', function() {
    it('should call external `sanitizeHtml` sanitizer method for every data entity in provided data structure', function() {
        var htmlSanitizerSpy = sinon.spy(htmlSanitizer, 'sanitize');

        //data
        var dataStr = 'This is a <a href=""> link </a>';

        var dataObj = {
            obj: {prop: dataStr},
            arr: [dataStr],
            prop: dataStr,
        };

        //sanitize data
        var sanitizedStr = sanitizers.$sanitizeHtml.call({
            val: dataStr
        });
        htmlSanitizerSpy.should.have.callCount(1);

        var sanitizedObj = sanitizers.$sanitizeHtml.call({
            val: dataObj
        });
        htmlSanitizerSpy.should.have.callCount(4);

        var sanitizedArr = sanitizers.$sanitizeHtml.call({
            val: [dataStr]
        });
        htmlSanitizerSpy.should.have.callCount(5);

        //assert sanitized
        sanitizedStr.should.not.be.equal(dataStr);

        sanitizedObj.should.have.property('obj').that.is.eql({prop: sanitizedStr});
        sanitizedObj.should.have.property('arr').that.is.eql([sanitizedStr]);
        sanitizedObj.should.have.property('prop').that.is.equal(sanitizedStr);

        sanitizedArr.should.be.eql([sanitizedStr]);
    })
})
