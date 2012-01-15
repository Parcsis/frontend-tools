var HCF = function(options) {
	// Проверяем переданы ли какие-нибудь опции или нет. Если нет то заменяем options на пустой объект
	// для избежания ошибок обращения к несуществующим ключам
	options || (options = {});

	// Задаем значения по умолчанию
	this.options = options;
	this.headerHeight = this.footerHeight = 0;
	this.hasHeightTable = false;
	this.maxHeight = screen.height;
	this.styles = null;
	this.isSupportMQ = false;

	// Инициализируем библиотеку
	this.init();

	// Возвращаем объект с набором доступных для пользователя методов
	return {
		recheck: this.getFn('recheck')
	}
};

HCF.prototype = {
	/**
	 * @description Метод инициализации работы библиотеки.
	 */
	init: function() {
		var processBlock = function(block) {
				if (block) {
					if (typeof(block) === 'string') {
						return $(block);
					} else if ('length' in block && !('siblings' in block)) {
						var list = null;

						$.each(block, function(i, item) {
							if (!list) {
								list = processBlock(item)
							} else if ('add' in list) {
								list = list.add(processBlock(item));
							}
						});
						return list;
					}
				}
				return block;
			};

		// Из переданных селекторов получаем jq объекты для дальнейшей работы с ними
		this.header = processBlock(this.options.header).first();
		this.contents = processBlock(this.options.contents);
		this.footer = processBlock(this.options.footer).first();

		// Проверяем поддерживает ли тикущий браузер media queries
		this.isSupportMQ = this.checkMQ();

		// Запускаем механизм расчета высоты блоков
		this.recheck();

		// Навешиваем событие на изменение размера окна браузера
		$(window).bind('resize.hcf', this.getFn('recheck'));
	},

	/**
	 * @description Проверяет поддержку media queries браузером.
	 * @returns {Bool} Флаг говорящий о поддержки браузером media queries.
	 */
	checkMQ: function() {
		var dummy = $('<div id="mq-test-dummy">'),
			style = $('<style type="text/css">@media only all{#mq-test-dummy{width:10px}}</style>'),
			support = false;

		dummy
			.css({
				'top': -1000,
				'position': 'absolute'
			})
			.appendTo('body');
		style.appendTo('head');

		if (dummy.width() == 10) {
			support = true;
		}
		dummy.remove();
		style.remove();
		return support;
	},

	/**
	 * @description Метод возвращающий ссылку на вызов переданного метода в текущем контексте.
	 * @param {String} name Имя метода на которой нужно сделать ссылку с локальным контекстом.
	 * @returns {Function} Функция ссылающаяся на указанную функция в текущем контексте.
	 */
	getFn: function(name) {
		var fn = this[name],
			context = this;

		return function() {
			if (fn && typeof(fn) === 'function') {
				fn.call(context);
			}
		}
	},

	/**
	 * @description Метод делающий нужные проверки во избежания лишних перерасчетов, если это возможно.
	 */
	recheck: function() {
		var header = this.header,
			headerHeight = header.outerHeight(),
			footer = this.footer,
			footerHeight = footer.outerHeight();

		// Проверяем поддержку mq браузером
		if (this.isSupportMQ) {
			// Если браузер поддерживает mq, то проверяем не изменились ли высоты шапки и футера.
			// Если изменились, то удаляем старые стили и выставляем флаг на перерасчет новых стилей.
			if (!this.headerHeight || this.headerHeight != headerHeight) {
				this.headerHeight = headerHeight;
				this.removeHeightTable();
			}

			if (!this.footerHeight || this.footerHeight != footerHeight) {
				this.footerHeight = footerHeight;
				this.removeHeightTable();
			}
		} else {
			this.headerHeight = headerHeight;
			this.footerHeight = footerHeight;
			this.removeHeightTable();
		}

		// Если старые стили были удалены то собираем новые
		if (!this.hasHeightTable) {
			this.createHeightTable();
		}
	},

	/**
	 * @description Метод в зависимости от поддержки mq либо генерирует таблицу стилей либо через js выставляет
	 *              высоту блоку.
	 * @param {Object} target Элемент в который нужно вставить сгенерированные стили.
	 */
	generateHeightTable: function(target) {
		var diffHeight = this.headerHeight + this.footerHeight;

		if (this.isSupportMQ) {
			// Получаем селекторы для блоков контентной части
			var selectors = typeof(this.options.contents) === 'string' ? this.options.contents : ('join' in this.options.contents ? this.options.contents.join(', ') : false),
				styles = '';

			// Если селекторы были получены, то генерируем таблицу стилей
			if (selectors) {
				for (var i = diffHeight ; i < this.maxHeight; i++) {
					styles += '@media screen and (height:' + i + 'px){' + selectors + '{height:' + (i - diffHeight) + 'px}} ';
				}
				// После генерации вставляем стили в переданный DOM элемент
				target.html(styles);
			}
		} else {
			var sizes = this.getBrowserSizes();

			// Высчитываем и выставляем высоту блока контентной части
			this.contents.height(sizes.y - diffHeight);
		}
	},

	/**
	 * @description Метод возвращающий размеры окна браузера.
	 * @returns {Object} Объект с ключами x и y содержащие значения ширины и высоты окна браузера соответственно.
	 */
	getBrowserSizes: function() {
		var w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0];

		return {
			x: w.innerWidth || e.clientWidth || g.clientWidth,
			y: w.innerHeight || e.clientHeight || g.clientHeight
		}
	},

	createHeightTable: function() {
		if (this.isSupportMQ) {
			this.styles = $('<style type="text/css">');
			this.generateHeightTable(this.styles);
			this.styles.appendTo('head');
		} else {
			this.generateHeightTable();
		}
		this.hasHeightTable = true;
	},

	removeHeightTable: function() {
		this.styles && this.styles.remove();
		this.hasHeightTable = false;
	}
}