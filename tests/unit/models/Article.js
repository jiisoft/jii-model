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
        }

	},

	getUser: function () {
		return this.hasOne(tests.unit.models.User.className(), {userId: 'id'});
	},

	getLinks: function () {
		return this.hasMany(tests.unit.models.Link.className(), {articleId: 'id'});
	}

});
