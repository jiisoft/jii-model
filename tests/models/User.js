'use strict';

var Jii = require('jii');
var ActiveRecord = require('./ActiveRecord.js');

/**
 * @class tests.unit.models.User
 * @extends Jii.base.ActiveRecord
 */
module.exports = Jii.defineClass('tests.unit.models.User', {

	__extends: ActiveRecord,

	__static: {

        /**
         * @returns {{}}
         */
        modelSchema: function() {
            return {
                primaryKey: ['id'],
                columns: {
                    id: {
                        jsType: 'number',
                        isPrimaryKey: true
                    },
                    name: 'string',
                    email: 'string'
                }
            };
        },

        tableName: function() {
            return 'users';
        }

	}

});
