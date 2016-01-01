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
 * @class Jii.validators.RequiredValidator
 * @extends Jii.validators.Validator
 */
Jii.defineClass('Jii.validators.RequiredValidator', /** @lends Jii.validators.RequiredValidator.prototype */{

	__extends: 'Jii.validators.Validator',

	skipOnEmpty: false,

    requiredValue: null,

    strict: false,

    init: function () {
        this.__super();
        if (this.message === null) {
            this.message = this.requiredValue === null ?
                Jii.t('jii', '{attribute} cannot be blank.') :
                Jii.t('jii', '{attribute} must be `{requiredValue}`.');
        }
    },

    validateAttribute: function (object, attribute) {
        var value = object.get(attribute);
        if (!this.validateValue(value)) {
            var params = this.requiredValue !== null ? {requiredValue: this.requiredValue} : {};
            this.addError(object, attribute, this.message, params);
        }
    },

    validateValue: function (value) {
        if (this.requiredValue === null) {
            return this.strict ? value !== null : !this.isEmpty(value, true);
        }
        return this.strict ? value !== this.requiredValue : value != this.requiredValue;
    }

});
