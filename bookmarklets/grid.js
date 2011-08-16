/**
 * Позволяет добавлять на любую страницу нашу сетку 10x10 пикселей (квадратами
 * по 100 пикселей). Сетка управляемая, можно её двигать и всячески настраивать.
 * 
 * Добавляется на страницу с помощью вот такой ссылки
 * javascript:(function(){_my_script=document.createElement('SCRIPT');_my_script.type='text/javascript';_my_script.src='https://github.com/Parcsis/frontend-tools/raw/master/bookmarklets/grid.js';document.getElementsByTagName('head')[0].appendChild(_my_script);})();void%200;
 */
;(function(document, options) {

	var documentBody = document.getElementsByTagName('body')[0];

	/**
	 * Объект сетки
	 */
	var Grid = function(container, options) {

		var Grid = function(container, options) {
			this.grid = null; // DOM-элемент сетки
			this.gridStyles = null; // DOM-элемент стилей сетки

			this.options = options = options || {};
			
			options.stepX = options.stepX || 10;
			options.stepY = options.stepY || 10;
			
			/**
			 * Координаты сетки
			 */
			this.coords = {x:0, y:0};
			this.alpha = 10;
			
			this.handlers=[];

			this.initialize();
		};

		Grid.prototype = {
			/**
			 * Цепляет обработчик на объект и запоминает его
			 */
			attach: function(){
				var handler = $.attachEventHandler.apply(this, arguments);
				this.handlers.push(handler);
				return handler;
			},

			/**
			 * Таблица соответствий кодов нажимаемых на клавиатуре клавиш
			 * предполагаемым действиям с таблицей
			 */
			keymap: {
				37: 'moveLeft',
				38: 'moveUp',
				39: 'moveRight',
				40: 'moveDown',
				27: 'removeGrid',
				61: 'incAlpha',
				107: 'incAlpha',
				109: 'decAlpha'
			},

			/**
			 * Конструктор
			 */
			initialize: function() {
				this
					.addGrid()
					.bindGrid();
			},

			/**
			 * Добавляет сетку на страницу
			 */
			addGrid: function() {
				if (!this.grid) {
					var gridContainer = document.createElement('canvas');

					gridContainer.className = 'da-grid';
					documentBody.appendChild(gridContainer);

					this.grid = gridContainer;

					this.appendStyles();
				}

				return this;
			},

			/**
			 * Перерисовывает сетку
			 */
			redrawGrid: function() {
				if (this.grid) {
					//перед отрисовкой устанавливаем габариты
					this.grid.height = document.height;
					this.grid.width = document.width;

					var g = this.grid.getContext("2d");

					g.strokeStyle = "rgba(0,0,0," + this.alpha * 0.1 + ")";
					g.lineWidth = 1;
					g.clearRect(0, 0, this.grid.height, this.width);
					g.beginPath();

					for (var x = this.coords.x % this.options.stepX + 0.5; x <= this.grid.width; x += this.options.stepX) {
						g.moveTo(x, 0);
						g.lineTo(x, this.grid.height);
					}
					for (var y = this.coords.y % this.options.stepY + 0.5; y <= this.grid.height; y += this.options.stepY) {
						g.moveTo(0, y);
						g.lineTo(this.grid.width, y);
					}
					g.stroke();
				}

				return this;
			},

			/**
			 * Добавляет стили для сетки
			 */
			appendStyles: function() {
				var head = document.getElementsByTagName('head'),
					stylesElement;

				if (!this.gridStyles) {
					if (this.options.styles) {
						stylesElement = document.createElement('style');
						stylesElement.type = 'text/css';
						if (stylesElement.styleSheet) {
							stylesElement.styleSheet.cssText = this.options.styles;
						} else {
							stylesElement.appendChild(document.createTextNode(this.options.styles));
						}

						if (head && head[0]) {
							head[0].appendChild(stylesElement);
						} else {
							documentBody.write('<style type="text/css">' + this.options.styles + '</styles>');
						}
					}

					this.gridStyles = stylesElement;
				}

				return this;
			},

			/**
			 * Навешивает события на сетку
			 */
			bindGrid: function() {
				var handler = this.attach(document, 'keydown', function(event) {
					var keyCode = event.keyCode;

					$.preventDefault(event);

					if (this.keymap[keyCode] && typeof this[this.keymap[keyCode]] === 'function') {
						this[this.keymap[keyCode]]();
					}

					// Не могу разобраться почему обработчик на самом деле не детачится
					if (keyCode == 29) {
						handler.detach();
					}
				}, this);
				var x = 0, y = 0,
					listener;
				function move(event) {
					this.coords.x += event.clientX - x;
					this.coords.y += event.clientY - y;
					x = event.clientX;
					y = event.clientY;
					this.redrawGrid();
				}
				this.attach(document, 'mousedown', function(event){
					x = event.clientX;
					y = event.clientY;
					listener = $.attachEventHandler(document,'mousemove', move, this);
				},this);
				this.attach(document, 'mouseup', function(){
					listener.detach();
				},this);

				return this;
			},

			/**
			 * Удаляет сетку
			 */
			removeGrid: function() {
				// Чистим DOM и память
				this.gridStyles && this.gridStyles.parentNode.removeChild(this.gridStyles);
				this.grid && container.removeChild(this.grid);

				this.gridStyles = this.grid = null;
				
				for (var h=0; h < this.handlers.length; h++){
					this.handlers[h].detach();
				}
			},

			/**
			 * 
			 * Управление сеткой
			 * 
			 */

			// TODO: Неплохо-бы тут впихнуть работу с координатами через сеттеры

			/**
			 * Двигает сетку влево на 1 пиксель
			 */
			moveLeft: function() {
				this.coords.x--;
				this.redrawGrid();
			},

			/**
			 * Двигает сетку вправо на 1 пиксель
			 */
			moveRight: function() {
				this.coords.x++;
				this.redrawGrid();
			},

			/**
			 * Двигает сетку вверх на 1 пиксель
			 */
			moveUp: function() {
				this.coords.y--;
				this.redrawGrid();
			},

			/**
			 * Двигает сетку вниз на 1 пиксель
			 */
			moveDown: function() {
				this.coords.y++;
				this.redrawGrid();
			},
			/**
			 * Уменьшает прозрачность
			 */
			incAlpha: function() {
				this.alpha += (this.alpha < 10);
				this.redrawGrid();
			},
			/**
			 * Увеличивает прозрачность
			 */
			decAlpha: function() {
				this.alpha -= (this.alpha > 0);
				this.redrawGrid();
			}

		}

		return new Grid(container, options);

	};



	/**
	 * Наш собственный ручной "jQuery" с блекджеком и маркитантками
	 */
	var $ = function() {

		/**
		 * Применяет контекст к методу
		 * @param {!Object} obj - контекст
		 * @param {function(?Object)} method - метод
		 * @return {Object}
		 */
		var _bind = function(obj, method) {
				var newMethod = function() {
					method.apply(obj, arguments);
				};
				newMethod.unbind = method;
				return newMethod;
			},

			/**
			 * Итератор по объекту
			 * @param {!Object} obj - объект
			 * @param {function(?Object)} method - метод для итерирования
			 * @param {?Object} context - контекст выполнения итератора
			 */
			_each = function(obj, iterator, context) {
				var breaker = {};

				for (var key in obj) {
					if (hasOwnProperty.call(obj, key)) {
						if (iterator.call(context, obj[key], key, obj) === breaker) return;
					}
				}
			};

		return {

			/**
			 * Расширяет текущий объект данными объекта-источника
			 * @param {!Object} obj - источник
			 */
			extend: function(obj) {
				_each(Array.prototype.slice.call(arguments, 1), function(source) {
					for (var prop in source) {
						if (source[prop] !== void 0) obj[prop] = source[prop];
					}
				});

				return obj;
			},

			/**
			 * Навешивает событие, сохраняя контекст
			 * @param {!Object} element - элемент-источник события
			 * @param {string} eventString - имя события
			 * @param {function(?Object)} handler - обработчик события
			 * @param {?Object} - контекст выполнения обработчика
			 */
			attachEventHandler: function(element, eventString, handler, context) {
				if (typeof context != 'undefined' && context) {
					handler = _bind(context, handler);
					if (element.addEventListener) { // W3C DOM
						element.addEventListener(eventString, handler, false);
					} else if (element.attachEvent) {// IE DOM
						element.attachEvent('on' + eventString, handler);
					}
				} else {
					if (element.addEventListener) {// W3C DOM
						element.addEventListener(eventString, handler, false);
					} else if (element.attachEvent) {// IE DOM
						element.attachEvent('on' + eventString, handler);
					}
				}
				return {
					detach: function(){
						if (element.removeEventListener) {
							element.removeEventListener(eventString, handler, false);
						} else if (element.detachEvent) {
							element.detachEvent('on' + eventString, handler);
						}
						this.detach = function(){};
					}
				}
			},

			/**
			 * Предотвращает стандартное действие события
			 * @param {!Object} e - событие
			 */
			preventDefault: function(e) {
				e = e || win.event;
				if (e.preventDefault) {
					e.preventDefault();
				}
				e.returnValue = false; // IE
			},

			/**
			 * Останавливает всплытие события
			 * @param {!Object} e - событие
			 */
			stopEventPropagation: function(e) {
				e = e || win.event;

				if (e.stopPropagation) {
					e.stopPropagation();
				}
				e.cancelBubble = true; // IE
			},

		}

	}();

	// Создадим новый объект сетки
	return new Grid(documentBody, options).redrawGrid();

}(document,

	/**
	 * Объект настроек для букмарклета
	 */
	{
		// Стили для сетки
		stepX: 10,
		stepY: 15,
		styles: '.da-grid {position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999 }'
	}
));