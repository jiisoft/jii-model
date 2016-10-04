/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var ModelEvent = require('jii/base/ModelEvent');

/**
 * @class Jii.model.AfterSaveEvent
 * @extends Jii.base.ModelEvent
 */
module.exports = Jii.defineClass('Jii.model.AfterSaveEvent', /** @lends Jii.model.AfterSaveEvent.prototype */{

	__extends: ModelEvent,

	/**
	 * The attribute values that had changed and were saved.
	 * @type {string[]}
	 */
	changedAttributes: null

});
