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

	__extends: Jii.base.Object,

	/**
	 * @var {string} the name of the schema that this table belongs to.
	 */
	schemaName: '',

	/**
	 * @var {string[]} primary keys of this table.
	 */
	primaryKey: [],

	/**
	 * @var {{string: Jii.sql.ColumnSchema}} column metadata of this table. Each array element is a [[ColumnSchema]] object, indexed by column names.
	 */
	columns: {},

	/**
	 * Gets the named column metadata.
	 * This is a convenient method for retrieving a named column even if it does not exist.
	 * @param {string} name column name
	 * @return {Jii.sql.ColumnSchema} metadata of the named column. Null if the named column does not exist.
	 */
	getColumn: function (name) {
		return Jii._.has(this.columns, name) ? this.columns[name] : null;
	},

	/**
	 * Returns the names of all columns in this table.
	 * @return {[]} list of column names
	 */
	getColumnNames: function () {
		return Jii._.keys(this.columns);
	}

});
