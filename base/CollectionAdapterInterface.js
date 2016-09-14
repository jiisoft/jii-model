/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

var Jii = require('jii');

/**
 * @class Jii.base.CollectionAdapterInterface
 */
module.exports = Jii.defineClass('Jii.base.CollectionAdapterInterface', /** @lends Jii.base.CollectionAdapterInterface.prototype */{


    /**
     *
     * @param {Jii.base.Collection} original
     */
    instance(original) {

    },

    /**
     *
     * @param {Jii.base.Collection} original
     * @param {*} cloned
     * @param {Jii.base.Model[]} models
     */
	add(original, cloned, models) {

    },

    /**
     *
     * @param {Jii.base.Collection} original
     * @param {*} cloned
     * @param {Jii.base.Model[]} models
     */
    remove(original, cloned, models) {

    }

});
