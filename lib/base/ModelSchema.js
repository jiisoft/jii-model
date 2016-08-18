/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('jii');

/**
 * @class Jii.base.ModelSchema
 * @extends Jii.base.Object
 */
Jii.defineClass('Jii.base.ModelSchema', /** @lends Jii.base.ModelSchema.prototype */{

	__extends: 'Jii.base.Object',

    __static: /** @lends Jii.base.ModelSchema */{

        /**
         *
         * @param {object} obj
         * @returns {Jii.base.ModelSchema}
         */
        createFromObject(obj) {
            Jii._.each(obj.columns, (column, name) => {
                if (!(column instanceof Jii.base.ModelAttributeSchema)) {
                    if (Jii._.isString(column)) {
                        if (Jii._.isNumber(name)) {
                            var parts = column.split(':');
                            column = {
                                name: parts[0],
                                type: 'string'
                            };
                        } else {
                            column = {
                                name: name,
                                type: column
                            }
                        }
                    }

                    if (!Jii._.isObject(column)) {
                        throw new Jii.exceptions.InvalidConfigException('Invalid column format: ' + column);
                    }
                    if (!Jii._.isString(name)) {
                        column.name = name;
                    }
                    obj.columns[name] = new Jii.base.ModelAttributeSchema(column);
                }
            });

            return new Jii.base.ModelSchema(obj);
        }

    },

	/**
	 * @var {string} the name of the schema that this table belongs to.
	 */
	schemaName: '',

	/**
	 * @var {string[]} primary keys of this table.
	 */
	primaryKey: [],

	/**
	 * @var {{string: Jii.base.ModelAttributeSchema}} column metadata of this table. Each array element is a [[Jii.base.ModelAttributeSchema]] object, indexed by column names.
	 */
	columns: {},

	/**
	 * Gets the named column metadata.
	 * This is a convenient method for retrieving a named column even if it does not exist.
	 * @param {string} name column name
	 * @return {Jii.base.ModelAttributeSchema} metadata of the named column. Null if the named column does not exist.
	 */
	getColumn(name) {
		return Jii._.has(this.columns, name) ? this.columns[name] : null;
	},

	/**
	 * Returns the names of all columns in this table.
	 * @return {[]} list of column names
	 */
	getColumnNames() {
		return Jii._.keys(this.columns);
	},

    toJSON() {
        var obj = {};

        if (!Jii._.isEmpty(this.primaryKey)) {
            obj.primaryKey = this.primaryKey;
        }
        if (!Jii._.isEmpty(this.schemaName)) {
            obj.schemaName = this.schemaName;
        }
        if (!Jii._.isEmpty(this.columns)) {
            obj.columns = {};
            Jii._.each(this.columns, (column, name) => {
                obj.columns[name] = column.toJSON();
            });
        }

        return obj;
    }

});
