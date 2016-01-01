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

require('./ChangeEvent');

/**
 * @class Jii.model.ChangeAttributeEvent
 * @extends Jii.model.ChangeEvent
 */
Jii.defineClass('Jii.model.ChangeAttributeEvent', /** @lends Jii.model.ChangeAttributeEvent.prototype */{

	__extends: 'Jii.model.ChangeEvent',

    /**
     * @type {string}
     */
    attribute: '',

    /**
     * @type {*}
     */
    oldValue: null,

    /**
     * @type {*}
     */
    newValue: null

});
