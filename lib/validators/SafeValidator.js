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

/**
 * @class Jii.validators.SafeValidator
 * @extends Jii.validators.Validator
 */
Jii.defineClass('Jii.validators.SafeValidator', /** @lends Jii.validators.SafeValidator.prototype */{

	__extends: 'Jii.validators.Validator',

	validateAttribute: function(object, attribute) {
    }

});
