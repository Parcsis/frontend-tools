/* Backbone core custom extends for ver */
	(function() {
		if (Backbone.VERSION.indexOf('0.5') != -1) {
			// Extending Backbone.Model.prototype for adding send() method
			_.extend(Backbone.Model.prototype, Backbone.Events, {
				// POST метод с передачей параметров, который передает только переданные в него данные не 
				// объединяя их с данными модели
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
				},

				// GET метод с передачей параметров, который передает только переданные в него данные не 
				// объединяя их с данными модели
				read: function(attrs, options) {
					attrs || (attrs = {});
					options || (options = {});

					var model = this,
						url = model.url && typeof(model.url === 'function') ? model.url() : model.url,
						fakemodel = _.extend(_.clone(model), {
							url : function() {
								return url + '?' + $.param(attrs);
							}
						}),
						success = options.success;

					options.success = function(resp, status, xhr) {
						if (!model.set(model.parse(resp, xhr), options)) return false;
						if (success) success(model, resp, xhr);
					};
					options.error = wrapError(options.error, model, options);
					return (this.sync || Backbone.sync).call(this, 'read', fakemodel, options);
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

			DateUTC: function(time, format, asArray) {
				var d = new Date(),
					splitReg = /[:.]/,
					date = {},
					formatDate = function(d) {
						return ('0' + d).slice(-2);
					};

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

					return ('00' + d).slice(-3);
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

				if (format) {
					var partialDate = format.split(splitReg),
						symbolResult = splitReg.exec(format),
						delimeterSymbol = symbolResult ? symbolResult[0] : '',
						formatedDate = [];

					$.each(partialDate, function(i, item) {
						formatedDate.push(date[item]);
					});
					return asArray ? formatedDate : formatedDate.join(delimeterSymbol);
				}
				return date;
			},

			// Обертка над запросом которая позваляет "продавливать" переданные параметры
			// в объект xhr который приходит в метод parse модели или коллекции.
			requestWraper: function(target, method, data, params) {
				this._req || (this._req = {});

				if (target && method && target[method] && typeof(target[method]) === 'function') {
					data || (data = {});
					params || (params = {});

					// Если у нас передан уникальный ключ запроса, параметр synchronous и уже выполняется запрос 
					// с таким же uniqueness, то новый запрос игнорируется, до окончания старого
					if (params.uniqueness && params.synchronous) {
						var req = this._req[params.uniqueness];

						if (req) {
							return NO;
						}
					}

					// Если требуется то делаем предобработку данных для всех запросов
					if (this.preProcessRequestWrapperData && typeof(this.preProcessRequestWrapperData) === 'function') {
						var processedData = this.preProcessRequestWrapperData(data);

						if (processedData) {
							data = processedData;
						}
					}

					var options = params.options || {},
						arguments = [data],
						xhr = null,
						errorStatuses = {
							'error': YES,
							'timeout': YES,
							'parsererror': YES
						},
						getErrorText = this.getErrorText,
						beatTheHeart = function() {
							if (this.heartbeatState && this.startHeartbeat && typeof(this.startHeartbeat) === 'function') {
								this.stopHeartbeat();
								this._heartbeatTimer = setTimeout(function() {
									this.startHeartbeat();
									beatTheHeart();
								}.bind(this), this.heartbeatTimout * 1000 * 60); // Время указывается в минутах
							}
						}.bind(this);

					// Если обработчик метода complete не был передан, то заменяем его на функцию-пустышку
					options.complete || (options.complete = function() {});

					// Делаем обертки для методов success и error чтоб после окончания запроса
					// можно было запустить "биение сердца"
					if (options.complete && typeof(options.complete) === 'function') {
						options.originalCompleteHandler = options.complete;

						options.complete = function(xhr, textStatus) {
							xhr.userData || (xhr.userData = {});

							var uniqueness = xhr.userData.uniqueness,
								options = xhr.userData.options;

							if (options && options.originalCompleteHandler) {
								options.originalCompleteHandler.apply(this, arguments);
							}

							// Как бы не закончился запрос (ошибкой или успехом) запускаем
							// "биение сердца" для поддержания сессии
							beatTheHeart();

							// Если статус запроса вернулся равным error, timeout или parsererror,
							// то значит произошла какая-то ошибка и нужно вывести сообщение об этом
							if (errorStatuses[textStatus] && getErrorText && typeof(getErrorText) === 'function') {
								if (Calc.error && typeof(Calc.error) === 'function') {
									Calc.error(getErrorText());
								}
							}

							// Удаляем выполненый запрос из колекции
							if (Calc._req[uniqueness]) {
								delete Calc._req[uniqueness];
							}
						}
					}
					options.timeout || (options.timeout = 3 * 1000 * 60); // таймаут ожидания в минутах (3 мин)

					// Добавляем обработанные опции в список аргументов
					arguments.push(options);

					if (method == 'fetch') {
						arguments.shift();
					}
					target.action = params.action;

					// Остановка "биения сердца" если запрос выполняется долго, чтоб не было паралельного запроса
					this.stopHeartbeat();

					// Выполняем запрос с параметрами
					xhr = $.extend(target[method].apply(target, arguments), {
						userData: $.extend({}, params, params.appendData && {
							sendedData: data
						})
					});

					// Если передан этот параметр то под его значением мы сохраняем запрос
					// в коллекцию и при повторном вызове запроса с таким значение сбросит
					// старый запрос сохраненный в коллекции записав на его место новый
					if (params.uniqueness) {
						this.abortRequest(params.uniqueness);
						this._req[params.uniqueness] = xhr;
					}
				}
			},

			abortRequest: function(id) {
				if (id) {
					var req = this._req[id];

					req || (req = {});

					if (req.abort && typeof(req.abort) === 'function') {
						req.abort();
					}
				}
			},

			// Метод-обертка, который делает задержку между получением данных из вью-модели и отправкой их 
			// в шаблонизатор, что позволит сделать увеличить максимальное время скрипта без вывода сообщения
			// о том что скрипт перестал отвечать.
			// 
			// Необходимые условия:
			//     1) renderHandler - метод, который выполняет отрисовку должен принимать данные в качестве 
			//        параметра и без обработки их отправлять в шаблонизатор;
			//     2) dataSourceHandler - метод, который получает из источника данных сформированный объект
			//        подготовленный для отрисовки.
			// 
			// params: {
			//     renderContext - контекст вызова (scope) метода renderHandler;
			//     renderArguments - массив аргументов которые должны быть переданы в метод renderHandler 
			//         помимо объекта с данными. Например: renderArguments = [a, b], тогда в полный набор 
			//         аргументов переданные в renderHandler будет [data, a, b];
			//     dataSourceContext - контекст вызова (scope) метода dataSourceHandler;
			//     dataSourceArguments - массив аргументов которые будут переданны в метод dataSourceHandler;
			//     beforeRenderCallback - метод, который будет вызван непосредственно до вызова метода 
			//         renderHandler;
			//     afterRenderCallback - метод, который будет вызван непосредственно после вызова метода
			//         renderHandler;
			//     afterRenderDefferedCallback - метод, который будет вызван через 100мс после вызова метода
			//         renderHandler;
			// }
			defferedViewRender: function(renderHandler, dataSourceHandler, params) {
				params || (params = {});

				if (renderHandler && typeof(renderHandler) === 'function' && dataSourceHandler && typeof(dataSourceHandler) === 'function') {
					var data = dataSourceHandler.apply(params.dataSourceContext || this, params.dataSourceArguments || []),
						renderArguments = [data];

					setTimeout(function() {
						if (params.beforeRenderCallback && typeof(params.beforeRenderCallback) === 'function') {
							params.beforeRenderCallback();
						}
						renderHandler.apply(params.renderContext || this, renderArguments.concat(params.renderArguments || []));

						if (params.afterRenderCallback && typeof(params.afterRenderCallback) === 'function') {
							params.afterRenderCallback();
						}

						if (params.afterRenderDefferedCallback && typeof(params.afterRenderDefferedCallback) === 'function') {
							setTimeout(function() {
								params.afterRenderDefferedCallback();
							}, 100);
						}
					}.bind(this), 100);
				} else {
					return NO;
				}
				return YES;
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

			createEventProxy: function(dataSource) {
				var proxy = {};

				_.extend(proxy, Backbone.Events);
				dataSource.bind('all', function() {
					proxy.trigger.apply(proxy, arguments);
				});
				return proxy;
			},

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
					data.eventProxy = this.createEventProxy(data.model || data.collection);
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

				if (data && data._view && !data.view) {
					if (data.multiple) {
						var tmpName = name + Math.floor(Math.random() * 10000),
							dummyBundle = $.extend({}, data);

						dummyBundle.view = new dummyBundle._view(viewData);
						this['__' + tmpName] = dummyBundle;
						this.list.push(tmpName);
					} else {
						this['__' + name].view = new data._view(viewData);
					}
				}
				return data;
			},

			// Метод позволяющий передавать массив имен бандлов с параметрами или без к которым при 
			// отрисовке будут примен общий набор параметров
			// 
			// Пример #1:
			// Core.renderStream(['Menu', 'Content', 'Footer'], {
			//     context: 'agent'
			// });
			// 
			// Пример #2:
			// Core.renderStream([{
			//     name: 'Menu',
			//     params: {
			//         params: params,
			//         value: value
			//     }
			// }, 'Content', 'Footer'], {
			//     context: 'agent'
			// });
			// 
			renderStream: function(bandlesList, params) {
				params || (params = {});

				$.each(bandlesList, function(i, bandle) {
					var name = '';

					if (bandle && typeof(bandle) === 'string') {
						name = bandle;
					} else if ('name' in bandle) {
						name = bandle.name;
					}
					this.render(name, $.extend({}, params, bandle.params));
				}.bind(this));
				return this;
			},

			get: function(name) {
				return this['__' + name] || {
					multiple: NO,
					standalone: NO,
					_view: Backbone.View
				};
			},

			unload: function(viewName) {
				var list = viewName ? [viewName] : this.list,
					currentHashUrl = window.location.hash.replace('/', '');

				this.locationBlock = YES;
				$.each(list, function(i, name) {
					var object = this.get(name),
						isStandalone = !!object.standalone,
						view = object.view;

					if (isStandalone && 'push' in object.standalone) {
						$.each(object.standalone, function(j, route) {
							if (currentHashUrl.indexOf(route.replace('/', '')) >= 0) {
								isStandalone = YES;
								return NO;
							}
						});
					}

					if (view && (!isStandalone || !!viewName)) {
						view.remove();
						delete this['__' + name].view;
					}

					if (object.eventProxy) {
						object.eventProxy.unbind();
					}
				}.bind(this));
				this.locationBlock = NO;
				return this;
			},

			restore: function() {
				// Пробуем найти контейнер к которому приложение было изначально привязано
				var selector = this.container.selector,
					container = $(selector);

				// Если получается найти его то вставляем в него старый каркас
				if (container.length) {
					container
						.empty()
						.append(this.view.el);

					// Указываем ссылку на новый контейнер
					this.container = container;

					// Пробегаемся по всем активным вью и делаем ребинд событий
					$.each(this.list, function(i, name) {
						var view = this['__' + name].view;

						if (view) {
							view.delegateEvents(view.events);
						}
					}.bind(this));

					// Сбрасываем роутинг на дефолтовую страницу тем самым возобновляя навигацию
					window.location.hash = Math.random();
				}
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