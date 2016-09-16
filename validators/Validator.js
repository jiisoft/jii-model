/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var ApplicationException = require('jii/exceptions/ApplicationException');
var _isFunction = require('lodash/isFunction');
var _isObject = require('lodash/isObject');
var _isArray = require('lodash/isArray');
var _indexOf = require('lodash/indexOf');
var _isString = require('lodash/isString');
var _has = require('lodash/has');
var _extend = require('lodash/extend');
var _intersection = require('lodash/intersection');
var _map = require('lodash/map');
var _each = require('lodash/each');
var Object = require('jii/base/Object');

/**
 * @class Jii.validators.Validator
 * @extends Jii.base.Object
 */
module.exports = Jii.defineClass('Jii.validators.Validator', /** @lends Jii.validators.Validator.prototype */{

	__extends: Object,

	__static: /** @lends Jii.validators.Validator */{

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

		create(type, object, attributes, params) {
			params = params || {};
			params.attributes = attributes;

			if (_isFunction(object[type])) {
				params.className = 'Jii.validators.InlineValidator';
				params.method = type;
			} else {
				if (_has(this.defaultValidators, type)) {
					type = this.defaultValidators[type];
				}

				if (_isObject(type)) {
					_extend(params, type);
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

    /**
     * @abstract
     * @param object
     * @param attribute
	 * @returns {Promise|null}
     */
    validateAttribute(object, attribute) {
    },

    validateValue() {
        throw new ApplicationException('Not found implementation for method `validateValue()`.');
    },

    validate(object, attributes) {
        attributes = _isArray(attributes) ?
            _intersection(this.attributes, attributes) :
            this.attributes;

        var promises = _map(attributes, attribute => {
            if (this.skipOnError && object.hasErrors(attribute)) {
                return;
            }

            if (this.skipOnEmpty && this.isEmpty(object.get(attribute))) {
                return;
            }

            return this.validateAttribute(object, attribute);
        });

        return Promise.all(promises);
    },

    isActive(scenario) {
        return _indexOf(this.except, scenario) === -1 &&
            (!this.on || this.on.length === 0 || _indexOf(this.on, scenario) !== -1);
    },

    addError(object, attribute, message, params) {
        params = params || {};
        params.attribute = object.getAttributeLabel(attribute);
        params.value = object.get(attribute);

        // @todo
        //message = Jii.t('jii', message);
        _each(params, (value, key) => {
            message = message.replace('{' + key + '}', value);
        });

        object.addError(attribute, message);
        Jii.warning('Validation error in model `' + object.className() + '`: ' + message);
    },

    isEmpty(value, isTrim) {
        return value === null ||
            value === '' ||
            (isTrim && _isString(value) && value.replace(/^\s+|\s+$/g, '') === '') ||
            (_isArray(value) && value.length === 0);
    }


});
