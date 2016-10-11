/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var Event = require('jii/base/Event');

/**
 * @class Jii.model.FetchEvent
 * @extends Jii.base.Event
 */
var FetchEvent = Jii.defineClass('Jii.model.FetchEvent', /** @lends Jii.model.FetchEvent.prototype */{

	__extends: Event,

    /**
     * @type {boolean}
     */
    isLoading: false

});

module.exports = FetchEvent;