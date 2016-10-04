'use strict';

var Jii = require('jii');
var ActiveRecord = require('./ActiveRecord.js');
var LinkData = require('./LinkData');

/**
 * @class tests.unit.models.Link
 * @extends Jii.base.ActiveRecord
 */
module.exports = Jii.defineClass('tests.unit.models.Link', {

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
                    articleId: 'number',
                    dataId: 'number',
                    url: 'string',
                    title: 'string'
                }
            };
        }

	},

    getData: function () {
        return this.hasOne(LinkData, {dataId: 'id'});
    }

});
