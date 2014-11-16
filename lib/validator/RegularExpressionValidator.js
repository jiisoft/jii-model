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
 * @class Jii.data.validator.RegularExpressionValidator
 * @extends Jii.data.validator.Validator
 */
Jii.defineClass('Jii.data.validator.RegularExpressionValidator', {

	__extends: Jii.data.validator.Validator,

	pattern: null,

    not: false,

    init: function() {
        this.__super();

        if (!_.isRegExp(this.pattern)) {
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
