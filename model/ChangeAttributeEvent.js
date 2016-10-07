/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

var Jii = require('jii');
var ChangeEvent = require('./ChangeEvent');

/**
 * @class Jii.model.ChangeAttributeEvent
 * @extends Jii.model.ChangeEvent
 */
var ChangeAttributeEvent = Jii.defineClass('Jii.model.ChangeAttributeEvent', /** @lends Jii.model.ChangeAttributeEvent.prototype */{

	__extends: ChangeEvent,

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
    newValue: null,

    /**
     * @type {boolean}
     */
    isRelation: false

});

module.exports = ChangeAttributeEvent;