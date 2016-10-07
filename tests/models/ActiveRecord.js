'use strict';

var Jii = require('jii');
var BaseActiveRecord = require('jii-model/base/BaseActiveRecord');

/**
 * @class tests.unit.models.ActiveRecord
 * @extends Jii.base.BaseActiveRecord
 */
var ActiveRecord = Jii.defineClass('tests.unit.models.ActiveRecord', {

	__extends: BaseActiveRecord,

	__static: {

		db: null,

		getDb: function () {
			return this.db;
		}

	}

});

module.exports = ActiveRecord;