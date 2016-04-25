'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var tests = Jii.namespace('tests');

require('./ActiveRecord.js');

/**
 * @class tests.unit.models.LinkJunction
 * @extends Jii.base.ActiveRecord
 */
var self = Jii.defineClass('tests.unit.models.LinkJunction', {

	__extends: 'Jii.base.ActiveRecord',

	__static: {

        /**
         * @returns {{}}
         */
        modelSchema: function() {
            return {
                primaryKey: ['articleId', 'linkId'],
                columns: {
                    articleId: 'number',
                    linkId: 'number'
                }
            };
        }

	},

    getLink: function () {
        return this.hasOne(tests.unit.models.Link.className(), {id: 'linkId'});
    }

});
