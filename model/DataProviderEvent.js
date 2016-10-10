/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var CollectionEvent = require('./CollectionEvent');

/**
 * @class Jii.model.DataProviderEvent
 * @extends Jii.model.CollectionEvent
 */
var DataProviderEvent = Jii.defineClass('Jii.model.DataProviderEvent', /** @lends Jii.model.DataProviderEvent.prototype */{

	__extends: CollectionEvent,

    /**
     * @type {number|null}
     */
    totalCount: null

});

module.exports = DataProviderEvent;