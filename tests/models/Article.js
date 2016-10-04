'use strict';

var Jii = require('jii');
var ActiveRecord = require('./ActiveRecord.js');
var User = require('./User');
var Link = require('./Link');
var LinkJunction = require('./LinkJunction');

/**
 * @class Article
 * @extends Jii.base.ActiveRecord
 */
module.exports = Jii.defineClass('Article', {

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
		return this.hasOne(User, {id: 'userId'});
	},

	getLinks: function () {
		return this.hasMany(Link, {articleId: 'id'});
	},

	getLinksJunction: function () {
		return this.hasMany(LinkJunction, {articleId: 'id'});
	},

    getLinksVia: function () {
        return this.hasMany(Link, {id: 'linkId'}).via('linksJunction');
    }

});
