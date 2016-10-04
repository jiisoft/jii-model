'use strict';

var Jii = require('jii');
var ActiveRecord = require('jii-model/base/ActiveRecord');

/**
 * @class tests.unit.models.ActiveRecord
 * @extends Jii.base.ActiveRecord
 */
module.exports = Jii.defineClass('tests.unit.models.ActiveRecord', {

	__extends: ActiveRecord,

	__static: {

		db: null,

		getDb: function () {
			return this.db;
		}

	}

});
