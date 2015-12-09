'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var tests = Jii.namespace('tests');

require('./ActiveRecord.js');

/**
 * @class tests.unit.models.LinkData
 * @extends Jii.base.ActiveRecord
 */
var self = Jii.defineClass('tests.unit.models.LinkData', {

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
                    value: new Jii.sql.ColumnSchema({
                        name: 'value',
                        jsType: 'string'
                    })
                }
            });
        },

		tableName: function () {
			return 'link_data';
		}

	}

});
