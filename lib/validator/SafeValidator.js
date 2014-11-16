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
 * @class Jii.data.validator.SafeValidator
 * @extends Jii.data.validator.Validator
 */
Jii.defineClass('Jii.data.validator.SafeValidator', {

	__extends: Jii.data.validator.Validator,

	validateAttribute: function(object, attribute) {
    }

});
