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
 * @class Jii.model.ChangeEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.model.ChangeEvent', /** @lends Jii.model.ChangeEvent.prototype */{

	__extends: Jii.base.Event,

    changedAttributes: {}

});
