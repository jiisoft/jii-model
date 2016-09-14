/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var Event = require('jii/base/Event');

/**
 * @class Jii.model.CollectionEvent
 * @extends Jii.base.Event
 */
module.exports = Jii.defineClass('Jii.model.CollectionEvent', /** @lends Jii.model.CollectionEvent.prototype */{

	__extends: Event,

    /**
     *
     * @type {Jii.base.Model[]}
     */
    added: [],

    /**
     *
     * @type {Jii.base.Model[]}
     */
    removed: [],

    /**
     *
     * @type {boolean}
     */
    isSorted: false

});
