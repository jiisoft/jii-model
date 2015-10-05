/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

require('./Validator');

/**
 * @class Jii.validators.RegularExpressionValidator
 * @extends Jii.validators.Validator
 */
Jii.defineClass('Jii.validators.RegularExpressionValidator', /** @lends Jii.validators.RegularExpressionValidator.prototype */{

	__extends: Jii.validators.Validator,

	pattern: null,

    not: false,

    init: function() {
        this.__super();

        if (!Jii._.isRegExp(this.pattern)) {
            throw new Jii.exceptions.ApplicationException('The `pattern` property must be set.');
        }

        if (this.message === null) {
            this.message = Jii.t('jii', '{attribute} is invalid.');
        }
    },

    validateAttribute: function(object, attribute) {
        var value = object.get(attribute);
        if (!this.validateValue(value)) {
            this.addError(object, attribute, this.message);
        }
    },

    validateValue: function(value) {
        var isMatch = this.pattern.test(value);
        return !this.not ? isMatch : !isMatch;
    }

});
