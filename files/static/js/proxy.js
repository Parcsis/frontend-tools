/**
 * Прокси-модуль для калькулятора
 */
(function() {
	var initRpc = function() {
			// Проверяем готова ли библиотека для работы если нет, то ждем 500мс и пробуем снова
			if (window.easyXDM) {
				new easyXDM.Rpc({}, {
					local: {
						Request: function(params, complete, error) {
							params.complete = function(xhr, textStatus) {
								xhr.textStatus = textStatus;
								complete.apply(this, arguments);
							};
							params.error = error || function() {};
							$.ajax(params || {});
						},
						getTemplates: function() {
							var container = $('<div>'),
								templates = $('script', document.body).appendTo(container);

							return {
								html: container.html()
							}
						}
					}
				});
			} else {
				setTimeout(initRpc, 500);
			}
		};

	initRpc();
})();