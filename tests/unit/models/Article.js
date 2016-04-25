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
Jii.defineClass('tests.unit.models.Article', {

	__extends: 'Jii.base.ActiveRecord',

	__static: {

        /**
         * @returns {{}}
         */
        modelSchema: function() {
            return {
                primaryKey: ['id'],
                columns: {
                    id: {
                        name: 'id',
                        jsType: 'number',
                        isPrimaryKey: true
                    },
                    userId: 'number',
                    title: 'string',
                    text: 'string',
                    createTime: 'number'
                }
            };
        },

        tableName: function() {
            return 'articles';
        }

	},

	getUser: function () {
		return this.hasOne(tests.unit.models.User.className(), {id: 'userId'});
	},

	getLinks: function () {
		return this.hasMany(tests.unit.models.Link.className(), {articleId: 'id'});
	},

	getLinksJunction: function () {
		return this.hasMany(tests.unit.models.LinkJunction.className(), {articleId: 'id'});
	},

    getLinksVia: function () {
        return this.hasMany(tests.unit.models.Link.className(), {id: 'linkId'}).via('linksJunction');
    }

});
