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
    constructor(models, config) {
        this.__super(config);

        if (Jii._.isArray(models)) {
            this.add(models);
        }
    },

    /**
     * @returns {[]|object}
     */
    getModels() {
        return this.map(model => model);
    },

    /**
     *
     * @param {object|object[]|Jii.base.Model|Jii.base.Model[]} models
     */
    setModels(models) {
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
    add(models, index) {
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
    remove(models) {
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
    set(name, value) {
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
    get(name) {
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

    getRoot() {
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
    setFilter(value) {
        // @todo normalize code, remove duplicates

        var modelClass = this.modelClass && Jii.namespace(this.modelClass);
        var db = modelClass && modelClass.getDb && modelClass.getDb();
        var parentCollection = this.parent || this;

        // Function
        if (Jii._.isFunction(value) || value === null) {
            if (!this._filter || this._filter !== value) {
                // Unsubscribe previous
                if (db && this._filter && this._filter.query && this._filter.attributes) {
                    Jii._.each(this._filter.attributes, attribute => {
                        parentCollection.off(this.__static.EVENT_CHANGE_NAME + attribute, {
                            context: this,
                            callback: this.refreshFilter
                        });
                    });
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
                        Jii._.each(this._filter.attributes, attribute => {
                            parentCollection.off(this.__static.EVENT_CHANGE_NAME + attribute, {
                                context: this,
                                callback: this.refreshFilter
                            });
                        });
                    }
                }

                this._filter = this._normalizePredicate(value);

                if (db) {
                    // Subscribe current
                    Jii._.each(this._filter.attributes, attribute => {
                        parentCollection.on(this.__static.EVENT_CHANGE_NAME + attribute, {
                            context: this,
                            callback: this.refreshFilter
                        });
                    });
                }


                this.refreshFilter();
            }
        }
    },

    /**
     * Run filter
     */
    refreshFilter() {
        var models = this.parent ? this.parent.getModels() : this.getModels();
        if (this._filter) {
            // Optimize search by id
            // @todo bad condition.. =(
            var where = this._filter.query ? this._filter.query.getWhere() : null;
            if (Jii._.isArray(where)
                && Jii._.isString(where[0])
                && where[0].toLowerCase() === 'in'
                && where[1].toString() === Jii.namespace(this.modelClass).primaryKey().toString()) {
                models = Jii._.map(where[2], id => this._byId[id]);
            } else {
                models = Jii._.filter(models, this._filter);
            }
        }

        var diff = this._prepareDiff(models);
        if (diff.add.length || diff.remove.length) {
            this._change(0, diff.add, diff.remove, true);
        }

        Jii._.each(this._childCollections, childCollection => {
            childCollection.refreshFilter();
        });
    },

    /**
     *
     * @param {object|Jii.base.CollectionAdapterInterface} collectionAdapter
     */
    createProxy(collectionAdapter) {
        var cloned = collectionAdapter.instance(this);

        // Fill
        collectionAdapter.add(this, cloned, this.getModels());

        // Subscribe
        this.on(
            this.__static.EVENT_CHANGE,
            /** @param {Jii.model.CollectionEvent} event */
            event => {
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
    beginEdit() {
        this._editedLevel++;

        Jii._.each(this._childCollections, childCollection => {
            childCollection.beginEdit();
        });
    },

    /**
     * Cancel all changes after beginEdit() call
     */
    cancelEdit() {
        if (this._editedLevel > 0) {
            this._editedLevel--;
        }

        // Cancel in sub-models
        if (this._editedLevel === 0) {
            Jii._.each(this._childCollections, childCollection => {
                childCollection.cancelEdit();
            });

            // Revert changes
            // @todo
        }
    },

    /**
     * End change operation - trigger change events
     */
    endEdit() {
        if (this._editedLevel > 0) {
            this._editedLevel--;
        }

        if (this._editedLevel === 0) {
            // End in child
            Jii._.each(this._childCollections, childCollection => {
                childCollection.endEdit();
            });

            // Each trigger events in children
            Jii._.each(this._editedEvents,
                /** @param {Jii.model.CollectionEvent} event */
                event => {
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
                });

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
    getById(primaryKey) {
        return this._byId[this._getPrimaryKey(primaryKey)] || null;
    },

    /**
     *
     * @returns {number}
     */
    getCount() {
        return this.length;
    },

    /**
     *
     * @returns {[]}
     */
    getKeys() {
        return this.map(this._getPrimaryKey.bind(this));
    },

    /**
     * @param options
     * @returns {*}
     */
    toJSON(options) {
        return this.map(model => model.toJSON(options));
    },

    /**
     *
     * @param {number} index
     * @returns {*}
     */
    at(index) {
        if (index < 0) {
            index = Math.max(0, this.length + index);
        }
        return this[index] || null;
    },

    /**
     *
     * @param {*} [models]
     */
    reset(models) {
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

    _prepareDiff(models) {
        var toAdd = [];
        Jii._.each(models, data => {
            var finedModels = this._findModels(data);
            if (finedModels.length) {
                // Convert data to model
                Jii._.each(this._findModels(data), model => {
                    if (Jii._.indexOf(toAdd, model) === -1) {
                        toAdd.push(model);
                    }
                });
            } else {
                toAdd.push(data);
            }
        });

        var toRemove = [];
        Jii._.each(this.getModels(), model => {
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
    clone() {
        return new this.__static(this.getModels(), {
            modelClass: this.modelClass
        });
    },

    /**
     *
     * @param {function|Jii.sql.Query} [filter]
     * @returns {Jii.base.Collection}
     */
    createChild(filter) {
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
    _detectKeyFormatIndex(name) {
        var matches = /^\[([0-9]+)\]\.?(.*)/.exec(name);
        if (matches === null) {
            return null;
        }

        return {
            index: parseInt(matches[1]),
            subName: matches[2] || null
        };
    },

    _change(startIndex, toAdd, toRemove, unique) {
        unique = unique || false;

        var added = [];
        var removed = [];
        var isSorted = false;

        // Remove
        Jii._.each(toRemove, data => {
            Jii._.each(this._findModels(data), model => {
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
            });
        });

        // Add
        Jii._.each(toAdd, data => {
            var existsModels = unique ? this._findModels(data) : [];
            var models = existsModels.length > 0 ? existsModels : [this.createModel(data)];

            if (this._filter) {
                models = Jii._.filter(models, this._filter, this);
            }

            Jii._.each(models, model => {
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
            });
        });

        // Lazy subscribe on added
        Jii._.each(added, model => {
            Jii._.each(this._eventsChangeName, arr => {
                model.on.apply(model, arr);
            });
        });

        // Unsubscribe on removed
        Jii._.each(removed, model => {
            Jii._.each(this._eventsChangeName, arr => {
                model.off.apply(model, arr.slice(0, 2));
            });
        });

        // Start
        this.beginEdit();

        // Trigger events
        this._editedEvents.push(new Jii.model.CollectionEvent({
            added: added,
            removed: removed
        }));

        // Change children
        Jii._.each(this._childCollections, childCollection => {
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
    _findModels(data) {
        var primaryKey = this._getPrimaryKey(data);

        if (this.modelClass) {
            return this._byId[primaryKey] ? [this._byId[primaryKey]] : [];
        } else {
            return this.filter(model => primaryKey == this._getPrimaryKey(model));
        }
    },

    /**
     *
     * @param {number|string|object} data
     * @returns {string}
     */
    _getPrimaryKey(data) {
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
    createModel(data) {
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

    _onSort() {
        // @todo Trigger sort event
    },

    /**
     * @param {string|string[]} name
     * @param {function|object} handler
     * @param {*} [data]
     * @param {boolean} [isAppend]
     */
    on(name, handler, data, isAppend) {
        // Multiple names support
        name = this._normalizeEventNames(name);
        if (name.length > 1) {
            Jii._.each(name, n => {
                this.on(n, handler, data, isAppend)
            });
            return;
        } else {
            name = name[0];
        }

        // Attributes in models
        var changeNameFormat = this._detectKeyFormatChangeName(name);
        if (changeNameFormat) {
            var changeNameEvent = Jii.base.Model.EVENT_CHANGE_NAME + changeNameFormat.subName;
            this._eventsChangeName.push([changeNameEvent, handler, data, isAppend]);
            this.each(model => {
                model.on(changeNameEvent, handler, data, isAppend);
            });
            return;
        }

        this.__super(name, handler, data, isAppend);
    },

    /**
     * @param {string|string[]} name
     * @param {function} [handler]
     * @return boolean
     */
    off(name, handler) {
        // Multiple names support
        name = this._normalizeEventNames(name);
        if (name.length > 1) {
            var bool = false;
            Jii._.each(name, n => {
                if (this.on(n, handler)) {
                    bool = true;
                }
            });
            return bool;
        } else {
            name = name[0];
        }

        // Attributes in models
        var changeNameFormat = this._detectKeyFormatChangeName(name);
        if (changeNameFormat) {
            var changeNameEvent = Jii.base.Model.EVENT_CHANGE_NAME + changeNameFormat.subName;
            this._eventsChangeName = Jii._.filter(this._eventsChangeName, arr => {
                return arr[0] !== changeNameEvent || arr[1] !== handler;
            });

            var bool = false;
            this.each(model => {
                if (model.off(changeNameEvent, handler)) {
                    bool = true;
                }
            });
            return bool;
        }

        return this.__super(name, handler);
    },

    _detectKeyFormatChangeName(name) {
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
    concat(value1) {
        this.add(Jii._.toArray(arguments));
        return this;
    },

    /**
     *
     */
    reverse() {
        Array.prototype.reverse.call(this);
        this._onSort();
    },

    /**
     *
     */
    sort() {
        Array.prototype.sort.call(this);
        this._onSort();
    },

    /**
     *
     */
    toArray() {
        return this;
    },

    /**
     *
     */
    join() {
        // @todo
        throw new Jii.exceptions.NotSupportedException();
    },

    /**
     *
     */
    toString() {
        // @todo
        throw new Jii.exceptions.NotSupportedException();
    },

    /**
     *
     */
    toLocaleString() {
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
    splice(start, deleteCount, model1) {
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
    slice(begin, end) {
        return new this.__static(Array.prototype.slice.call(this, begin, end), {
            modelClass: this.modelClass
        });
    },

    /**
     *
     * @param {...object} model
     */
    push(model) {
        this.add(Jii._.toArray(arguments));
    },

    /**
     *
     * @returns {object}
     */
    pop() {
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
    unshift(model1) {
        this.add(Jii._.toArray(arguments), 0);
        return this.length;
    },

    /**
     *
     * @returns {object}
     */
    shift() {
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
    each(iteratee, context) {
        return Jii._.each(this, iteratee, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {object} [context]
     */
    forEach(iteratee, context) {
        return this.each.apply(this, arguments);
    },

    /**
     *
     * @param {function} iteratee
     * @param {object} [context]
     * @returns {[]}
     */
    map(iteratee, context) {
        return Jii._.map(this, iteratee, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {*} [memo]
     * @param {object} [context]
     * @returns {[]}
     */
    reduce(iteratee, memo, context) {
        return Jii._.reduce(this, iteratee, memo, context);
    },

    /**
     *
     * @param {function} iteratee
     * @param {*} [memo]
     * @param {object} [context]
     * @returns {[]}
     */
    reduceRight(iteratee, memo, context) {
        return Jii._.reduceRight(this, iteratee, memo, context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {object|Jii.base.Model|null}
     */
    find(predicate, context) {
        return Jii._.find(this, this._normalizePredicate(predicate), context) || null;
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {[]}
     */
    filter(predicate, context) {
        return Jii._.filter(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {object} properties
     * @returns {[]}
     */
    where(properties) {
        return Jii._.where(this, properties);
    },

    /**
     *
     * @param {object} properties
     * @returns {object|Jii.base.Model|null}
     */
    findWhere(properties) {
        return Jii._.findWhere(this, properties) || null;
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {[]}
     */
    reject(predicate, context) {
        return Jii._.reject(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {function} [predicate]
     * @param {boolean} [context]
     */
    every(predicate, context) {
        return Jii._.every(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {function} [predicate]
     * @param {boolean} [context]
     */
    some(predicate, context) {
        return Jii._.some(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {object} value
     * @param {number} [fromIndex]
     */
    contains(value, fromIndex) {
        return Jii._.contains(this, value, fromIndex);
    },

    /**
     *
     * @param {object} value
     * @param {number} [fromIndex]
     */
    includes(value, fromIndex) {
        return this.contains.apply(this, arguments);
    },

    /**
     *
     * @param {string} [methodName]
     * @param {...*} [methodParam]
     * @returns {Array}
     */
    invoke(methodName, methodParam) {
        var args = Jii._.toArray(arguments);
        args.unshift(this);
        return Jii._.invoke.apply(Jii._, args);
    },

    /**
     *
     * @param {string} propertyName
     * @returns {Array}
     */
    pluck(propertyName) {
        return Jii._.map(this, model => Jii._.isFunction(model.get) ? model.get(propertyName) : model[propertyName]);
    },

    /**
     *
     * @param {function} [iteratee]
     * @param {object} [context]
     * @returns {object}
     */
    max(iteratee, context) {
        return Jii._.max(this, iteratee, context);
    },

    /**
     *
     * @param {function} [iteratee]
     * @param {object} [context]
     * @returns {object}
     */
    min(iteratee, context) {
        return Jii._.min(this, iteratee, context);
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    sortBy(value, context) {
        var iterator = Jii._.isFunction(value) ?
            value :
            model => Jii._.isFunction(model.get) ? model.get(value) : model[value];

        Jii._.each(Jii._.sortBy(this, iterator, context), (model, i) => {
            this[i] = model;
        });
        this._onSort();
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    groupBy(value, context) {
        var iterator = Jii._.isFunction(value) ?
            value :
            model => Jii._.isFunction(model.get) ? model.get(value) : model[value];

        return Jii._.groupBy(this, iterator, context);
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    indexBy(value, context) {
        var iterator = Jii._.isFunction(value) ?
            value :
            model => Jii._.isFunction(model.get) ? model.get(value) : model[value];

        return Jii._.indexBy(this, iterator, context);
    },

    /**
     *
     * @param {string|function} value
     * @param [context]
     * @returns {[]}
     */
    countBy(value, context) {
        var iterator = Jii._.isFunction(value) ?
            value :
            model => Jii._.isFunction(model.get) ? model.get(value) : model[value];

        return Jii._.countBy(this, iterator, context);
    },

    /**
     *
     * @returns {number}
     */
    size() {
        return this.length;
    },

    /**
     *
     * @param [num]
     * @returns {number}
     */
    first(num) {
        return Jii._.first(this, num);
    },

    /**
     *
     * @param [num]
     * @returns {[]}
     */
    initial(num) {
        return Jii._.initial(this, num);
    },

    /**
     *
     * @param [num]
     * @returns {number}
     */
    last(num) {
        return Jii._.last(this, num);
    },

    /**
     *
     * @param [index]
     * @returns {number}
     */
    rest(index) {
        return Jii._.rest(this, index);
    },

    /**
     *
     * @param {...*} [value]
     * @returns {[]}
     */
    without(value) {
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
    indexOf(value, isSorted) {
        return Jii._.indexOf(this, value, isSorted);
    },

    /**
     *
     * @param {*} value
     * @param {number} [fromIndex]
     * @returns {object}
     */
    lastIndexOf(value, fromIndex) {
        return Jii._.lastIndexOf(this, value, fromIndex);
    },

    /**
     *
     * @param {object} model
     * @param {*} value
     * @param {object} [context]
     * @returns {number}
     */
    sortedIndex(model, value, context) {
        var iterator = Jii._.isFunction(value) ?
            value :
            model => Jii._.isFunction(model.get) ? model.get(value) : model[value];

        return Jii._.sortedIndex(this, model, iterator, context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {number}
     */
    findIndex(predicate, context) {
        return Jii._.findIndex(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     * @param {function} predicate
     * @param {object} [context]
     * @returns {number}
     */
    findLastIndex(predicate, context) {
        return Jii._.findLastIndex(this, this._normalizePredicate(predicate), context);
    },

    /**
     *
     */
    shuffle() {
        Jii._.shuffle(this);
    },

    /**
     *
     * @returns {boolean}
     */
    isEmpty() {
        return this.length === 0;
    },

    _normalizePredicate(predicate) {
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
