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
 * @class Jii.validators.StringValidator
 * @extends Jii.validators.Validator
 */
Jii.defineClass('Jii.validators.StringValidator', /** @lends Jii.validators.StringValidator.prototype */{

	__extends: 'Jii.validators.Validator',

	length: null,

    max: null,

    min: null,

    tooLong: null,

    tooShort: null,

    notEqual: null,

    init() {
        this.__super();

        if (Jii._.isArray(this.length)) {
            if (this.length[0]) {
                this.min = this.length[0];
            }
            if (this.length[1]) {
                this.max = this.length[1];
            }
            this.length = null;
        }

        if (this.message === null) {
            this.message = Jii.t('jii', '{attribute} must be a string.');
        }
        if (this.min !== null && this.tooShort === null) {
            this.tooShort = Jii.t('jii', '{attribute} should contain at least {min} characters.');
        }
        if (this.max !== null && this.tooLong === null) {
            this.tooLong = Jii.t('jii', '{attribute} should contain at most {max} characters.');
        }
        if (this.length !== null && this.notEqual === null) {
            this.notEqual = Jii.t('jii', '{attribute} should contain {length} characters.');
        }
    },

    validateAttribute(object, attribute) {
        var value = object.get(attribute);

        if (!Jii._.isString(value)) {
            this.addError(object, attribute, this.message);
            return;
        }

        var length = value.length;

        if (this.min !== null && length < this.min) {
            this.addError(object, attribute, this.tooShort, {
                min: this.min
            });
        }
        if (this.max !== null && length > this.max) {
            this.addError(object, attribute, this.tooLong, {
                max: this.max
            });
        }
        if (this.length !== null && length !== this.length) {
            this.addError(object, attribute, this.notEqual, {
                length: this.length
            });
        }
    },

    validateValue(value) {
        if (!Jii._.isString(value)) {
            return false;
        }

        var length = value.length;
        return (this.min === null || length >= this.min) &&
            (this.max === null || length <= this.max) &&
            (this.length === null || length === this.length);
    }

});
