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
			if (typeof(this.beforeInit) === 'function') {
				this.beforeInit.apply(this, arguments);
			}

			if (this.Views.Workspace) {
				this.view = new this.Views.Workspace();
			}
			this.baseLocation = window.location.href.replace(/[?#].*/, '') == Config.web.host;

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