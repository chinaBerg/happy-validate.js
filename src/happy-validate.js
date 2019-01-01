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
	 * @param form { String, Node } 待验证的form表单，支持name和节点的形式
	 * @param fields { Array } 验证规则 [{
	 *		name: 待验证的表单域的name
	 *		rule: 验证规则
	 *		errMessage: 自定义错误信息 
	 * }]
	 * @callback { Funtion } 验证完成后的回调函数
	 * 		@argument errors 所有验证不通过的错误信息
	 * 		@argument event js的event参数
	 * */
	var happyValidate = function (form, fields, callback) {
		if (!(this instanceof happyValidate)) return new happyValidate(form, fields, callback);
		this.errors = [];
		this.rules = [];
		this.formElement = utils.getElement(form) || {};
		this.callback = callback;
		this.init(form, fields, callback);
	}
	
	/*
	 * happyValidate的原型方法
	 */
	happyValidate.prototype = {
		constructor: happyValidate,
		/*
		 * 实例化函数
		 */
		init: function (form, fields, callback) {
			if (!form) {
				throw ReferenceError("Missing parameter of 'form'");
			}
			if (!fields || !fields.length) {
				throw ReferenceError("Missing parameter of 'fields'");
			}
			for (var i = 0, fieldsLen = fields.length; i < fieldsLen; i++) {
				var field = fields[i];
				var rules = field.rules;
				if (!field.name) {
					console.warn("happyValidate.js: The prop of 'name' is missing for fields[" + i + "]: ", fields[i]);
					continue;
				}
				if (!rules || !rules.length) {
					console.warn("happyValidate.js: The prop of 'rules' is missing or empty for fields[" + i + "]: ", fields[i]);
					continue;
				}
				var elem = this.formElement[field.name];
				if (elem) {
					field.value = utils.attr(elem, 'value');
					field.checked = utils.attr(elem, 'checked');
					field.type = utils.attr(elem, 'type');
				}
				this._addSingleRules(field);
			}
			console.log('this.rules', this.rules);
			var submitFun = this.formElement.onsubmit;
			this.formElement.onsubmit = (function(_this) {
				return function (event) {
					_this._validateForm(event)
				}
			})(this);
		},
		/*
		 * @method _addSingleRules 拆分field中的rules， 对每一条添加相应的属性值
		 * @param rule { Array } 待拆分的rules
		 * @param name { String } 当前rules对应的name
		 */
		_addSingleRules: function (field) {
			for (var j = 0, rulesLen = field.rules.length; j < rulesLen; j++) {
				var rule = field.rules[j];
				if (rule.rule) {
					rule.name = field.name;
					rule.type = field.type;
					this.rules.push(rule);
					if (rule.type === 'radio' || rule.type === 'checkbox') {
						rule.value = field.checked;
					} else {
						rule.value = field.value;
					}
				}
			}
		},
		/*
		 * form表单验证
		 */
		_validateForm: function (event) {
			this.errors = [];
			for (var i = 0, rulesLen = this.rules.length; i < rulesLen; i++) {
				var rule = this.rules[i];
				var method = rule.rule;
				var methodParam;
				var parts = regex.rule.exec(method);
				if (parts) {
					method = parts[1];
					methodParam = parts[2];
				}
				if (utils.isFunction(this._hooks[method])) {
					var validateResult = this._hooks[method].call(this, rule, methodParam);
					!validateResult && this._handleError(rule);
				} else {
					console.warn('Unable to find \"' + method + '\" validation method')
				}
			}
			if (this.callback && utils.isFunction(this.callback)) {
				this.callback(this.errors, event)
			}
			if (this.errors.length > 0) {
				event.preventDefault();
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
		 * 正则验证钩子函数
		 */
		_hooks: {
			required: function (field) {
				return !field.value || !field.value.length || ;
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
	 * public 辅助函数
	 */
	var utils = {
		getElement: function (elem) {
			if (typeof elem === 'object' && elem.nodeType === 1 && elem.nodeName.toutilspperCase() === 'FORM') {
				return elem;
			} else if (typeof elem === 'string') {
				return document.forms[elem];
			}
		},
		attr: function (elem, attr) {
			if (elem && elem.length > 0 && (elem.type === 'radio' || elem.type === 'checkbox')) {
				for (var i = 0, elemLen = elem.length; i < elemLen; i++) if (elem[i].checked) return elem[i][attr];
			}
			return elem[attr];
		},
		isFunction: function (v) {
			return typeof v === 'function';
		},
		isArray: function (v) {
			return Object.prototype.toString.call(v).slice(8, -1) === 'Array';
		}
	}
	
	/*
	 * 将happyValidate暴露出去
	 */
	window.happyValidate = happyValidate;
})(window, document);