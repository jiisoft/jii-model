/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var Event = require('jii/base/Event');

/**
 * @class Jii.model.ChangeEvent
 * @extends Jii.base.Event
 */
var ChangeEvent = Jii.defineClass('Jii.model.ChangeEvent', /** @lends Jii.model.ChangeEvent.prototype */{

	__extends: Event,

    changedAttributes: {}

});

module.exports = ChangeEvent;