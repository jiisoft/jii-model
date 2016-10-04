'use strict';

var Jii = require('jii');
var ActiveRecord = require('./ActiveRecord.js');
var Link = require('./Link');

/**
 * @class tests.unit.models.LinkJunction
 * @extends Jii.base.ActiveRecord
 */
module.exports = Jii.defineClass('tests.unit.models.LinkJunction', {

	__extends: ActiveRecord,

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
        return this.hasOne(Link, {id: 'linkId'});
    }

});
