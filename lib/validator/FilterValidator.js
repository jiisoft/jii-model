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
 * @class Jii.data.validator.FilterValidator
 * @extends Jii.data.validator.Validator
 */
Jii.defineClass('Jii.data.validator.FilterValidator', {

	__extends: Jii.data.validator.Validator,

	filter: null,

    skipOnEmpty: false,

    init: function() {
        this.__super();
        if (this.filter === null) {
            throw new Jii.exceptions.ApplicationException('The `filter` property must be set.');
        }
    },

    validateAttribute: function(object, attribute) {
        object.set(attribute, this.filter.call(object, object.get(attribute)));
    }

});
