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
 * @class Jii.validators.RangeValidator
 * @extends Jii.validators.Validator
 */
Jii.defineClass('Jii.validators.RangeValidator', /** @lends Jii.validators.RangeValidator.prototype */{

	__extends: 'Jii.validators.Validator',

	range: null,

    strict: false,

    not: false,

    init() {
        this.__super();

        if (!Jii._.isArray(this.range)) {
            throw new Jii.exceptions.ApplicationException('The `range` property must be set.');
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
        var isFined = false;

        Jii._.each(this.range, item => {
            if (this.strict && value === item) {
                isFined = true;
                return false;
            }

            if (!this.strict && value == item) {
                isFined = true;
                return false;
            }
        });

        return !this.not ? isFined : !isFined;
    }

});
