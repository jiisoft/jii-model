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

/**
 * @class Jii.validators.BooleanValidator
 * @extends Jii.validators.Validator
 */
Jii.defineClass('Jii.validators.BooleanValidator', /** @lends Jii.validators.BooleanValidator.prototype */{

	__extends: 'Jii.validators.Validator',

    trueValue: '1',

    falseValue: '0',

    strict: false,

    init: function() {
        this.__super();
        if (this.message === null) {
            this.message = ''; // @todo
        }
    },

    validateAttribute: function(object, attribute) {
        var value = object.get(attribute);
        if (!this.validateValue(value)) {
            this.addError(object, attribute, this.message, {
                trueValue: this.trueValue,
                falseValue: this.falseValue
            });
        }
    },

    validateValue: function(value) {
        if (this.strict) {
            return value === this.trueValue || value === this.falseValue;
        } else {
            return value == this.trueValue || value == this.falseValue;
        }
    }

});
