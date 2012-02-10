var App = function() {
		this.Views = {};
		this.Routers = {};
		this.Models = {};
		this.Collections = {};
		this.User = {};

		this.router = null;
		this.view = null;
		this.baseLocation = NO;

		this.beforeInit = function() {};
		this.afterInit = function() {};

		this.init = function(initData) {
			var paths = ['/'];

			// Проверяем создан ли кастомный обработчик ошибок
			if (this.errorHandler && typeof(this.errorHandler) === 'function') {
				if (!window.onerror) {
					window.onerror = this.errorHandler.bind(this);
				} else {
					// Если есть уже какой-то обработчик то мы делаем обертку которая при
					// вызове сначала вызовет старый обработчик с переданными параметрами
					// и лишь потом будет вызван наш обработчик
					var oldHandler = window.onerror;

					window.onerror = function() {
						oldHandler.apply(window, arguments);
						this.errorHandler.apply(this, arguments);
					}.bind(this)
				}
			}

			if (typeof(this.beforeInit) === 'function') {
				this.beforeInit.apply(this, arguments);
			}

			if (this.Views.Workspace) {
				this.view = new this.Views.Workspace();
			}

			if (initData && initData.CreateParams && initData.CreateParams.locations && initData.CreateParams.locations.allowedPaths) {
				paths = initData.CreateParams.locations.allowedPaths;
			}

			// Если приложение должно запускаться на нескольких урлах, то можно передать массив путей по 
			// которым разрешен запуск.
			// Так же обрабатывается ситуация с указанием в конце /
			$.each(paths, function(i, pathname) {
				var host = Config.calc.parent_host,
					href = window.location.host + pathname,
					hostHasSlash = host.slice(-1) == '/',
					hrefHasSlash = href.slice(-1) == '/';

				host = host.replace(window.location.protocol + '//', '');
				
				if (hrefHasSlash && !hostHasSlash) {
					host += '/';
				} else if (!hrefHasSlash && hostHasSlash) {
					host = host.slice(0, -1);
				}

				if (href == host) {
					this.baseLocation = YES;
				}
			}.bind(this));

			if (this.Routers.Workspace) {
				this.router = new this.Routers.Workspace(initData);
			}
			this.view && this.view.setListeners && this.view.setListeners();
			Backbone.history.start();

			if (typeof(this.afterInit) === 'function') {
				this.afterInit.apply(this, arguments);
			}
		}.bind(this);
	};

App.prototype = Core;