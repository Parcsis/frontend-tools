/**
 * Собственная реализация метода Backbone.sync для прокси-объекта калькулятора
 */
(function() {

	var getUrl = function(object) {
			if (!(object && object.url)) return null;
			return _.isFunction(object.url) ? object.url() : object.url;
		},
		urlError = function() {
			throw new Error('A "url" property or function must be specified');
		},
		methodMap = {
			'create': 'POST',
			'update': 'PUT',
			'delete': 'DELETE',
			'read': 'GET'
		};

	/**
	 * Собственная реализация метода Backbone.sync
	 * По сути, это обычный Backbone.sync с альтернативной концовкой
	 */
	Backbone.sync = function(method, model, options) {
		var type = methodMap[method],
			proxy = Proxy || {};

		// Default JSON-request options.
		var params = _.extend({
				type: type,
				dataType: 'json'
			}, options);

		// Ensure that we have a URL.
		if (!params.url) {
			params.url = getUrl(model) || urlError();
		}

		// Ensure that we have the appropriate request data.
		if (!params.data && model && (method == 'create' || method == 'update')) {
			params.contentType = 'application/json';
			params.data = JSON.stringify(model.toJSON());
		}

		// For older servers, emulate JSON by encoding the request into an HTML-form.
		if (Backbone.emulateJSON) {
			params.contentType = 'application/x-www-form-urlencoded';
			params.data = params.data ? {model : params.data} : {};
		}

		// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
		// And an `X-HTTP-Method-Override` header.
		if (Backbone.emulateHTTP) {
			if (type === 'PUT' || type === 'DELETE') {
				if (Backbone.emulateJSON) params.data._method = type;
				params.type = 'POST';
				params.beforeSend = function(xhr) {
					xhr.setRequestHeader('X-HTTP-Method-Override', type);
				};
			}
		}

		// Don't process data on a non-GET request.
		if (params.type !== 'GET' && !Backbone.emulateJSON) {
			params.processData = false;
		}

		if (proxy.Request && typeof(proxy.Request) === 'function') {
			var fakeXhr = {
					abort: function() {}
				};

			(function(fakeXhr) {
				// Стреляем событие о том что мы начинаем делать ajax запрос
				Calc.Observatory.trigger('proxyAjaxStart');

				// Вызываем метод в iframe proxy который будет выполнять запрос по протоколу https
				proxy.Request(params, function(response) {
					var xhr = $.extend({}, response, fakeXhr),
						textStatus = xhr.textStatus;

					delete xhr.textStatus;

					if (options && options.complete && typeof(options.complete) === 'function') {
						options.complete(xhr, textStatus);
					}

					if (textStatus == 'success' && options && options.success && typeof(options.success) === 'function') {
						options.success($.parseJSON(xhr.responseText), textStatus, xhr);
					}

					// По окончанию запроса мы тригерим событие что запрос завершился
					Calc.Observatory.trigger('proxyAjaxStop');
				}, function(error) {
					if (options && options.error && typeof(options.error) === 'function') {
						options.error(xhr, textStatus, error);
					}
				});
			})(fakeXhr);

			return fakeXhr;
		} else {
			setTimeout(function() {
				if (options && options.success && typeof(options.success) === 'function') {
					options.success({
						Errors: [{
							Message: 'Неизвестная ошибка.'
						}]
					});
				}
			}, 0);
			return {};
		}
	};
})();