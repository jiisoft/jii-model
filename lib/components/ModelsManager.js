/**
 * @author <a href="http://www.affka.ru">Vladimir Kozhin</a>
 * @license MIT
 */

'use strict';

/**
 * @namespace Jii
 * @ignore
 */
var Jii = require('../../../jii/lib/Jii');

require('../../../jii/lib/base/Component');

/**
 *
 * @class Jii.base.ModelsManager
 * @extends Jii.base.Component
 */
Jii.defineClass('Jii.base.ModelsManager', {

	__extends: Jii.base.Component,

	__static: {

		_modelClassNames: null,

		registerModel: function (modelClassName) {
			this._modelClassNames  = this._modelClassNames || [];
			this._modelClassNames.push(modelClassName);
		}
	},

	/**
	 * Initializes UrlManager.
	 */
	init: function () {
		this.__super();
		this._compileRules();
	}

});
