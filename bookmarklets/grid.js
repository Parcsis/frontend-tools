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
	 * подключаем canvas для IE
	 */
	var script = document.createElement('script');
	script.setAttribute('src', '../../../excanvas/excanvas.js');
	documentBody.appendChild(script);

	var preventDefault = function(e) {
		e = e || win.event;
		if (e.preventDefault) {
			e.preventDefault();
		}
		e.returnValue = false; // IE
	}
	/**
	 * Объект сетки
	 */
	var Grid = function(container, options) {
		var Listener = function(element, event, callback, context) {
			var _bind = function(fn, obj){
				return function(){
					fn.apply(obj, arguments);
				}
			}
			if (typeof context != 'undefined' && context) {
				callback = _bind(callback, context);
			} 
			if (element.addEventListener) {// W3C DOM
				element.addEventListener(event, callback, false);
			} else if (element.attachEvent) {// IE DOM
				element.attachEvent('on' + event, callback);
			}

			this.detach = function(){	
				if (element.removeEventListener) {
					element.removeEventListener(event, callback, false);
				} else if (element.detachEvent) {
					element.detachEvent('on' + event, callback);
				}
			this.detach = function(){}
			}
		}

		var Grid = function(container, options) {
			this.listeners=[];//список обработчиков которые надо удалить при очистке
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
			
			this.addGrid().bindGrid().redrawGrid();
		};

		Grid.prototype = {

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
					this.grid.height = window.innerHeight;
					this.grid.width = window.innerWidth;
					
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
				var self = this, pushed,
					x = 0, y = 0,
					listener;
				this.listeners.push(new Listener(document, 'keydown', function(event) {
					var keyCode = event.keyCode;

					preventDefault(event);

					if (self.keymap[keyCode] && typeof self[self.keymap[keyCode]] === 'function') {
						self[self.keymap[keyCode]]();
					}

					// Не могу разобраться почему обработчик на самом деле не детачится
					if (keyCode == 29) {
						doc.unbind('keydown');
					}
					return false;
				}));
				this.listeners.push(new Listener(document,'mousemove', function(event) {
					if(pushed){
						self.coords.x += event.clientX - x;
						self.coords.y += event.clientY - y;
						x = event.clientX;
						y = event.clientY;
						self.redrawGrid();
					}
				}));
				this.listeners.push(new Listener(document, 'mousedown', function(event){
					x = event.clientX;
					y = event.clientY;
					pushed = true;
				}));
				this.listeners.push(new Listener(document, 'mouseup', function(){
					pushed = false;
				}));
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

				//убераем обработчики
				while(this.listeners.length){
					this.listeners.pop().detach();
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

	return new Grid(documentBody, options);

}(document,

	/**
	 * Объект настроек для букмарклета
	 */
	{
		stepX: 10,
		stepY: 10,
		styles: '.da-grid {position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999; cursor:move}'
	}
));