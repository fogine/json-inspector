var chai                 = require('chai');
var expect               = chai.expect;
var Validator            = require('../../validator.js');
var ValidatorManager     = require('../../validatorManager.js');
var index                = require('../../index.js');
var ValidationError      = require('../../error/validationError.js');
var ValidationMultiError = require('../../error/validationMultiError.js');
var define               = index.define;

chai.should();

describe('Validator', function() {
    before(function() {
        this.schema = {
            first_name: {
                $required: true,
                $message: 'first_name property is required and must contain alpha characters only',
                $isAlpha: 'en-US'
            },
            last_name: {
                $isAlpha: 'en-US'
            },
            address: {
                $or: {
                    $is: null,
                    $matches: /^[a-zA-Z0-9- ]+$/
                }
            },
            bio: {
                $is: String,
                $escape: undefined
            },
            friends: {
                $forEach: {
                    $required: true,
                    username: {
                        $isAlpha: 'en-US',
                        $hasLengthOf: {max: 32}
                    },
                    sex: {
                        $in: ['female', 'male'],
                        $sanitize: function(sex) {
                            return sex && sex.toUpperCase();
                        }
                    }
                }
            },
            channels: {
                $forEach: {
                    $required: true,
                    $or: [
                        {
                            type: { $eq: 'TeamSpeak' },
                            address: { $iLike: 'ts3server://%'}
                        },
                        {
                            type: { $eq: 'Mumble' },
                            address: { $iLike: 'mumble://%'}
                        },
                    ]
                }
            },
            storage: new Validator({
                items: {
                    $forEach: {
                        $isAlphanumeric: 'en-US'
                    }
                }
            }),
            $sanitize: function(data) {
                data.name = data.first_name + ' ' + data.last_name;
            }
        };

        this.validator = new Validator(this.schema);
    });

    it('should pass the validation process', function() {

        var dataCollection = [
            {
                first_name: 'Ray',
                address: 'Houghton Street London WC2A 2AE UK',
                friends: [
                    {
                        username: 'happie',
                        sex: 'female'
                    }
                ],
                channels: [
                    {
                        type: 'TeamSpeak',
                        address: 'ts3server://192.168.0.2'
                    },
                    {
                        type: 'Mumble',
                        address: 'mumble://192.168.0.2'
                    }
                ]
            },
            {
                first_name: 'Mike',
                address: null,
                storage: {},
                friends: [
                    {
                        username: 'happie',
                        sex: 'female'
                    }
                ],
                channels: []
            }
        ];

        var self = this;
        dataCollection.forEach(function(data) {
            var validator = self.validator.validate(data);

            validator.should.have.property('success', true);
            validator.should.have.property('error', null);
        });
    });

    it('should NOT pass the validation process', function() {

        var dataCollection = [
            {
                first_name: 'Mike',
                address: null,
                friends: [
                    {
                        username: 'happie',
                        sex: 'female'
                    }
                ],
                channels: [undefined] //should fail
            },
            {
                address: null,
                friends: [
                {
                    username: 'happie',
                    sex: 'female'
                }
                ],
                channels: []
            },
            {
                first_name: undefined,
                address: null,
                friends: [
                {
                    sex: 'notvalidvalue'
                }
                ],
                channels: []
            },
            {
                first_name: null,
                address: null,
                friends: [
                {
                    username: 'happie',
                }
                ],
                channels: []
            },
            {
                first_name: 'David',
                address: null,
                friends: [
                    {
                        username: 'happie',
                        sex: 'female'
                    }
                ],
                channels: [
                    {
                        type: 'notvalid',
                        address: 'ts3server://192.168.0.2'
                    }
                ]
            },
        ];

        var self = this;
        dataCollection.forEach(function(data) {
            var validator = self.validator.validate(data);
            validator.should.have.property('success', false);
            validator.should.have.property('error').that.is.an.instanceof(Error);
        })

    });

    it('should allow to override validation schema on `validate` method (by `customSchema` option)', function() {
        var data = {
            first_name: 'Mike',
            address: null,
            storage: {},
            friends: [
                {
                    username: 'happie',
                    sex: 'female & male'
                }
            ],
            channels: []
        };
        var validator = this.validator.validate(data, {
            friends: {
                $forEach: {
                    sex: {
                        $in: ['female & male']
                    }
                }
            }
        });

        validator.should.have.property('success', true);
    })

    it('should fail with proper validation message', function() {
        var validator = this.validator.validate({});
        validator.error.message.should.be.equal(this.schema.first_name.$message);
    })

    it('should process `message` option when its a function and return proper error message', function() {
        var validator = this.validator.validate({
            first_name: 'test',
            last_name: 'j284*&'
        }, undefined, {
            message: function(assertionType, context) {
                return assertionType; //error message should be equal to failed assertion type
            }
        });

        validator.error.message.should.be.equal('$isAlpha');
    })

    it('should fail with proper validation error', function() {
        var validator = this.validator.validate({
            address: '*&Q@%'
        });
        validator.should.have.property('error').that.is.an.instanceof(ValidationMultiError);

        var validator = this.validator.validate({});
        validator.should.have.property('error').that.is.an.instanceof(ValidationError);
    })

    it('should filter out unexpected data from validated data when `filterData` option is true (true=defaul)', function() {
        var data = {
            first_name: 'Mike',
            address: null,
            friends: [
                {
                    username: 'happie',
                    sex: 'female',
                    unallowedprop: 'data'
                }
            ],
            channels: [],
            someprop: 'data',
            anotherprop: 'data'
        };

        var validator = this.validator.validate(data);
        data.should.not.have.property('someprop');
        data.should.not.have.property('anotherprop');
        data.friends[0].should.not.have.property('unallowedprop');
    })

    it('should reduce data being validated by data properties defined in `only` array option', function() {

        var data = {
            address: '1st Street',
            friends: [
                {
                    username: 'happie',
                    sex: 'female',
                }
            ],
            channels: [],
        };

        var validator = this.validator.validate(data, undefined, {
            only: ['friends', 'channels']
        });

        data.should.not.have.property('address'); //address is not included in `only` array option
        validator.should.have.property('success', true);
        validator.should.have.property('error', null);
    })

    it('should respect `failOnFirstErr` option', function() {
        var data = {
            address: 'Houghton Street London WC2A 2AE UK',
            friends: [
                {
                    username: 'happie',
                    sex: 'invalidavalue'
                }
            ],
            channels: 'invalidvalue'
        };

        var validator = this.validator.validate(data, undefined, {
            failOnFirstErr: true
        });

        validator.should.have.property('success', false);
        //only single error should be returned
        validator.should.have.property('error').that.is.an.instanceof(ValidationError);
    })

    it('should fail on first unexpected data property when `failOnUnexpectedData` option is set', function() {
        var data = {
            first_name: 'Mike',
            address: null,
            friends: [
                {
                    username: 'happie',
                    sex: 'female',
                    unallowedprop: 'data'
                }
            ],
            channels: []
        };
        var validator = this.validator.validate(data, undefined, {
            failOnUnexpectedData: true
        });

        validator.should.have.property('success', false);
        validator.should.have.property('error').that.is.an.instanceof(ValidationError);
    })

    it('should sanitize validated data', function() {

        var data = {
            first_name: 'Mike',
            last_name: 'Taylor',
            bio: '<script src=""> some info </script>',
            friends: [
                {
                    username: 'happie',
                    sex: 'female'
                }
            ]
        };
        var validator = this.validator.validate(data);

        validator.should.have.property('success', true);
        data.friends[0].sex.should.be.equal('FEMALE');
        data.bio.should.be.equal('&lt;script src=&quot;&quot;&gt; some info &lt;&#x2F;script&gt;');
        data.should.have.property('name', data.first_name + ' ' + data.last_name);
    })

    it('should run supported sanitizers defined for top data object', function() {

        var schema = {
            $required: true,
            description: { $is: String },
            bio: { $is: String },
            $sanitizeHtml: {
                allowedTags: ['a'],
                allowedAttributes: {}
            }
        };

        var data = {
            description: '<a href="https://google.com">google</a><br><script src="./test"></script>',
            bio: '<br>',
        };
        var validator = new Validator(schema);
        validator.validate(data);

        validator.should.have.property('success', true);
        data.description.should.be.equal('<a>google</a>');
        data.bio.should.be.equal('');
    })

    it('should respect `nullAsEmpty` option if set. null data values should be treated as if data would not be sent', function() {

        var schema = {
            description: { $isInt: undefined },
            user: {
                username: { $isAlpha: 'en-US' }
            }
        };

        var data = {
            description: null,
            user: null
        };
        var validator = new Validator(schema, {nullAsEmpty: true});
        validator.validate(data);

        validator.should.have.property('success', true);
        expect(data.description).to.be.equal(null);
        expect(data.user).to.be.equal(null);

        validator.validate(data, {$required: true});
        validator.should.have.property('success', false);
    })
});

describe('module.define', function() {
    it('should initiate and register new validator object', function() {
        var validationSchema = {
            username: {
                $isAlphanumeric: 'en-US'
            }
        };

        var userValidator = define('#user_validator', validationSchema, {failOnFirstErr: true});

        userValidator.should.be.an.instanceof(Validator);
        userValidator.validatorManager.should.be.an.instanceof(ValidatorManager);
        userValidator.schema.should.be.equal(validationSchema);
        userValidator.options.should.have.property('failOnFirstErr', true);

        userValidator.validatorManager.get('#user_validator').should.be.equal(userValidator);
    })

    it('should allow to load another registered validator in schema definition', function() {
        var validationSchema = function() {

            var userValidator = this.getSchemaFor('#user_validator');

            return {
                username: userValidator.username
            }
        };

        var validator = define('#validator2', validationSchema);

        validator.validate({
            username: 'happie'
        });

        validator.should.have.property('success', true);
    })
})
