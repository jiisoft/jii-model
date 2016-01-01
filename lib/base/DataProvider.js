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
 * BaseDataProvider provides a base class that implements the [[DataProviderInterface]].
 *
 * @class Jii.base.DataProvider
 * @extends Jii.base.Collection
 */
Jii.defineClass('Jii.base.DataProvider', /** @lends Jii.base.DataProvider.prototype */{

    __extends: 'Jii.base.Collection',

    /**
     * @type {string} an ID that uniquely identifies the data provider among all data providers.
     * You should set this property if the same page contains two or more different data providers.
     * Otherwise, the [[pagination]] and [[sort]] may not work properly.
     */
    id: null,

    _sort: null,
    _pagination: null,
    _keys: null,
    _isModelsPrepare: false,
    _totalCount: null,

    /**
     * Prepares the data models that will be made available in the current page.
     * @returns {[]} the available data models
     */
    prepareModels: function () {

    },

    /**
     * Prepares the keys associated with the currently available data models.
     * @param {[]} models the available data models
     * @returns {[]} the keys
     */
    prepareKeys: function (models) {

    },

    /**
     * Returns a value indicating the total number of data models in this data provider.
     * @returns {number} total number of data models in this data provider.
     */
    prepareTotalCount: function () {

    },

    /**
     * Prepares the data models and keys.
     *
     * This method will prepare the data models and keys that can be retrieved via
     * [[getModels()]] and [[getKeys()]].
     *
     * This method will be implicitly called by [[getModels()]] and [[getKeys()]] if it has not been called before.
     *
     * @param {boolean} [forcePrepare] whether to force data preparation even if it has been done before.
     */
    prepare: function (forcePrepare) {
        forcePrepare = forcePrepare || false;

        if (forcePrepare || !this._isModelsPrepare) {
            this.splice(0, this.length);
            Jii._.each(this.prepareModels(), function (model) {
                this.push(model);
            }.bind(this));
        }
        if (forcePrepare || this._keys === null) {
            this._keys = this.prepareKeys(this._models);
        }
    },

    /**
     * Returns the data models in the current page.
     * @returns {[]} the list of data models in the current page.
     */
    getModels: function () {
        this.prepare();
        return this.__super();
    },

    /**
     * Returns the key values associated with the data models.
     * @returns {[]} the list of key values corresponding to [[models]]. Each data model in [[models]]
     * is uniquely identified by the corresponding key value in this array.
     */
    getKeys: function () {
        this.prepare();

        return this._keys;
    },

    /**
     * Sets the key values associated with the data models.
     * @param {[]} keys the list of key values corresponding to [[models]].
     */
    setKeys: function (keys) {
        this._keys = keys;
    },

    /**
     * Returns the total number of data models.
     * When [[pagination]] is false, this returns the same value as [[count]].
     * Otherwise, it will call [[prepareTotalCount()]] to get the count.
     * @returns {number} total number of possible data models.
     */
    getTotalCount: function () {
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
    setTotalCount: function (value) {
        this._totalCount = value;
    },

    /**
     * Returns the pagination object used by this data provider.
     * Note that you should call [[prepare()]] or [[getModels()]] first to get correct values
     * of [[Pagination.totalCount]] and [[Pagination.pageCount]].
     * @returns {jii.data.Pagination|boolean} the pagination object. If this is false, it means the pagination is disabled.
     */
    getPagination: function () {
        // @todo Pagination & Sort
        /*if (this._pagination === null) {
         this.setPagination({});
         }

         return this._pagination;*/
    },

    /**
     * Sets the pagination for this data provider.
     * @param {[]|jii.data.Pagination|boolean} value the pagination to be used by this data provider.
     * This can be one of the following:
     *
     * - a configuration array for creating the pagination object. The "class" element defaults
     *   to 'jii\data\Pagination'
     * - an instance of [[Pagination]] or its subclass
     * - false, if pagination needs to be disabled.
     *
     * @throws InvalidParamException
     */
    setPagination: function (value) {
        // @todo Pagination & Sort
        /*if (Jii._.isObject(value)) {
         config = {class: Pagination.className()};
         if (this.id !== null) {
         config['pageParam'] = this.id . '-page';
         config['pageSizeParam'] = this.id . '-per-page';
         }
         this._pagination = Jii.createObject(array_merge(config, value));
         } else if (value instanceof Pagination || value === false) {
         this._pagination = value;
         } else {
         throw new InvalidParamException('Only Pagination instance, configuration array or false is allowed.');
         }*/
    },

    /**
     * @returns {jii.data.Sort|boolean} the sorting object. If this is false, it means the sorting is disabled.
     */
    getSort: function () {
        // @todo Pagination & Sort
        /*if (this._sort === null) {
         this.setSort({});
         }

         return this._sort;*/
    },

    /**
     * Sets the sort definition for this data provider.
     * @param {[]|jii.data.Sort|boolean} value the sort definition to be used by this data provider.
     * This can be one of the following:
     *
     * - a configuration array for creating the sort definition object. The "class" element defaults
     *   to 'jii\data\Sort'
     * - an instance of [[Sort]] or its subclass
     * - false, if sorting needs to be disabled.
     *
     * @throws InvalidParamException
     */
    setSort: function (value) {
        // @todo Pagination & Sort
        /*if (Jii._.isObject(value)) {
         config = {class: Sort.className()};
         if (this.id !== null) {
         config['sortParam'] = this.id . '-sort';
         }
         this._sort = Jii.createObject(array_merge(config, value));
         } else if (value instanceof Sort || value === false) {
         this._sort = value;
         } else {
         throw new InvalidParamException('Only Sort instance, configuration array or false is allowed.');
         }*/
    },

    /**
     * Refreshes the data provider.
     * After calling this method, if [[getModels()]], [[getKeys()]] or [[getTotalCount()]] is called again,
     * they will re-execute the query and return the latest data available.
     */
    refresh: function () {
        this.splice(0, this.length);
        this._totalCount = null;
        this._keys = null;
    }


});
