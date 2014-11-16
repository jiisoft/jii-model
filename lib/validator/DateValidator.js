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
 * @class Jii.data.validator.DateValidator
 * @extends Jii.data.validator.Validator
 */
Jii.defineClass('Jii.data.validator.DateValidator', {

	__extends: Jii.data.validator.Validator,

	format: 'Y-m-d',

    timestampAttribute: null,

    init: function() {
        this.__super();
        if (this.message === null) {
            this.message = Jii.t('jii', 'The format of {attribute} is invalid.');
        }
    },

    validateAttribute: function(object, attribute) {
        var value = object.get(attribute);

        if (_.isArray(value)) {
            this.addError(object, attribute, this.message);
            return;
        }

        if (!this.validateValue(value)) {
            this.addError(object, attribute, this.message);
        } else if (this.timestampAttribute !== null) {
            // @todo Parse by format
            var timestamp = Date.parse(value);
            object.set(this.timestampAttribute, Math.round(timestamp / 1000));
        }
    },

    validateValue: function(value) {
        // @todo Validate by format
        var timestamp = Date.parse(value);
        return !_.isNaN(timestamp);
    }

});
