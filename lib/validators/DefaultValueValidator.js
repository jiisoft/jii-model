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
 * @class Jii.validators.DefaultValueValidator
 * @extends Jii.validators.Validator
 */
Jii.defineClass('Jii.validators.DefaultValueValidator', /** @lends Jii.validators.DefaultValueValidator.prototype */{

	__extends: Jii.validators.Validator,

	value: null,

    skipOnEmpty: false,

    init: function() {
        this.__super();
        if (this.message === null) {
            this.message = ''; // @todo
        }
    },

    validateAttribute: function(object, attribute) {
        if (this.isEmpty(object.get(attribute))) {
            object.set(attribute, this.value);
        }

    }

});
