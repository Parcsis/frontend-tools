var Calc = new App();

$.extend(Calc, {
	debugMode: NO,
	container: null,
	heartbeatTimout: 4,
	heartbeatState: YES,

	// Обработчик heartbeat срабатывает когда по таймеру приходит время выполнить запрос
	startHeartbeat: function() {
		// Код обращения на сервер для продления жизни сессии
	},

	stopHeartbeat: function() {
		Calc._heartbeatTimer && clearTimeout(Calc._heartbeatTimer);
	},

	// Кастомный обработчик ошибок с указанием режима дебага или продакшна
	// 
	// [TODO] Нужно ко всем js файлам в дальнейшем добавить префикс "calc." 
	// чтоб можно было опрделеить в коде калькулятора выпала ошибка или в сторонем коде
	erorrHandler: function(message, file, lineNum) {
		if (!this.debugMode) {
			alert('В калькуляторе произошел сбой!');
			return true;
		} else {
			alert('"' + message + '" on line: ' + lineNum + ' in ' + file);
			return false;
		}
	},
});