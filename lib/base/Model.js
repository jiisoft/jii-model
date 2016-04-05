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
Jii.defineClass('Jii.base.Model', /** @lends Jii.base.Model.prototype */{

    __extends: 'Jii.base.Component',

    _attributes: {},
    _errors: {},
    _validators: null,
    _scenario: 'default',

    _editedLevel: 0,
    _editedSubModels: [],
    _editedChanges: {},

    __static: /** @lends Jii.base.Model */{

        /**
         * @event Jii.base.Model#change
         * @property {Jii.model.ChangeEvent} event
         */
        EVENT_CHANGE: 'change',

        /**
         * @event Jii.base.Model#change:
         * @property {Jii.model.ChangeAttributeEvent} event
         */
        EVENT_CHANGE_NAME: 'change:'

    },

    /**
     * @constructor
     */
    constructor: function (attributes, config) {
        if (Jii._.isObject(attributes)) {
            this.set(attributes);
        }

        this.__super(config);
    },

    /**
     * Validation rules
     * @returns {Array}
     */
    rules: function () {
        return [];
    },

    /**
     * Begin change operation
     */
    beginEdit: function () {
        this._editedLevel++;
    },

    /**
     * Cancel all changes after beginEdit() call
     */
    cancelEdit: function () {
        if (this._editedLevel > 0) {
            this._editedLevel--;
        }

        // Cancel in sub-models
        if (this._editedLevel === 0) {
            Jii._.each(this._editedSubModels, function (subModel) {
                subModel.cancelEdit();
            });

            // Revert attribute changes
            Jii._.each(this._editedChanges, function (values, name) {
                this._attributes[name] = values[0];
            }.bind(this));
        }
    },

    /**
     * End change operation - trigger change events
     */
    endEdit: function () {
        if (this._editedLevel > 0) {
            this._editedLevel--;
        }

        if (this._editedLevel === 0) {
            // End in sub-models
            Jii._.each(this._editedSubModels, function (subModel) {
                subModel.endEdit();
            });

            // Trigger change attribute events
            if (!Jii._.isEmpty(this._editedChanges)) {
                Jii._.each(this._editedChanges, function (values, name) {
                    this.trigger(this.__static.EVENT_CHANGE_NAME + name, new Jii.model.ChangeAttributeEvent({
                        sender: this,
                        attribute: name,
                        oldValue: values[0],
                        newValue: values[1],
                        changedAttributes: this._editedChanges
                    }));
                }.bind(this));

                // Trigger change event
                this.trigger(this.__static.EVENT_CHANGE, new Jii.model.ChangeEvent({
                    sender: this,
                    changedAttributes: this._editedChanges
                }));
            }

            // Reset state
            this._editedSubModels = [];
            this._editedChanges = {};
        }
    },

    /**
     * Get attribute value
     * @param {String} name
     * @returns {*}
     */
    get: function (name) {
        if (this.hasAttribute(name)) {
            return this.getAttribute(name);
        }

        // Sub models support: foo[0]
        var collectionFormat = this._detectKeyFormatCollection(name, '', true);
        if (collectionFormat) {
            return collectionFormat.subName ?
                collectionFormat.model.get(collectionFormat.subName) :
                collectionFormat.model;
        }

        // Sub models support: foo.bar
        var modelFormat = this._detectKeyFormatModel(name);
        if (modelFormat) {
            return modelFormat.model ?
                modelFormat.model.get(modelFormat.subName) :
                null;
        }

        try {
            return this.__super(name);
        } catch (e) {
            if (!(e instanceof Jii.exceptions.UnknownPropertyException)) {
                throw e;
            }
            return null;
        }
    },

    /**
     * Set attribute value
     * @param {object|string} name
     * @param {*} [value]
     */
    set: function (name, value) {
        // Object format support
        if (Jii._.isObject(name)) {
            this.beginEdit();

            var isChanged = false;
            Jii._.each(name, function (value, name) {
                if (this.set(name, value)) {
                    isChanged = true;
                }
            }.bind(this));

            this.endEdit();
            return isChanged;
        }

        // Sub models support: foo[0].bar.zen
        var subMatches = /^(.+)\.([^\[\].]+)$/.exec(name);
        if (subMatches !== null) {
            var subModel = this.get(subMatches[1]);

            // Check sub-model is Jii.base.Model
            if (subModel instanceof Jii.base.Collection) {
                throw new Jii.exceptions.InvalidParamException('Try set property of array models: `' + name + '`');
            } else if (!(subModel instanceof Jii.base.Model)) {
                throw new Jii.exceptions.UnknownPropertyException('Setting property of null sub-model `' + name + '`');
            }

            subModel.beginEdit();
            this._editedSubModels.push(subModel);

            var isSubChanged = subModel.set(subMatches[2], value);

            this.endEdit();
            return isSubChanged;
        }

        if (this.hasAttribute(name)) {
            this.beginEdit();

            var oldValue = this._attributes[name];
            var isAttributeChanged = !Jii._.isEqual(oldValue, value);
            this._attributes[name] = value;

            if (isAttributeChanged) {
                this._editedChanges[name] = [oldValue, value];
            }

            this.endEdit();
            return isAttributeChanged;
        }

        this.__super(name, value);
    },

    /**
     *
     * @param {string} name
     * @param {string} [prefix]
     * @param {boolean} [skipThrow]
     * @returns {{model: Jii.base.ActiveRecord, name: string, subName: string}|null}
     * @protected
     */
    _detectKeyFormatCollection: function (name, prefix, skipThrow) {
        prefix = prefix || '';
        skipThrow = skipThrow || false;

        // Sub models support: change:foo[0]
        var arrRegExp = new RegExp('^' + prefix + '([^\\[\\].]+)\\[([-0-9]+)\\](\\.(.+))?$');
        var arrMatches = arrRegExp.exec(name);
        if (arrMatches === null) {
            return null;
        }

        var collection = this.get(arrMatches[1]);
        if (collection instanceof Jii.base.Collection) {
            var index = parseInt(arrMatches[2]);
            var arrSubModel = collection.at(index);
            if (arrSubModel) {
                return {
                    model: arrSubModel,
                    subName: arrMatches[4] ? prefix + arrMatches[4] : null,
                    index: index
                };
            } else if (!skipThrow) {
                throw new Jii.exceptions.InvalidParamException('Model with index `' + index + '` in collection `' + arrMatches[1] + '` is not found.');
            }
        } else if (!skipThrow) {
            throw new Jii.exceptions.InvalidParamException('Relation `' + arrMatches[1] + '` is not collection.');
        }

        return null;
    },

    /**
     *
     * @param {string} name
     * @param {string} [prefix]
     * @returns {{model: Jii.base.ActiveRecord|null, name: string, subName: string}|null}
     * @protected
     */
    _detectKeyFormatModel: function (name, prefix) {
        prefix = prefix || '';

        if (prefix && name.indexOf(prefix) !== 0) {
            return null;
        }
        name = name.substr(prefix.length);

        var dotIndex = name.indexOf('.');
        if (dotIndex === -1) {
            return null;
        }

        var relationName = name.substr(0, dotIndex);

        return {
            model: this.get(relationName),
            name: relationName,
            subName: prefix + name.substr(dotIndex + 1)
        };
    },

    /**
     * Returns the named attribute value.
     * If this record is the result of a query and the attribute is not loaded,
     * null will be returned.
     * @param {string} name the attribute name
     * @returns {*} the attribute value. Null if the attribute is not set or does not exist.
     * @see hasAttribute()
     */
    getAttribute: function (name) {
        return Jii._.has(this._attributes, name) ? this._attributes[name] : null;
    },

    /**
     * Sets the named attribute value.
     * @param {string} name the attribute name
     * @param {*} value the attribute value.
     * @throws {Jii.exceptions.InvalidParamException} if the named attribute does not exist.
     * @see hasAttribute()
     */
    setAttribute: function (name, value) {
        if (this.hasAttribute(name)) {
            this.set(name, value);
        } else {
            throw new Jii.exceptions.InvalidParamException(this.className() + ' has no attribute named "' + name + '".');
        }
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

        var filteredAttributes = {};
        var attributeNames = safeOnly ? this.safeAttributes() : this.attributes();

        Jii._.each(attributes, function (value, key) {
            if (Jii._.indexOf(attributeNames, key) !== -1) {
                filteredAttributes[key] = value;
            } else if (safeOnly) {
                this.onUnsafeAttribute(key, value);
            }
        }.bind(this));

        return this.set(filteredAttributes);
    },

    /**
     *
     * @param {object|Jii.base.ModelAdapterInterface} adapter
     */
    createProxy: function (adapter) {
        var cloned = adapter.instance(this);

        var attributes = {};
        Jii._.each(adapter.attributes || this.attributes(), function(name, alias) {
            if (Jii._.isNumber(alias)) {
                alias = name;
            }
            attributes[alias] = name;
        });

        // Fill model
        var values = {};
        Jii._.each(attributes, function (name, alias) {
            values[alias] = this.get(name);
        }.bind(this));
        adapter.setValues(this, cloned, values);

        // Subscribe for sync
        Jii._.each(attributes, function (name, alias) {
            this.on(
                this.__static.EVENT_CHANGE_NAME + name,
                /** @param {Jii.model.ChangeAttributeEvent} event */
                function (event) {
                    var obj = {};
                    obj[alias] = event.newValue;
                    adapter.setValues(this, cloned, obj)
                }.bind(this)
            );
        }.bind(this));

        return cloned;
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

        Jii._.each(names, function (name) {
            if (!Jii._.isArray(except) || Jii._.indexOf(name, except) === -1) {
                values[name] = this.get(name);
            }
        }.bind(this));

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
            Jii._.each(validator.on, function (scenario) {
                scenarios[scenario] = [];
            });
            Jii._.each(validator.except, function (scenario) {
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
        Jii._.each(this.rules(), function (rule) {
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
        }.bind(this));
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

        return Promise.resolve(this.beforeValidate())
            .then(function (bool) {
                if (!bool) {
                    return Promise.resolve(false);
                }

                var promises = Jii._.map(this.getActiveValidators(), function (validator) {
                    return validator.validate(this, attributes);
                }.bind(this));
                return Promise.all(promises);
            }.bind(this))
            .then(this.afterValidate)
            .then(function () {
                if (this.hasErrors()) {
                    return Promise.resolve(false);
                }

                // Return result
                return Promise.resolve(true);
            }.bind(this));
    },

    addError: function (attribute, error) {
        if (!this._errors[attribute]) {
            this._errors[attribute] = [];
        }

        this._errors[attribute].push(error);
    },

    setErrors: function (errors) {
        this._errors = errors;
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
        Jii._.each(this.getActiveValidators(attribute), function (validator) {
            if (validator instanceof Jii.validators.RequiredValidator && validator.when === null) {
                bool = true;
            }
        }.bind(this));
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
        Jii._.each(this._errors, function (es, name) {
            if (es.length > 0) {
                errors[name] = es[0];
            }
        }.bind(this));

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
