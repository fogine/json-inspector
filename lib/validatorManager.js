
var ValidatorError = require('./error/validatorError.js');

module.exports = ValidatorManager;

/*
 * ValidatorManager
 *
 */
function ValidatorManager() {
    this.validators = {};
}

/*
 * add
 *
 * @param {string} name
 * @param {Validator} validator
 * @return {undefined}
 *
 */
ValidatorManager.prototype.add = function(name, validator) {
    this.validators[name] = validator;
};

/*
 * get
 *
 * @param {string} name
 * @return {Validator}
 */
ValidatorManager.prototype.get = function(name) {
    if (!this.validators.hasOwnProperty(name)) {
        throw new ValidatorError('Validator ' + name + ' not found');
    }
    return this.validators[name];
};

/*
 * remove
 *
 * @param {string} name
 * @return {undefined}
 */
ValidatorManager.prototype.remove = function(name) {
    delete this.validators[name];
};
