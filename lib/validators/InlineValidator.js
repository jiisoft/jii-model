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
 * @class Jii.validators.InlineValidator
 * @extends Jii.validators.Validator
 */
Jii.defineClass('Jii.validators.InlineValidator', {

	__extends: Jii.validators.Validator,

	method: null,

    params: null,

    init: function() {
        this.__super();
        if (this.message === null) {
            this.message = ''; // @todo
        }
    },

    validateAttribute: function(object, attribute) {
        var method = object[this.method];

        if (!Jii._.isFunction(method)) {
            throw new Jii.exceptions.ApplicationException('Not find method `' + this.method + '` in model `' + object.debugClassName + '`.');
        }

        return method.call(object, attribute, this.params || {});
    }

});
