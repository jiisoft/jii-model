'use strict';

var Jii = require('jii');
var Model = require('jii-model/base/Model');

/**
 * @class tests.unit.models.SampleModel
 * @extends Jii.base.Model
 */
module.exports = Jii.defineClass('tests.unit.models.SampleModel', {

	__extends: Model,

    _attributes: {
        uid: null,
        name: null,
        description: null
    },

    rules: function () {
        return [
            // insert
            ['name', 'required', {on: 'insert'}],

            // insert, update
            ['description', 'string', {on: ['insert', 'update'], max: 10}]
        ];
    }

});