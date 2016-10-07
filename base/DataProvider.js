/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var InvalidConfigException = require('jii/exceptions/InvalidConfigException');
var InvalidParamException = require('jii/exceptions/InvalidParamException');
var Collection = require('./Collection');
var Pagination = require('../data/Pagination');
var _isNumber = require('lodash/isNumber');
var _isArray = require('lodash/isArray');
var _isObject = require('lodash/isObject');
var _isFunction = require('lodash/isFunction');

/**
 * DataProvider provides a base class that implements the [[DataProviderInterface]].
 *
 * @class Jii.base.DataProvider
 * @extends Jii.base.Collection
 */
var DataProvider = Jii.defineClass('Jii.base.DataProvider', /** @lends Jii.base.DataProvider.prototype */{

    __extends: Collection,

    __static: /** @lends Jii.base.DataProvider */{

        FETCH_MODE_SET: 'set',
        FETCH_MODE_RESET: 'reset',

    },

    /**
     * @type {string|null} an ID that uniquely identifies the data provider among all data providers.
     * You should set this property if the same page contains two or more different data providers.
     * Otherwise, the [[pagination]] and [[sort]] may not work properly.
     */
    id: null,

    /**
     * @type {function|Jii.base.Query}
     */
    query: null,

    /**
     * @type {string}
     */
    fetchMode: 'add',

    /**
     * @type {Jii.data.Sort}
     */
    _sort: null,

    /**
     * @type {Jii.data.Pagination}
     */
    _pagination: null,

    /**
     * @type {number|null}
     */
    _totalCount: null,

    /**
     * @type {function[]|null}
     */
    _fetchCallbacks: null,

    /**
     *
     * @param {object} [params]
     * @param {boolean} [force]
     * @return {*}
     */
    fetch(params = {}, force = false) {
        if (this._isFetched && !force) {
            return Promise.resolve(false);
        }

        // Queue promises when fetch in process
        if (this._fetchCallbacks !== null) {
            return new Promise(resolve => {
                this._fetchCallbacks.push(resolve)
            });
        }
        this._fetchCallbacks = [];

        return Promise.resolve()
            .then(() => {

                // Query as function
                if (_isFunction(this.query)) {
                    return this.query(params);
                }

                // TODO Query, REST, ...
                throw new InvalidConfigException('Wrong query format in DataProvider.');
            })
            .then(data => {
                // Validate response
                if (!data) {
                    throw new InvalidParamException('Result data is not object in DataProvider.fetch().');
                }
                if (!_isNumber(data.totalCount)) {
                    throw new InvalidParamException('Result param "totalCount" must be number in DataProvider.fetch().');
                }
                if (!_isArray(data.models)) {
                    throw new InvalidParamException('Result param "models" must be array in DataProvider.fetch().');
                }

                this.setTotalCount(data.totalCount);

                switch(this.fetchMode) {
                    case this.__static.FETCH_MODE_SET:
                        this.set(data.models);
                        break;

                    case this.__static.FETCH_MODE_RESET:
                        this.reset(data.models);
                        break;
                }

                // Resolve queue promises after current
                var callbacks = this._fetchCallbacks;
                this._fetchCallbacks = null;
                setTimeout(() => {
                    callbacks.forEach(callback => {
                        callback(data.models);
                    });
                });

                return data;
            });
    },

    /**
     * Returns the total number of data models.
     * When [[pagination]] is false, this returns the same value as [[count]].
     * Otherwise, it will call [[prepareTotalCount()]] to get the count.
     * @returns {number} total number of possible data models.
     */
    getTotalCount() {
        if (this.getPagination() === false) {
            return this.getCount();
        } else if (this._totalCount === null) {
            this._totalCount = this.prepareTotalCount();
        }

        return this._totalCount;
    },

    /**
     * Sets the total number of data models.
     * @param {number} value the total number of data models.
     */
    setTotalCount(value) {
        this._totalCount = value;
    },

    /**
     * Returns the pagination object used by this data provider.
     * Note that you should call [[prepare()]] or [[getModels()]] first to get correct values
     * of [[Pagination.totalCount]] and [[Pagination.pageCount]].
     * @returns {jii.data.Pagination|boolean} the pagination object. If this is false, it means the pagination is disabled.
     */
    getPagination() {
        if (this._pagination === null) {
            this.setPagination({});
        }

        return this._pagination;
    },

    /**
     * Sets the pagination for this data provider.
     * @param {object|Jii.data.Pagination|boolean} value the pagination to be used by this data provider.
     * @throws InvalidParamException
     */
    setPagination(value) {
        if (_isObject(value)) {
            let config = {className: Pagination};
            if (this.id !== null) {
                config.pageParam = `${this.id}-page`;
                config.pageSizeParam = `${this.id}-per-page`;
            }
            this._pagination = Jii.createObject(Jii.mergeConfigs(config, value));
        } else if (value instanceof Pagination || value === false) {
            this._pagination = value;
        } else {
            throw new InvalidParamException('Only Pagination instance, configuration object or false is allowed.');
        }
    },

    /**
     * @returns {Jii.data.Sort|boolean} the sorting object. If this is false, it means the sorting is disabled.
     */
    getSort() {
        if (this._sort === null) {
            this.setSort({});
        }

        return this._sort;
    },

    /**
     * Sets the sort definition for this data provider.
     * @param {object|Jii.data.Sort|boolean} value the sort definition to be used by this data provider.
     * This can be one of the following:
     *
     * - a configuration array for creating the sort definition object. The "class" element defaults
     *   to 'jii\data\Sort'
     * - an instance of [[Sort]] or its subclass
     * - false, if sorting needs to be disabled.
     *
     * @throws InvalidParamException
     */
    setSort(value) {

        if (_isObject(value)) {
            let config = {/*className: Sort*/}; // @todo Sort implementation
            if (this.id !== null) {
                config.sortParam = `${this.id}-sort`;
            }
            this._sort = Jii.createObject(Jii.mergeConfigs(config, value));
        } else if (/*value instanceof Sort ||*/ value === false) { // @todo Sort implementation
            this._sort = value;
        } else {
            throw new InvalidParamException('Only Sort instance, configuration object or false is allowed.');
        }
    }

});

module.exports = DataProvider;