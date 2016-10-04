'use strict';

var Jii = require('jii');
var Model = require('jii-model/base/Model');

/**
 * @class tests.unit.models.FakeValidationModel
 * @extends Jii.base.Model
 */
module.exports = Jii.defineClass('tests.unit.models.FakeValidationModel', {

	__extends: Model,

    _attributes: {
        foo: null,
        bar: null
    }

});