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
 * ArrayDataProvider implements a data provider based on a data array.
 *
 * The [[allModels]] property contains all data models that may be sorted and/or paginated.
 * ArrayDataProvider will provide the data after sorting and/or pagination.
 * You may configure the [[sort]] and [[pagination]] properties to
 * customize the sorting and pagination behaviors.
 *
 * Elements in the [[allModels]] array may be either objects (e.g. model objects)
 * or associative arrays (e.g. query results of DAO).
 * Make sure to set the [[key]] property to the name of the field that uniquely
 * identifies a data record or false if you do not have such a field.
 *
 * Compared to [[ActiveDataProvider]], ArrayDataProvider could be less efficient
 * because it needs to have [[allModels]] ready.
 *
 * @class Jii.base.ArrayDataProvider
 * @extends Jii.base.DataProvider
 */
Jii.defineClass('Jii.base.ArrayDataProvider', /** @lends Jii.base.ArrayDataProvider.prototype */{

    __extends: Jii.base.DataProvider,

    /**
     * @type {string|function} the column that is used as the key of the data models.
     * This can be either a column name, or a callable that returns the key value of a given data model.
     * If this is not set, the index of the [[models]] array will be used.
     * @see getKeys()
     */
    key: null,

    /**
     * @type {[]} the data that is not paginated or sorted. When pagination is enabled,
     * this property usually contains more elements than [[models]].
     * The array elements must use zero-based integer keys.
     */
    allModels: null,

    /**
     * @inheritdoc
     */
    _prepareModels: function () {
        var models = this.allModels;
        if (models === null) {
            return [];
        }

        // @todo Pagination & Sort
        /*var sort = this.getSort();
        if (sort !== false) {
            models = this._sortModels(Jii._.clone(models), sort);
        }

        var pagination = this.getPagination();
        if (pagination !== false) {
            pagination.totalCount = this.getTotalCount();

            if (pagination.getPageSize() > 0) {
                models = array_slice(models, pagination.getOffset(), pagination.getLimit(), true);
            }
        }*/

        return models;
    },

    /**
     * @inheritdoc
     */
    _prepareKeys: function (models) {
        if (this.key !== null) {
            return Jii._.map(models, function(model) {
                if (Jii._.isString(this.key)) {
                    return model[this.key];
                }
                return this.key.call(null, model);
            }.bind(this));
        }

        return Jii._.keys(models);
    },

    /**
     * @inheritdoc
     */
    _prepareTotalCount: function () {
        return this.allModels.length;
    },

    /**
     * Sorts the data models according to the given sort definition
     * @param {[]} models the models to be sorted
     * @param {jii.data.Sort} sort the sort definition
     * @returns {[]} the sorted data models
     */
    _sortModels: function (models, sort) {
        // @todo Pagination & Sort
        /*var orders = sort.getOrders();
        if (!Jii._.isEmpty(orders)) {
            ArrayHelper.multisort(models, array_keys(orders), array_values(orders));
        }

        return models;*/
    }

});
