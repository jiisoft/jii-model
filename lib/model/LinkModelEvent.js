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
 * @class Jii.model.LinkModelEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.model.LinkModelEvent', /** @lends Jii.model.LinkModelEvent.prototype */{

	__extends: Jii.base.Event,

    /**
     * Relation name
     * @type {string}
     */
    relationName: null

});
