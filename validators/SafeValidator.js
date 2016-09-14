/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var Validator = require('./Validator');

/**
 * @class Jii.validators.SafeValidator
 * @extends Jii.validators.Validator
 */
module.exports = Jii.defineClass('Jii.validators.SafeValidator', /** @lends Jii.validators.SafeValidator.prototype */{

	__extends: Validator,

	validateAttribute(object, attribute) {
    }

});
