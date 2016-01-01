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

    init: function() {
        this.__super();

        if (!Jii._.isArray(this.range)) {
            throw new Jii.exceptions.ApplicationException('The `range` property must be set.');
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
        var isFined = false;

        Jii._.each(this.range, function(item) {
            if (this.strict && value === item) {
                isFined = true;
                return false;
            }

            if (!this.strict && value == item) {
                isFined = true;
                return false;
            }
        }.bind(this));

        return !this.not ? isFined : !isFined;
    }

});
