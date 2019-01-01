/*
 *
 * 
 * 
 */
;(function(window, document, undefined) {
	
	/*
	 * 定义需要使用到的正则表达式
	 */
	var regex = {
		rule: /^(.+)\[(\d+)\]$/,
		numeric: /^[0-9]+$/,
		integer: /^\-?[0-9]+$/
	}
	
	/*
	 * 定义默认的错误信息
	 */
	var errMessage = {
		required: '$1的值不能为空'
	}
	
	/*
	 * 定义版本号
	 */
	var VERSION = 'v0.0.1';
	
	/*
	 * @method happyValidate 表单验证类
	 * @param config { Object } 插件配置参数
	 */
	var happyValidate = function (config) {
		// 初始化插件时，可以不写new关键词
		if (!(this instanceof happyValidate)) return new happyValidate(form, fields, callback);
		// 合并参数
		this.config = {};
		this._extend(this.config, config || {});
	}
	
	/*
	 * happyValidate的原型方法
	 */
	happyValidate.prototype = {
		constructor: happyValidate,
		/*
		 * 
		 * @param form { String, Node } 待验证的form表单，支持name和节点的形式
		 * @param fields { Array } 验证规则 [{
		 *		name: 待验证的表单域的name
		 *		rule: 验证规则
		 *		errMessage: 自定义错误信息 
		 * }]
		 * @callback { Funtion } 验证完成后的回调函数
		 * 		@argument errors 所有验证不通过的错误信息
		 * 		@argument event js的event参数
		 */
		init: function (form, fields, callback) {
			if (!form) {
				throw ReferenceError("Missing parameter of 'form'");
			}
			this.errors = [];
			this.fields = [];
			this.formElement = utils.getElement(form) || {};
			console.log('this.formElement', this.formElement)
			this.callback = callback;

			this._initFields(fields);

			var submitFun = this.formElement.onsubmit;
			console.log('submitFun', submitFun)
			this.formElement.onsubmit = (function(_this) {
				return function (event) {
					_this._validateForm(event) && submitFun && submitFun();
				}
			})(this);
		},
		/*
		 * @method _initFields 筛选合法的field
		 */
		_initFields: function (fields) {
			if (!fields || !fields.length) {
				throw ReferenceError("Missing parameter of 'fields'");
			}
			for (var i = 0, fieldsLen = fields.length; i < fieldsLen; i++) {
				var name = fields[i].name;
				var rules = fields[i].rules;
				if (!name) {
					throw ReferenceError("happyValidate.js: The prop of 'name' is missing for fields[" + i + "]");
				}
				if (!rules) {
					throw ReferenceError("happyValidate.js: The prop of 'rules' is missing in fields[" + i + "]");
				}
				if (!utils.isArray(rules)) {
					throw TypeError("happyValidate.js: The prop of 'rules' in fields[" + i + "]: expected \'Array\'");
				}
				if (rules.length > 0) {
					var j = 0,
							rulesLen = rules.length;
					for (; j < rulesLen; j++) {
						var rule = rules[j];
						if (!rule.rule) {
							throw ReferenceError('The prop of \'rule\' cannot be empty in \'' + name + '\'')
						}
					}
					this.fields.push(fields[i]);	
				}
			}
		},
		/*
		 * form表单验证
		 */
		_validateForm: function (event) {
			this.errors = [];
			console.log('this.fields', this.fields)
			for (var i = 0, fieldsLen = this.fields.length; i < fieldsLen; i++) {
				var field = this.fields[i];
				field.value = utils.attr(this.formElement[field.name], 'value');
				// var method = rule.rule;
				// var methodParam;
				// var parts = regex.rule.exec(method);
				// if (parts) {
				// 	method = parts[1];
				// 	methodParam = parts[2];
				// }
				// if (utils.isFunction(this._hooks[method])) {
				// 	var validateResult = this._hooks[method].call(this, rule, methodParam);
				// 	!validateResult && this._handleError(rule);
				// } else {
				// 	console.warn('Unable to find \"' + method + '\" validation method')
				// }
			}
			if (this.callback && utils.isFunction(this.callback)) {
				this.callback(this.errors, event)
			}
			if (this.errors.length > 0) {
				event.preventDefault();
				return false;
			}
			return true
			
		},
		/*
		 * 验证失败后的错误处理
		 */
		_handleError: function (rule) {
			var errMsg = rule.errMessage || errMessage[rule.rule].replace('$1', rule.name);
			var error = {
				name: rule.name,
				value: rule.value,
				message: errMsg
			}
			this.errors.push(error);
		},
		/*
		 * 参数合并
		 * 将o2对象合并到o1对象中
		 * 同名属性覆盖
		 */
		_extend: function (o1, o2) {
			if (!utils.isObject(o2)) {
				throw TypeError('Parameter type error');
			}
			for (prop in o2) {
				if (o2.hasOnwPrototype(prop)) {
					o1[prop] = o2[prop];
				}
			}
		},
		/*
		 * 正则验证钩子函数
		 */
		_hooks: {
			required: function (field) {
				return (field.value && field.value.length > 0) || field.checked;
			}
		},
		/*
		 * 获取版本号
		 */
		version: function () {
			return VERSION;
		}
	}
	
	/*
	 * public - utils 辅助函数
	 */
	var utils = {
		/*
		 * 获取form元素
		 * @param elem { String, Object } form的name或节点对象
		 */
		getElement: function (elem) {
			if (typeof elem === 'object' && elem.nodeType === 1 && elem.nodeName.toutilspperCase() === 'FORM') {
				return elem;
			} else if (typeof elem === 'string') {
				return document.forms[elem];
			}
		},
		/*
		 * 获取元素属性
		 * @param elem { obejct } 元素对象
		 * @param attr { String } 元素的属性名
		 */
		attr: function (elem, attr) {
			if (elem && (elem.type === 'radio' || elem.type === 'checkbox')) {
				if (!elem.length) return elem.checked;
				for (var i = 0, elemLen = elem.length; i < elemLen; i++) {
					if (elem[i].checked) return elem[i][attr];
				}
				return false;
			}
			return elem[attr];
		},
		/*
		 * 类型检测：函数
		 */
		isFunction: function (v) {
			return typeof v === 'function';
		},
		/*
		 * 类型检测：数组
		 */
		isArray: function (v) {
			return Object.prototype.toString.call(v).slice(8, -1) === 'Array';
		},
		/*
		 * 类型检测：对象
		 */
		isObject: function (v) {
			return Object.prototype.toString.call(v).slice(8, -1) === 'Object';
		}
	}
	
	/*
	 * 将happyValidate暴露出去
	 */
	window.happyValidate = happyValidate;
})(window, document);