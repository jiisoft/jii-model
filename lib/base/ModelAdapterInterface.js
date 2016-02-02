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
 * @class Jii.base.ModelAdapterInterface
 */
Jii.defineClass('Jii.base.ModelAdapterInterface', /** @lends Jii.base.ModelAdapterInterface.prototype */{

    /**
     * @type {object|string[]|null}
     */
    attributes: null,

    /**
     *
     * @param {Jii.base.Model} original
     */
	instance: function(original) {

    },

    /**
     *
     * @param {Jii.base.Model} original
     * @param {*} proxy
     * @param {object} values
     */
    setValues: function(original, proxy, values) {

    }

});
