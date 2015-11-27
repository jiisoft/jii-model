'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var tests = Jii.namespace('tests');

require('./ActiveRecord.js');

/**
 * @class tests.unit.models.Article
 * @extends Jii.base.ActiveRecord
 */
var self = Jii.defineClass('tests.unit.models.Article', {

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
                    userId: new Jii.sql.ColumnSchema({
                        name: 'userId',
                        jsType: 'number'
                    }),
                    title: new Jii.sql.ColumnSchema({
                        name: 'title',
                        jsType: 'string'
                    }),
                    text: new Jii.sql.ColumnSchema({
                        name: 'text',
                        jsType: 'string'
                    }),
                    createTime: new Jii.sql.ColumnSchema({
                        name: 'createTime',
                        jsType: 'number'
                    })
                }
            });
        },

		tableName: function () {
			return 'article';
		}

	},

	getUser: function () {
		return this.hasOne(tests.unit.models.User.className(), {userId: 'id'});
	},

	getLinks: function () {
		return this.hasMany(tests.unit.models.Link.className(), {articleId: 'id'});
	}

});
