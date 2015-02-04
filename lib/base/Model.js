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
 * @class Jii.base.Model
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.base.Model', {

	__extends: Jii.base.Component,

	_attributes: {},
	_errors: {},
	_validators: null,
	_scenario: 'default',

	/**
	 * Get attribute value
	 * @param {String} name
	 * @returns {*}
	 */
	get: function (name) {
		if (Jii._.has(this._attributes, name)) {
			return this._attributes[name];
		} else if (this.hasAttribute(name)) {
			return null;
		}

		return this.__super(name);
	},

	/**
	 * Set attribute value
	 * @param {String} name
	 * @param {*} value
	 */
	set: function (name, value) {
		if (this.hasAttribute(name)) {
			this._attributes[name] = value;
		} else {
			this.__super(name, value);
		}

		// @todo Move to browser model
		//this.trigger('change:' + key, this, this._attributes[key]);
	},

	/**
	 * Validation rules
	 * @returns {Array}
	 */
	rules: function () {
		return [];
	},

	/**
	 * Update model attributes. This method run change
	 * and change:* events, if attributes will be changes
	 * @param attributes
	 * @param {Boolean} [safeOnly]
	 * @returns {boolean}
	 */
	setAttributes: function (attributes, safeOnly) {
		if (Jii._.isUndefined(safeOnly)) {
			safeOnly = true;
		}

		var isChanged = false;
		var attributeNames = safeOnly ? this.safeAttributes() : this.attributes();

		Jii._.each(attributes, Jii._.bind(function (value, key) {
			if (Jii._.indexOf(attributeNames, key) !== -1) {
				isChanged = this.set(key, value);
			} else if (safeOnly) {
				this.onUnsafeAttribute(key, value);
			}
		}, this));

		if (isChanged) {
			// @todo Move to browser model
			//this.trigger('change', this);
		}
		return isChanged;
	},

	/**
	 * This method is invoked when an unsafe attribute is being massively assigned.
	 * The default implementation will log a warning message if YII_DEBUG is on.
	 * It does nothing otherwise.
	 * @param {string} name the unsafe attribute name
	 * @param {*} value the attribute value
	 */
	onUnsafeAttribute: function (name, value) {
		if (Jii.debug) {
			Jii.trace('Failed to set unsafe attribute `' + name + '` in ' + this.className() + '`');
		}
	},

	/**
	 * Returns attribute values.
	 * @param {Array} [names]
	 * @param {Array} [except]
	 * @returns {{}} Attribute values (name => value).
	 */
	getAttributes: function (names, except) {
		var values = {};

		if (!Jii._.isArray(names)) {
			names = this.attributes();
		}

		Jii._.each(names, Jii._.bind(function (name) {
			if (!Jii._.isArray(except) || Jii._.indexOf(name, except) === -1) {
				values[name] = this.get(name);
			}
		}, this));

		return values;
	},

	/**
	 * Get attributes list for this model
	 * @return {Array}
	 */
	attributes: function () {
		return Jii._.keys(this._attributes);
	},

	/**
	 * Check attribute exists in this model
	 * @param {String} name
	 * @returns {boolean}
	 */
	hasAttribute: function (name) {
		//return true;
		return Jii._.indexOf(this.attributes(), name) !== -1;
	},

	/**
	 * Format: attribute => label
	 * @return {object}
	 */
	attributeLabels: function () {
		return {};
	},

	/**
	 * Get label by attribute name
	 * @param {string} name
	 * @returns {string}
	 */
	getAttributeLabel: function (name) {
		var attributes = this.attributeLabels();
		return Jii._.has(attributes, name) ? attributes[name] : name;
	},

	/**
	 *
	 * @param scenario
	 */
	setScenario: function (scenario) {
		this._scenario = scenario;
	},

	/**
	 *
	 * @returns {string}
	 */
	getScenario: function () {
		return this._scenario;
	},

	safeAttributes: function () {
		var scenario = this.getScenario();
		var scenarios = this.scenarios();

		if (!Jii._.has(scenarios, scenario)) {
			return [];
		}

		var attributes = [];
		Jii._.each(scenarios[scenario], function (attribute, i) {
			if (attribute.substr(0, 1) !== '!') {
				attributes.push(attribute);
			}
		});
		return attributes;
	},

	/**
	 *
	 * @returns {*}
	 */
	activeAttributes: function () {
		var scenario = this.getScenario();
		var scenarios = this.scenarios();

		if (!Jii._.has(scenarios, scenario)) {
			return [];
		}

		var attributes = scenarios[scenario];
		Jii._.each(attributes, function (attribute, i) {
			if (attribute.substr(0, 1) === '!') {
				attributes[i] = attribute.substr(1);
			}
		});

		return attributes;
	},

	/**
	 *
	 * @returns {Object}
	 */
	scenarios: function () {
		var scenarios = {};
		scenarios['default'] = [];

		Jii._.each(this.getValidators(), function (validator) {
			Jii._.each(validator.on, function(scenario) {
				scenarios[scenario] = [];
			});
			Jii._.each(validator.except, function(scenario) {
				scenarios[scenario] = [];
			});
		});
		var names = Jii._.keys(scenarios);

		Jii._.each(this.getValidators(), function (validator) {
			var validatorScenarios = validator.on && validator.on.length > 0 ? validator.on : names;
			Jii._.each(validatorScenarios, function (name) {
				if (!scenarios[name]) {
					scenarios[name] = [];
				}

				if (Jii._.indexOf(validator.except, name) !== -1) {
					return;
				}

				Jii._.each(validator.attributes, function (attribute) {

					if (Jii._.indexOf(scenarios[name], attribute) !== -1) {
						return;
					}

					scenarios[name].push(attribute);
				});
			});
		});

		return scenarios;
	},

	/**
	 *
	 * @returns {Array}
	 */
	createValidators: function () {
		var validators = [];
		Jii._.each(this.rules(), Jii._.bind(function (rule) {
			if (rule instanceof Jii.validators.Validator) {
				validators.push(rule);
			} else if (Jii._.isArray(rule) && rule.length >= 2) {
				var attributes = Jii._.isString(rule[0]) ? [rule[0]] : rule[0];
				var params = rule[2] || {};
				params.on = Jii._.isString(params.on) ? [params.on] : params.on;

				var validator = Jii.validators.Validator.create(rule[1], this, attributes, params);
				validators.push(validator);
			} else {
				throw new Jii.exceptions.ApplicationException('Invalid validation rule: a rule must specify both attribute names and validator type.');
			}
		}, this));
		return validators;
	},

	/**
	 *
	 * @returns {*}
	 */
	getValidators: function () {
		if (this._validators === null) {
			this._validators = this.createValidators();
		}
		return this._validators;
	},

	/**
	 *
	 * @param [attribute]
	 * @returns {Array}
	 */
	getActiveValidators: function (attribute) {
		var validators = [];
		var scenario = this.getScenario();

		Jii._.each(this.getValidators(), function (validator) {
			if (!validator.isActive(scenario)) {
				return;
			}

			if (attribute && Jii._.indexOf(validator.attributes, attribute) === -1) {
				return;
			}

			validators.push(validator);
		});

		return validators;
	},

	/**
	 * Validate model by rules, see rules() method.
	 * @param {Array} [attributes]
	 * @param {Boolean} [isClearErrors]
	 */
	validate: function (attributes, isClearErrors) {
		if (Jii._.isUndefined(isClearErrors)) {
			isClearErrors = true;
		}
		if (!attributes) {
			attributes = this.activeAttributes();
		}

		var scenarios = this.scenarios();
		var scenario = this.getScenario();
		if (!Jii._.has(scenarios, scenario)) {
			throw new Jii.exceptions.ApplicationException('Unknown scenario `' + scenario + '`.');
		}

		if (isClearErrors) {
			this.clearErrors();
		}

		return Jii.when.resolve(this.beforeValidate())
			.then(Jii._.bind(function (bool) {
				if (!bool) {
					return Jii.when.resolve(false);
				}

				var promises = Jii._.map(this.getActiveValidators(), Jii._.bind(function (validator) {
					return validator.validate(this, attributes);
				}, this));
				return Jii.when.all(promises);
			}, this))
			.then(this.afterValidate)
			.then(Jii._.bind(function () {
				if (this.hasErrors()) {
					return Jii.when.resolve(false);
				}

				// Return result
				return Jii.when.resolve(true);
			}, this));
	},

	addError: function (attribute, error) {
		if (!this._errors[attribute]) {
			this._errors[attribute] = [];
		}

		this._errors[attribute].push(error);
	},

	/**
	 *
	 * @param [attribute]
	 * @returns {*}
	 */
	getErrors: function (attribute) {
		return !attribute ? this._errors : this._errors[attribute] || {};
	},

	/**
	 *
	 * @param [attribute]
	 * @returns {*}
	 */
	hasErrors: function (attribute) {
		return attribute ? Jii._.has(this._errors, attribute) : !Jii._.isEmpty(this._errors);
	},

	/**
	 *
	 * @param [attribute]
	 * @returns {*}
	 */
	clearErrors: function (attribute) {
		if (!attribute) {
			this._errors = {};
		} else if (this._errors) {
			delete this._errors[attribute];
		}
	},

	beforeValidate: function () {
		return true;
	},

	afterValidate: function () {
	},






	/**
	 * Returns a value indicating whether the attribute is required.
	 * This is determined by checking if the attribute is associated with a
	 * [[\jii\validators\RequiredValidator|required]] validation rule in the
	 * current [[scenario]].
	 *
	 * Note that when the validator has a conditional validation applied using
	 * [[\jii\validators\RequiredValidator.when|when]] this method will return
	 * `false` regardless of the `when` condition because it may be called be
	 * before the model is loaded with data.
	 *
	 * @param {string} attribute attribute name
	 * @returns {boolean} whether the attribute is required
	 */
	isAttributeRequired: function (attribute) {
		var bool = false;
		Jii._.each(this.getActiveValidators(attribute), Jii._.bind(function(validator) {
			if (validator instanceof Jii.validators.RequiredValidator && validator.when === null) {
				bool = true;
			}
		}, this));
		return bool;
	},

	/**
	 * Returns a value indicating whether the attribute is safe for massive assignments.
	 * @param {string} attribute attribute name
	 * @returns {boolean} whether the attribute is safe for massive assignments
	 * @see safeAttributes()
	 */
	isAttributeSafe: function (attribute) {
		return Jii._.indexOf(this.safeAttributes(), attribute) !== -1;
	},

	/**
	 * Returns a value indicating whether the attribute is active in the current scenario.
	 * @param {string} attribute attribute name
	 * @returns {boolean} whether the attribute is active in the current scenario
	 * @see activeAttributes()
	 */
	isAttributeActive: function (attribute) {
		return Jii._.indexOf(this.activeAttributes(), attribute) !== -1;
	},

	/**
	 * Returns the first error of every attribute in the model.
	 * @returns {object} the first errors. The array keys are the attribute names, and the array
	 * values are the corresponding error messages. An empty array will be returned if there is no error.
	 * @see getErrors()
	 * @see getFirstError()
	 */
	getFirstErrors: function () {
		if (Jii._.isEmpty(this._errors)) {
			return {};
		}

		var errors = {};
		Jii._.each(this._errors, Jii._.bind(function(es, name) {
			if (es.length > 0) {
				errors[name] = es[0];
			}
		}, this));

		return errors;
	},

	/**
	 * Returns the first error of the specified attribute.
	 * @param {string} attribute attribute name.
	 * @returns {string} the error message. Null is returned if no error.
	 * @see getErrors()
	 * @see getFirstErrors()
	 */
	getFirstError: function (attribute) {
		return Jii._.has(this._errors, attribute) ? this._errors[attribute][0] : null;
	},

	/**
	 * Generates a user friendly attribute label based on the give attribute name.
	 * This is done by replacing underscores, dashes and dots with blanks and
	 * changing the first letter of each word to upper case.
	 * For example, 'department_name' or 'DepartmentName' will generate 'Department Name'.
	 * @param {string} name the column name
	 * @returns {string} the attribute label
	 */
	generateAttributeLabel: function (name) {
		return Jii._s.humanize(name);
	}

});
