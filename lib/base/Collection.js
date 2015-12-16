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
 * BaseCollection provides a base class that implements the [[CollectionInterface]].
 *
 * @class Jii.base.Collection
 * @extends Jii.base.Component
 * @extends Array
 */
Jii.defineClass('Jii.base.Collection', /** @lends Jii.base.Collection.prototype */{

    __extends: Jii.base.Component,

    __static: /** @lends Jii.base.Collection */{

        /**
         * @event Jii.base.Collection#add
         * @property {Jii.model.CollectionEvent} event
         */
        EVENT_ADD: 'add',

        /**
         * @event Jii.base.Collection#change
         * @property {Jii.model.CollectionEvent} event
         */
        EVENT_CHANGE: 'change',

        /**
         * @event Jii.base.Collection#change:
         * @property {Jii.model.CollectionEvent} event
         */
        EVENT_CHANGE_NAME: 'change:',

        /**
         * @event Jii.base.Collection#remove
         * @property {Jii.model.CollectionEvent} event
         */
        EVENT_REMOVE: 'remove'

    },

    /**
     * @type {number}
     */
    length: 0,

    /**
     * @type {string|Jii.base.Model}
     */
    modelClass: null,

    _byId: {},

    _eventsChangeName: [],

    /**
     * @param {[]|object} [models]
     * @param {object} [config]
     * @constructor
     */
    constructor: function (models, config) {
        this.__super(config);

        if (Jii._.isArray(models)) {
            this.add(models);
        }
    },

    /**
     * @returns {[]|object}
     */
    getModels: function () {
        return this.map(function(model) {
            return model;
        });
    },

    /**
     *
     * @param {object|object[]|Jii.base.Model|Jii.base.Model[]} models
     */
    setModels: function(models) {
        if (!Jii._.isArray(models)) {
            models = [models];
        }
        this._change(this.length, models, [], true);
    },

    /**
     *
     * @param {object|object[]|Jii.base.Model|Jii.base.Model[]} models
     * @param {number} [index]
     */
    add: function(models, index) {
        if (!Jii._.isArray(models)) {
            models = [models];
        }
        if (!index && index !== 0) {
            index = this.length;
        }
        this._change(index, models, []);
    },

    /**
     *
     * @param {*|*[]} models
     */
    remove: function(models) {
        if (!Jii._.isArray(models)) {
            models = [models];
        }
        this._change(0, [], models);
    },

    /**
     *
     * @param {string|object|object[]} name
     * @param {*} [value]
     * @returns {*}
     */
    set: function(name, value) {
        // Format [0].name
        var indexFormat = this._detectKeyFormatIndex(name);
        if (indexFormat) {
            var model = this.at(indexFormat.index);
            if (model) {
                return model.set(indexFormat.subName, value);
            }

            throw new Jii.exceptions.InvalidParamException('Not found model with index `' + indexFormat.index + '` for set attribute `' + indexFormat.subName + '`.');
        }

        // Object format
        if (Jii._.isObject(name) && !Jii._.has(name, 'modelClass')) {
            return this.setModels(name);
        }

        // Array format
        if (Jii._.isArray(name)) {
            return this.setModels(name);
        }

        return this.__super(name, value);
    },

    /**
     *
     * @param {string} name
     * @returns {*}
     */
    get: function(name) {
        // Format [0].name
        var indexFormat = this._detectKeyFormatIndex(name);
        if (indexFormat) {
            var model = this.at(indexFormat.index);
            if (model) {
                return indexFormat.subName ? model.get(indexFormat.subName) : model;
            }
            return null;
        }

        // Get by pk
        var primaryKey = this._getPrimaryKey(name);
        if (Jii._.has(this._byId, primaryKey)) {
            return this._byId[primaryKey];
        }

        return this.__super(name);
    },

    /**
     * Method for NeatComet api
     * @param newAttributes
     * @param oldAttributes
     */
    update: function(newAttributes, oldAttributes) {
        var model = this.getById(oldAttributes);
        if (model) {
            model.set(newAttributes);
        } else {
            this.add(newAttributes);
        }
    },

    /**
     *
     * @param name
     * @returns {{index: number, subName: string|null}}
     * @private
     */
    _detectKeyFormatIndex: function(name) {
        var matches = /^\[([0-9]+)\]\.?(.*)/.exec(name);
        if (matches === null) {
            return null;
        }

        return {
            index: parseInt(matches[1]),
            subName: matches[2] || null
        };
    },

    /**
     *
     *
     * @param {number|string|object} primaryKey
     * @returns {*|null}
     */
    getById: function(primaryKey) {
        return this._byId[this._getPrimaryKey(primaryKey)] || null;
    },

    /**
     *
     * @returns {number}
     */
    getCount: function () {
        return this.length;
    },

    /**
     * @param options
     * @returns {*}
     */
    toJSON: function(options) {
        return this.map(function(model) {
            return model.toJSON(options);
        });
    },

    /**
     *
     * @param {number} index
     * @returns {*}
     */
    at: function(index) {
        if (index < 0) {
            index = Math.max(0, this.length + index);
        }
        return this[index] || null;
    },

    /**
     *
     * @param {*} [models]
     */
    reset: function(models) {
        models = models || [];
        if (!Jii._.isArray(models)) {
            models = [models];
        }

        var toAdd = [];
        Jii._.each(models, function(data) {
            var finedModels = this._findModels(data);
            if (finedModels.length) {
                // Convert data to model
                Jii._.each(this._findModels(data), function(model) {
                    if (Jii._.indexOf(toAdd, model) === -1) {
                        toAdd.push(model);
                    }
                });
            } else {
                toAdd.push(data);
            }
        }.bind(this));

        var toRemove = [];
        Jii._.each(this.getModels(), function(model) {
            if (Jii._.indexOf(toAdd, model) === -1) {
                toRemove.push(model);
            }
        });

        this._change(0, toAdd, toRemove, true);
    },

    /**
     *
     * @returns {Jii.base.Object.__super}
     */
    clone: function() {
        return new this.__super(this.getModels(), {
            modelClass: this.modelClass
        });
    },

    _reset: function() {
        this._byId  = {};
        Array.prototype.splice.call(this, 0, this.length);
    },

    _change: function(startIndex, toAdd, toRemove, unique) {
        unique = unique || false;

        var added = [];
        var removed = [];
        var isSorted = false;

        // Remove
        Jii._.each(toRemove, function(data) {
            Jii._.each(this._findModels(data), function(model) {
                var index = this.indexOf(model);
                if (index < startIndex) {
                    startIndex--;
                }

                removed.push(model);

                // Array access
                Array.prototype.splice.call(this, index, 1);

                // By id
                if (model instanceof Jii.base.ActiveRecord) {
                    delete this._byId[this._getPrimaryKey(model)];
                }
            }.bind(this));
        }.bind(this));

        // Add
        Jii._.each(toAdd, function(data) {
            var existsModels = unique ? this._findModels(data) : [];
            var models = existsModels.length > 0 ? existsModels : [this._createModel(data)];

            Jii._.each(models, function(model) {
                // Check moving
                if (existsModels.length > 0) {
                    isSorted = true;

                    // Update model attributes
                    if (model instanceof Jii.base.Model && Jii._.isObject(data) && !(data instanceof Jii.base.Model)) {
                        model.set(data);
                    }
                } else {
                    added.push(model);

                    // Array access
                    Array.prototype.splice.call(this, startIndex++, 0, model);

                    // By id
                    if (model instanceof Jii.base.ActiveRecord) {
                        this._byId[this._getPrimaryKey(model)] = model;
                    }
                }
            }.bind(this));
        }.bind(this));

        // Lazy subscribe on added
        Jii._.each(added, function(model) {
            Jii._.each(this._eventsChangeName, function(arr) {
                model.on.apply(model, arr);
            });
        }.bind(this));

        // Unsubscribe on removed
        Jii._.each(removed, function(model) {
            Jii._.each(this._eventsChangeName, function(arr) {
                model.off.apply(model, arr.slice(0, 2));
            });
        }.bind(this));

        // Trigger events
        var event = new Jii.model.CollectionEvent({
            added: added,
            removed: removed
        })
        if (added.length > 0) {
            this.trigger(this.__static.EVENT_ADD, event);
        }
        if (removed.length > 0) {
            this.trigger(this.__static.EVENT_REMOVE, event);
        }
        if (added.length > 0 || removed.length > 0) {
            this.trigger(this.__static.EVENT_CHANGE, event);
        }

        if (isSorted) {
            this._onSort();
        }
    },

    /**
     *
     * @param {number|string|object} data
     * @returns {*|*[]}
     * @private
     */
    _findModels: function(data) {
        var primaryKey = this._getPrimaryKey(data);
        return this.filter(function(model) {
            return primaryKey == this._getPrimaryKey(model);
        }.bind(this));
    },

    /**
     *
     * @param {number|string|object} data
     * @returns {string}
     */
    _getPrimaryKey: function(data) {
        if (Jii._.isObject(data) && this.modelClass && !(data instanceof Jii.base.ActiveRecord)) {
            data = this._createModel(data);
        }

        if (data instanceof Jii.base.ActiveRecord) {
            data = data.getPrimaryKey();
        }

        if (Jii._.isObject(data)) {
            return JSON.stringify(data);
        }
        return data;
    },

    /**
     *
     * @param {object|*} data
     * @returns {Jii.base.Model}
     * @private
     */
    _createModel: function(data) {
        // Already model
        if (data instanceof Jii.base.Model) {
            return data;
        }

        // Disabled model auto create
        if (this.modelClass === false) {
            return data;
        }

        // Required
        if (this.modelClass === null) {
            Jii.exceptions.InvalidConfigException('Property `modelClass` in collection is required (or set false to force disable).');
        }

        if (Jii._.isObject(data)) {
            var modelClass = this.modelClass;
            if (Jii._.isString(modelClass)) {
                modelClass = Jii.namespace(modelClass);
            }
            if (!Jii._.isFunction(modelClass)) {
                Jii.exceptions.InvalidConfigException('Not found model class for create instance in collection, modelClass: ' + this.modelClass);
            }

            return new modelClass(data);
        }

        throw new Jii.exceptions.InvalidParamException('Cannot create model instance from data: ' + JSON.stringify(data));
    },

    _onSort: function() {
        // @todo Trigger sort event
    },

    /**
     * @param {string|string[]} name
     * @param {function} handler
     * @param {*} [data]
     * @param {boolean} [isAppend]
     */
    on: function(name, handler, data, isAppend) {
        // Multiple names support
        name = this._normalizeEventNames(name);
        if (name.length > 1) {
            Jii._.each(name, function(n) {
                this.on(n, handler, data, isAppend)
            }.bind(this));
            return;
        } else {
            name = name[0];
        }

        // Attributes in models
        var changeNameFormat = this._detectKeyFormatChangeName(name);
        if (changeNameFormat) {
            var changeNameEvent = Jii.base.Model.EVENT_CHANGE_NAME + changeNameFormat.subName;
            this._eventsChangeName.push([changeNameEvent, handler, data, isAppend]);
            this.each(function(model) {
                model.on(changeNameEvent, handler, data, isAppend);
            })
            return;
        }

        this.__super(name, handler, data, isAppend);
    },

    /**
     * @param {string|string[]} name
     * @param {function} [handler]
     * @return boolean
     */
    off: function(name, handler) {
        // Multiple names support
        name = this._normalizeEventNames(name);
        if (name.length > 1) {
            var bool = false;
            Jii._.each(name, function(n) {
                if (this.on(n, handler)) {
                    bool = true;
                }
            }.bind(this));
            return bool;
        } else {
            name = name[0];
        }

        // Attributes in models
        var changeNameFormat = this._detectKeyFormatChangeName(name);
        if (changeNameFormat) {
            var changeNameEvent = Jii.base.Model.EVENT_CHANGE_NAME + changeNameFormat.subName;
            this._eventsChangeName = Jii._.filter(this._eventsChangeName, function(arr) {
                return arr[0] !== changeNameEvent || arr[1] !== handler;
            });

            var bool = false;
            this.each(function(model) {
                if (model.off(changeNameEvent, handler)) {
                    bool = true;
                }
            })
            return bool;
        }

        return this.__super(name, handler);
    },

    _detectKeyFormatChangeName: function(name) {
        if (name.indexOf(this.__static.EVENT_CHANGE_NAME) !== 0) {
            return null;
        }

        return {
            subName: name.substr(this.__static.EVENT_CHANGE_NAME.length)
        };
    },

    // Array prototype
    /////////////////////

    /**
     *
     * @param {...*} value1
     * @returns {self}
     */
    concat: function(value1) {
        this.add(Jii._.toArray(arguments));
        return this;
    },

    /**
     *
     */
    reverse: function() {
        Array.prototype.reverse.call(this);
    },

    /**
     *
     */
    sort: function() {
        Array.prototype.sort.call(this);
        this._onSort();
    },

    /**
     *
     */
    join: function() {
        // @todo
        throw new Jii.exceptions.NotSupportedException();
    },

    /**
     *
     */
    toString: function() {
        // @todo
        throw new Jii.exceptions.NotSupportedException();
    },

    /**
     *
     */
    toLocaleString: function() {
        // @todo
        throw new Jii.exceptions.NotSupportedException();
    },

    /**
     *
     *
     * @param {number} start
     * @param {number} deleteCount
     * @param {...object} [model1]
     * @returns {[]}
     */
    splice: function(start, deleteCount, model1) {
        var toRemove = Array.prototype.slice.call(this, start, start + deleteCount);
        this.remove(toRemove);
        this.add(Jii._.toArray(arguments).slice(2), start);
        return toRemove;
    },

    /**
     *
     * @param begin
     * @param end
     * @returns {*}
     */
    slice: function(begin, end) {
        return new this.__static(Array.prototype.slice.call(this, begin, end), {
            modelClass: this.modelClass
        });
    },

    /**
     *
     * @param {...object} model1
     */
    push: function(model1) {
        this.add(Jii._.toArray(arguments));
    },

    /**
     *
     * @returns {object}
     */
    pop: function() {
        if (this.length === 0) {
            return null;
        }

        var model = this[this.length - 1];
        this.remove(model);
        return model;
    },

    /**
     *
     * @param {...object} model1
     * @returns {number}
     */
    unshift: function(model1) {
        this.add(Jii._.toArray(arguments), 0);
        return this.length;
    },

    /**
     *
     * @returns {object}
     */
    shift: function() {
        if (this.length === 0) {
            return null;
        }

        var model = this[0];
        this.remove(model);
        return model;
    },

    // @todo ES6 methods
    //es6 copyWithin: function() {},
    //es6 entries: function() {},
    //es6 fill: function() {},
    //es6 keys: function() {},
    //es6 values: function() {},

    // Underscore methods
    /////////////////////

    /**
     *
     * @param {function} iteratee
     * @param {object} [context]
     */
    each: function(iteratee, context) {
        return Jii._.each(this, iteratee, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {object} [context]
     */
    forEach: function(iteratee, context) {
        return this.each.apply(this, arguments);
    },

    /**
     *
     * @param {function} iteratee
     * @param {object} [context]
     * @returns {[]}
     */
    map: function(iteratee, context) {
        return Jii._.map(this, iteratee, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {*} [memo]
     * @param {object} [context]
     * @returns {[]}
     */
    reduce: function(iteratee, memo, context) {
        return Jii._.reduce(this, iteratee, memo, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {*} [memo]
     * @param {object} [context]
     * @returns {[]}
     */
    reduceRight: function(iteratee, memo, context) {
        return Jii._.reduceRight(this, iteratee, memo, context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {object}
     */
    find: function(predicate, context) {
        return Jii._.find(this, predicate, context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {[]}
     */
    filter: function(predicate, context) {
        return Jii._.filter(this, predicate, context);
    },

    /**
     *
     * @param {object} properties
     * @returns {object}
     */
    where: function(properties) {
        return Jii._.where(this, properties);
    },

    /**
     *
     * @param {object} properties
     * @returns {object}
     */
    findWhere: function(properties) {
        return Jii._.findWhere(this, properties);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {[]}
     */
    reject: function(predicate, context) {
        return Jii._.reject(this, predicate, context);
    },

    /**
     *
     * @param {function} [predicate]
     * @param {object} [context]
     */
    every: function(predicate, context) {
        return Jii._.every(this, predicate, context);
    },

    /**
     *
     * @param {function} [predicate]
     * @param {object} [context]
     */
    some: function(predicate, context) {
        return Jii._.some(this, predicate, context);
    },

    /**
     *
     * @param {object} value
     * @param {number} [fromIndex]
     */
    contains: function(value, fromIndex) {
        return Jii._.contains(this, value, fromIndex);
    },

    /**
     *
     * @param {object} value
     * @param {number} [fromIndex]
     */
    includes: function(value, fromIndex) {
        return this.contains.apply(this, arguments);
    },

    /**
     *
     * @param {string} [methodName]
     * @param {...*} [methodParam]
     * @returns {Array}
     */
    invoke: function(methodName, methodParam) {
        var args = Jii._.toArray(arguments);
        args.unshift(this);
        return Jii._.invoke.apply(Jii._, args);
    },

    /**
     *
     * @param {string} propertyName
     * @returns {Array}
     */
    pluck: function(propertyName) {
        return Jii._.map(this, function(model) {
            return Jii._.isFunction(model.get) ? model.get(propertyName) : model[propertyName];
        });
    },

    /**
     *
     * @param {function} [iteratee]
     * @param {object} [context]
     * @returns {object}
     */
    max: function(iteratee, context) {
        return Jii._.max(this, iteratee, context);
    },

    /**
     *
     * @param {function} [iteratee]
     * @param {object} [context]
     * @returns {object}
     */
    min: function(iteratee, context) {
        return Jii._.min(this, iteratee, context);
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    sortBy: function(value, context) {
        var iterator = Jii._.isFunction(value) ? value : function(model) {
            return Jii._.isFunction(model.get) ? model.get(value) : model[value];
        };
        Jii._.each(Jii._.sortBy(this, iterator, context), function(model, i) {
            this[i] = model;
        }.bind(this));
        this._onSort();
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    groupBy: function(value, context) {
        var iterator = Jii._.isFunction(value) ? value : function(model) {
            return Jii._.isFunction(model.get) ? model.get(value) : model[value];
        };
        return Jii._.groupBy(this, iterator, context);
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    indexBy: function(value, context) {
        var iterator = Jii._.isFunction(value) ? value : function(model) {
            return Jii._.isFunction(model.get) ? model.get(value) : model[value];
        };
        return Jii._.indexBy(this, iterator, context);
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    countBy: function(value, context) {
        var iterator = Jii._.isFunction(value) ? value : function(model) {
            return Jii._.isFunction(model.get) ? model.get(value) : model[value];
        };
        return Jii._.countBy(this, iterator, context);
    },

    /**
     *
     * @returns {number}
     */
    size: function() {
        return this.length;
    },

    /**
     *
     * @param [num]
     * @returns {number}
     */
    first: function(num) {
        return Jii._.first(this, num);
    },

    /**
     *
     * @param [num]
     * @returns {[]}
     */
    initial: function(num) {
        return Jii._.initial(this, num);
    },

    /**
     *
     * @param [num]
     * @returns {number}
     */
    last: function(num) {
        return Jii._.last(this, num);
    },

    /**
     *
     * @param [index]
     * @returns {number}
     */
    rest: function(index) {
        return Jii._.rest(this, index);
    },

    /**
     *
     * @param {...*} [value]
     * @returns {[]}
     */
    without: function(value) {
        var args = Jii._.toArray(arguments);
        args.unshift(this);
        return Jii._.without.apply(Jii._, args);
    },

    /**
     *
     * @param {*} [value]
     * @param {boolean} [isSorted]
     * @returns {number}
     */
    indexOf: function(value, isSorted) {
        return Jii._.indexOf(this, value, isSorted);
    },

    /**
     *
     * @param {*} value
     * @param {number} [fromIndex]
     * @returns {object}
     */
    lastIndexOf: function(value, fromIndex) {
        return Jii._.lastIndexOf(this, value, fromIndex);
    },

    /**
     *
     * @param {object} model
     * @param {*} value
     * @param {object} [context]
     * @returns {number}
     */
    sortedIndex: function(model, value, context) {
        var iterator = Jii._.isFunction(value) ? value : function(model) {
            return Jii._.isFunction(model.get) ? model.get(value) : model[value];
        };
        return Jii._.sortedIndex(this, model, iterator, context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {number}
     */
    findIndex: function(predicate, context) {
        return Jii._.findIndex(this, predicate, context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {number}
     */
    findLastIndex: function(predicate, context) {
        return Jii._.findLastIndex(this, predicate, context);
    },

    /**
     *
     */
    shuffle: function() {
        Jii._.shuffle(this);
    },

    /**
     *
     * @returns {boolean}
     */
    isEmpty: function() {
        return this.length === 0;
    }

});
