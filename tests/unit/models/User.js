'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var tests = Jii.namespace('tests');

require('./ActiveRecord.js');

/**
 * @class tests.unit.models.User
 * @extends Jii.base.ActiveRecord
 */
var self = Jii.defineClass('tests.unit.models.User', {

	__extends: Jii.base.ActiveRecord,

	__static: {

        /**
         * @returns {Jii.sql.TableSchema}
         */
        getTableSchema: function () {
            return new Jii.sql.TableSchema({
                primaryKey: ['id'],
                columns: {
                    id: new Jii.sql.ColumnSchema({
                        name: 'id',
                        jsType: 'number',
                        isPrimaryKey: true
                    }),
                    name: new Jii.sql.ColumnSchema({
                        name: 'name',
                        jsType: 'string'
                    }),
                    email: new Jii.sql.ColumnSchema({
                        name: 'email',
                        jsType: 'string'
                    })
                }
            });
        },

		tableName: function () {
			return 'user';
		}

	}

});
