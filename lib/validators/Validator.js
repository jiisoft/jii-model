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
 * @class Jii.validators.Validator
 * @extends Jii.base.Object
 */
Jii.defineClass('Jii.validators.Validator', {

	__extends: Jii.base.Object,

	__static: {

		defaultValidators: {

			'boolean': 'Jii.validators.BooleanValidator',
			'compare': 'Jii.validators.CompareValidator',
			'date': 'Jii.validators.DateValidator',
			'default': 'Jii.validators.DefaultValueValidator',
			'double': 'Jii.validators.NumberValidator',
			'email': 'Jii.validators.EmailValidator',
			//'exist': 'Jii.validators.ExistValidator',
			//'file': 'Jii.validators.FileValidator',
			'filter': 'Jii.validators.FilterValidator',
			//'image': 'Jii.validators.ImageValidator',
			'in': 'Jii.validators.RangeValidator',
			'integer': {
				'className': 'Jii.validators.NumberValidator',
				'integerOnly': true
			},
			'match': 'Jii.validators.RegularExpressionValidator',
			'number': 'Jii.validators.NumberValidator',
			'required': 'Jii.validators.RequiredValidator',
			'safe': 'Jii.validators.SafeValidator',
			'string': 'Jii.validators.StringValidator',
			//'unique': 'Jii.validators.UniqueValidator',
			'url': 'Jii.validators.UrlValidator'
		},

		create: function (type, object, attributes, params) {
			params = params || {};
			params.attributes = attributes;

			if (Jii._.isFunction(object[type])) {
				params.className = 'Jii.validators.InlineValidator';
				params.method = type;
			} else {
				if (Jii._.has(this.defaultValidators, type)) {
					type = this.defaultValidators[type];
				}

				if (Jii._.isArray(type)) {
					Jii._.extend(params, type);
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
	 * @returns {Jii.when|null}
     */
    validateAttribute: function (object, attribute) {
    },

    validateValue: function() {
        throw new Jii.exceptions.ApplicationException('Not found implementation for method `validateValue()`.');
    },

    validate: function(object, attributes) {
        attributes = Jii._.isArray(attributes) ?
            Jii._.intersection(this.attributes, attributes) :
            this.attributes;

        var promises = Jii._.map(attributes, Jii._.bind(function(attribute) {
            if (this.skipOnError && object.hasErrors(attribute)) {
                return;
            }

            if (this.skipOnEmpty && this.isEmpty(object.get(attribute))) {
                return;
            }

            return this.validateAttribute(object, attribute);
        }, this));

        return Jii.when.all(promises);
    },

    isActive: function(scenario) {
        return Jii._.indexOf(this.except, scenario) === -1 &&
            (this.on.length === 0 || Jii._.indexOf(this.on, scenario) !== -1);
    },

    addError: function(object, attribute, message, params) {
        params = params || {};
        params.attribute = object.getAttributeLabel(attribute);
        params.value = object.get(attribute);

        // @todo
        //message = Jii.t('jii', message);
        Jii._.each(params, function(value, key) {
            message = message.replace('{' + key + '}', value);
        });

        object.addError(attribute, message);
        Jii.warning('Validation error in model `' + object.className() + '`:' + message);
    },

    isEmpty: function(value, isTrim) {
        return value === null ||
            value === '' ||
            (isTrim && Jii._.isString(value) && value.replace(/^\s+|\s+$/g, '') === '') ||
            (Jii._.isArray(value) && value.length === 0);
    }


});
