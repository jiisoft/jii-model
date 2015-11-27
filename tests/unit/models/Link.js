'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var tests = Jii.namespace('tests');

require('./ActiveRecord.js');

/**
 * @class tests.unit.models.Link
 * @extends Jii.base.ActiveRecord
 */
var self = Jii.defineClass('tests.unit.models.Link', {

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
                    articleId: new Jii.sql.ColumnSchema({
                        name: 'articleId',
                        jsType: 'number'
                    }),
                    url: new Jii.sql.ColumnSchema({
                        name: 'url',
                        jsType: 'string'
                    }),
                    title: new Jii.sql.ColumnSchema({
                        name: 'title',
                        jsType: 'string'
                    })
                }
            });
        },

		tableName: function () {
			return 'category';
		}

	}

});
