/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var ApplicationException = require('jii/exceptions/ApplicationException');
var _isArray = require('lodash/isArray');
var Validator = require('./Validator');

/**
 * @class Jii.validators.CompareValidator
 * @extends Jii.validators.Validator
 */
module.exports = Jii.defineClass('Jii.validators.CompareValidator', /** @lends Jii.validators.CompareValidator.prototype */{

    __extends: Validator,

    compareAttribute: null,

    compareValue: null,

    operator: '==',

    init() {
        this.__super();
        if (this.message === null) {
            this.message = ''; // @todo
        }
    },

    validateAttribute(object, attribute) {
        var compareLabel = null;
        var value = object.get(attribute);

        if (_isArray(value)) {
            this.addError(object, attribute, Jii.t('{attribute} is invalid.'));
            return;
        }

        if (this.compareValue === null) {
            if (this.compareAttribute === null) {
                this.compareAttribute = attribute + '_repeat';
            }
            compareLabel = object.getAttributeLabel(this.compareAttribute);
            this.compareValue = object.get(this.compareAttribute);
        } else {
            compareLabel = this.compareValue;
        }

        if (!this.validateValue(value)) {
            this.addError(object, attribute, this.message, {
                compareAttribute: compareLabel,
                compareValue: this.compareValue
            });
        }
    },

    validateValue(value) {
        if (!this.compareValue) {
            throw new ApplicationException('CompareValidator::compareValue must be set.');
        }

        switch (this.operator) {
            case '==': return this.compareValue == value;
            case '===': return this.compareValue === value;
            case '!=': return this.compareValue != value;
            case '!==': return this.compareValue !== value;
            case '>': return this.compareValue > value;
            case '>=': return this.compareValue >= value;
            case '<': return this.compareValue < value;
            case '<=': return this.compareValue <= value;
        }
        return false;
    }

});
