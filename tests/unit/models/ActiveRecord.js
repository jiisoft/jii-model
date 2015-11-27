
'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var tests = Jii.namespace('tests');

require('jii-ar-sql');

/**
 * @class tests.unit.models.ActiveRecord
 * @extends Jii.base.ActiveRecord
 */
var self = Jii.defineClass('tests.unit.models.ActiveRecord', {

	__extends: Jii.base.ActiveRecord,

	__static: {

		db: null,

		getDb: function () {
			return self.db;
		}

	}

});
