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
 * @class Jii.base.CollectionAdapterInterface
 */
Jii.defineClass('Jii.base.CollectionAdapterInterface', /** @lends Jii.base.CollectionAdapterInterface.prototype */{


    /**
     *
     * @param {Jii.base.Collection} original
     */
    instance: function(original) {

    },

    /**
     *
     * @param {Jii.base.Collection} original
     * @param {*} cloned
     * @param {Jii.base.Model[]} models
     */
	add: function(original, cloned, models) {

    },

    /**
     *
     * @param {Jii.base.Collection} original
     * @param {*} cloned
     * @param {Jii.base.Model[]} models
     */
    remove: function(original, cloned, models) {

    }

});
