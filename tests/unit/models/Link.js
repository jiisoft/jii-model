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
        return this.hasOne(tests.unit.models.LinkData.className(), {dataId: 'id'});
    }

});
