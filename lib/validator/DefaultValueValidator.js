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
 * @class Jii.data.validator.DefaultValueValidator
 * @extends Jii.data.validator.Validator
 */
Jii.defineClass('Jii.data.validator.DefaultValueValidator', {

	__extends: Jii.data.validator.Validator,

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
