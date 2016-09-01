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
 * @class Jii.model.ValidateEvent
 * @extends Jii.base.Event
 */
Jii.defineClass('Jii.model.ValidateEvent', /** @lends Jii.model.ValidateEvent.prototype */{

	__extends: 'Jii.base.Event',

    errors: {}

});
