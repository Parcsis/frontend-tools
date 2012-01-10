// все пути будут с заканчивающимися слешами.
var rootHost = location.protocol + '//' + location.hostname + (location.port == '' ? '' : ':' + location.port) + '/',
	Config = {
		web: {
			host: rootHost, // Url на который будет посылаться все запросы
			parent_host: rootHost, // Url на котором будет происходить инициализация калькулятора
			img_host: rootHost + 'Content/static/img/',
			css_host: rootHost + 'Content/static/css/',
			js_host: rootHost + 'Content/static/js/'
		}
	};