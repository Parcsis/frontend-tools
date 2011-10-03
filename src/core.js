/* Backbone core custom extends for ver */
	(function() {
		if (Backbone.VERSION.indexOf('0.5') != -1) {
			// Extending Backbone.Model.prototype for adding send() method
			_.extend(Backbone.Model.prototype, Backbone.Events, {
				send: function(attrs, options) {
					attrs || (attrs = {});
					options || (options = {});

					var model = this,
						fakemodel = _.extend(_.clone(model), {
							toJSON : function() {
								return attrs;
							}
						}),
						success = options.success;

					options.success = function(resp, status, xhr) {
						if (!model.set(model.parse(resp, xhr), options)) return false;
						if (success) success(model, resp, xhr);
					};
					options.error = wrapError(options.error, model, options);
					return (this.sync || Backbone.sync).call(this, 'create', fakemodel, options);
				}
			});

			// Wrap an optional error callback with a fallback error event.
			var wrapError = function(onError, model, options) {
				return function(resp) {
					if (onError) {
						onError(model, resp, options);
					} else {
						model.trigger('error', model, resp, options);
					}
				};
			};
		}
	})();
/* Backbone core custom extends */

/* Core */
	var YES = true,
		NO = false,
		Core = {
			getHashUrl: function() {
				var reg = /([^\/]+)\/?(.*)/,
					regData = reg.exec(Backbone.history.getFragment()) || [];

				return {
					section: regData[1],
					parameters: regData[2]
				}
			},
			Observatory: $({}),
			DateUTC: function(time) {
				var d = new Date(),
					date = {},
					formatDate = function(d) { return (d < 10 ? '0' + d : d).toString() };

				time && d.setTime(time);
				date.HH = (function(d) {
					return (d.getUTCFullYear()).toString();
				})(d);
				date.MM = (function(d) {
					return formatDate(d.getUTCMonth() + 1);
				})(d);
				date.WD = (function(d) {
					return formatDate(d.getUTCDay());
				})(d);
				date.DD = (function(d) {
					return formatDate(d.getUTCDate());
				})(d);
				date.H = (function(d) {
					return formatDate(d.getUTCHours());
				})(d);
				date.M = (function(d) {
					return formatDate(d.getUTCMinutes());
				})(d);
				date.S = (function(d) {
					return formatDate(d.getUTCSeconds());
				})(d);
				date.MS = (function(d) {
					var d = d.getUTCMilliseconds();

					if (d < 10) {
						return '00' + d;
					} else if (d < 100) {
						return '0' + d;
					} else {
						return d.toString();
					}
				})(d);

				date.hh = (function(d) {
					return d.getUTCFullYear();
				})(d);
				date.mm = (function(d) {
					return d.getUTCMonth();
				})(d);
				date.wd = (function(d) {
					return d.getUTCDay();
				})(d);
				date.dd = (function(d) {
					return d.getUTCDate();
				})(d);
				date.h = (function(d) {
					return d.getUTCHours();
				})(d);
				date.m = (function(d) {
					return d.getUTCMinutes();
				})(d);
				date.s = (function(d) {
					return d.getUTCSeconds();
				})(d);
				date.ms = (function(d) {
					return d.getUTCMilliseconds();
				})(d);

				date.timestamp = (function(d) {
					return d.valueOf();
				})(d);
				return date;
			},
			Request: function(params) {
				params = params || {};

				var url = params.url,
					method = params.method,
					data = params.data,
					success = params.success,
					error = params.error,
					abort = params.abort || params.success,
					cache = params.cache;

				return $.ajax({
					url: url + this.getCacheReset(),
					type: method || 'post',
					dataType: 'json',
					cache: cache || NO,
					data: data || {},
					success: function(data) {
						success && success(data);
					},
					error: function(data, status) {
						if (!data.status) {
							abort && abort({
								Success: NO,
								Message: 'Abort'
							});
						} else {
							error && error(data.responseText ? $.parseJSON(data.responseText) : {});
						}
					}
				});
			},
			navigate: function(hash, triggerRoute) {
				!this.locationBlock && this.router.navigate(hash, triggerRoute);
				return this;
			},

			toArray: function(data) {
				var returnData = [];

				if (data) {
					if (data.length) {
						returnData = data.slice(0);
					} else {
						for (var key in data) {
							returnData.push({
								name: key,
								value: data[key]
							});
						}
					}
				}
				return returnData;
			},

			toObject: function(data) {
				var returnData = {};

				if (data) {
					if (data.push && data.length) {
						$(data).each(function(i, item) {
							var itemData = returnData[item.name];

							if (itemData) {
								if (!itemData.push) {
									returnData[item.name] = [itemData];
								}
								returnData[item.name].push(item.value);
							} else {
								returnData[item.name] = item.value;
							}
						});
					} else {
						returnData = data;
					}
				}
				return returnData;
			},

			goToPage: function(url, isForceLoad) {
				var functionalPart = url.split('#')[1] || '404',
					urlArr = functionalPart.split('/'),
					requestedUrl = functionalPart.replace(/^\/+/, ''),
					isLegitRoute = NO;

				for (var route in this.router.routes) {
					var method = this.router.routes[route];

					if (this.router.routes.hasOwnProperty(route) && route == urlArr[0]) {
						if (this.router[method]) {
							isLegitRoute = YES;
						}
					}
				}

				if (isLegitRoute) {
					// делаем задержку в одну милисекунду чтоб все обработчики были готовы слушать новое событие
					setTimeout(function() {
						this.router.navigate(requestedUrl, YES);

						if (isForceLoad && requestedUrl == Backbone.history.getFragment()) {
							this.router[urlArr.shift()](urlArr.join('/'));
						}
					}.bind(this), 1);
				}
				return this;
			},

			cookie: function(params) {
				var get = function(name) {
						var reg = new RegExp(name + '=([^;]*)', 'gi'),
							result = reg.exec(document.cookie);

						return result ? result[1] : NO;
					};

				if (params.length) {
					var list = [];

					$(params).each(function(i, item) {
						list.push(get(item));
					});
					return list;
				} else {
					for (var key in params) {
						if (params.hasOwnProperty(key)) {
							document.cookie = key + '=' + (params[key] || NO) + '; expires=Mon, 01-Jan-' + (params[key] == NO ? '2000' : '2100') + ' 00:00:00 GMT; path=/';
						}
					}
				}
			},

			getCacheReset: function() {
				return $.browser.msie ? '?ajax=' + this.DateUTC().timestamp : '';
			},

			list: [],
			locationBlock: NO,

			set: function(name, params, render) {
				params = params || {};

				var view = params.view,
					model = params.model,
					collection = params.collection,
					dataSource = params.dataSource,
					initData = params.initData,
					data = {
						multiple: !!params.multiple,
						standalone: !!params.standalone
					},
					exeptionList = {
						'view': YES,
						'_view': YES,
						'standalone': YES,
						'multiple': YES,
						'eventProxy': YES
					},
					proxy = {},
					undefined;

				if (dataSource) {
					var object = this.get(dataSource);

					for (var key in object) {
						if (!exeptionList[key]) {
							data[key] = object[key];
						}
					}
				} else {
					if (collection) {
						data.collection = new collection(initData);
					} else {
						if (model) {
							data.model = new model(initData);
						} else if (model == undefined && this.Models[name]) {
							data.model = new this.Models[name](initData);
						}
					}
				}

				if (data.model || data.collection) {
					_.extend(proxy, Backbone.Events);
					(data.model || data.collection).bind('all', function() {
						proxy.trigger.apply(proxy, arguments);
					});
					data.eventProxy = proxy;
				}

				if (view) {
					data._view = view;
				} else if (view == undefined && this.Views[name]) {
					data._view = this.Views[name];
				}
				this['__' + name] = data;
				this.list.push(name);

				if (render) {
					setTimeout(function() {
						this.render(name);
					}.bind(this), 1);
				}
				return this;
			},

			render: function(name, params) {
				params = params || {};

				var data = this.get(name),
					viewData = $.extend(params, data);

				data.render = this.render.bind(this);

				if (data && ((data._view && !data.standalone) || (data.standalone && !data.view))) {
					if (data.multiple) {
						var tmpName = name + Math.floor(Math.random() * 10000),
							dummyBundle = this.get(tmpName);

						dummyBundle.view = new data._view(viewData);
						this['__' + tmpName] = dummyBundle;
						this.list.push(tmpName);
					} else {
						this['__' + name].view = new data._view(viewData);
					}
				}
				return data;
			},

			get: function(name) {
				return this['__' + name] || {
					multiple: NO,
					standalone: NO,
					_view: Backbone.View
				};
			},

			unload: function(viewName) {
				var list = viewName ? [viewName] : this.list;

				this.locationBlock = YES;
				$(this.list).each(function(i, name) {
					var object = this.get(name),
						view = object.view;

					if (view && (!object.standalone || !!viewName)) {
						view.remove();
						delete this['__' + name].view;
					}

					if (object.eventProxy) {
						object.eventProxy.unbind();
					}
				}.bind(this));
				this.locationBlock = NO;
				return this;
			}
		};
/* Core */

/* Native js custom extends */
	// Расширяем объект массива
	$A = Array.from = function(iterable) {
		if (!iterable) {
			return [];
		}
		if (iterable.toArray) {
			return iterable.toArray();
		} else {
			var results = [];
			for (var i = 0, length = iterable.length; i < length; i++) {
				results.push(iterable[i]);
			}
			return results;
		}
	};
	
	// Расширяем прототип функции для добавления передачи контекста через .bind()
	$.extend( Function.prototype, {
		bind: function() {
			var __method = this, args = $A(arguments), object = args.shift();
			return function() {
				return __method.apply(object, args.concat($A(arguments)));
			};
		}
	});
	
	if (typeof window.console == 'undefined') {
		window.console = {};
		console.log = console.info = console.warn = console.debug = console.group = console.groupEnd = console.error = console.time = console.timeEnd = function() {};
	} else if (typeof window.console == 'object' && ($.browser.msie && $.browser.version == 8)) {
		console.debug = console.group = console.groupEnd = console.time = console.timeEnd = function(){};
	}
/* Native js custom extends */