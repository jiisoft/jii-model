'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

var tests = Jii.namespace('tests');

require('./ActiveRecord.js');

/**
 * @class tests.unit.models.User
 * @extends Jii.base.ActiveRecord
 */
var self = Jii.defineClass('tests.unit.models.User', {

	__extends: Jii.base.ActiveRecord,

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
                    name: 'string',
                    email: 'string'
                }
            };
        }

	}

});
