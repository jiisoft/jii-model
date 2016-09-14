/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var _isRegExp = require('lodash/isRegExp');
var Validator = require('./Validator');

/**
 * @class Jii.validators.RegularExpressionValidator
 * @extends Jii.validators.Validator
 */
module.exports = Jii.defineClass('Jii.validators.RegularExpressionValidator', /** @lends Jii.validators.RegularExpressionValidator.prototype */{

    __extends: Validator,

	pattern: null,

    not: false,

    init() {
        this.__super();

        if (!_isRegExp(this.pattern)) {
            throw new Jii.exceptions.ApplicationException('The `pattern` property must be set.');
        }

        if (this.message === null) {
            this.message = Jii.t('jii', '{attribute} is invalid.');
        }
    },

    validateAttribute(object, attribute) {
        var value = object.get(attribute);
        if (!this.validateValue(value)) {
            this.addError(object, attribute, this.message);
        }
    },

    validateValue(value) {
        var isMatch = this.pattern.test(value);
        return !this.not ? isMatch : !isMatch;
    }

});
