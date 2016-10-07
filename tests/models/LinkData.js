'use strict';

var Jii = require('jii');
var ActiveRecord = require('./ActiveRecord.js');

/**
 * @class tests.unit.models.LinkData
 * @extends Jii.base.BaseActiveRecord
 */
var LinkData = Jii.defineClass('tests.unit.models.LinkData', {

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
                    value: 'string'
                }
            };
        }

	}

});

module.exports = LinkData;