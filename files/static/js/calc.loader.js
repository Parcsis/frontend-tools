/**
 * Загрузчик зависимых файлов для калькулятора
 *
 * Работает в трех основных режимах, определяемых параметрами в объекте _calc_options:
 *     @param (boolean) calculator - загружать/не загружать скрипты и стили калькулятора
 *     @param (boolean) proxy      - загружать/не загружать прокси-модуль
 *
 * Доступны следующие комбинации этих параметров:
 *     calculator = true  - загружаются стили и скрипты калькулятора
 *     proxy = true       - помимо калькулятора загружается модуль проксирования
 *                          запросов Backbone.sync (backbone-sync.proxy.js) через
 *                          отдельный автоматически создаваемый iframe
 *     calculator = false - загружать только прокси-модуль (по сути обертка над $.ajax)
 */
(function() {
	window.Calc || (window.Calc = {});

	var createParams = window.Calc.loadOptions || {};

	createParams.locations || (createParams.locations = {});

	var rootHost = createParams.locations.calculator || (location.protocol + '//' + location.hostname + (location.port == '' ? '' : ':' + location.port) + '/'),
		resourcesHost = createParams.locations.static || rootHost,
		jsHostName = resourcesHost + 'Content/static/js/',
		cssHostName = resourcesHost + 'Content/static/css/',
		noCache = '?no_cache=' + (+new Date()),
		jsFile = /\.js(?:\|nocache)?$/,
		cssFile = /\.css(?:\|deployment_prefix)?$/,

		/* Modernizr 2.0.6 (Custom Build) | MIT & BSD
		 * Build: http://www.modernizr.com/download/#-respond-mq-teststyles
		 */
		Modernizr = function(a,b,c){function y(a,b){return!!~(""+a).indexOf(b)}function x(a,b){return typeof a===b}function w(a,b){return v(prefixes.join(a+";")+(b||""))}function v(a){j.cssText=a}var d="2.0.6",e={},f=b.documentElement,g=b.head||b.getElementsByTagName("head")[0],h="modernizr",i=b.createElement(h),j=i.style,k,l=Object.prototype.toString,m={},n={},o={},p=[],q=function(a,c,d,e){var g,i,j,k=b.createElement("div");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),k.appendChild(j);g=["&shy;","<style>",a,"</style>"].join(""),k.id=h,k.innerHTML+=g,f.appendChild(k),i=c(k,a),k.parentNode.removeChild(k);return!!i},r=function(b){if(a.matchMedia)return matchMedia(b).matches;var c;q("@media "+b+" { #"+h+" { position: absolute; } }",function(b){c=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle).position=="absolute"});return c},s,t={}.hasOwnProperty,u;!x(t,c)&&!x(t.call,c)?u=function(a,b){return t.call(a,b)}:u=function(a,b){return b in a&&x(a.constructor.prototype[b],c)};for(var z in m)u(m,z)&&(s=z.toLowerCase(),e[s]=m[z](),p.push((e[s]?"":"no-")+s));v(""),i=k=null,e._version=d,e.mq=r,e.testStyles=q;return e}(this,this.document);

	/* Media-queries tester for Modernizr */
	(function(a,b){function u(){r(!0)}a.respond={},respond.update=function(){},respond.mediaQueriesSupported=b;if(!b){var c=a.document,d=c.documentElement,e=[],f=[],g=[],h={},i=30,j=c.getElementsByTagName("head")[0]||d,k=j.getElementsByTagName("link"),l=[],m=function(){var b=k,c=b.length,d=0,e,f,g,i;for(;d<c;d++)e=b[d],f=e.href,g=e.media,i=e.rel&&e.rel.toLowerCase()==="stylesheet",!!f&&i&&!h[f]&&(!/^([a-zA-Z]+?:(\/\/)?(www\.)?)/.test(f)||f.replace(RegExp.$1,"").split("/")[0]===a.location.host?l.push({href:f,media:g}):h[f]=!0);n()},n=function(){if(l.length){var a=l.shift();s(a.href,function(b){o(b,a.href,a.media),h[a.href]=!0,n()})}},o=function(a,b,c){var d=a.match(/@media[^\{]+\{([^\{\}]+\{[^\}\{]+\})+/gi),g=d&&d.length||0,b=b.substring(0,b.lastIndexOf("/")),h=function(a){return a.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,"$1"+b+"$2$3")},i=!g&&c,j=0,k,l,m,n,o;b.length&&(b+="/"),i&&(g=1);for(;j<g;j++){k=0,i?(l=c,f.push(h(a))):(l=d[j].match(/@media ([^\{]+)\{([\S\s]+?)$/)&&RegExp.$1,f.push(RegExp.$2&&h(RegExp.$2))),n=l.split(","),o=n.length;for(;k<o;k++)m=n[k],e.push({media:m.match(/(only\s+)?([a-zA-Z]+)(\sand)?/)&&RegExp.$2,rules:f.length-1,minw:m.match(/\(min\-width:[\s]*([\s]*[0-9]+)px[\s]*\)/)&&parseFloat(RegExp.$1),maxw:m.match(/\(max\-width:[\s]*([\s]*[0-9]+)px[\s]*\)/)&&parseFloat(RegExp.$1)})}r()},p,q,r=function(a){var b="clientWidth",h=d[b],l=c.compatMode==="CSS1Compat"&&h||c.body[b]||h,m={},n=c.createDocumentFragment(),o=k[k.length-1],s=(new Date).getTime();if(a&&p&&s-p<i)clearTimeout(q),q=setTimeout(r,i);else{p=s;for(var t in e){var u=e[t];if(!u.minw&&!u.maxw||(!u.minw||u.minw&&l>=u.minw)&&(!u.maxw||u.maxw&&l<=u.maxw))m[u.media]||(m[u.media]=[]),m[u.media].push(f[u.rules])}for(var t in g)g[t]&&g[t].parentNode===j&&j.removeChild(g[t]);for(var t in m){var v=c.createElement("style"),w=m[t].join("\n");v.type="text/css",v.media=t,v.styleSheet?v.styleSheet.cssText=w:v.appendChild(c.createTextNode(w)),n.appendChild(v),g.push(v)}j.insertBefore(n,o.nextSibling)}},s=function(a,b){var c=t();if(!!c){c.open("GET",a,!0),c.onreadystatechange=function(){c.readyState==4&&(c.status==200||c.status==304)&&b(c.responseText)};if(c.readyState==4)return;c.send()}},t=function(){var a=!1,b=[function(){return new ActiveXObject("Microsoft.XMLHTTP")},function(){return new XMLHttpRequest}],c=b.length;while(c--){try{a=b[c]()}catch(d){continue}break}return function(){return a}}();m(),respond.update=m,a.addEventListener?a.addEventListener("resize",u,!1):a.attachEvent&&a.attachEvent("onresize",u)}})(this,Modernizr.mq("only all"));

	/*yepnope1.5.0b|WTFPL*/
	(function(a,b,c){function C(a){return!a||a=="loaded"||a=="complete"||a=="uninitialized"}function D(a,c,d,g,h,j){var l=b.createElement("script"),m;g=g||B.errorTimeout,l.src=a;for(i in d)l.setAttribute(i,d[i]);c=j?F:c||k,l.onreadystatechange=l.onload=function(){!m&&C(l.readyState)&&(m=1,c(),l.onload=l.onreadystatechange=null)},e(function(){m||(m=1,c(1))},g),h?l.onload():f.parentNode.insertBefore(l,f)}function E(a,c,d,g,h,i){var j=b.createElement("link"),l,m;g=g||B.errorTimeout,c=i?F:c||k,j.href=a,j.rel="stylesheet",j.type="text/css";for(m in d)j.setAttribute(m,d[m]);h||(f.parentNode.insertBefore(j,f),e(c,0))}function F(){var a=h.shift();j=1,a?a.t?e(function(){(a.t=="c"?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),F()):j=0}function G(a,c,d,g,i,k,l){function s(b){if(!p&&C(o.readyState)){r.r=p=1,!j&&F(),o.onload=o.onreadystatechange=null;if(b){a=="object"&&e(function(){n.removeChild(o)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}}l=l||B.errorTimeout;var o={},p=0,q=0,r={t:d,s:c,e:i,a:k,x:l};y[c]===1&&(q=1,y[c]=[],o=b.createElement(a)),o.src=o.data=c,o.width=o.height="0",o.onerror=o.onload=o.onreadystatechange=function(){s.call(this,q)},h.splice(g,0,r),a=="object"&&(q||y[c]===2?(n.insertBefore(o,m?null:f),e(s,l)):y[c].push(o))}function H(a,b,c,d,e){return j=0,b=b||"j",v(a)?G(b=="c"?s:r,a,b,this.i++,c,d,e):(h.splice(this.i++,0,a),h.length==1&&F()),this}function I(){var a=B;return a.loader={load:H,i:0},a}var d=b.documentElement,e=a.setTimeout,f=b.getElementsByTagName("script")[0],g={}.toString,h=[],j=0,k=function(){},l="MozAppearance"in d.style,m=l&&!!b.createRange().compareNode,n=m?d:f.parentNode,o=a.opera&&g.call(a.opera)=="[object Opera]",p=!!b.attachEvent,q="webkitAppearance"in d.style,r=l?"object":"img",s=p?"script":r,t=Array.isArray||function(a){return g.call(a)=="[object Array]"},u=function(a){return Object(a)===a},v=function(a){return typeof a=="string"},w=function(a){return g.call(a)=="[object Function]"},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function f(a){var b=a.split("!"),c=x.length,d=b.pop(),e=b.length,f={url:d,origUrl:d,prefixes:b},g,h,i;for(h=0;h<e;h++)i=b[h].split("="),g=z[i.shift()],g&&(f=g(f,i));for(h=0;h<c;h++)f=x[h](f);return f}function g(a){return a.split(".").pop().split("?").shift()}function h(a,b,d,e,h){var i=f(a),j=i.autoCallback,k=g(i.url);if(i.bypass)return;b&&(b=w(b)?b:b[a]||b[e]||b[a.split("/").pop().split("?")[0]]||F);if(i.instead)return i.instead(a,b,d,e,h);y[i.url]?i.noexec=!0:y[i.url]=1,d.load(i.url,i.forceCSS||!i.forceJS&&"css"==g(i.url)?"c":c,i.noexec,i.attrs,i.timeout),(w(b)||w(j))&&d.load(function(){I(),b&&b(i.origUrl,h,e),j&&j(i.origUrl,h,e),y[i.url]=2})}function i(a,b){function m(a,d){if(!a)!d&&i();else if(v(a))d||(f=function(){var a=[].slice.call(arguments);g.apply(this,a),i()}),h(a,f,b,0,c);else if(u(a)){j=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}();for(l in a)a.hasOwnProperty(l)&&(!d&&!--j&&(w(f)?f=function(){var a=[].slice.call(arguments);g.apply(this,a),i()}:f[l]=function(a){return function(){var b=[].slice.call(arguments);a.apply(this,b),i()}}(g[l])),h(a[l],f,b,l,c))}}var c=!!a.test,d=c?a.yep:a.nope,e=a.load||a.both,f=a.callback||k,g=f,i=a.complete||k,j,l;m(d,!!e),e&&m(e)}var b,d,e=this.yepnope.loader;if(v(a))h(a,0,e,0);else if(t(a))for(b=0;b<a.length;b++)d=a[b],v(d)?h(d,0,e,0):t(d)?B(d):u(d)&&i(d,e);else u(a)&&i(a,e)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,b.readyState==null&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=I(),a.yepnope.executeStack=F,a.yepnope.injectJs=D,a.yepnope.injectCss=E})(this,this.document);

	/* Yepnope IE detection prefix */
	(function(i){var f={}.hasOwnProperty,g;g=typeof f!=="undefined"&&typeof f.call!=="undefined"?function(a,b){return f.call(a,b)}:function(a,b){return b in a&&typeof a.constructor.prototype[b]==="undefined"};var a=function(){for(var a=3,b=document.createElement("div"),c=b.getElementsByTagName("i");b.innerHTML="<\!--[if gt IE "+ ++a+"]><i></i><![endif]--\>",c[0];);return a>4?a:void 0}(),d={ie:!!a,ie5:a===5,ie6:a===6,ie7:a===7,ie8:a===8,ie9:a===9,iegt5:a>5,iegt6:a>6,iegt7:a>7,iegt8:a>8,ielt7:a<7,ielt8:a<
	8,ielt9:a<9},h;for(h in d)g(d,h)&&i.addPrefix(h,function(a){var b;a:{b=a.prefixes;var c,e;for(e=0;e<b.length;e++)if(c=b[e],g(d,c)&&d[c]){b=true;break a}b=false}if(!b)a.bypass=true;return a})})(yepnope);

	var resources = {
		// Ресурсы, загружаемые при обычном сценарии
		// (createParams.calculator == true)
		Calculator: {
			// Блок загрузки стилей калькулятора
			content_css: [
				{
					load: [
						'main.css|deployment_prefix',
						'ie!main_ie.css|deployment_prefix',
						'lib/global.css'
					]
				},
				{
					test: Modernizr.mq('only screen and (max-device-width: 1024px)'),
					yep: 'ipad.css'
				}
			],

			// Блок загрузки js файлов калькулятора
			main: [
				// Стили необходимые для начального отображаения калькулятора
				{
					load: [
						'preload.css|deployment_prefix',
						'ie!preload_ie.css|deployment_prefix'
					]
				},
				{
					test: window.JSON,
					nope: 'libs/json2.js'
				},
				{
					test: Object.keys,
					nope: 'libs/es5-shim.min.js'
				},
				{
					test: window.Modernizr,
					nope: 'libs/modernizr.min.js'
				},
				{
					test: window.$,
					nope: 'libs/jquery-1.6.4.min.js'
				},

				// Загрузка оставшихся библиотек
				{
					load: [
						'libs/jquery.validate.min.js',
						'libs/jquery.maskedinput-1.3.min.custom.js',
						'libs/jquery.mousewheel.js',
						'libs/jquery.scrollpane.js',
						'libs/jquery.autocomplete.custom.js',
						'libs/ui.core.js',
						'libs/ui.slider.custom.js',
						'libs/ui.datepicker.js',
						'libs/ui.datepicker-ru.js',
						'libs/mouse_input.js',
						'libs/underscore-min.js',
						'libs/backbone-min.js'
					]
				},

				// Если мы работаем через iframe proxy, то подключаем специальный модуль backbone.sync
				{
					test: createParams.proxy,
					yep: 'libs/extensions/backbone-sync.proxy.js'
				},

				// Проверяем что мы работаем через iframe proxy и библиотека easyXDM еще не загружена
				{
					test: createParams.proxy && !window.easyXDM,
					yep: 'libs/xdomain/easyXDM.min.js'
				},
				{
					load: [
						// Core Section
						'config.js',
						'core.js',
						'app.js',
						'calc.js',

						// Routers Section
						'routes/workspace.js',

						// Models Section
						'models/policy.js',
						'models/calculator.js',
						'models/popup.js',
						'models/pages.js',
						'models/page.js',
						'models/calculation.js',

						// Collections Section
						'collections/pages.js',
						'collections/last_calculations.js',

						// Views Section
						'views/workspace.js',
						'views/text_popup.js',
						'views/popup.js',
						'views/input_notification.js',
						'views/select.js',
						'views/calculator.js',
						'views/options.js',
						'views/order_panel.js',
						'views/confirmation.js',
						'views/questionnaire.js',
						'views/slider.js',
						'views/drivers.js',
						'views/last_calculations.js',
						'views/hint.js',
						'views/notification_panel.js'
					],
					complete: function() {
						var initCalculator = function(withProxy) {
								var init = function() {
										// Собираем параметры необходимые для инициализации во едино
										$.extend(window.Calc, {
											// Перед инициализацией удаляем все содержимое контейнера
											container: $(createParams.containerSelector || '.l-wrapper').empty(),
											heartbeatTimout: createParams.heartbeatTimout, // Время в минутах
											debugMode: createParams.debugMode,
											offlineErrors: createParams.offlineErrors,
											customErrorNotifier: createParams.customErrorNotifier, // Кастомный нотификатор ошибок
											rootHost: rootHost
										});

										// Инициализируем каклькулятор
										window.Calc.init({
											CreateParams: createParams,
											Policy: {
												createParams: {
													calc_id: createParams.calc_id,
													facetype: createParams.faceType,
													siebel_id: createParams.siebel_id,
													operator_id: createParams.operator_id,
													ola_id: createParams.ola_id,
													from: createParams.from
												}
											}
										});
									}

								if (withProxy) {
									// Получаем шаблоны необходимые для работы из iframe proxy и вставляем их в body, после 
									// чего инициализируем калькулятор
									Proxy.getTemplates(function(teplates) {
										$('body').append(teplates.html);
										init();
									});
								} else {
									init();
								}
							},
							initRpc = function() {
								// Проверяем готова ли библиотека для работы если нет, то ждем 500мс и пробуем снова
								if (window.easyXDM) {
									window.Proxy = new window.easyXDM.Rpc({
										remote: rootHost + '?' + $.param(iframeParams),
										onReady: function() {
											initCalculator(true);
										}
									}, {
										remote: {
											Request: {},
											getTemplates: {}
										}
									});
								} else {
									setTimeout(initRpc, 500);
								}
							},
							iframeParams = {
								faceType: createParams.faceType,
								calculator: false,
								proxy: true
							};

						// Инициализируемся в соответствии со сценарием
						if (createParams.proxy) {
							initRpc();
						} else if (createParams.calculator) {
							initCalculator();
						}
					}
				}
			]
		},

		// Ресурсы, загружаемые для проксированного калькулятора
		// (createParams.calculator == false и createParams.proxy == true)
		Proxy: [
			{
				test: window.JSON,
				nope: 'libs/json2.js',
				load: [
					'libs/jquery-1.6.4.min.js',
					'libs/xdomain/easyXDM.min.js',
					'proxy.js|nocache'
				]
			}
		]
	};

	// Новый фильтр для yepnope, добавляющий абсолютный путь к каталогам
	// ресурсов (css или js)
	yepnope.addFilter(function(resourceObj) {
		// Допишем адрес хоста
		if (jsFile.test(resourceObj.url)) {
			resourceObj.url = jsHostName + resourceObj.url.replace('|nocache', noCache);
		} else if (cssFile.test(resourceObj.url)) {
			resourceObj.url = cssHostName + (/\|deployment_prefix/.test(resourceObj.url) ? (createParams.useDebugCSS ? 'debug_' : 'production_') : '') + resourceObj.url.replace('|deployment_prefix', '');
		}
		return resourceObj;
	});

	// Стартуем загрузку файлов
	if (createParams.calculator) {
		// Если загружаем сам калькулятор то пускаем загрузку стилей и js паралельно чтоб они не влияли
		// на загрузку друг друга
		yepnope(resources.Calculator.main);
		yepnope(resources.Calculator.content_css);
	} else {
		yepnope(resources.Proxy);
	}
})();
