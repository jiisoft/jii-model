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
 * @class Jii.data.validator.Validator
 * @extends Jii.base.Object
 */
Jii.defineClass('Jii.data.validator.Validator', {

	__extends: Jii.base.Object,

	__static: {

		defaultValidators: {

			'boolean': 'Jii.data.validator.BooleanValidator',
			'compare': 'Jii.data.validator.CompareValidator',
			'date': 'Jii.data.validator.DateValidator',
			'default': 'Jii.data.validator.DefaultValueValidator',
			'double': 'Jii.data.validator.NumberValidator',
			'email': 'Jii.data.validator.EmailValidator',
			//'exist': 'Jii.data.validator.ExistValidator',
			//'file': 'Jii.data.validator.FileValidator',
			'filter': 'Jii.data.validator.FilterValidator',
			//'image': 'Jii.data.validator.ImageValidator',
			'in': 'Jii.data.validator.RangeValidator',
			'integer': {
				'className': 'Jii.data.validator.NumberValidator',
				'integerOnly': true
			},
			'match': 'Jii.data.validator.RegularExpressionValidator',
			'number': 'Jii.data.validator.NumberValidator',
			'required': 'Jii.data.validator.RequiredValidator',
			'safe': 'Jii.data.validator.SafeValidator',
			'string': 'Jii.data.validator.StringValidator',
			//'unique': 'Jii.data.validator.UniqueValidator',
			'url': 'Jii.data.validator.UrlValidator'
		},

		create: function (type, object, attributes, params) {
			params = params || {};
			params.attributes = attributes;

			if (_.isFunction(object[type])) {
				params.className = 'Jii.data.validator.InlineValidator';
				params.method = type;
			} else {
				if (_.has(this.defaultValidators, type)) {
					type = this.defaultValidators[type];
				}

				if (_.isArray(type)) {
					_.extend(params, type);
				} else {
					params.className = type;
				}
			}

			return Jii.createObject(params);
		}

	},

    attributes: [],
    message: null,
    on: [],
    except: [],
    skipOnError: true,
    skipOnEmpty: true,
    deferred: null,

    init: function() {

    },

    /**
     * @abstract
     * @param object
     * @param attribute
	 * @returns {Promise|null}
     */
    validateAttribute: function (object, attribute) {
    },

    validateValue: function() {
        throw new Jii.exceptions.ApplicationException('Not found implementation for method `validateValue()`.');
    },

    validate: function(object, attributes) {
        attributes = _.isArray(attributes) ?
            _.intersection(this.attributes, attributes) :
            this.attributes;

        var promises = _.map(attributes, _.bind(function(attribute) {
            if (this.skipOnError && object.hasErrors(attribute)) {
                return;
            }

            if (this.skipOnEmpty && this.isEmpty(object.get(attribute))) {
                return;
            }

            return this.validateAttribute(object, attribute);
        }, this));

        return Promise.all(promises);
    },

    isActive: function(scenario) {
        return _.indexOf(this.except, scenario) === -1 &&
            (this.on.length === 0 || _.indexOf(this.on, scenario) !== -1);
    },

    addError: function(object, attribute, message, params) {
        params = params || {};
        params.attribute = object.getAttributeLabel(attribute);
        params.value = object.get(attribute);

        // @todo
        //message = Jii.t('jii', message);
        _.each(params, function(value, key) {
            message = message.replace('{' + key + '}', value);
        });

        object.addError(attribute, message);
        //Jii.app.logger.error('Validation error in model `%s`:', object.debugClassName, message);
    },

    isEmpty: function(value, isTrim) {
        return value === null ||
            value === '' ||
            (isTrim && _.isString(value) && value.replace(/^\s+|\s+$/g, '') === '') ||
            (_.isArray(value) && value.length === 0);
    }


});
