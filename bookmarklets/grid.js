/**
 * Позволяет добавлять на любую страницу нашу сетку 10x10 пикселей (квадратами
 * по 100 пикселей). Сетка управляемая, можно её двигать и всячески настраивать.
 * 
 * Добавляется на страницу с помощью вот такой ссылки
 * javascript:(function(){_my_script=document.createElement('SCRIPT');_my_script.type='text/javascript';_my_script.src='https://github.com/Parcsis/frontend-tools/raw/master/bookmarklets/grid.js';document.getElementsByTagName('head')[0].appendChild(_my_script);})();void%200;
 */
;(function(document, options) {
//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

var Zepto = (function() {
  var undefined, key, $$, classList, emptyArray = [], slice = emptyArray.slice,
    document = window.document,
    elementDisplay = {}, classCache = {},
    getComputedStyle = document.defaultView.getComputedStyle,
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+)[^>]*>/,
    elementTypes = [1, 9, 11],
    adjacencyOperators = ['prepend', 'after', 'before', 'append'],
    reverseAdjacencyOperators = ['append', 'prepend'],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    };

  function isF(value) { return ({}).toString.call(value) == "[object Function]" }
  function isO(value) { return value instanceof Object }
  function isA(value) { return value instanceof Array }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return array.filter(function(item){ return item !== undefined && item !== null }) }
  function flatten(array) { return array.length > 0 ? [].concat.apply([], array) : array }
  function camelize(str)  { return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str){
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase();
  }
  function uniq(array)    { return array.filter(function(item,index,array){ return array.indexOf(item) == index }) }

  function classRE(name){
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
  }

  function maybeAddPx(name, value) { return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value; }

  function defaultDisplay(nodeName) {
    var element, display;
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName);
      document.body.appendChild(element);
      display = getComputedStyle(element, '').getPropertyValue("display");
      element.parentNode.removeChild(element);
      display == "none" && (display = "block");
      elementDisplay[nodeName] = display;
    }
    return elementDisplay[nodeName];
  }

  function fragment(html, name) {
    if (name === undefined) fragmentRE.test(html) && RegExp.$1;
    if (!(name in containers)) name = '*';
    var container = containers[name];
    container.innerHTML = '' + html;
    return slice.call(container.childNodes);
  }

  function Z(dom, selector){
    dom = dom || emptyArray;
    dom.__proto__ = Z.prototype;
    dom.selector = selector || '';
    return dom;
  }

  function $(selector, context){
    if (!selector) return Z();
    if (context !== undefined) return $(context).find(selector);
    else if (isF(selector)) return $(document).ready(selector);
    else if (selector instanceof Z) return selector;
    else {
      var dom;
      if (isA(selector)) dom = compact(selector);
      else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
        dom = [selector], selector = null;
      else if (fragmentRE.test(selector))
        dom = fragment(selector.trim(), RegExp.$1), selector = null;
      else if (selector.nodeType && selector.nodeType == 3) dom = [selector];
      else dom = $$(document, selector);
      return Z(dom, selector);
    }
  }

  $.extend = function(target){
    slice.call(arguments, 1).forEach(function(source) {
      for (key in source) target[key] = source[key];
    })
    return target;
  }
  $.qsa = $$ = function(element, selector){ return slice.call(element.querySelectorAll(selector)) }

  function filtered(nodes, selector){
    return selector === undefined ? $(nodes) : $(nodes).filter(selector);
  }

  function funcArg(context, arg, idx, payload){
   return isF(arg) ? arg.call(context, idx, payload) : arg;
  }

  $.isFunction = isF;
  $.isObject = isO;
  $.isArray = isA;

  $.map = function(elements, callback) {
    var value, values = [], i, key;
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i);
        if (value != null) values.push(value);
      }
    else
      for (key in elements) {
        value = callback(elements[key], key);
        if (value != null) values.push(value);
      }
    return flatten(values);
  }

  $.each = function(elements, callback) {
    var i, key;
    if (likeArray(elements))
      for(i = 0; i < elements.length; i++) {
        if(callback(i, elements[i]) === false) return elements;
      }
    else
      for(key in elements) {
        if(callback(key, elements[key]) === false) return elements;
      }
    return elements;
  }

  $.fn = {
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,
    map: function(fn){
      return $.map(this, function(el, i){ return fn.call(el, i, el) });
    },
    slice: function(){
      return $(slice.apply(this, arguments));
    },
    ready: function(callback){
      if (document.readyState == 'complete' || document.readyState == 'loaded') callback();
      document.addEventListener('DOMContentLoaded', callback, false);
      return this;
    },
    get: function(idx){ return idx === undefined ? this : this[idx] },
    size: function(){ return this.length },
    remove: function () {
      return this.each(function () {
        if (this.parentNode != null) {
          this.parentNode.removeChild(this);
        }
      });
    },
    each: function(callback){
      this.forEach(function(el, idx){ callback.call(el, idx, el) });
      return this;
    },
    filter: function(selector){
      return $([].filter.call(this, function(element){
        return element.parentNode && $$(element.parentNode, selector).indexOf(element) >= 0;
      }));
    },
    end: function(){
      return this.prevObject || $();
    },
    add:function(selector,context){
      return $(uniq(this.concat($(selector,context))));
    },
    is: function(selector){
      return this.length > 0 && $(this[0]).filter(selector).length > 0;
    },
    not: function(selector){
      var nodes=[];
      if (isF(selector) && selector.call !== undefined)
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this);
        });
      else {
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isF(selector.item)) ? slice.call(selector) : $(selector);
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el);
        });
      }
      return $(nodes);
    },
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1);
    },
    first: function(){ return $(this[0]) },
    last: function(){ return $(this[this.length - 1]) },
    find: function(selector){
      var result;
      if (this.length == 1) result = $$(this[0], selector);
      else result = this.map(function(){ return $$(this, selector) });
      return $(result);
    },
    closest: function(selector, context){
      var node = this[0], nodes = $$(context !== undefined ? context : document, selector);
      if (nodes.length === 0) node = null;
      while(node && node !== document && nodes.indexOf(node) < 0) node = node.parentNode;
      return $(node !== document && node);
    },
    parents: function(selector){
      var ancestors = [], nodes = this;
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
          if ((node = node.parentNode) && node !== document && ancestors.indexOf(node) < 0) {
            ancestors.push(node);
            return node;
          }
        });
      return filtered(ancestors, selector);
    },
    parent: function(selector){
      return filtered(uniq(this.pluck('parentNode')), selector);
    },
    children: function(selector){
      return filtered(this.map(function(){ return slice.call(this.children) }), selector);
    },
    siblings: function(selector){
      return filtered(this.map(function(i, el){
        return slice.call(el.parentNode.children).filter(function(child){ return child!==el });
      }), selector);
    },
    empty: function(){ return this.each(function(){ this.innerHTML = '' }) },
    pluck: function(property){ return this.map(function(){ return this[property] }) },
    show: function(){
      return this.each(function() {
        this.style.display == "none" && (this.style.display = null);
        if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
          this.style.display = defaultDisplay(this.nodeName)
        }
      })
    },
    replaceWith: function(newContent) {
      return this.each(function() {
        var par=this.parentNode,next=this.nextSibling;
        $(this).remove();
        next ? $(next).before(newContent) : $(par).append(newContent);
      });
    },
    wrap: function(newContent) {
      return this.each(function() {
        $(this).wrapAll($(newContent)[0].cloneNode(false));
      });
    },
    wrapAll: function(newContent) {
      if (this[0]) {
        $(this[0]).before(newContent = $(newContent));
        newContent.append(this);
      }
      return this;
    },
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children());
      });
      return this;
    },
    hide: function(){
      return this.css("display", "none")
    },
    toggle: function(setting){
      return (setting === undefined ? this.css("display") == "none" : setting) ? this.show() : this.hide();
    },
    prev: function(){ return $(this.pluck('previousElementSibling')) },
    next: function(){ return $(this.pluck('nextElementSibling')) },
    html: function(html){
      return html === undefined ?
        (this.length > 0 ? this[0].innerHTML : null) :
        this.each(function (idx) {
          var originHtml = this.innerHTML;
          $(this).empty().append( funcArg(this, html, idx, originHtml) );
        });
    },
    text: function(text){
      return text === undefined ?
        (this.length > 0 ? this[0].textContent : null) :
        this.each(function(){ this.textContent = text });
    },
    attr: function(name, value){
      return (typeof name == 'string' && value === undefined) ?
        (this.length > 0 && this[0].nodeName == 'INPUT' && this[0].type == 'text' && name == 'value') ? (this.val()) :
        (this.length > 0 ? this[0].getAttribute(name) || (name in this[0] ? this[0][name] : undefined) : undefined) :
        this.each(function(idx){
          if (isO(name)) for (key in name) this.setAttribute(key, name[key])
          else this.setAttribute(name, funcArg(this, value, idx, this.getAttribute(name)));
        });
    },
    removeAttr: function(name) {
      return this.each(function() { this.removeAttribute(name); });
    },
    data: function(name, value){
      return this.attr('data-' + name, value);
    },
    val: function(value){
      return (value === undefined) ?
        (this.length > 0 ? this[0].value : null) :
        this.each(function(){
          this.value = value;
        });
    },
    offset: function(){
      if(this.length==0) return null;
      var obj = this[0].getBoundingClientRect();
      return {
        left: obj.left + document.body.scrollLeft,
        top: obj.top + document.body.scrollTop,
        width: obj.width,
        height: obj.height
      };
    },
    css: function(property, value){
      if (value === undefined && typeof property == 'string')
        return this[0].style[camelize(property)] || getComputedStyle(this[0], '').getPropertyValue(property);
      var css = '';
      for (key in property) css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
      if (typeof property == 'string') css = dasherize(property) + ":" + maybeAddPx(property, value);
      return this.each(function() { this.style.cssText += ';' + css });
    },
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0]);
    },
    hasClass: function(name){
      if (this.length < 1) return false;
      else return classRE(name).test(this[0].className);
    },
    addClass: function(name){
      return this.each(function(idx) {
        classList = [];
        var cls = this.className, newName = funcArg(this, name, idx, cls);
        newName.split(/\s+/g).forEach(function(klass) {
          if (!$(this).hasClass(klass)) {
            classList.push(klass)
          }
        }, this);
        classList.length && (this.className += (cls ? " " : "") + classList.join(" "))
      });
    },
    removeClass: function(name){
      return this.each(function(idx) {
        if(name === undefined)
          return this.className = '';
        classList = this.className;
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass) {
          classList = classList.replace(classRE(klass), " ")
        });
        this.className = classList.trim()
      });
    },
    toggleClass: function(name, when){
      return this.each(function(idx){
       var cls = this.className, newName = funcArg(this, name, idx, cls);
       ((when !== undefined && !when) || $(this).hasClass(newName)) ?
         $(this).removeClass(newName) : $(this).addClass(newName)
      });
    }
  };

  'filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings'.split(',').forEach(function(property){
    var fn = $.fn[property];
    $.fn[property] = function() {
      var ret = fn.apply(this, arguments);
      ret.prevObject = this;
      return ret;
    }
  });

  ['width', 'height'].forEach(function(property){
    $.fn[property] = function(value) {
      var offset;
      if (value === undefined) { return (offset = this.offset()) && offset[property] }
      else return this.css(property, value);
    }
  });

  function insert(operator, target, node) {
    var parent = (!operator || operator == 3) ? target : target.parentNode;
    parent.insertBefore(node,
      !operator ? parent.firstChild :         // prepend
      operator == 1 ? target.nextSibling :    // after
      operator == 2 ? target :                // before
      null);                                  // append
  }

  function traverseNode (node, fun) {
    fun(node);
    for (key in node.childNodes) {
      traverseNode(node.childNodes[key], fun);
    }
  }

  adjacencyOperators.forEach(function(key, operator) {
    $.fn[key] = function(html){
      var nodes = typeof(html) == 'object' ? html : fragment(html);
      if (!('length' in nodes)) nodes = [nodes];
      if (nodes.length < 1) return this;
      var size = this.length, copyByClone = size > 1, inReverse = operator < 2;

      return this.each(function(index, target){
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[inReverse ? nodes.length-i-1 : i];
          traverseNode(node, function (node) {
            if (node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT') {
              window['eval'].call(window, node.innerHTML);
            }
          });
          if (copyByClone && index < size - 1) node = node.cloneNode(true);
          insert(operator, target, node);
        }
      });
    };
  });

  reverseAdjacencyOperators.forEach(function(key) {
    $.fn[key+'To'] = function(html){
      if (typeof(html) != 'object') html = $(html);
      html[key](this);
      return this;
    };
  });

  Z.prototype = $.fn;

  return $;
})();


//     Zepto.js
//     (c) 2010, 2011 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function($){
  var $$ = $.qsa, handlers = {}, _zid = 1;
  function zid(element) {
    return element._zid || (element._zid = _zid++);
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event);
    if (event.ns) var matcher = matcherFor(event.ns);
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || handler.fn == fn)
        && (!selector || handler.sel == selector);
    });
  }
  function parse(event) {
    var parts = ('' + event).split('.');
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
  }

  function add(element, events, fn, selector, delegate){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []));
    events.split(/\s/).forEach(function(event){
      var callback = delegate || fn;
      var proxyfn = function (event) {
        var result = callback.apply(element, [event].concat(event.data));
        if (result === false) {
          event.preventDefault();
        }
        return result;
      };
      var handler = $.extend(parse(event), {fn: fn, proxy: proxyfn, sel: selector, del: delegate, i: set.length});
      set.push(handler);
      element.addEventListener(handler.e, proxyfn, false);
    });
  }
  function remove(element, events, fn, selector){
    var id = zid(element);
    (events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){
        delete handlers[id][handler.i];
        element.removeEventListener(handler.e, handler.proxy, false);
      });
    });
  }

  $.event = { add: add, remove: remove }

  $.fn.bind = function(event, callback){
    return this.each(function(){
      add(this, event, callback);
    });
  };
  $.fn.unbind = function(event, callback){
    return this.each(function(){
      remove(this, event, callback);
    });
  };
  $.fn.one = function(event, callback){
    return this.each(function(){
      var self = this;
      add(this, event, function wrapper(evt){
        callback.call(self, evt);
        remove(self, event, arguments.callee);
      });
    });
  };

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      };
  function createProxy(event) {
    var proxy = $.extend({originalEvent: event}, event);
    $.each(eventMethods, function(name, predicate) {
      proxy[name] = function(){
        this[predicate] = returnTrue;
        return event[name].apply(event, arguments);
      };
      proxy[predicate] = returnFalse;
    })
    return proxy;
  }

  $.fn.delegate = function(selector, event, callback){
    return this.each(function(i, element){
      add(element, event, callback, selector, function(e, data){
        var target = e.target, nodes = $$(element, selector);
        while (target && nodes.indexOf(target) < 0) target = target.parentNode;
        if (target && !(target === element) && !(target === document)) {
          callback.call(target, $.extend(createProxy(e), {
            currentTarget: target, liveFired: element
          }), data);
        }
      });
    });
  };
  $.fn.undelegate = function(selector, event, callback){
    return this.each(function(){
      remove(this, event, callback, selector);
    });
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback);
    return this;
  };
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback);
    return this;
  };

  $.fn.trigger = function(event, data){
    if (typeof event == 'string') event = $.Event(event);
    event.data = data;
    return this.each(function(){ this.dispatchEvent(event) });
  };

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, data){
    var e, result;
    this.each(function(i, element){
      e = createProxy(typeof event == 'string' ? $.Event(event) : event);
      e.data = data; e.target = element;
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e);
        if (e.isImmediatePropagationStopped()) return false;
      });
    });
    return result;
  };

  // shortcut methods for `.bind(event, fn)` for each event type
  ('focusin focusout load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback){ return this.bind(event, callback) };
  });

  ['focus', 'blur'].forEach(function(name) {
    $.fn[name] = function(callback) {
      if (callback) this.bind(name, callback);
      else if (this.length) try { this.get(0)[name]() } catch(e){};
      return this;
    };
  });

  $.Event = function(type, props) {
    var event = document.createEvent('Events');
    if (props) $.extend(event, props);
    event.initEvent(type, !(props && props.bubbles === false), true);
    return event;
  };

})(Zepto);

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
				var doc = $(document), self = this,
					x = 0, y = 0,
					listener;
				doc.bind('keydown', function(event) {
					var keyCode = event.keyCode;

					//$.preventDefault(event);

					if (self.keymap[keyCode] && typeof self[self.keymap[keyCode]] === 'function') {
						self[self.keymap[keyCode]]();
					}

					// Не могу разобраться почему обработчик на самом деле не детачится
					if (keyCode == 29) {
						doc.unbind('keydown');
					}
					return false;
				});
				function move(event) {
					self.coords.x += event.clientX - x;
					self.coords.y += event.clientY - y;
					x = event.clientX;
					y = event.clientY;
					self.redrawGrid();
				}
				doc.bind('mousedown', function(event){
					x = event.clientX;
					y = event.clientY;
					doc.bind('mousemove', move);
				});
				doc.bind('mouseup', function(){
					doc.unbind('mousemove', move);
				});
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
	var $ = Zepto;

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