var Calc = new App();

$.extend(Calc, {
	debugMode: NO,
	rootHost: null,
	container: null,
	heartbeatTimout: 4,
	heartbeatState: YES,

	preProcessRequestWrapperData: function(data) {
		var pages = Calc.get('Options').model;

		// Добавляем ко всем запросам параметр page с id текущей страницы
		data.page = Calc.processControlID(pages.get('CurrentPage'), '$1');
		return data;
	},

	// Обработчик heartbeat срабатывает когда по таймеру приходит время выполнить запрос
	startHeartbeat: function() {
		var policy = Calc.get('Policy').model,
			account = policy.get('AccountNumber');

		if (account) {
			Calc.requestWraper(policy, 'send', {
				account: account
			}, {
				action: 'do_heartbeat'
			});
		}
	},

	stopHeartbeat: function() {
		Calc._heartbeatTimer && clearTimeout(Calc._heartbeatTimer);
	},

	// Кастомный обработчик ошибок с указанием режима дебага или продакшна
	// 
	// [TODO] Нужно ко всем js файлам в дальнейшем добавить префикс "calc." 
	// чтоб можно было опрделеить в коде калькулятора выпала ошибка или в сторонем коде
	errorHandler: function(message, file, lineNum) {
		if (!this.debugMode) {
			return true;
		} else {
			alert('"' + message + '" on line: ' + lineNum + ' in ' + file);
			return false;
		}
	}
});
