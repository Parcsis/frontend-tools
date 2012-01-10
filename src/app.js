var App = function() {
		this.Views = {};
		this.Routers = {};
		this.Models = {};
		this.Collections = {};
		this.User = {};

		this.router = null;
		this.view = null;
		this.baseLocation = null;

		this.beforeInit = function() {};
		this.afterInit = function() {};

		this.init = function(initData) {
			// Проверяем создан ли кастомный обработчик ошибок
			if (this.erorrHandler && typeof(this.erorrHandler) === 'function') {
				if (!window.onerror) {
					window.onerror = this.erorrHandler.bind(this);
				} else {
					// Если есть уже какой-то обработчик то мы делаем обертку которая при
					// вызове сначала вызовет старый обработчик с переданными параметрами
					// и лишь потом будет вызван наш обработчик
					var oldHandler = window.onerror;

					window.onerror = function() {
						oldHandler.apply(window, arguments);
						this.erorrHandler.apply(this, arguments);
					}.bind(this)
				}
			}

			if (typeof(this.beforeInit) === 'function') {
				this.beforeInit.apply(this, arguments);
			}

			if (this.Views.Workspace) {
				this.view = new this.Views.Workspace();
			}
			this.baseLocation = window.location.href.replace(/[?#].*/, '') == Config.web.parent_host;

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