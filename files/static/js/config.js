window.Config || (window.Config = {});

window.Config.calc = (function(Config, Calc) {
	var locations = Calc && Calc.loadOptions && Calc.loadOptions.locations,
		rootHost = locations && locations.calculator || location.protocol + '//' + location.hostname + (location.port == '' ? '' : ':' + location.port) + '/';

	// все пути будут с заканчивающимися слешами.
	return {
		host: rootHost, // Url на который будет посылаться все запросы
		parent_host: locations && locations.parent || rootHost, // Url на котором будет происходить инициализация калькулятора
		img_host: rootHost + 'Content/static/img/',
		css_host: rootHost + 'Content/static/css/',
		js_host: rootHost + 'Content/static/js/'
	}
})(window.Config || {}, window.Calc);