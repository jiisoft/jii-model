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

    __extends: 'Jii.base.Component',

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

    /**
     * Root collection
     * @type {Jii.base.Collection}
     */
    parent: null,

    _byId: {},
    _filter: null,

    _eventsChangeName: [],

    _editedLevel: 0,
    _childCollections: [],
    _editedEvents: [],

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
        return this.map(function (model) {
            return model;
        });
    },

    /**
     *
     * @param {object|object[]|Jii.base.Model|Jii.base.Model[]} models
     */
    setModels: function (models) {
        if (!Jii._.isArray(models)) {
            models = [models];
        }

        if (this.parent) {
            this.parent.setModels(models);
        } else {
            this._change(this.length, models, [], true);
        }
    },

    /**
     *
     * @param {object|object[]|Jii.base.Model|Jii.base.Model[]} models
     * @param {number} [index]
     * @returns {Jii.base.Model[]}
     */
    add: function (models, index) {
        if (!Jii._.isArray(models)) {
            models = [models];
        }

        if (this.parent) {
            this.parent.add(models, index);
        } else {
            if (!index && index !== 0) {
                index = this.length;
            }

            return this._change(index, models, []).added;
        }
    },

    /**
     *
     * @param {*|*[]} models
     * @returns {Jii.base.Model[]}
     */
    remove: function (models) {
        if (!Jii._.isArray(models)) {
            models = [models];
        }
        if (this.parent) {
            this.parent.remove(models);
        } else {
            return this._change(0, [], models).removed;
        }
    },

    /**
     *
     * @param {string|object|object[]} name
     * @param {*} [value]
     * @returns {*}
     */
    set: function (name, value) {
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
    get: function (name) {
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

    getRoot: function () {
        var parent = this;
        while (true) {
            if (!parent.parent) {
                return parent;
            }
            parent = parent.parent;
        }
    },

    /**
     *
     * @param {function|Jii.sql.Query} value
     */
    setFilter: function (value) {
        // @todo normalize code, remove duplicates

        var modelClass = this.modelClass && Jii.namespace(this.modelClass);
        var db = modelClass && modelClass.getDb && modelClass.getDb();
        var parentCollection = this.parent || this;

        // Function
        if (Jii._.isFunction(value) || value === null) {
            if (!this._filter || this._filter !== value) {
                // Unsubscribe previous
                if (db && this._filter && this._filter.query && this._filter.attributes) {
                    Jii._.each(this._filter.attributes, function(attribute) {
                        parentCollection.off(this.__static.EVENT_CHANGE_NAME + attribute, {
                            context: this,
                            callback: this.refreshFilter
                        });
                    }.bind(this));
                }

                this._filter = value;
                this.refreshFilter();
            }
        }

        if (Jii.sql && Jii.sql.Query) {
            // Where object
            /*if (Jii._.isArray(value) || Jii._.isObject(value)) {
                value = (new Jii.sql.Query()).where(value);
            }*/

            // Query instance
            if (value instanceof Jii.sql.Query && (!this._filter || this._filter.query !== value)) {
                if (db) {
                    // Unsubscribe previous
                    if (this._filter && this._filter.query && this._filter.attributes) {
                        Jii._.each(this._filter.attributes, function(attribute) {
                            parentCollection.off(this.__static.EVENT_CHANGE_NAME + attribute, {
                                context: this,
                                callback: this.refreshFilter
                            });
                        }.bind(this));
                    }
                }

                this._filter = this._normalizePredicate(value);

                if (db) {
                    // Subscribe current
                    Jii._.each(this._filter.attributes, function(attribute) {
                        parentCollection.on(this.__static.EVENT_CHANGE_NAME + attribute, {
                            context: this,
                            callback: this.refreshFilter
                        });
                    }.bind(this));
                }


                this.refreshFilter();
            }
        }
    },

    /**
     * Run filter
     */
    refreshFilter: function () {
        var models = this.parent ? this.parent.getModels() : this.getModels();
        if (this._filter) {
            // Optimize search by id
            // @todo bad condition.. =(
            var where = this._filter.query ? this._filter.query.getWhere() : null;
            if (Jii._.isArray(where)
                && Jii._.isString(where[0])
                && where[0].toLowerCase() === 'in'
                && where[1].toString() === Jii.namespace(this.modelClass).primaryKey().toString()) {
                models = Jii._.map(where[2], function(id) {
                    return this._byId[id];
                }.bind(this))
            } else {
                models = Jii._.filter(models, this._filter);
            }
        }

        var diff = this._prepareDiff(models);
        if (diff.add.length || diff.remove.length) {
            this._change(0, diff.add, diff.remove, true);
        }

        Jii._.each(this._childCollections, function (childCollection) {
            childCollection.refreshFilter();
        });
    },

    /**
     *
     * @param {object|Jii.base.CollectionAdapterInterface} collectionAdapter
     */
    createProxy: function (collectionAdapter) {
        var cloned = collectionAdapter.instance(this);

        // Fill
        collectionAdapter.add(this, cloned, this.getModels());

        // Subscribe
        this.on(
            this.__static.EVENT_CHANGE,
            /** @param {Jii.model.CollectionEvent} event */
            function (event) {
                if (event.added.length > 0) {
                    collectionAdapter.add(this, cloned, event.added);
                }
                if (event.removed.length > 0) {
                    collectionAdapter.remove(this, cloned, event.removed);
                }
            }
        );

        return cloned;
    },

    /**
     * Begin change operation
     */
    beginEdit: function () {
        this._editedLevel++;

        Jii._.each(this._childCollections, function (childCollection) {
            childCollection.beginEdit();
        });
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
            Jii._.each(this._childCollections, function (childCollection) {
                childCollection.cancelEdit();
            });

            // Revert changes
            // @todo
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
            // End in child
            Jii._.each(this._childCollections, function (childCollection) {
                childCollection.endEdit();
            });

            // Each trigger events in children
            Jii._.each(this._editedEvents,
                /** @param {Jii.model.CollectionEvent} event */
                function (event) {
                    if (event.added.length > 0) {
                        this.trigger(this.__static.EVENT_ADD, event);
                    }
                    if (event.removed.length > 0) {
                        this.trigger(this.__static.EVENT_REMOVE, event);
                    }
                    if (event.added.length > 0 || event.removed.length > 0) {
                        this.trigger(this.__static.EVENT_CHANGE, event);
                    }

                    if (event.isSorted) {
                        this._onSort();
                    }
                }.bind(this));

            // Reset state
            this._editedEvents = [];
        }
    },

    /**
     *
     *
     * @param {number|string|object} primaryKey
     * @returns {*|null}
     */
    getById: function (primaryKey) {
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
     *
     * @returns {[]}
     */
    getKeys: function () {
        return this.map(this._getPrimaryKey.bind(this));
    },

    /**
     * @param options
     * @returns {*}
     */
    toJSON: function (options) {
        return this.map(function (model) {
            return model.toJSON(options);
        });
    },

    /**
     *
     * @param {number} index
     * @returns {*}
     */
    at: function (index) {
        if (index < 0) {
            index = Math.max(0, this.length + index);
        }
        return this[index] || null;
    },

    /**
     *
     * @param {*} [models]
     */
    reset: function (models) {
        models = models || [];
        if (!Jii._.isArray(models)) {
            models = [models];
        }

        if (this.parent) {
            this.parent.reset(models);
        } else {
            var diff = this._prepareDiff(models);
            this._change(0, diff.add, diff.remove, true);
        }
    },

    _prepareDiff: function (models) {
        var toAdd = [];
        Jii._.each(models, function (data) {
            var finedModels = this._findModels(data);
            if (finedModels.length) {
                // Convert data to model
                Jii._.each(this._findModels(data), function (model) {
                    if (Jii._.indexOf(toAdd, model) === -1) {
                        toAdd.push(model);
                    }
                });
            } else {
                toAdd.push(data);
            }
        }.bind(this));

        var toRemove = [];
        Jii._.each(this.getModels(), function (model) {
            if (Jii._.indexOf(toAdd, model) === -1) {
                toRemove.push(model);
            }
        });

        return {
            add: toAdd,
            remove: toRemove
        };
    },

    /**
     *
     * @returns {static}
     */
    clone: function () {
        return new this.__static(this.getModels(), {
            modelClass: this.modelClass
        });
    },

    /**
     *
     * @param {function|Jii.sql.Query} [filter]
     * @returns {Jii.base.Collection}
     */
    createChild: function (filter) {
        var childCollection = new this.__static(null, {
            modelClass: this.modelClass,
            parent: this
        });
        childCollection._change(0, this.getModels(), [], true);

        this._childCollections.push(childCollection);

        if (filter) {
            childCollection.setFilter(filter);
        }
        return childCollection;
    },

    /**
     *
     * @param name
     * @returns {{index: number, subName: string|null}}
     * @private
     */
    _detectKeyFormatIndex: function (name) {
        var matches = /^\[([0-9]+)\]\.?(.*)/.exec(name);
        if (matches === null) {
            return null;
        }

        return {
            index: parseInt(matches[1]),
            subName: matches[2] || null
        };
    },

    _change: function (startIndex, toAdd, toRemove, unique) {
        unique = unique || false;

        var added = [];
        var removed = [];
        var isSorted = false;

        // Remove
        Jii._.each(toRemove, function (data) {
            Jii._.each(this._findModels(data), function (model) {
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
        Jii._.each(toAdd, function (data) {
            var existsModels = unique ? this._findModels(data) : [];
            var models = existsModels.length > 0 ? existsModels : [this.createModel(data)];

            if (this._filter) {
                models = Jii._.filter(models, this._filter, this);
            }

            Jii._.each(models, function (model) {
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
        Jii._.each(added, function (model) {
            Jii._.each(this._eventsChangeName, function (arr) {
                model.on.apply(model, arr);
            });
        }.bind(this));

        // Unsubscribe on removed
        Jii._.each(removed, function (model) {
            Jii._.each(this._eventsChangeName, function (arr) {
                model.off.apply(model, arr.slice(0, 2));
            });
        }.bind(this));

        // Start
        this.beginEdit();

        // Trigger events
        this._editedEvents.push(new Jii.model.CollectionEvent({
            added: added,
            removed: removed
        }));

        // Change children
        Jii._.each(this._childCollections, function (childCollection) {
            childCollection._change(startIndex, added, removed, true);
        });

        // End
        this.endEdit();

        return {
            added: added,
            removed: removed
        };
    },

    /**
     *
     * @param {number|string|object} data
     * @returns {*|*[]}
     * @private
     */
    _findModels: function (data) {
        var primaryKey = this._getPrimaryKey(data);

        if (this.modelClass) {
            return this._byId[primaryKey] ? [this._byId[primaryKey]] : [];
        } else {
            return this.filter(function (model) {
                return primaryKey == this._getPrimaryKey(model);
            }.bind(this));
        }
    },

    /**
     *
     * @param {number|string|object} data
     * @returns {string}
     */
    _getPrimaryKey: function (data) {
        if (Jii._.isObject(data) && this.modelClass && !(data instanceof Jii.base.ActiveRecord)) {
            data = this.createModel(data);
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
     * Convert any data to model
     * @param {object|*} [data]
     * @returns {Jii.base.Model}
     */
    createModel: function (data) {
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

        // Empty model
        if (!data) {
            data = {};
        }

        if (Jii._.isObject(data)) {
            var modelClass = this.modelClass;
            modelClass = Jii.namespace(modelClass);
            if (!Jii._.isFunction(modelClass)) {
                throw new Jii.exceptions.InvalidConfigException('Not found model class for create instance in collection, modelClass: ' + this.modelClass);
            }

            return new modelClass(data);
        }

        throw new Jii.exceptions.InvalidParamException('Cannot create model instance from data: ' + JSON.stringify(data));
    },

    _onSort: function () {
        // @todo Trigger sort event
    },

    /**
     * @param {string|string[]} name
     * @param {function|object} handler
     * @param {*} [data]
     * @param {boolean} [isAppend]
     */
    on: function (name, handler, data, isAppend) {
        // Multiple names support
        name = this._normalizeEventNames(name);
        if (name.length > 1) {
            Jii._.each(name, function (n) {
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
            this.each(function (model) {
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
    off: function (name, handler) {
        // Multiple names support
        name = this._normalizeEventNames(name);
        if (name.length > 1) {
            var bool = false;
            Jii._.each(name, function (n) {
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
            this._eventsChangeName = Jii._.filter(this._eventsChangeName, function (arr) {
                return arr[0] !== changeNameEvent || arr[1] !== handler;
            });

            var bool = false;
            this.each(function (model) {
                if (model.off(changeNameEvent, handler)) {
                    bool = true;
                }
            })
            return bool;
        }

        return this.__super(name, handler);
    },

    _detectKeyFormatChangeName: function (name) {
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
    concat: function (value1) {
        this.add(Jii._.toArray(arguments));
        return this;
    },

    /**
     *
     */
    reverse: function () {
        Array.prototype.reverse.call(this);
        this._onSort();
    },

    /**
     *
     */
    sort: function () {
        Array.prototype.sort.call(this);
        this._onSort();
    },

    /**
     *
     */
    toArray: function () {
        return this;
    },

    /**
     *
     */
    join: function () {
        // @todo
        throw new Jii.exceptions.NotSupportedException();
    },

    /**
     *
     */
    toString: function () {
        // @todo
        throw new Jii.exceptions.NotSupportedException();
    },

    /**
     *
     */
    toLocaleString: function () {
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
    splice: function (start, deleteCount, model1) {
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
    slice: function (begin, end) {
        return new this.__static(Array.prototype.slice.call(this, begin, end), {
            modelClass: this.modelClass
        });
    },

    /**
     *
     * @param {...object} model
     */
    push: function (model) {
        this.add(Jii._.toArray(arguments));
    },

    /**
     *
     * @returns {object}
     */
    pop: function () {
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
    unshift: function (model1) {
        this.add(Jii._.toArray(arguments), 0);
        return this.length;
    },

    /**
     *
     * @returns {object}
     */
    shift: function () {
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
    each: function (iteratee, context) {
        return Jii._.each(this, iteratee, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {object} [context]
     */
    forEach: function (iteratee, context) {
        return this.each.apply(this, arguments);
    },

    /**
     *
     * @param {function} iteratee
     * @param {object} [context]
     * @returns {[]}
     */
    map: function (iteratee, context) {
        return Jii._.map(this, iteratee, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {*} [memo]
     * @param {object} [context]
     * @returns {[]}
     */
    reduce: function (iteratee, memo, context) {
        return Jii._.reduce(this, iteratee, memo, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {*} [memo]
     * @param {object} [context]
     * @returns {[]}
     */
    reduceRight: function (iteratee, memo, context) {
        return Jii._.reduceRight(this, iteratee, memo, context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {object|Jii.base.Model|null}
     */
    find: function (predicate, context) {
        return Jii._.find(this, this._normalizePredicate(predicate), context) || null;
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {[]}
     */
    filter: function (predicate, context) {
        return Jii._.filter(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {object} properties
     * @returns {[]}
     */
    where: function (properties) {
        return Jii._.where(this, properties);
    },

    /**
     *
     * @param {object} properties
     * @returns {object|Jii.base.Model|null}
     */
    findWhere: function (properties) {
        return Jii._.findWhere(this, properties) || null;
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {[]}
     */
    reject: function (predicate, context) {
        return Jii._.reject(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {function} [predicate]
     * @param {boolean} [context]
     */
    every: function (predicate, context) {
        return Jii._.every(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {function} [predicate]
     * @param {boolean} [context]
     */
    some: function (predicate, context) {
        return Jii._.some(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {object} value
     * @param {number} [fromIndex]
     */
    contains: function (value, fromIndex) {
        return Jii._.contains(this, value, fromIndex);
    },

    /**
     *
     * @param {object} value
     * @param {number} [fromIndex]
     */
    includes: function (value, fromIndex) {
        return this.contains.apply(this, arguments);
    },

    /**
     *
     * @param {string} [methodName]
     * @param {...*} [methodParam]
     * @returns {Array}
     */
    invoke: function (methodName, methodParam) {
        var args = Jii._.toArray(arguments);
        args.unshift(this);
        return Jii._.invoke.apply(Jii._, args);
    },

    /**
     *
     * @param {string} propertyName
     * @returns {Array}
     */
    pluck: function (propertyName) {
        return Jii._.map(this, function (model) {
            return Jii._.isFunction(model.get) ? model.get(propertyName) : model[propertyName];
        });
    },

    /**
     *
     * @param {function} [iteratee]
     * @param {object} [context]
     * @returns {object}
     */
    max: function (iteratee, context) {
        return Jii._.max(this, iteratee, context);
    },

    /**
     *
     * @param {function} [iteratee]
     * @param {object} [context]
     * @returns {object}
     */
    min: function (iteratee, context) {
        return Jii._.min(this, iteratee, context);
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    sortBy: function (value, context) {
        var iterator = Jii._.isFunction(value) ? value : function (model) {
            return Jii._.isFunction(model.get) ? model.get(value) : model[value];
        };
        Jii._.each(Jii._.sortBy(this, iterator, context), function (model, i) {
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
    groupBy: function (value, context) {
        var iterator = Jii._.isFunction(value) ? value : function (model) {
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
    indexBy: function (value, context) {
        var iterator = Jii._.isFunction(value) ? value : function (model) {
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
    countBy: function (value, context) {
        var iterator = Jii._.isFunction(value) ? value : function (model) {
            return Jii._.isFunction(model.get) ? model.get(value) : model[value];
        };
        return Jii._.countBy(this, iterator, context);
    },

    /**
     *
     * @returns {number}
     */
    size: function () {
        return this.length;
    },

    /**
     *
     * @param [num]
     * @returns {number}
     */
    first: function (num) {
        return Jii._.first(this, num);
    },

    /**
     *
     * @param [num]
     * @returns {[]}
     */
    initial: function (num) {
        return Jii._.initial(this, num);
    },

    /**
     *
     * @param [num]
     * @returns {number}
     */
    last: function (num) {
        return Jii._.last(this, num);
    },

    /**
     *
     * @param [index]
     * @returns {number}
     */
    rest: function (index) {
        return Jii._.rest(this, index);
    },

    /**
     *
     * @param {...*} [value]
     * @returns {[]}
     */
    without: function (value) {
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
    indexOf: function (value, isSorted) {
        return Jii._.indexOf(this, value, isSorted);
    },

    /**
     *
     * @param {*} value
     * @param {number} [fromIndex]
     * @returns {object}
     */
    lastIndexOf: function (value, fromIndex) {
        return Jii._.lastIndexOf(this, value, fromIndex);
    },

    /**
     *
     * @param {object} model
     * @param {*} value
     * @param {object} [context]
     * @returns {number}
     */
    sortedIndex: function (model, value, context) {
        var iterator = Jii._.isFunction(value) ? value : function (model) {
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
    findIndex: function (predicate, context) {
        return Jii._.findIndex(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {number}
     */
    findLastIndex: function (predicate, context) {
        return Jii._.findLastIndex(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     */
    shuffle: function () {
        Jii._.shuffle(this);
    },

    /**
     *
     * @returns {boolean}
     */
    isEmpty: function () {
        return this.length === 0;
    },

    _normalizePredicate: function(predicate) {
        if (Jii.sql && Jii.sql.Query && predicate instanceof Jii.sql.Query && this.modelClass) {
            var db = Jii.namespace(this.modelClass).getDb();
            if (db) {
                var filterBuilder = db.getSchema().getFilterBuilder();
                var query = predicate;
                filterBuilder.prepare(query);

                predicate = filterBuilder.createFilter(query);
                predicate.query = query;
                predicate.attributes = filterBuilder.attributes(query);
            } else {
                throw new Jii.exceptions.InvalidConfigException('Not found db component in model.');
            }
        }

        return predicate;
    }

});
