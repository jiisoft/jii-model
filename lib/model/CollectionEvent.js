/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.model.CollectionEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.model.CollectionEvent', /** @lends Jii.model.CollectionEvent.prototype */{

	__extends: Jii.base.Event,

    /**
     *
     * @type {Jii.base.Model[]}
     */
    added: [],

    /**
     *
     * @type {Jii.base.Model[]}
     */
    removed: []

});
