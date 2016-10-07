/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var Event = require('jii/base/Event');

/**
 * @class Jii.model.ValidateEvent
 * @extends Jii.base.Event
 */
var ValidateEvent = Jii.defineClass('Jii.model.ValidateEvent', /** @lends Jii.model.ValidateEvent.prototype */{

	__extends: Event,

    errors: {}

});

module.exports = ValidateEvent;