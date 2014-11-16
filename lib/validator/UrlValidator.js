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
 * @class Jii.data.validator.UrlValidator
 * @extends Jii.data.validator.Validator
 */
Jii.defineClass('Jii.data.validator.UrlValidator', {

	__extends: Jii.data.validator.Validator,

	pattern: /^{schemes}:\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)/i,

    validSchemes: [
        'http',
        'https'
    ],

    defaultScheme: null,

    init: function() {
        this.__super();
        if (this.message === null) {
            this.message = Jii.t('jii', '{attribute} is not a valid URL.');
        }
    },

    validateAttribute: function(object, attribute) {
        var value = object.get(attribute);
        if (!this.validateValue(value)) {
            this.addError(object, attribute, this.message);
        } else if (this.defaultScheme !== null && value.indexOf('://') === -1) {
            object.set(attribute, this.defaultScheme + '://' + value);
        }
    },

    validateValue: function(value) {
        if (!_.isString(value) || value.length > 2000) {
            return false;
        }

        if (this.defaultScheme !== null && value.indexOf('://') === -1) {
            value = this.defaultScheme + '://' + value;
        }

        var pattern = this.pattern.source;
        pattern = pattern.replace('{schemes}', '(' + this.validSchemes.join('|') + ')');

        var flags = '';
        _.each({global: 'g', ignoreCase: 'i', multiline: 'm'}, _.bind(function(flag, key) {
            if (this.pattern[key]) {
                flags += flag;
            }
        }, this));

        return (new RegExp(pattern, flags)).test(value);
    }

});
