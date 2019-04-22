/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _Chat = __webpack_require__(2);

	var _Chat2 = _interopRequireDefault(_Chat);

	var _Socials = __webpack_require__(9);

	var _Socials2 = _interopRequireDefault(_Socials);

	var _ajax = __webpack_require__(4);

	var _styles = __webpack_require__(10);

	var _pageVisibility = __webpack_require__(11);

	var _pageVisibility2 = _interopRequireDefault(_pageVisibility);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Время (в миллисекундах), при котором считается, что пользователь еще активен на сайте
	 * @constant
	 * @type {Number}
	 */
	var ACTIVE_PERIOD = 1 * 60 * 1000;

	/**
	 * Задержка (в миллисекундах) с момента загрузки страницы сайта до отрисовки социальных кнопок и чата
	 * @constant
	 * @type {Number}
	 */
	var SHOW_BTN_DELAY = 2000;

	/**
	 * Экземпляр класса 'Онлайн-чат'
	 */
	var chat = void 0;

	/**
	 * Экземпляр класса 'Социальные сети'
	 */
	var socials = void 0;

	/**
	 * Индекс выбранной страницы сайта
	 * @type {Number}
	 */
	var lastTabIndex = void 0;

	/**
	 * Времена (в секундах), через которые необходимо автоматически открывать чат
	 * @type {Array}
	 */
	var showTimes = [];

	/**
	 * Получение настроек для сервиса (и для социальных кнопок, и для чата)
	 */
	function _getSettings() {
	  var params = { 'action': 'settings' };
	  (0, _ajax.get)(params, function (response) {
	    var socialsSettings = response.channels;
	    var colorSettings = response.colors;
	    var chatSettings = response.chat;

	    // Если настройки для чата получены
	    if (chatSettings) {
	      showTimes.push(chatSettings.timeShow1, chatSettings.timeShow2, chatSettings.timeShow3);
	      chat = new _Chat2.default(response.chat.header, response.chat.welcome, response.timeout, showTimes);
	      (0, _styles.setChatStyles)(colorSettings);
	      setTimeout(function () {
	        _activatePage();
	      }, SHOW_BTN_DELAY);
	    }

	    // Если пришли настройки хотя бы для одной социальной кнопки
	    if (socialsSettings.length > 0) {
	      // Инициализация социальных кнопок
	      socials = new _Socials2.default();
	      (0, _styles.setIconStyles)(colorSettings);
	      if (!document.querySelector('.socials')) {
	        socials.renderContainer();
	      }

	      // Отрисовка социальных кнопок
	      setTimeout(function () {
	        socialsSettings.forEach(function (item) {
	          switch (item.channel) {
	            case 3:
	              socials.renderTl(item.id);
	              break;
	            case 4:
	              socials.renderFb(item.id);
	              break;
	            case 5:
	              socials.renderVk(item.id);
	              break;
	            // case 6:
	            //   socials.renderVb(item.id);
	            //   break;
	          }
	        });
	        socials.showSocials();
	      }, SHOW_BTN_DELAY);
	    }
	  });
	}

	/**
	 * Активация страницы
	 */
	function _activatePage() {
	  // Если чат не инициализирован (чат отключен)
	  if (!chat) {
	    return;
	  }

	  // Обновление индекса для выбранной страницы браузера
	  lastTabIndex = +localStorage.getItem('nrx-tabIndex') + 1;
	  localStorage.setItem('nrx-tabIndex', lastTabIndex);

	  // Обновление расписания автооткрытия чата
	  if (Date.now() - +localStorage.getItem('nrx-lastGetMessageRequest') > ACTIVE_PERIOD) {
	    // Активность на сайте не проявляется, поэтому перезапускаем автооткрытие чата с начала
	    localStorage.setItem('nrx-currentAutoOpenTimeIndex', '0');
	  }

	  // Активация чата
	  chat.activateChat();
	}

	/**
	 * Обработчик события изменения значения в localStorage
	 */
	function _onStorageChange(event) {
	  if (event.key === 'nrx-tabIndex') {
	    if (lastTabIndex !== +localStorage.getItem('nrx-tabIndex')) {
	      chat.deactivateChat();
	    }
	  }
	}

	/**
	 * Обработчик события загрузки страницы
	 */
	function _onPageIsLoaded() {
	  lastTabIndex = +localStorage.getItem('nrx-tabIndex');
	  window.addEventListener('storage', _onStorageChange);
	  _pageVisibility2.default.onVisible(_activatePage);
	  _getSettings();
	}

	// Навешивание обработчиков событий
	window.addEventListener('load', _onPageIsLoaded);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _Dialog = __webpack_require__(3);

	var _Dialog2 = _interopRequireDefault(_Dialog);

	var _Contacts = __webpack_require__(7);

	var _Contacts2 = _interopRequireDefault(_Contacts);

	var _ajax = __webpack_require__(4);

	var _messages = __webpack_require__(5);

	var _utils = __webpack_require__(6);

	var _audio = __webpack_require__(8);

	var _audio2 = _interopRequireDefault(_audio);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = Chat;


	/**
	 * URL-адрес компании-разработчика чата
	 * @constant
	 * @type {String}
	 */
	var COPYRIGHT_URL = 'https://nirax.ru/products/online';

	/**
	 * Время анимации скрытия окна чата (в миллисекундах)
	 * @constant
	 * @type {Number}
	 */
	var CLOSE_CHAT_ANIMATE_DELAY = 1000;

	/**
	 * Время (в миллисекундах) задержки анимации открытия окна чата
	 * @constant
	 * @type {Number}
	 */
	var OPEN_CHAT_DELAY = 900;

	/**
	 * Время опроса сервера на наличие новых вх. сообщений
	 * @type {Number}
	 */
	var listenerTimeoutDelay = void 0;

	/**
	 * Конструктор типа 'Онлайн-чат'
	 * @param {String} headerText  Текст кнопки раскрытия чата и заголовка чата
	 * @param {String} welcomeText Приветственное сообщение пользователю при открытии чата
	 * @param {Number} timeout     Время (в секундах) задержки для слушателя вх. сообщений (сообщений оператора)
	 * @param {Array} times        Времена автораскрытия чата (в секундах)
	 */
	function Chat(headerText, welcomeText, timeout, times) {
	  (0, _utils.bindAllFunc)(this);
	  this.headerText = headerText || _messages.defaultText.chatHeader;
	  this.welcomeText = welcomeText || _messages.defaultText.chatWelcome;
	  this.timesShow = times ? times : [5, 0, 0];
	  this.voices = _audio2.default;
	  this.autoOpenTimerId = '';
	  this.getMessageTimerId = '';

	  // Формирование идентификатора текущей сессии чата
	  var savedSessionId = localStorage.getItem('nrx-sessionId');
	  if (savedSessionId) {
	    // Если ранее для работы в чате сессия была сгенерирована, то используется соответствующий id
	    this.sessionId = savedSessionId;
	  } else {
	    // Если в браузере сохраненного идентификатора сессии нет, то генерируется новый id сессии
	    var newSessionId = generateSessionId('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx');
	    this.sessionId = newSessionId;
	    localStorage.setItem('nrx-sessionId', newSessionId);
	  }

	  this.dialog = new _Dialog2.default(this.welcomeText, this.voices, this.sessionId, this.showContacts, this.autoOpenTimerId);
	  this.contacts = new _Contacts2.default(this.sessionId, this.showDialog);
	  listenerTimeoutDelay = timeout ? timeout * 1000 : 5000;
	}

	/**
	 * Отрисовка контейнера чата
	 */
	Chat.prototype._renderChatContainer = function () {
	  this.chatContainer = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat' });
	  document.querySelector('body').appendChild(this.chatContainer);
	};

	/**
	 * Отрисовка кнопки раскрытия чата
	 */
	Chat.prototype._renderChatBtn = function () {
	  // Отрисовка контейнера чата, если он еще не отрисован
	  if (!document.querySelector('.nrx-chat')) {
	    this._renderChatContainer();
	  }

	  // Отрисовка непосретсвенно кнопки раскрытия чата
	  this.btnChat = (0, _utils.createDOMElement)('button', {
	    'class': 'nrx-btn-chat nrx-btnSlideUp',
	    'type': 'button'
	  });
	  this.btnChat.innerHTML = this.headerText;
	  this.chatContainer.appendChild(this.btnChat);
	  this.btnChat.addEventListener('click', this._onBtnChatClick);
	  this.dialog.setBtnChat(this.btnChat);
	};

	/**
	 * Отрисовка окна чата
	 */
	Chat.prototype._renderChat = function () {
	  // Отрисовка контейнера чата, если он еще не отрисован
	  if (!document.querySelector('.nrx-chat')) {
	    this._renderChatContainer();
	  }

	  // Серверное сообщение об ошибке
	  this.chatContactsServerResultMessage = (0, _utils.createDOMElement)('p', { 'class': 'nrx-server-message' });
	  this.chatContainer.appendChild(this.chatContactsServerResultMessage);

	  // Окно чата
	  this.chat = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__wrapper nrx-slideInUp' });
	  this.chatContainer.appendChild(this.chat);
	  this.dialog.setChat(this.chat);

	  // Заголовок чата
	  this.chatHeader = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__header' });
	  this.chat.appendChild(this.chatHeader);

	  this.chatHeaderImg = (0, _utils.createDOMElement)('img', {
	    'class': 'nrx-chat__header-img',
	    'width': '25',
	    'height': '32',
	    'alt': '',
	    'src': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNi4wNjYiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjcuODE5IDYgMjYuMDY2IDIwIj4gIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xNi4wMSAxMi4xMTdjLTQuNDU0LS4wODgtOC4xMiAyLjY1OC04LjE5IDYuMTMyLS4wMjMgMS4yMDcuMzkyIDIuMzQ0IDEuMTMgMy4zMTdDMTAuMjE2IDIzLjE5NyA4LjgzIDI2IDguODMgMjZsNC4wOS0xLjc2MmMuODguMjggMS44MzguNDQyIDIuODQuNDYgNC40NTUuMDkgOC4xMjMtMi42NTggOC4xOS02LjEzMy4wNy0zLjQ3Mi0zLjQ4Ni02LjM2LTcuOTQtNi40NDhtMTYuNzQ0IDMuMzMzYy43MzgtLjk3MyAxLjE1My0yLjExIDEuMTMtMy4zMTgtLjA3LTMuNDc0LTMuNzM4LTYuMjItOC4xOTQtNi4xMy0zLjczMy4wNy02LjgzNiAyLjExNC03LjcgNC44MTcgMS43NDIuMzI4IDMuMzQyIDEuMDQyIDQuNjMyIDIuMDkgMS44NiAxLjUxIDIuODY0IDMuNTI0IDIuODI4IDUuNjcuMTYyLjAwNC4zMjUuMDA1LjQ4OCAwIDEuMDA1LS4wMTYgMS45Ni0uMTc4IDIuODQzLS40Nmw0LjA5IDEuNzY0Yy0uMDAyIDAtMS4zODctMi44MDQtLjExNy00LjQzNCIvPjwvc3ZnPg=='
	  });
	  this.chatHeader.appendChild(this.chatHeaderImg);

	  this.chatHeaderText = (0, _utils.createDOMElement)('p', { 'class': 'nrx-chat__header-text' });
	  this.chatHeaderText.innerHTML = this.headerText;
	  this.chatHeader.appendChild(this.chatHeaderText);

	  this.chatCloseBtn = (0, _utils.createDOMElement)('button', {
	    'class': 'nrx-btn-close',
	    'type': 'button'
	  });
	  this.chatHeader.appendChild(this.chatCloseBtn);
	  this.chatCloseBtn.addEventListener('click', this._closeChat);

	  // Тело чата
	  this.chatBody = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__body' });
	  this.chat.appendChild(this.chatBody);
	  this.dialog.setChatBody(this.chatBody);
	  this.contacts.setChatBody(this.chatBody);

	  // Информация о разработчике чата
	  this.chatCopyright = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__copyright' });
	  this.chatBody.appendChild(this.chatCopyright);

	  this.chatCopyrightText = (0, _utils.createDOMElement)('p', {});
	  this.chatCopyrightText.innerHTML = 'Сервис предоставлен ';
	  this.chatCopyright.appendChild(this.chatCopyrightText);

	  this.chatCopyrightLink = (0, _utils.createDOMElement)('a', {
	    'href': COPYRIGHT_URL,
	    'target': '_blank'
	  });
	  this.chatCopyrightLink.innerHTML = 'Nirax';
	  this.chatCopyright.appendChild(this.chatCopyrightLink);

	  // Отрисовка диалога чата и формы для воода сообщений
	  this.dialog.renderDialog();
	};

	/**
	 * Получение вх. сообщений (сообщений от оператора)
	 */
	Chat.prototype._getMessage = function () {
	  var self = this;
	  var params = this.dialog.userIsTypingNow ? { 'action': 'verify', 'session': this.sessionId, 'writes': this.dialog.userIsTypingNow } : { 'action': 'verify', 'session': this.sessionId };
	  (0, _ajax.get)(params, function (response) {
	    self._setOperatorName(response.name);
	    self._setOperatorPhoto(response.photo);
	    if (response.message) {
	      self.dialog.renderMessage('org', (0, _utils.setEnterInText)(response.message));
	    }
	    if (response.writes) {
	      self.dialog._renderOperatorIsTypingMessage();
	    } else {
	      self.dialog._hideOperatorIsTypingMessage();
	    }
	  });
	  this.setLoadTimeout();
	  this.dialog._hideOperatorIsTypingMessage();

	  // Сохранение времени отправки запроса
	  localStorage.setItem('nrx-lastGetMessageRequest', Date.now());
	};

	/**
	 * Отрисовка имени оператора, обрабатывающего обращение пользователя
	 * @param {String} name Имя оператора
	 */
	Chat.prototype._setOperatorName = function (name) {
	  if (name) {
	    this.chatHeaderText.innerHTML = (0, _utils.setEnterInText)(name);
	  }
	};

	/**
	 * Отрисовка фотографии оператора, обрабатывающего обращение пользователя
	 * @param {String} photoUrl URL-ссылка на фотографию оператора (или картинка оператора по-умолчанию)
	 */
	Chat.prototype._setOperatorPhoto = function (photoUrl) {
	  if (photoUrl) {
	    (0, _utils.renderImg)(this.chatHeaderImg, '50', '50', photoUrl, 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAMDAwMDAwQEBAQFBQUFBQcHBgYHBwsICQgJCAsRCwwLCwwLEQ8SDw4PEg8bFRMTFRsfGhkaHyYiIiYwLTA+PlQBAwMDAwMDBAQEBAUFBQUFBwcGBgcHCwgJCAkICxELDAsLDAsRDxIPDg8SDxsVExMVGx8aGRofJiIiJjAtMD4+VP/CABEIADwAPAMBIgACEQEDEQH/xAAcAAADAQACAwAAAAAAAAAAAAAABgcIAQkDBAX/2gAIAQEAAAAA7Uxcz7GLzpLkEtB+FAN1MgZzV/IsbN9oIgjkZ7A/aBNzEs6eq4Cp1k7KqdEOE+eQGoUV1ZuZ3KfNANbfSbP/xAAaAQEAAgMBAAAAAAAAAAAAAAAFAAQBAgMG/9oACAECEAAAAIUb6eB4dhuyFulzS//EABoBAAEFAQAAAAAAAAAAAAAAAAYAAQIEBQP/2gAIAQMQAAAAWxfF3MIiKJOGFXII4H//xAAyEAACAgEEAAUCBAQHAAAAAAABAgMEBQAGERITISIxQQcgFlFSYUJxkbEIEBUyNGKh/9oACAEBAAE/AP8ALdGeO2sFbyYo2b7w+GsdWuvaSWSVxGij34BZhy3wPPW6957hzHapH1jMLnx2QEwhgwKhOf8AcF48nI5P7ayO7Z9u2TfvyieorekPArcntx15kB6ge7eWtj/VQrDQuXJp5sPk7ogEk/ranNO3VCrD1msXPQl+ejEerr7fZu680NZK8TgPI47D568E8/8AmqEFVj1aNQWPmSB5nW7dj7YzFKaO1Thk8RfUdHaNjEPdxnI8K5TsQV7gd+kKyKee8K+TMvxx762emXh2lg4cvaFvIx42sLljnnxZhGO554HI5+zemcvWb2f/ANEjguZnH1IYGqyyGJFMsjSBWZeSG6ef8jrZGb3ZZFpMzjzURWkMPaUSjrG3BdXPq6OPUFf1DV/6mbdOWiw9q1RqTz/8VJrPSWx8ehAh1lJT+I8NBKyqtzILWRCOeXdS5PzwFUEk+2qE0E+PqSQEGJ4IyhAKjqV5HAIH2byqYXa+SsZGpRr1GuE270saKniycdDJI37Ko5J1Z3JVmhLOJZ/HAWJ60TWI3R/MkPF3H8yeNZbGbPycJnu42ramhKjiaMPwyOJB/RgGH7+et17lv4/d7VY8FbsZSPBGfbsCJy9+3bLRskCn34SMxyOOfDid2I41Qaw+PqNYgMExgiMsXcSeG5HqXuvk3B+fs3bimvU0sx+b1uxK/qRh6tTYKxHQeLHVMaUWbw4b0MrRTRKg4EbmuYyxT/s2rGRwW35sfSyW4Gd5JE8e1ZlEsrct7IkY5c+fCqAWJIGvp7QfKvLui4hiabvXxtBipNGonEY7lSwaabwwz8HqvsvyT9m6rlRcHk60zSBZqc0TtG5RlEiFSQw9iAdfSn/DWMBvLNmjubO18QIZKzS1niryuSQUHJV1cpr8D4u3DUTLGPLSQcKl6zBDHahbr1MkUkKRlWP8Y1tKlUwOOo1KvK144IoQCeeFReqkn5I+zdVm+sUaUbhryo3c8KrdgPhuQfT+fzr6l5KSrt0xQoWkuWEgB/SCpkLf0XjWK/EN9clg6LpTmvRTOlkSdZlDMkbTIp59MXPv7cnjnnW4Nypt+vUpktanSHiSV2HL9V6qzAceonW3Mm1/D1XfpzIDJ1XkgKxJUcn51j8m8TBZWBiPkD+nQPI5Ggf7ayTs1+xyf42H9PLX1Fd5cvtaoWPhTm2XA+SDEv8AY6bHUMVZmsVa8aTtXUPN19bqq9gpb8ufjWdyNqzurGQSt3S7kEhk555CcfGsVBFUrpFEoVEAVR+QHGp5nXso44CA62/LJPjh3Yno7KP5DX//xAAmEQACAgIBAwIHAAAAAAAAAAABAgMEABEhBRBREkEGEyIxMkJh/9oACAECAQE/AM6hNICkSHW+WIyvPPUsBGLFWbkfcaw8drkimeQEeNN4ytBHYtJot9K7Y97saxn1E+hnXhdbBzpMQKzAflwf6fI7UoxJLs+w3l+mJ3szPIwWuqqqj3LZ8O1/mRz2yf3KIvgDLUCqQwz/xAAjEQACAQMDBAMAAAAAAAAAAAABAgMABBEFITEQEkFRBhQy/9oACAEDAQE/AK0y0SUNK4yBwKvLKKW3Micrx4odNJgJtIip5z3bea1OR7W0bb9thR10K8nRWRUV0U7tnGK1+fuaE523HoDpcuUj281pN59KCyiSNS9yWcseAEr5JIFeG2xuFEjt7z6qKQkV/9k=');
	  }
	};

	/**
	 * Отрисовка переписки между пользователем и оператором
	 * @param {Object} history Информация о переписке
	 */
	Chat.prototype._renderHistory = function (history) {
	  if (history) {
	    this._setOperatorName(history.name);
	    this._setOperatorPhoto(history.photo);
	    this.dialog.showHistory(history.dialog, history.time);
	  } else {
	    this.dialog.loadHistory(this._setOperatorName, this._setOperatorPhoto);
	  }
	};

	/**
	 * Запуск слушателя новых вх. сообщений по предопределенному расписанию
	 */
	Chat.prototype.setLoadTimeout = function () {
	  this.getMessageTimerId = setTimeout(this._getMessage, listenerTimeoutDelay);
	};

	/**
	 * Остановка слушателя новых вх. сообщений по предопределенному расписанию
	 */
	Chat.prototype.clearLoadTimeout = function () {
	  clearTimeout(this.getMessageTimerId);
	};

	/**
	 * Открытие нужной вкладки чата
	 */
	Chat.prototype._setOpenedTab = function () {
	  if (localStorage.getItem('nrx-currentChatTab') === 'contacts') {
	    this.showContacts();
	  } else {
	    this.showDialog();
	  }
	};

	/**
	 * Отображение формы контактов пользователя
	 */
	Chat.prototype.showContacts = function () {
	  this.dialog.hideDialog();
	  (0, _ajax.hideServerResultMessage)();
	  this.contacts.showContacts();
	  localStorage.setItem('nrx-currentChatTab', 'contacts');
	};

	/**
	 * Отображение формы диалога
	 */
	Chat.prototype.showDialog = function () {
	  this.contacts.closeContacts();
	  (0, _ajax.hideServerResultMessage)();
	  this.dialog.showDialog();
	  localStorage.setItem('nrx-currentChatTab', 'dialog');
	};

	/**
	 * Деактивация чата
	 */
	Chat.prototype.deactivateChat = function () {
	  clearTimeout(this.autoOpenTimerId);
	  this.clearLoadTimeout();
	  this.contacts.clearContactsForm();
	};

	/**
	 * Активация чата
	 */
	Chat.prototype.activateChat = function () {
	  // Получение всей переписки пользователя
	  var response = (0, _ajax.getSync)({
	    'action': 'dialog',
	    'session': this.sessionId
	  });

	  // Раскрытие/свертывание чата
	  if (localStorage.getItem('nrx-chatOpened') === 'true' && response.result && response.dialog.length > 0) {
	    // Если признак открытия чата взведен, а переписка получена и непуста
	    if (!this.chat || (0, _utils.hasClass)(this.chat, 'hidden')) {
	      // Если окно чата свернуто или не отрисовано
	      this._openChat(response);
	    } else {
	      // Если окно чата ракрыто
	      this._setOpenedTab();
	      this._renderHistory(response);
	    }
	  } else {
	    // Если признак открытия чата снят
	    if (!this.chat || (0, _utils.hasClass)(this.chat, 'hidden')) {
	      // Если окно чата свернуто или не отрисовано
	      if (!this.btnChat) {
	        this._renderChatBtn();
	      }
	      this.chatAutoOpen();
	    } else {
	      // Если окно чата ракрыто
	      this._closeChat();
	    }
	  }

	  // Перезапуск слушателя новых сообщений
	  this.clearLoadTimeout();
	  this.setLoadTimeout();
	};

	/**
	 * Раскрытие чата
	 * @param {Object} history Информация о переписке между пользователем и оператором
	 */
	Chat.prototype._openChat = function (history) {
	  var self = this;

	  // Скрытие кнопки раскрытия чата за пределы экрана
	  if (this.btnChat) {
	    (0, _utils.removeClass)(this.btnChat, 'nrx-btnSlideUp');
	    (0, _utils.addClass)(this.btnChat, 'nrx-btnSlideDown');
	  }

	  setTimeout(function () {
	    // Скрытие кнопки раскрытия чата из DOM-дерева
	    if (self.btnChat) {
	      (0, _utils.addClass)(self.btnChat, 'hidden');
	      (0, _utils.removeClass)(self.btnChat, 'nrx-btnSlideDown');
	    }

	    // Раскрытие окна чата
	    if (self.chat) {
	      (0, _utils.addClass)(self.chat, 'nrx-slideInUp');
	      (0, _utils.removeClass)(self.chat, 'hidden');
	      (0, _utils.removeClass)(self.chatContactsServerResultMessage, 'hidden');
	    } else {
	      self._renderChat();
	    }

	    // Открытие нужной вкладки чата
	    self._setOpenedTab();

	    // Отрисовка переписки между пользователем и оператором
	    self._renderHistory(history);

	    // Сохранение признака открытого чата
	    localStorage.setItem('nrx-chatOpened', 'true');

	    // Сброс счетчика автораскрытия чата
	    clearTimeout(self.autoOpenTimerId);
	  }, OPEN_CHAT_DELAY);
	};

	/**
	 * Закрытие чата
	 */
	Chat.prototype._closeChat = function () {
	  var self = this;

	  // Скрытие сообщения о результате выполнения запроса сервером
	  if (this.chatContactsServerResultMessage) {
	    (0, _utils.addClass)(this.chatContactsServerResultMessage, 'hidden');
	  }

	  // Скрытие окна чата за пределы экрана
	  (0, _utils.removeClass)(this.chat, 'nrx-slideInUp');
	  (0, _utils.addClass)(this.chat, 'nrx-slideInDown');

	  setTimeout(function () {
	    // Скрытие окна чата из DOM-дерева
	    (0, _utils.addClass)(self.chat, 'hidden');
	    (0, _utils.removeClass)(self.chat, 'nrx-slideInDown');

	    // Скрытие сообщений об ошибках формы
	    (0, _utils.hideError)(self.dialog.chatMessageInput);

	    // Показ кнопки раскрытия чата
	    if (!self.btnChat) {
	      self._renderChatBtn();
	    }
	    (0, _utils.removeClass)(self.btnChat, 'hidden');
	    (0, _utils.removeClass)(self.btnChat, 'nrx-btnSlideDown');
	    (0, _utils.addClass)(self.btnChat, 'nrx-btnSlideUp');
	  }, CLOSE_CHAT_ANIMATE_DELAY);

	  this.chatAutoOpen();
	  localStorage.removeItem('nrx-chatOpened');
	};

	/**
	 * Автоматическое открытие чата
	 */
	Chat.prototype.chatAutoOpen = function () {
	  var self = this;
	  var timeIndex = +localStorage.getItem('nrx-currentAutoOpenTimeIndex');

	  if (this.timesShow[timeIndex] !== 0) {
	    // Время автооткрытия чата отлично от нуля, поэтому инициируем автооткрытие чата
	    this.autoOpenTimerId = setTimeout(function () {
	      // Открытие чата
	      self._openChat();

	      // Проигрывание звукового уведомления об открытии окна чата
	      setTimeout(function () {
	        (0, _utils.playAudio)(self.voices.open);
	      }, OPEN_CHAT_DELAY + 1000);

	      // Обновление расписания автооткрытия чата
	      if (localStorage.getItem('nrx-currentAutoOpenTimeIndex') < 2) {
	        var newTime = +localStorage.getItem('nrx-currentAutoOpenTimeIndex') + 1;
	        localStorage.setItem('nrx-currentAutoOpenTimeIndex', newTime);
	      }
	    }, this.timesShow[timeIndex] * 1000);
	  } else {
	    // Время автооткрытия чата нулевое, поэтому автооткрытие чата отключаем
	    return;
	  }
	};

	/**
	 * Обработчик события нажатия на кнопку раскрытия чата
	 */
	Chat.prototype._onBtnChatClick = function () {
	  this._openChat();
	};

	/**
	 * Генерация id сессии
	 * @param  {String} str Шаблон, по которому будет формироваться id
	 * @return {String}     Идентификатор сессии
	 */
	function generateSessionId(str) {
	  return str.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0;
	    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
	  });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _ajax = __webpack_require__(4);

	var _messages = __webpack_require__(5);

	var _utils = __webpack_require__(6);

	exports.default = Dialog;


	/**
	 * Код клавиши 'Enter'
	 * @constant
	 * @type {Number}
	 */
	var ENTER_CODE = 13;

	/**
	 * Конструктор типа 'Диалог'
	 * @param {String}   welcomeText      Приветственное сообщение
	 * @param {String}   voices           Звуки
	 * @param {String}   sessionId        Идентификатор сессии
	 * @param {Function} showContactsFunc Функция показа формы контактов пользователя
	 */
	function Dialog(welcomeText, voices, sessionId, showContactsFunc) {
	  (0, _utils.bindAllFunc)(this);
	  this.welcomeText = welcomeText;
	  this.voices = voices;
	  this.sessionId = sessionId;
	  this.showContactsFunc = showContactsFunc;
	  this.userIsTypingNow = false;
	  this._stopUserTypingDebounce = (0, _utils.debounce)(this._stopUserTyping, 2000);
	}

	/**
	 * Получение DOM-элемента кнопки раскрытия чата
	 * @param {Element} chat DOM-элемент кнопки раскрытия чата
	 */
	Dialog.prototype.setBtnChat = function (btn) {
	  this.btnChat = btn;
	};

	/**
	 * Получение DOM-элемента окна чата
	 * @param {Element} chat DOM-элемент окна чата
	 */
	Dialog.prototype.setChat = function (chat) {
	  this.chat = chat;
	};

	/**
	 * Получение DOM-элемента тела чата
	 * @param {Element} chat DOM-элемент тела чата
	 */
	Dialog.prototype.setChatBody = function (chatBody) {
	  this.chatBody = chatBody;
	};

	/**
	 * Отрисовка диалога (области переписки и формы отправки сообщений)
	 */
	Dialog.prototype.renderDialog = function () {
	  this._renderChatDialog();
	  this.renderMessage('org', this.welcomeText, null);
	  this._renderChatMessageForm();
	};

	/**
	 * Отрисовка области переписки
	 */
	Dialog.prototype._renderChatDialog = function () {
	  this.chatDialog = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__dialog' });
	  this.chatBody.appendChild(this.chatDialog);
	};

	/**
	 * Отрисовка формы отправки сообщений
	 */
	Dialog.prototype._renderChatMessageForm = function () {
	  this.chatMessageForm = (0, _utils.createDOMElement)('form', {
	    'class': 'nrx-chat__form nrx-chat__form--message',
	    'action': ''
	  });
	  this.chatBody.appendChild(this.chatMessageForm);
	  this.chatMessageForm.addEventListener('keydown', this._onMessageFormEnterDown);

	  this.chatMessageField = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__field' });
	  this.chatMessageForm.appendChild(this.chatMessageField);

	  this.chatMessageInput = (0, _utils.createDOMElement)('textarea', {
	    'placeholder': 'Введите сообщение и нажмите Enter',
	    'name': 'message',
	    'maxlength': '200'
	  });
	  this.chatMessageField.appendChild(this.chatMessageInput);
	  this.chatMessageInput.focus();
	  this.chatMessageInput.addEventListener('focus', _utils.onFieldsFocus);
	  this.chatMessageInput.addEventListener('change', this._onMessageFormFieldsChange);
	  this.chatMessageInput.addEventListener('keyup', this._onTypingInMessageFormFields);

	  this.chatMessageError = (0, _utils.createDOMElement)('p', { 'class': 'nrx-error-message' });
	  this.chatMessageField.appendChild(this.chatMessageError);

	  this.chatMessageFormControls = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__controls' });
	  this.chatMessageForm.appendChild(this.chatMessageFormControls);

	  this.chatSetContactsBtn = (0, _utils.createDOMElement)('button', {
	    'class': 'nrx-btn-set-contacts',
	    'type': 'button'
	  });
	  this.chatSetContactsBtn.innerHTML = this._setContactsBtnText();
	  this.chatMessageFormControls.appendChild(this.chatSetContactsBtn);
	  this.chatSetContactsBtn.addEventListener('click', this.showContactsFunc);

	  this.chatMessageSendBtn = (0, _utils.createDOMElement)('button', {
	    'class': 'nrx-btn-send-message',
	    'type': 'submit'
	  });
	  this.chatMessageSendBtn.innerHTML = 'Отправить';
	  this.chatMessageFormControls.appendChild(this.chatMessageSendBtn);
	  this.chatMessageSendBtn.addEventListener('click', this._onMessageSendClick);
	};

	/**
	 * Отрисовка сообщения
	 * @param {String}  userType  Тип сообщения: user (исх. сообщение) и org (вх. сообщение)
	 * @param {String}  text      Текст сообщения
	 * @param {String}  time      Время сообщения
	 * @param {Boolean} isHistory Признак того, что это сообщение из истории переписки
	 */
	Dialog.prototype.renderMessage = function (userType, text, time, isHistory) {
	  if ((0, _utils.hasClass)(this.chat, 'hidden')) {
	    (0, _utils.removeClass)(this.chat, 'hidden');
	    (0, _utils.addClass)(this.btnChat, 'hidden');
	  }

	  // Отрисовка сообщения
	  this.chatMessageWrapper = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__message-wrapper' });
	  this.chatDialog.appendChild(this.chatMessageWrapper);

	  this.chatMessage = (0, _utils.createDOMElement)('p', { 'class': 'nrx-chat__message' });
	  this.chatMessage.innerHTML = text;
	  this.chatMessageWrapper.appendChild(this.chatMessage);

	  if (userType === 'user') {
	    // Отрисовка исх. сообщения
	    (0, _utils.addClass)(this.chatMessage, 'nrx-chat__message--user');
	    this.chatMessageInput.value = '';
	    this.chatMessageInput.focus();
	  } else if (userType === 'org') {
	    // Отрисовка вх. сообщения
	    (0, _utils.addClass)(this.chatMessage, 'nrx-chat__message--org');
	  }

	  // Отрисовка времени сообщения
	  if (time !== null) {
	    this.chatMessageTime = (0, _utils.createDOMElement)('span', { 'class': 'nrx-chat__message-time' });
	    this.chatMessageTime.innerHTML = time ? (0, _utils.formatTime)(time) : (0, _utils.formatTime)(new Date());
	    this.chatMessage.appendChild(this.chatMessageTime);

	    if (!isHistory && userType === 'org') {
	      (0, _utils.playAudio)(this.voices.message);
	    }
	  }

	  // Прокрутка диалога чата к последнему сообщению
	  this.chatDialog.scrollTop = this.chatDialog.scrollHeight;

	  // Сброс автооткрытия окна чата
	  clearTimeout(this.autoOpenTimerId);
	};

	/**
	 * Отрисовка информации о том, что оператор набирает текст сообщения
	 */
	Dialog.prototype._renderOperatorIsTypingMessage = function () {
	  if (!this.chatOperIsTyping) {
	    this.chatOperIsTyping = (0, _utils.createDOMElement)('p', { 'class': 'nrx-chat__oper-typing' });
	    this.chatOperIsTyping.innerHTML = _messages.defaultText.operIsTyping;
	    this.chatMessageForm.appendChild(this.chatOperIsTyping);
	  }
	};

	/**
	 * Скрытие информации о том, что оператор набирает текст сообщения
	 */
	Dialog.prototype._hideOperatorIsTypingMessage = function () {
	  if (this.chatOperIsTyping) {
	    (0, _utils.removeDOMElement)(this.chatMessageForm, this.chatOperIsTyping);
	    this.chatOperIsTyping = null;
	  }
	};

	/**
	 * Установка текста кнопки показа контактов пользователя
	 */
	Dialog.prototype._setContactsBtnText = function () {
	  return localStorage.getItem('nrx-userSetContacts') ? _messages.defaultText.contactsLinkFull : _messages.defaultText.contactsLinkEmpty;
	};

	/**
	 * Показ диалога
	 */
	Dialog.prototype.showDialog = function () {
	  if (this.chatMessageForm) {
	    (0, _utils.removeClass)(this.chatDialog, 'hidden');
	    (0, _utils.removeClass)(this.chatMessageForm, 'hidden');
	    this.chatMessageInput.focus();
	    this.chatSetContactsBtn.innerHTML = this._setContactsBtnText();
	  }
	};

	/**
	 * Скрытие диалога
	 */
	Dialog.prototype.hideDialog = function () {
	  if (this.chatMessageForm) {
	    (0, _utils.addClass)(this.chatDialog, 'hidden');
	    (0, _utils.addClass)(this.chatMessageForm, 'hidden');
	    (0, _utils.hideError)(this.chatMessageInput);
	  }
	};

	/**
	 * Очистка области переписки
	 */
	Dialog.prototype._clearDialog = function () {
	  for (var i = this.chatDialog.children.length - 1; i > 0; i--) {
	    (0, _utils.removeDOMElement)(this.chatDialog, this.chatDialog.children[i]);
	  }
	};

	/**
	 * Загрузка всей переписки между пользователем и оператором
	 * @param  {Function} setNameFunc  Функция установки имени оператора
	 * @param  {Function} setPhotoFunc Функция установки фотографии оператора
	 */
	Dialog.prototype.loadHistory = function (setNameFunc, setPhotoFunc) {
	  var self = this;

	  var params = {
	    'action': 'dialog',
	    'session': this.sessionId
	  };

	  (0, _ajax.get)(params, function (response) {
	    // Установка имени и фото оператора
	    setNameFunc(response.name);
	    setPhotoFunc(response.photo);

	    // Разбор и отрисовка переписки между посетителем и оператором
	    if (response.dialog.length > 0) {
	      self.showHistory(response.dialog, response.time);
	    }
	  });
	};

	/**
	 * Отрисовка переписки между пользователем и оператором
	 * @param {Object} messageList Сообщения из переписки
	 * @param {String} time        Текущее время сервера
	 */
	Dialog.prototype.showHistory = function (messageList, time) {
	  // Сортировка сообщений диалога по дате
	  messageList.sort(function (message1, message2) {
	    var date1 = (0, _utils.createDateFromString)(message1.datetime);
	    var date2 = (0, _utils.createDateFromString)(message2.datetime);
	    var time1 = new Date(date1).getTime();
	    var time2 = new Date(date2).getTime();
	    return time1 - time2;
	  });

	  // Вычисление разницы во времени между сервером и клиентом (компьютером пользователя)
	  var clnServerTimeDelta = (0, _utils.createDateFromString)(time).getTime() - Date.now();

	  // Удаление старого диалога и отрисовка нового
	  if (this.chatDialog) {
	    this._clearDialog();
	  }

	  var self = this;
	  messageList.forEach(function (message) {
	    var messageAuthor = message.outcoming ? 'user' : 'org';
	    var messageDateTime = new Date((0, _utils.createDateFromString)(message.datetime) - clnServerTimeDelta);
	    self.renderMessage(messageAuthor, (0, _utils.setEnterInText)(message.message), messageDateTime, true);
	  });
	};

	/**
	 * Обработчик события изменения содержимого полей формы отправки сообщения
	 */
	Dialog.prototype._onMessageFormFieldsChange = function () {
	  if (this.chatMessageInput.value) {
	    (0, _utils.hideError)(this.chatMessageInput);
	  } else {
	    (0, _utils.showError)(this.chatMessageInput, _messages.errorMessages.requiredField);
	  }
	};

	/**
	 * Обработчик события нажатия на кнопку 'Отправить' формы отправки сообщений
	 * @param {Object} event
	 */
	Dialog.prototype._onMessageSendClick = function (event) {
	  event.preventDefault();
	  var self = this;

	  if (this.chatMessageInput.value) {
	    var params = {
	      'action': 'message',
	      'session': this.sessionId,
	      'visitor': 'Посетитель ' + getRandomVisitorNumber(),
	      'message': document.querySelector('.nrx-chat__form--message textarea').value
	    };

	    (0, _ajax.post)(params, function () {
	      self.renderMessage('user', self.chatMessageInput.value);
	      (0, _ajax.hideServerResultMessage)();
	    });
	  } else {
	    (0, _utils.showError)(this.chatMessageInput, _messages.errorMessages.requiredField);
	  }
	};

	/**
	 * Обработчик события нажатия клавиши 'Enter' при заполнении формы отправки сообщения
	 * @param {Object} event
	 */
	Dialog.prototype._onMessageFormEnterDown = function (event) {
	  if (event.keyCode === ENTER_CODE) {
	    this._onMessageSendClick(event);
	  }
	};

	/**
	 * Обработчик события ввода символов в поле текста сообщения
	 */
	Dialog.prototype._onTypingInMessageFormFields = function () {
	  this.userIsTypingNow = true;
	  this._stopUserTypingDebounce();
	};

	/**
	 * Сброс признака того, что пользователь набирает текст
	 */
	Dialog.prototype._stopUserTyping = function () {
	  this.userIsTypingNow = false;
	};

	/**
	 * Генерация случайного порядкового номера пользователя
	 * @return {Number} Порядковый номер пользователя
	 */
	function getRandomVisitorNumber() {
	  return Math.floor(Math.random() * (500 - 1 + 1)) + 1;
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.hideServerResultMessage = exports.showLoadingOk = exports.post = exports.getSync = exports.get = undefined;

	var _messages = __webpack_require__(5);

	var _utils = __webpack_require__(6);

	exports.get = get;
	exports.getSync = getSync;
	exports.post = post;
	exports.showLoadingOk = showLoadingOk;
	exports.hideServerResultMessage = hideServerResultMessage;


	/** Адрес веб-сервера, который используется для обмена сообщениями
	 * @constant
	 * @type {String}
	 */
	//var SERVER_URL = 'https://nirax.ru/online/adviser.php';
	var SERVER_URL = 'https://dzgansl.ru/test/adviser.php'; // Для тестирования

	/**
	 * Ассинхронное получение данных с сервера
	 * @param  {Object}   requestParamsObj Параметры запроса
	 * @param  {Function} callback         Функция обработки ответа сервера
	 */
	function get(requestParamsObj, callback) {
	  var requestParams = _requestParamsToString(requestParamsObj);
	  var xhr = _createCorsRequest('GET', SERVER_URL + requestParams);
	  if (!xhr) {
	    throw new Error('CORS not supported');
	  }

	  xhr.onload = function () {
	    var response = JSON.parse(xhr.responseText);
	    if (response.result) {
	      callback(response);
	    }
	  };

	  xhr.send(null);
	}

	/**
	 * Синхронное получение данных с сервера
	 * @param  {Object}   requestParamsObj Параметры запроса
	 */
	function getSync(requestParamsObj) {
	  var requestParams = _requestParamsToString(requestParamsObj);
	  var xhr = _createCorsRequest('GET', SERVER_URL + requestParams, true);
	  if (!xhr) {
	    throw new Error('CORS not supported');
	  }

	  var response = void 0;
	  xhr.onload = function () {
	    response = JSON.parse(xhr.responseText);
	  };

	  xhr.send(null);
	  return response;
	}

	/**
	 * Отправка данных на сервер
	 * @param  {Object}   requestParamsObj Параметры запроса
	 * @param  {Function} callback         Функция обработки ответа сервера
	 */
	function post(requestParamsObj, callback) {
	  var requestParams = _requestParamsToString(requestParamsObj);
	  var xhr = _createCorsRequest('GET', SERVER_URL + requestParams);
	  if (!xhr) {
	    throw new Error('CORS not supported');
	  }

	  xhr.onload = function () {
	    var response = JSON.parse(xhr.responseText);
	    if (response.result) {
	      callback(response);
	    } else {
	      _showLoadingError();
	    }
	  };

	  xhr.onerror = function () {
	    _showLoadingError();
	  };

	  xhr.send(null);
	}

	/**
	 * Преобразование параметров запроса из объекта в строку
	 * @param  {Onject} requestParamsObj Параметры запроса в виде объекта
	 * @return {String}                  Параметры запроса в виде строки
	 */
	function _requestParamsToString(requestParamsObj) {
	  var requestParams = void 0;
	  requestParamsObj.url = window.SERVER_1C_URL;
	  for (var key in requestParamsObj) {
	    if (requestParamsObj.hasOwnProperty(key)) {
	      requestParams = requestParams ? requestParams + '&' : '?';
	      requestParams += key + '=' + encodeURI(requestParamsObj[key]);
	    }
	  }
	  return requestParams;
	}

	/**
	 * Создание кросс-браузерного запроса
	 * @param  {String}  method Тип запроса (GET, POST....)
	 * @param  {String}  url    Адрес Веб-сервера
	 * @param  {Boolean} sync   Признак того, что отправляемый запрос синхронный
	 * @return {Object}         Кросс-браузерный экземпляр запроса
	 */
	function _createCorsRequest(method, url, sync) {
	  var xhr = new XMLHttpRequest();
	  if ('withCredentials' in xhr) {
	    xhr.open(method, url, !sync);
	  } else if (typeof XDomainRequest !== 'undefined') {
	    // Для IE
	    xhr = new XDomainRequest();
	    xhr.open(method, url);
	  } else {
	    xhr = null;
	  }
	  return xhr;
	}

	/**
	 * Отрисовка сообщения об ошибке, возникшей при выполнении запроса к серверу
	 */
	function _showLoadingError() {
	  var resultElement = document.querySelector('.nrx-server-message');
	  (0, _utils.removeClass)(resultElement, 'nrx-ok-message');
	  (0, _utils.addClass)(resultElement, 'nrx-error-message');
	  resultElement.innerText = _messages.errorMessages.serverError;
	  (0, _utils.addClass)(resultElement, 'nrx-fadeInRight');
	  setTimeout(function () {
	    hideServerResultMessage();
	  }, 3000);
	}

	/**
	 * Отрисовка сообщения об успешном выполнении запроса к серверу
	 * @param  {String} message Текст сообщения
	 */
	function showLoadingOk(message) {
	  var resultElement = document.querySelector('.nrx-server-message');
	  (0, _utils.removeClass)(resultElement, 'nrx-error-message');
	  (0, _utils.addClass)(resultElement, 'nrx-ok-message');
	  resultElement.innerText = message;
	  (0, _utils.addClass)(resultElement, 'nrx-fadeInRight');
	  setTimeout(function () {
	    hideServerResultMessage();
	  }, 3000);
	}

	/**
	 * Скрытие серверного сообщения об ошибке
	 */
	function hideServerResultMessage() {
	  var resultElement = document.querySelector('.nrx-server-message');
	  if (resultElement && resultElement.innerText) {
	    (0, _utils.addClass)(resultElement, 'nrx-fadeOut');
	    setTimeout(function () {
	      (0, _utils.removeClass)(resultElement, 'nrx-error-message');
	      (0, _utils.removeClass)(resultElement, 'nrx-ok-message');
	      (0, _utils.removeClass)(resultElement, 'nrx-fadeInRight');
	      (0, _utils.removeClass)(resultElement, 'nrx-fadeOut');
	      resultElement.innerText = '';
	    }, 1000);
	  }
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Тексты по-умолчанию
	 * @constant
	 * @type {Object}
	 */
	var defaultText = exports.defaultText = {
	  'socialBtn': 'Напишите нам',
	  'chatHeader': 'Напишите нам, мы онлайн!',
	  'chatWelcome': 'Добро пожаловать! Будем рады ответить на Ваш вопрос!',
	  'contactsLinkEmpty': 'Оставьте свои контакты',
	  'contactsLinkFull': 'Ваши контакты',
	  'contactsTipEmpty': 'Укажите, пожалуйста, свои контакты. Это поможет нам быть с Вами на связи',
	  'contactsTipFull': 'Вы оставили нам следующие контакты. При необходимости обновите иx',
	  'contactsSaved': 'Контакты сохранены',
	  'operIsTyping': 'оператор печатает...'
	};

	/**
	 * Тексты сообщений об ошибках
	 * @constant
	 * @type {Object}
	 */
	var errorMessages = exports.errorMessages = {
	  'serverError': 'Сервис временно недоступен',
	  'requiredField': 'Обязательное поле',
	  'needFillLeastOneField': 'Должно быть заполнено хотя бы одно поле',
	  'emailFormat': 'Должно быть заполнено в формате iv@yandex.ru',
	  'phoneFormat': 'Может содержать цифры, символы +-_() и пробел'
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.createDOMElement = createDOMElement;
	exports.removeDOMElement = removeDOMElement;
	exports.hasClass = hasClass;
	exports.addClass = addClass;
	exports.removeClass = removeClass;
	exports.validateEmail = validateEmail;
	exports.validatePhone = validatePhone;
	exports.createDateFromString = createDateFromString;
	exports.formatTime = formatTime;
	exports.playAudio = playAudio;
	exports.showError = showError;
	exports.hideError = hideError;
	exports.onFieldsFocus = onFieldsFocus;
	exports.bindAllFunc = bindAllFunc;
	exports.setEnterInText = setEnterInText;
	exports.renderImg = renderImg;
	exports.setImgParams = setImgParams;
	exports.debounce = debounce;

	/**
	 * Создание DOM-элемента
	 * @param  {String}  elementType Тип создаваемого элемента (div, input...)
	 * @param  {Object}  attrList    Список атрибутов элемента
	 * @return {Element}             Созданный элемент
	 */

	function createDOMElement(elementType, attrList) {
	  var element = void 0;
	  element = document.createElement(elementType);
	  for (var attr in attrList) {
	    if (attrList.hasOwnProperty(attr)) {
	      element.setAttribute(attr, attrList[attr]);
	    }
	  }
	  return element;
	}

	/**
	 * Удаление DOM-елемента
	 * @param {Element} parent  Родитель удаляемого элемента
	 * @param {Element} element Удаляемый элемент
	 */
	function removeDOMElement(parent, element) {
	  parent.removeChild(element);
	}

	/**
	 * Проверка наличия у DOM-элемента некоторого класса
	 * @param {Element} element   DOM-элемент
	 * @param {String}  className Название класса
	 */
	function hasClass(element, className) {
	  return !!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
	}

	/**
	 * Добавление класса DOM-элементу
	 * @param {Element} element   DOM-элемент
	 * @param {String}  className Название класса
	 */
	function addClass(element, className) {
	  if (!hasClass(element, className)) {
	    element.className += ' ' + className;
	  }
	}

	/**
	 * Удаление класса у DOM-элемента
	 * @param {Element} element   DOM-элемент
	 * @param {String}  className Название класса
	 */
	function removeClass(element, className) {
	  if (hasClass(element, className)) {
	    var elementClasses = element.className.split(' ');
	    for (var i = 0; i < elementClasses.length; i++) {
	      if (elementClasses[i] === className) {
	        elementClasses.splice(i, 1);
	        i--;
	      }
	    }
	    element.className = elementClasses.join(' ');
	  }
	}

	/**
	 * Проверка электронной формы на соответствие формату email
	 * @param  {String}  email Значение почты, которая проверяется
	 * @return {Boolean}       Результат проверки: true - email верный, false - формат email неверный
	 */
	function validateEmail(email) {
	  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	  return re.test(email);
	}

	/**
	 * Проверка формата номера телефона на наличие только допустимыхх символов - цифр, пробела и символов +-_()
	 * @param  {String}  phone Значение номера телефона, который проверяется
	 * @return {Boolean}       Результат проверки: true - телефон содержит только допустимые символы, false - телефон содержит недопустимые символы
	 */
	function validatePhone(phone) {
	  var re = /^([0-9\+\s-_\(\)])*$/;
	  return re.test(phone);
	}

	/**
	 * Создание элемента типа Date из строки
	 * @param  {String} str Строка с информацией о дате и времени
	 * @return {Date}       Дата и время в формате Date
	 */
	function createDateFromString(str) {
	  var year = str.substring(0, 4);
	  var month = str.substring(4, 6) - 1;
	  var date = str.substring(6, 8);
	  var hours = str.substring(8, 10);
	  var minutes = str.substring(10, 12);
	  var seconds = str.substring(12, 14);
	  return new Date(year, month, date, hours, minutes, seconds);
	}

	/**
	 * Получение времени из даты и преобразование его в нужный формат (чч:мм)
	 * @return {String} Время в нужном формате
	 */

	function formatTime(datetime) {
	  var hours = datetime.getHours();
	  var minutes = datetime.getMinutes();
	  hours = hours < 10 ? '0' + hours : hours;
	  minutes = minutes < 10 ? '0' + minutes : minutes;
	  return hours + ':' + minutes;
	}

	/**
	 * Воспроизведение звука
	 * @param {String} src Звуковой файл, который нужно проиграть (в формате base64)
	 */
	function playAudio(src) {
	  var voice = new Audio();
	  voice.src = src;
	  voice.autoplay = true;
	}

	/**
	 * Отображение текста сообщения об ошибке для поля формы
	 * @param {Element} element DOM-элемент поля формы, в котором возникла ошибка
	 * @param {String}  error   Текст ошибки
	 */
	function showError(element, error) {
	  addClass(element, 'error');
	  element.nextElementSibling.innerText = error;
	}

	/**
	 * Скрытие сообщения об ошибке для поля формы
	 * @param {Element} element DOM-элемент поля формы, ошибку для которого нужно скрыть
	 */
	function hideError(element) {
	  removeClass(element, 'error');
	  element.nextElementSibling.innerText = '';
	}

	/**
	 * Обработчик события приобретения полем формы фокуса
	 * @param {Object} event
	 */
	function onFieldsFocus(event) {
	  if (!event.currentTarget.value) {
	    event.currentTarget.focus();
	    hideError(event.currentTarget);
	  }
	}

	/**
	 * Функция, позволяющая избежать потери контекста
	 * @param  {Object} object Объект, контекст которого нужно привязать
	 */
	function bindAllFunc(object) {
	  for (var property in object) {
	    if (typeof object[property] === 'function') {
	      object[property] = object[property].bind(object);
	    }
	  }
	}

	/**
	 * Установка в html переноса строк
	 * @param {String}  text Текст c переносом строк через \n
	 * @return {String}      Текст с переносом строк с помощью тега <br>
	 */
	function setEnterInText(text) {
	  return text.replace(/\n/g, '<br>');
	}

	/**
	 * [isImgExistsSetIt description]
	 * @param {Element} imgElement DOM-элемент картинки
	 * @param {String} width       Ширина картинки
	 * @param {String} height      Высота картинки
	 * @param {String} src         Адрес картинки
	 * @param {String} defaultSrc  Адрес dafault-картинки
	 * @param {String} alt         Alt-текст для картинки
	 */
	function renderImg(imgElement, width, height, src, defaultSrc, alt) {
	  var img = new Image();
	  img.src = src;

	  img.onload = function () {
	    setImgParams(imgElement, width, height, src, alt);
	  };

	  img.onerror = function () {
	    setImgParams(imgElement, width, height, defaultSrc, alt);
	  };
	}

	/**
	 * Отрисовка фотографии оператора, обрабатывающего обращение пользователя
	 * @param {String} width  Ширина картинки
	 * @param {String} height Высота картинки
	 * @param {String} src    Адрес картинки
	 * @param {String} alt    Alt-текст для картинки
	 */
	function setImgParams(imgElement, width, height, src, alt) {
	  imgElement.setAttribute('width', width);
	  imgElement.setAttribute('height', height);
	  imgElement.setAttribute('src', src);

	  alt = alt ? alt : '';
	  imgElement.setAttribute('alt', alt);
	}

	/**
	 * Функция, позволяющая вызывать другую функцию не чаще, чем некоторое предопределенное время
	 * @param  {Function} func  Вызываемая функция
	 * @param  {Number}   wait Период между вызовами функции
	 * @return
	 */
	function debounce(func, wait, immediate) {
	  var timeout;
	  return function () {
	    var context = this,
	        args = arguments;
	    var later = function later() {
	      timeout = null;
	      if (!immediate) func.apply(context, args);
	    };
	    var callNow = immediate && !timeout;
	    clearTimeout(timeout);
	    timeout = setTimeout(later, wait);
	    if (callNow) func.apply(context, args);
	  };
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _ajax = __webpack_require__(4);

	var _messages = __webpack_require__(5);

	var _utils = __webpack_require__(6);

	exports.default = Contacts;


	/**
	 * Код клавиши 'Enter'
	 * @constant
	 * @type {Number}
	 */
	var ENTER_CODE = 13;

	/**
	 * Конструктор типа 'Контакты пользователя'
	 * @param {String}   sessionId      Идентификатор сессии работы в чате
	 * @param {Function} showDialogFunc Функция показа диалога чата
	 */
	function Contacts(sessionId, showDialogFunc) {
	  (0, _utils.bindAllFunc)(this);
	  this.sessionId = sessionId;
	  this.showDialogFunc = showDialogFunc;
	}

	/**
	 * Получение DOM-элемента тела чата
	 * @param {Element} chatBody DOM-элемента тела чата
	 */
	Contacts.prototype.setChatBody = function (chatBody) {
	  this.chatBody = chatBody;
	};

	/**
	 * Отрисовка формы ввода и просмотра контактов пользователя
	 */
	Contacts.prototype._renderContactsForm = function () {
	  this.chatContactsForm = (0, _utils.createDOMElement)('form', {
	    'class': 'nrx-chat__form nrx-chat__form--contacts',
	    'action': ''
	  });
	  this.chatBody.appendChild(this.chatContactsForm);
	  this.chatContactsForm.addEventListener('keydown', this._onContactsFormEnterDown);

	  // Подсказка пользователю
	  this.chatContactsTip = (0, _utils.createDOMElement)('p', { 'class': 'nrx-chat__tip' });
	  this.chatContactsTip.innerText = _messages.defaultText.contactsTipEmpty;
	  this.chatContactsForm.appendChild(this.chatContactsTip);

	  // Фамилия
	  this.chatSurnameField = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__field' });
	  this.chatContactsForm.appendChild(this.chatSurnameField);

	  this.chatSurnameInput = (0, _utils.createDOMElement)('input', {
	    'type': 'text',
	    'placeholder': 'Фамилия',
	    'name': 'surname',
	    'maxlength': '35'
	  });
	  this.chatSurnameField.appendChild(this.chatSurnameInput);
	  this.chatSurnameInput.focus();
	  this.chatSurnameInput.addEventListener('focus', _utils.onFieldsFocus);

	  this.chatSurnameError = (0, _utils.createDOMElement)('p', { 'class': 'nrx-error-message' });
	  this.chatSurnameField.appendChild(this.chatSurnameError);

	  // Имя
	  this.chatNameField = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__field' });
	  this.chatContactsForm.appendChild(this.chatNameField);

	  this.chatNameInput = (0, _utils.createDOMElement)('input', {
	    'type': 'text',
	    'placeholder': 'Имя',
	    'name': 'name',
	    'maxlength': '35'
	  });
	  this.chatNameField.appendChild(this.chatNameInput);
	  this.chatNameInput.addEventListener('focus', _utils.onFieldsFocus);

	  this.chatNameError = (0, _utils.createDOMElement)('p', { 'class': 'nrx-error-message' });
	  this.chatNameField.appendChild(this.chatNameError);

	  // Отчество
	  this.chatPatronymicField = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__field' });
	  this.chatContactsForm.appendChild(this.chatPatronymicField);

	  this.chatPatronymicInput = (0, _utils.createDOMElement)('input', {
	    'type': 'text',
	    'placeholder': 'Отчество',
	    'name': 'patronymic',
	    'maxlength': '35'
	  });
	  this.chatPatronymicField.appendChild(this.chatPatronymicInput);
	  this.chatPatronymicInput.addEventListener('focus', _utils.onFieldsFocus);

	  this.chatPatronymicError = (0, _utils.createDOMElement)('p', { 'class': 'nrx-error-message' });
	  this.chatPatronymicField.appendChild(this.chatPatronymicError);

	  // Номер телефона
	  this.chatPhoneField = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__field' });
	  this.chatContactsForm.appendChild(this.chatPhoneField);

	  this.chatPhoneInput = (0, _utils.createDOMElement)('input', {
	    'type': 'text',
	    'placeholder': 'Номер телефона',
	    'name': 'phone',
	    'maxlength': '25'
	  });
	  this.chatPhoneField.appendChild(this.chatPhoneInput);
	  this.chatPhoneInput.addEventListener('focus', _utils.onFieldsFocus);
	  this.chatPhoneInput.addEventListener('change', this._userPhoneIsValid);

	  this.chatPhoneError = (0, _utils.createDOMElement)('p', { 'class': 'nrx-error-message' });
	  this.chatPhoneField.appendChild(this.chatPhoneError);

	  // Электронная почта
	  this.chatEmailField = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__field' });
	  this.chatContactsForm.appendChild(this.chatEmailField);

	  this.chatEmailInput = (0, _utils.createDOMElement)('input', {
	    'type': 'email',
	    'placeholder': 'Электронный адрес',
	    'name': 'email',
	    'maxlength': '35'
	  });
	  this.chatEmailField.appendChild(this.chatEmailInput);
	  this.chatEmailInput.addEventListener('focus', _utils.onFieldsFocus);
	  this.chatEmailInput.addEventListener('change', this._userEmailIsValid);

	  this.chatEmailError = (0, _utils.createDOMElement)('p', { 'class': 'nrx-error-message' });
	  this.chatEmailField.appendChild(this.chatEmailError);

	  // Управляющие кнопки
	  this.chatContactsFormControls = (0, _utils.createDOMElement)('div', { 'class': 'nrx-chat__controls' });
	  this.chatContactsForm.appendChild(this.chatContactsFormControls);

	  this.chatCloseContactsBtn = (0, _utils.createDOMElement)('button', {
	    'class': 'nrx-btn-close-contacts',
	    'type': 'button'
	  });
	  this.chatCloseContactsBtn.innerHTML = '<< Вернуться к диалогу';
	  this.chatContactsFormControls.appendChild(this.chatCloseContactsBtn);
	  this.chatCloseContactsBtn.addEventListener('click', this.showDialogFunc);

	  this.chatSendContactsBtn = (0, _utils.createDOMElement)('button', {
	    'class': 'nrx-btn-send-contacts',
	    'type': 'submit'
	  });
	  this.chatSendContactsBtn.innerHTML = 'Сохранить';
	  this.chatContactsFormControls.appendChild(this.chatSendContactsBtn);
	  this.chatSendContactsBtn.addEventListener('click', this._onContactsSendClick);
	};

	/**
	 * Отображение контактов пользователя
	 */
	Contacts.prototype.showContacts = function () {
	  // Отрисовка формы
	  if (this.chatContactsForm) {
	    (0, _utils.removeClass)(this.chatContactsForm, 'hidden');
	  } else {
	    this._renderContactsForm();
	  }

	  // Получение контактов с сервера и заполнение или формы
	  var self = this;

	  var params = {
	    'action': 'getContacts',
	    'session': this.sessionId
	  };

	  (0, _ajax.get)(params, function (response) {
	    if (response.result) {
	      // Сохранение в localStorage признака о том, что пользователь ранее уже указал свои данные
	      if (response.email || response.phone) {
	        localStorage.setItem('nrx-userSetContacts', 'true');
	      } else {
	        localStorage.removeItem('nrx-userSetContacts');
	      }
	    } else {
	      // Контактная информация о пользователе не получена (сервер вернул result=false)
	      localStorage.removeItem('nrx-userSetContacts');
	    }

	    // Отрисовка подсказки пользователю
	    if (localStorage.getItem('nrx-userSetContacts')) {
	      self.chatContactsTip.innerText = _messages.defaultText.contactsTipFull;
	    } else {
	      self.chatContactsTip.innerText = _messages.defaultText.contactsTipEmpty;
	    }

	    // Проставление полученной от сервера контактной информации в поля формы
	    self.chatEmailInput.value = response.email || '';
	    self.chatPhoneInput.value = response.phone || '';
	    self.chatSurnameInput.value = response.surname || '';
	    self.chatNameInput.value = response.name || '';
	    self.chatPatronymicInput.value = response.patronymic || '';
	  });

	  // Установка фокуса в первое по списку поле
	  this.chatSurnameInput.focus();
	};

	/**
	 * Скрытие формы контактов пользователя
	 */
	Contacts.prototype.closeContacts = function () {
	  if (this.chatContactsForm) {
	    (0, _utils.addClass)(this.chatContactsForm, 'hidden');
	    (0, _utils.hideError)(this.chatEmailInput);
	    (0, _utils.hideError)(this.chatPhoneInput);
	  }
	};

	/**
	 * Очистка формы контактной информации о пользователе
	 */
	Contacts.prototype.clearContactsForm = function () {
	  if (this.chatContactsForm) {
	    var fields = this.chatContactsForm.querySelectorAll('.nrx-chat__field');
	    for (var i = 0; i < fields.length; i++) {
	      fields[i].querySelector('input').value = '';
	      fields[i].querySelector('.nrx-error-message').innerText = '';
	      (0, _utils.removeClass)(fields[i].querySelector('input'), 'error');
	    }
	  }
	};

	/**
	 * Проверка указанного пользователем email на корректность (соответствие формату)
	 * @return {Boolean}
	 */
	Contacts.prototype._userEmailIsValid = function () {
	  if (this.chatEmailInput.value && !(0, _utils.validateEmail)(this.chatEmailInput.value)) {
	    (0, _utils.showError)(this.chatEmailInput, _messages.errorMessages.emailFormat);
	    return false;
	  }
	  return true;
	};

	/**
	 * Проверка указанного пользователем номера телефона на корректность (соответствие формату)
	 * @return {Boolean}
	 */
	Contacts.prototype._userPhoneIsValid = function () {
	  if (this.chatPhoneInput.value && !(0, _utils.validatePhone)(this.chatPhoneInput.value)) {
	    (0, _utils.showError)(this.chatPhoneInput, _messages.errorMessages.phoneFormat);
	    return false;
	  }
	  return true;
	};

	/**
	 * Обработчик события нажатия на кнопку отправки контактов пользователя
	 */
	Contacts.prototype._onContactsSendClick = function (event) {
	  var _this = this;

	  event.preventDefault();
	  // Если поля формы заполнены неверно, отображаются сообщения об ошибках
	  if (!this.chatEmailInput.value && !this.chatPhoneInput.value) {
	    (0, _utils.showError)(this.chatEmailInput, _messages.errorMessages.needFillLeastOneField);
	    (0, _utils.showError)(this.chatPhoneInput, _messages.errorMessages.needFillLeastOneField);
	    return;
	  }

	  // Если поля формы заполнены верно, форма отправляется на сервер и скрывается из чата
	  if (this._userEmailIsValid() && this._userPhoneIsValid()) {
	    (function () {
	      var self = _this;
	      var params = {
	        'action': 'contacts',
	        'session': _this.sessionId,
	        'phone': document.querySelector('.nrx-chat__form--contacts input[name="phone"]').value,
	        'email': document.querySelector('.nrx-chat__form--contacts input[name="email"]').value,
	        'surname': document.querySelector('.nrx-chat__form--contacts input[name="surname"]').value,
	        'name': document.querySelector('.nrx-chat__form--contacts input[name="name"]').value,
	        'patronymic': document.querySelector('.nrx-chat__form--contacts input[name="patronymic"]').value
	      };

	      (0, _ajax.post)(params, function () {
	        localStorage.setItem('nrx-userSetContacts', 'true');
	        self.showDialogFunc();
	        (0, _ajax.showLoadingOk)(_messages.defaultText.contactsSaved);
	      });
	    })();
	  }
	};

	/**
	 * Обработчик события нажатия клавиши 'Enter' при заполнении формы контактов пользователя
	 * @param {Object} event
	 */
	Contacts.prototype._onContactsFormEnterDown = function (event) {
	  if (event.keyCode === ENTER_CODE) {
	    this._onContactsSendClick(event);
	  }
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = {
		"message": "data:audio/mp3;base64,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",
		"open": "data:audio/mp3;base64,SUQzAwAAAAAfdlBSSVYAAAAOAABQZWFrVmFsdWUAIQAAAFBSSVYAAAARAABBdmVyYWdlTGV2ZWwAewQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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"
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _utils = __webpack_require__(6);

	var _messages = __webpack_require__(5);

	exports.default = Socials;


	/**
	 * Конструктор типа 'Социальные кнопки'
	 */
	function Socials() {
	  (0, _utils.bindAllFunc)(this);
	}

	/**
	 * Отрисовка контейнера для кнопок
	 */
	Socials.prototype.renderContainer = function () {
	  this.socialsContainer = (0, _utils.createDOMElement)('div', { 'class': 'nrx-socials' });
	  document.querySelector('body').appendChild(this.socialsContainer);
	};

	/**
	 * Показ контейнера с кнопками (анимация)
	 */
	Socials.prototype.showSocials = function () {
	  (0, _utils.addClass)(this.socialsContainer, 'nrx-fadeInRight');
	};

	/**
	 * Отрисовка кнопки 'Telegram'
	 */
	Socials.prototype.renderTl = function (botName) {
	  this.tl = (0, _utils.createDOMElement)('div', { 'class': 'nrx-socials__item nrx-socials__item--tl' });
	  this.socialsContainer.appendChild(this.tl);

	  this.tlIcon = (0, _utils.createDOMElement)('a', {
	    'href': 'https://telegram.me/' + botName,
	    'target': '_blank'
	  });
	  this.tlIcon.innerHTML = _messages.defaultText.socialBtn;
	  this.tl.appendChild(this.tlIcon);
	};

	/**
	 * Отрисовка кнопки 'Facebook Messenger'
	 */
	Socials.prototype.renderFb = function (botName) {
	  this.fb = (0, _utils.createDOMElement)('div', { 'class': 'nrx-socials__item nrx-socials__item--fb' });
	  this.socialsContainer.appendChild(this.fb);

	  this.fbIcon = (0, _utils.createDOMElement)('a', {
	    'href': 'http://m.me/' + botName + '?ref=' + window.SERVER_1C_URL,
	    'target': '_blank'
	  });
	  this.fbIcon.innerHTML = _messages.defaultText.socialBtn;
	  this.fb.appendChild(this.fbIcon);
	};

	/**
	 * Отрисовка кнопки 'Вконтакте'
	 */
	Socials.prototype.renderVk = function (vkUserId) {
	  this.vk = (0, _utils.createDOMElement)('div', { 'class': 'nrx-socials__item nrx-socials__item--vk' });
	  this.socialsContainer.appendChild(this.vk);

	  this.vkIcon = (0, _utils.createDOMElement)('a', {
	    'href': 'https://vk.me/' + vkUserId,
	    'target': '_blank'
	  });
	  this.vkIcon.innerHTML = _messages.defaultText.socialBtn;
	  this.vk.appendChild(this.vkIcon);
	};

	/**
	 * Отрисовка кнопки 'Viber'
	 */
	// Socials.prototype.renderVb = function(phone) {
	//   this.vb = createDOMElement('div', {'class': 'nrx-socials__item nrx-socials__item--vb'});
	//   this.socialsContainer.appendChild(this.vb);

	//   this.vbIcon = createDOMElement('a', {
	//     'href': 'viber://add?number=%2B' + phone,
	//     'target': '_blank'
	//   });
	//   this.vbIcon.innerHTML = defaultText.socialBtn;
	//   this.vb.appendChild(this.vbIcon);
	// };

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.setChatStyles = setChatStyles;
	exports.setIconStyles = setIconStyles;

	/**
	 * Установка стилей для чата
	 * @param colors {Object} Цветовые настройки
	 */

	function setChatStyles(colors) {
	  var mainBg = void 0; // Цвет фона кнопки раскрытия чата, заголовка чата и кнопки 'Отправить'
	  var mainColor = void 0; // Цвет шрифта кнопки раскрытия чата, заголовка чата и кнопки 'Отправить'
	  var bodyBg = void 0; // Цвет фона чата
	  var messageTimeColor = void 0; // Цвет шрифта времени сообщения и информации о компании-разработчике чата
	  var userMessageBg = void 0; // Цвет фона сообщения пользователя
	  var userMessageColor = void 0; // Цвет текста сообщения пользователя
	  var orgMessageBg = void 0; // Цвет фона приветственного сообщения и вх. сообщений
	  var orgMessageColor = void 0; // Цвет шрифта приветственного сообщения и вх. сообщений

	  if (colors) {
	    mainBg = colors.mainBg;
	    mainColor = colors.mainColor;
	    bodyBg = colors.bodyBg;
	    messageTimeColor = colors.messageTimeColor;
	    userMessageBg = colors.userMessageBg;
	    userMessageColor = colors.userMessageColor;
	    orgMessageBg = colors.orgMessageBg;
	    orgMessageColor = colors.orgMessageColor;
	  } else {
	    mainBg = '#64B5F6';
	    mainColor = '#fff';
	    bodyBg = '#fff';
	    messageTimeColor = '#999';
	    userMessageBg = '#eee';
	    userMessageColor = '#616161';
	    orgMessageBg = '#BFE9F9';
	    orgMessageColor = '#757575';
	  }

	  var css = '.nrx-chat {position: fixed; right: 15px; bottom: 8px; z-index: 40;}' + '.nrx-chat *:not(.nrx-chat__header-img) {box-sizing: border-box;}' +
	  // Контейнер для чата
	  '.nrx-chat__wrapper {background-color:' + bodyBg + '; width: 325px; border-radius: 2px; box-shadow: 0 5px 21px -4px rgba(0, 0, 0, 0.3);}' + '.nrx-chat__wrapper.nrx-slideInUp, .nrx-chat__wrapper.nrx-slideInDown {-webkit-animation-duration: 1000ms; -moz-animation-duration: 1000ms; animation-duration: 1000ms; -webkit-animation-fill-mode: both; -moz-animation-fill-mode: both; animation-fill-mode: both;}' + '.nrx-chat__wrapper.nrx-slideInUp {-webkit-animation-name: nrx-slideInUp; -moz-animation-name: nrx-slideInUp; animation-name: nrx-slideInUp;}' + '.nrx-chat__wrapper.nrx-slideInDown {-webkit-animation-name: nrx-slideInDown; -moz-animation-name: nrx-slideInDown; animation-name: nrx-slideInDown;}' +

	  // Кнопка раскрытия чата
	  '.nrx-btn-chat {max-width: 250px; position: relative; padding: 0 20px 0 55px; height: 40px; text-align: left; border: none; border-radius: 2px; cursor: pointer; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;}' + '.nrx-btn-chat:hover, .nrx-btn-chat:focus {outline: none; box-shadow: 0px 0px 4px #999;}' + '.nrx-btn-chat:active {box-shadow: none;}' + '.nrx-btn-chat::before {content: ""; width: 25px; height: 32px; background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNi4wNjYiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjcuODE5IDYgMjYuMDY2IDIwIj4gIDxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xNi4wMSAxMi4xMTdjLTQuNDU0LS4wODgtOC4xMiAyLjY1OC04LjE5IDYuMTMyLS4wMjMgMS4yMDcuMzkyIDIuMzQ0IDEuMTMgMy4zMTdDMTAuMjE2IDIzLjE5NyA4LjgzIDI2IDguODMgMjZsNC4wOS0xLjc2MmMuODguMjggMS44MzguNDQyIDIuODQuNDYgNC40NTUuMDkgOC4xMjMtMi42NTggOC4xOS02LjEzMy4wNy0zLjQ3Mi0zLjQ4Ni02LjM2LTcuOTQtNi40NDhtMTYuNzQ0IDMuMzMzYy43MzgtLjk3MyAxLjE1My0yLjExIDEuMTMtMy4zMTgtLjA3LTMuNDc0LTMuNzM4LTYuMjItOC4xOTQtNi4xMy0zLjczMy4wNy02LjgzNiAyLjExNC03LjcgNC44MTcgMS43NDIuMzI4IDMuMzQyIDEuMDQyIDQuNjMyIDIuMDkgMS44NiAxLjUxIDIuODY0IDMuNTI0IDIuODI4IDUuNjcuMTYyLjAwNC4zMjUuMDA1LjQ4OCAwIDEuMDA1LS4wMTYgMS45Ni0uMTc4IDIuODQzLS40Nmw0LjA5IDEuNzY0Yy0uMDAyIDAtMS4zODctMi44MDQtLjExNy00LjQzNCIvPjwvc3ZnPg==) no-repeat center; background-size: contain; position: absolute; top: 50%; -ms-transform: translateY(-50%); -webkit-transform: translateY(-50%); -moz-transform: translateY(-50%); transform: translateY(-50%); left: 15px;}' + '.nrx-btn-chat.nrx-btnSlideUp, .nrx-btn-chat.nrx-btnSlideDown {-webkit-animation-duration: 1000ms; -moz-animation-duration: 1000ms; animation-duration: 1000ms; -webkit-animation-fill-mode: both; -moz-animation-fill-mode: both; animation-fill-mode: both;}' + '.nrx-btn-chat.nrx-btnSlideUp {-webkit-animation-name: nrx-btnSlideUp; -moz-animation-name: nrx-btnSlideUp; animation-name: nrx-btnSlideUp;}' + '.nrx-btn-chat.nrx-btnSlideDown {-webkit-animation-name: nrx-btnSlideDown; -moz-animation-name: nrx-btnSlideDown; animation-name: nrx-btnSlideDown;}' +

	  // Заголовок чата
	  '.nrx-chat__header {position: relative; padding: 10px 20px 10px 10px;}' + '.nrx-chat__header-img {margin: 0 16px 0 8px; vertical-align: middle; border-radius: 50%;}' + '.nrx-chat__header-text {margin: 0; display: inline-block; line-height: 1.3; vertical-align: middle; width: 210px;}' + '.nrx-btn-close {position: absolute; top: 15px; right: 10px; width: 12px; height: 12px; background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTQuMDI1IiB2aWV3Qm94PSIwIDAgMTQuMDQ3MTI1IDE0LjAyNTI1IiB3aWR0aD0iMTQuMDQ3Ij4gIDxwYXRoIGQ9Ik0xMy43NTIgMTIuMjk3bC01LjI3LTUuMjcgNS4yNC01LjE5NGMuMzk0LS4zOS4zOTQtMS4wMjQgMC0xLjQxNC0uMzk1LS4zOS0xLjAzNS0uMzktMS40MyAwbC01LjIzIDUuMTg3LTUuMzEtNS4zMUMxLjM2LS4xLjcyLS4xLjMyNi4yOTctLjA3LjY5Mi0uMDcgMS4zMzQuMzI1IDEuNzNsNS4zIDUuMy01LjMzIDUuMjg4Yy0uMzk0LjM5LS4zOTQgMS4wMjQgMCAxLjQxNC4zOTQuMzkgMS4wMzQuMzkgMS40MyAwbDUuMzIzLTUuMjggNS4yNzYgNS4yNzZjLjM5NC4zOTYgMS4wMzQuMzk2IDEuNDI4IDAgLjM5My0uMzk0LjM5My0xLjAzNSAwLTEuNDN6IiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNmZmYiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==) no-repeat center; background-size: contain; border: none; cursor: pointer; opacity: 0.3;}' + '.nrx-btn-close:hover, .nrx-btn-close:focus {opacity: 0.7;}' + '.nrx-btn-close:focus {outline: none;}' + '.nrx-btn-close:active {opacity: 0.7;}' +

	  // Тело чата и Информация о компании-разработчике
	  '.nrx-chat__body {height: 420px; padding: 40px 0 15px; position: relative;}' + '.nrx-chat__copyright {font: normal 12px/1.4 Arial, sans-serif; position: absolute; top: 5px; right: 20px;}' + '.nrx-chat__copyright p {color:' + messageTimeColor + '; display: inline;}' +

	  // Сообщение о результате отправки запроса на сервер
	  '.nrx-server-message {color: #777; padding: 10px 12px; max-width: 190px; margin: 2px 0;}' + '.nrx-server-message.nrx-fadeInRight {-webkit-animation-name: nrx-fadeInRight; -moz-animation-name: nrx-fadeInRight; animation-name: nrx-fadeInRight; -webkit-animation-duration: 1000ms; -moz-animation-duration: 1000ms; animation-duration: 1000ms; -webkit-animation-fill-mode: both; -moz-animation-fill-mode: both; animation-fill-mode: both;}' + '.nrx-server-message.nrx-fadeOut {-webkit-animation-name: nrx-fadeOut; -moz-animation-name: nrx-fadeOut; animation-name: nrx-fadeOut; -webkit-animation-duration: 1000ms; -moz-animation-duration: 1000ms; animation-duration: 1000ms; -webkit-animation-fill-mode: both; -moz-animation-fill-mode: both; animation-fill-mode: both;}' + '.nrx-server-message.nrx-ok-message {background-color: #c8e6c9;}' + '.nrx-server-message.nrx-error-message {background-color: #ffcdd2;}' +

	  // Диалог чата
	  '.nrx-chat__dialog {display: block; height: 227px; margin-bottom: 20px; padding: 0 20px; overflow-y: scroll; position: relative;}' + '.nrx-chat__message-wrapper {position: relative;}' + '.nrx-chat__message, .nrx-chat__tip {font: normal 13px/1.4 Arial, sans-serif; max-width: 85%; min-width: 60px; min-height: 35px; margin-top: 0; position: relative; display: inline-block; margin-bottom: 15px; padding: 10px 15px; vertical-align: top; border-radius: 10px;}' + '.nrx-chat__message--user {color:' + userMessageColor + '; background-color:' + userMessageBg + '; float: right;}' + '.nrx-chat__message--org, .nrx-chat__tip {color:' + orgMessageColor + '; background-color:' + orgMessageBg + ';}' + '.nrx-chat__message--org {float: left;}' + '.nrx-chat__message--user::before, .nrx-chat__message--org::before, .nrx-chat__tip::before {content: ""; position: absolute; top: 5px; z-index: 1; width: 0;  height: 0; border-width: 15px; border-style: solid;}' + '.nrx-chat__message--user::before {border-color:' + userMessageBg + ' transparent transparent transparent; right: -10px; -ms-transform: rotateX(-150deg); -webkit-transform: rotateX(-150deg); transform: rotateX(-150deg);}' + '.nrx-chat__message--org::before, .nrx-chat__tip::before {border-color:' + orgMessageBg + ' transparent transparent transparent; left: -10px;}' + '.nrx-chat__message-time {font: normal 12px/1.4 Arial, sans-serif; color:' + messageTimeColor + '; position: absolute; top: 50%; -ms-transform: translateY(-50%); -webkit-transform: translateY(-50%); -moz-transform: translateY(-50%); transform: translateY(-50%);}' + '.nrx-chat__message--user .nrx-chat__message-time {left: -40px;}' + '.nrx-chat__message--org .nrx-chat__message-time {right: -40px;}' + '.nrx-chat__message-wrapper::before, .nrx-chat__message-wrapper::after, .nrx-chat__controls::before, .nrx-chat__controls::after {content: " "; display: table;}' + '.nrx-chat__message-wrapper::after, .nrx-chat__controls::after {clear: both;}' +

	  // Информация о том, что оператор набирает текст
	  '.nrx-chat__oper-typing {font: bold 12px/1.4 Arial, sans-serif; color:' + messageTimeColor + '; font-style: italic; padding: 0 0 0 20px; margin: 0; position: absolute; top: -20px;}' + '.nrx-chat__oper-typing:before {content: ""; position: absolute; left: 0; width: 15px; height: 15px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADNQTFRFAAAAPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09EvTTBAAAABB0Uk5TAA8fLz9PX29/j5+vv8/f7/rfIY4AAAIeSURBVHja7ZvRjoMgEEVBERER5v+/dgWroq7drNmdmzQzL2186D0ewQAFpT6jGtNA8y0RTVbjABLlSgNKg6G1QgcBCLRXtEgBIIRABEUwdK1gAAL6qUYYNLcAP38d6+dgmAWUd0DjKwTHLUCdEYLmFrAg7L1i0uwCSnVpJRgBAnLprTVCBFTXI0bAfr0DC/BoAY0IEAEiACkgoAUYkIAGLcCLABEgAkSACMALiGgBFiRAowU4tIAkAkSACBABIoASWoADCVDxJUCDBFgRIAJEgAgQAXgBhBbgUQImpmXpOwEGLSCIABEgAkSACCBqwQICSsDItCw93AhgW5d3NwK41uXvANgElDaYrksvbAIKgPHn3sYnYAHIN3zYlMYn4AWQO121Ka3lE7AC6Lg2xLYft41yhg9AtXNqdM7HetuqYgTYZiBVGVaAjWDsW8snoAJQzRBGZzYUp7kBjtNBrp3TVwDe/CsAc746T/2589VpWyx7/gnAsecfATx//gEAkV/+kI/LOweRvw6K04wAyd/PbsQRkp8BTLcfmuA/QmTLYLANhLn/0vHLZ58bglE4gNlEahUOwDLMgt8BtJjnvwHkASkovwA0c36vcAB6Ytgj/g4Amr8MACaFBfjxrJS5VO+cs+eLj/pxX72AdP4VO/+0G0Ip+mU9mck0kXyOm+gv6gnAs6TpW+QnBi5nOVOR70qtD/df52jjKy4HKalPrS+YgHs5fyb5pwAAAABJRU5ErkJggg==") no-repeat center; background-size: contain;}' +

	  // Формы
	  '.nrx-chat__form {padding: 0 15px; position: relative;}' + '.nrx-chat__form--contacts .nrx-chat__tip {width: 100%; max-width: 98%; margin: 0 0 20px 5px;}' + '.nrx-chat__form--contacts .nrx-chat__field {margin-bottom: 5px;}' +

	  // Поля ввода
	  '.nrx-chat textarea, .nrx-chat input {font: normal 13px/1.4 Arial, sans-serif; width: 100%; padding: 0 10px; color: #4b4a4a; background-color: #fff; border: 1px solid #dcdcdc; border-radius: 4px; resize: none; overflow: auto;}' + '.nrx-chat input {height: 32px;}' + '.nrx-chat textarea.error, .nrx-chat input.error {border-color: #e57373;}' + '.nrx-chat textarea.error:invalid, .nrx-chat input.error:invalid {box-shadow: none; outline: 0;}' + '.nrx-chat textarea {height: 60px; padding-top: 10px; padding-bottom: 10px; line-height: 1.4; vertical-align: top;}' + '.nrx-chat textarea:focus, .nrx-chat input:focus {border-color:' + mainBg + '; outline: none;}' + '.nrx-chat textarea::-webkit-input-placeholder, .nrx-chat input::-webkit-input-placeholder {color: #bdbdbd;}' + '.nrx-chat textarea::-moz-placeholder, .nrx-chat input::-moz-placeholder {color: #bdbdbd;}' + '.nrx-chat textarea:-ms-input-placeholder, .nrx-chat input:-ms-input-placeholder {color: #bdbdbd;}' +

	  // Кнопки и ссылки форм
	  '.nrx-chat__controls {margin-top: 10px;}' + '.nrx-btn-send-message, .nrx-btn-send-contacts {padding: 0 20px; height: 35px; vertical-align: top; text-align: center; border: none; border-radius: 4px; cursor: pointer; float: right;}' + '.nrx-btn-send-message:hover, .nrx-btn-send-contacts:hover, .nrx-btn-send-message:focus, .nrx-btn-send-contacts:focus {outline: none; opacity: 0.7;}' + '.nrx-btn-send-message:active, .nrx-btn-send-contacts:active {opacity: 0.9;}' + '.nrx-btn-set-contacts, .nrx-btn-close-contacts {background: none; border: none; padding: 0; margin-right: 20px; line-height: 35px; cursor: pointer;}' + '.nrx-btn-set-contacts, .nrx-chat__copyright a {color:' + mainBg + '; text-decoration: none;}' + '.nrx-btn-set-contacts:hover, .nrx-btn-close-contacts:hover, .nrx-chat__copyright a:hover, .nrx-chat__copyright a:focus {text-decoration: underline; opacity: 0.8;}' + '.nrx-btn-set-contacts:active, .nrx-btn-close-contacts:active, .nrx-chat__copyright a:active {opacity: 0.6;}' + '.nrx-btn-set-contacts:focus, .nrx-btn-close-contacts:focus {outline: none;}' + '.nrx-btn-close-contacts {color:' + messageTimeColor + '; text-decoration: none;}' +

	  // Ошибки (серверные и для полей ввода)
	  '.nrx-error-message, .nrx-server-message {font: normal 11px/1.4 Arial, sans-serif; overflow: hidden; line-height: 1; text-align: left; white-space: nowrap; text-overflow: ellipsis;}' + '.nrx-error-message {color: #f44336; width: 295px; height: 13px; margin: 0 0 0 4px;}' +

	  // Общие настройки
	  '.nrx-chat__header, .nrx-btn-chat, .nrx-btn-send-message, .nrx-btn-send-contacts {font: normal 14px/1.4 Arial, sans-serif; color:' + mainColor + '; background-color:' + mainBg + '; border-top-left-radius: 2px; border-top-right-radius: 2px;}' + '.nrx-chat__wrapper.hidden, .nrx-chat__dialog.hidden, .hidden {display: none;}' +

	  // Анимация раскрытия чата
	  '@-webkit-keyframes nrx-slideInUp {from {-webkit-transform: translate(0, 500px); visibility: visible;} to {-webkit-transform: translate(0, 0);}}' + '@-moz-keyframes nrx-slideInUp {from {-moz-transform: translate(0, 500px); visibility: visible;} to {-moz-transform: translate(0, 0);}}' + '@keyframes nrx-slideInUp {from {transform: translate(0, 500px); visibility: visible;} to {transform: translate(0, 0);}}' +

	  // Анимация закрытия чата
	  '@-webkit-keyframes nrx-slideInDown {from {-webkit-transform: translate(0, 0); visibility: visible;} to {-webkit-transform: translate(0, 500px);}}' + '@-moz-keyframes nrx-slideInDown {from {-moz-transform: translate(0, 0); visibility: visible;} to {-moz-transform: translate(0, 500px);}}' + '@keyframes nrx-slideInDown {from {transform: translate(0, 0); visibility: visible;} to {transform: translate(0, 500px);}}' +

	  // Анимация появления сообщения о результате отправки запроса к серверу
	  '@-webkit-keyframes nrx-fadeInRight {from { opacity: 0; -webkit-transform: translate(100%, 0); transform: translate(100%, 0);} to {opacity: 1; -webkit-transform: none; transform: none;}}' + '@-moz-keyframes nrx-fadeInRight {from { opacity: 0; -webkit-transform: translate(100%, 0); transform: translate(100%, 0);} to {opacity: 1; -webkit-transform: none; transform: none;}}' + '@keyframes nrx-fadeInRight {from {opacity: 0; -webkit-transform: translate(100%, 0); transform: translate(100%, 0);} to {opacity: 1; -webkit-transform: none; transform: none;}}' +

	  // Анимация скрытия сообщения о результате отправки запроса к серверу
	  '@-webkit-keyframes nrx-fadeOut {from {opacity: 1;} to {opacity: 0;}}' + '@-moz-keyframes nrx-fadeOut {from {opacity: 1;} to {opacity: 0;}}' + '@keyframes nrx-fadeOut {from {opacity: 1;} to {opacity: 0;}}' +

	  // Анимация появления кнопки раскрытия чата
	  '@-webkit-keyframes nrx-btnSlideUp {from {-webkit-transform: translate(0, 150px); visibility: visible;} to {-webkit-transform: translate(0, 0);}}' + '@-moz-keyframes nrx-btnSlideUp {from {-moz-transform: translate(0, 150px); visibility: visible;} to {-moz-transform: translate(0, 0);}}' + '@keyframes nrx-btnSlideUp {from {transform: translate(0, 150px); visibility: visible;} to {transform: translate(0, 0);}}' +

	  // Анимация скрытия кнопки раскрытия чата
	  '@-webkit-keyframes nrx-btnSlideDown {from {-webkit-transform: translate(0, 0); visibility: visible;} to {-webkit-transform: translate(0, 150px);}}' + '@-moz-keyframes nrx-btnSlideDown {from {-moz-transform: translate(0, 0); visibility: visible;} to {-moz-transform: translate(0, 150px);}}' + '@keyframes nrx-btnSlideDown {from {transform: translate(0, 0); visibility: visible;} to {transform: translate(0, 150px);}}';

	  insertStylesToDOM(css);
	}

	/**
	 * Установка стилей для социальных кнопок
	 * @param {Object} colors Цветовые настройки
	 */
	function setIconStyles(colors) {
	  var color = void 0,
	      bgTl = void 0,
	      bgFb = void 0,
	      bgVb = void 0,
	      bgVk = void 0;
	  if (colors) {
	    color = colors.mainColor;
	    bgTl = colors.mainBg;
	    bgFb = colors.mainBg;
	    bgVk = colors.mainBg;
	    bgVb = colors.mainBg;
	  } else {
	    color = '#fff';
	    bgTl = '#64a9dc';
	    bgFb = '#29AAE3';
	    bgVk = '#4c75a3';
	    bgVb = '#7d3daf';
	  }

	  var css = '.nrx-socials {position: fixed; bottom: 510px; right: 0; z-index: 30;}' + '.nrx-socials.nrx-fadeInRight {-webkit-animation-name: nrx-fadeInRight; -moz-animation-name: nrx-fadeInRight; animation-name: nrx-fadeInRight; -webkit-animation-duration: 1000ms; -moz-animation-duration: 1000ms; animation-duration: 1000ms; -webkit-animation-fill-mode: both; -moz-animation-fill-mode: both; animation-fill-mode: both;}' + '.nrx-socials__item {position: relative;}' + '.nrx-socials__item:not(:last-of-type) {margin-bottom: 5px;}' + '.nrx-socials__item a {font: normal 14px/1.4 Arial, sans-serif; color:' + color + '; position: relative; display: block; height: 45px; padding: 0 15px 0 50px; line-height: 45px; vertical-align: top; text-decoration: none; -ms-transform: translateX(112px); -webkit-transform: translateX(112px); transform: translateX(112px); box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);}' + '.nrx-socials__item a:hover {-ms-transform: translateX(0); -webkit-transform: translateX(0); transform: translateX(0); transition: transform 0.3s ease;}' + '.nrx-socials__item a:focus {outline: none; -ms-transform: translateX(112px); -webkit-transform: translateX(112px); transform: translateX(112px);}' + '.nrx-socials__item a:active {opacity: 0.5; -ms-transform: translateX(112px); -webkit-transform: translateX(112px); transform: translateX(112px);}' + '.nrx-socials__item a::before {content: ""; left: 10px; width: 28px; height: 28px; background-repeat: no-repeat; background-position: center; background-size: contain; position: absolute; top: 50%; -ms-transform: translateY(-50%); -webkit-transform: translateY(-50%); transform: translateY(-50%);}' +

	  // Telegram
	  '.nrx-socials__item--tl a {background-color:' + bgTl + ';}' + '.nrx-socials__item--tl a::before {background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNi40MDYyNSAxNC4yODQzOTUiIHdpZHRoPSIyOCIgaGVpZ2h0PSIyNC4zNzkiPiAgPHBhdGggZD0iTS4yOSA2Ljg1bDMuNzggMS40MSAxLjQ2MyA0LjcwNmMuMDk0LjMuNDYzLjQxMy43MDcuMjEzbDIuMTA3LTEuNzJjLjIyLS4xOC41MzYtLjE4OC43NjctLjAybDMuOCAyLjc2Yy4yNjIuMTkuNjMzLjA0Ni42OTgtLjI3TDE2LjM5Ny41MzZjLjA3LS4zNDUtLjI2OC0uNjM0LS41OTctLjUwNkwuMjg1IDYuMDE3Yy0uMzgzLjE0Ny0uMzguNjkuMDA1LjgzM3ptNS4wMDguNjZsNy4zODgtNC41NWMuMTMyLS4wODMuMjcuMDk3LjE1NS4yMDNMNi43NDUgOC44M2MtLjIxNS4yLS4zNTMuNDY3LS4zOTIuNzU3bC0uMjA4IDEuNTRjLS4wMjcuMjA0LS4zMTYuMjI1LS4zNzMuMDI2bC0uNzk3LTIuODA3Yy0uMDkyLS4zMi4wNC0uNjYyLjMyNS0uODM3eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==);}' +

	  // Facebook Messenger
	  '.nrx-socials__item--fb a {background-color:' + bgFb + ';}' + '.nrx-socials__item--fb a::before {background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0NC40NjciIGhlaWdodD0iMjAiIHZpZXdCb3g9Ijk2IDkzIDQ0LjQ2ODA3MyAyMCI+ICA8cGF0aCBkPSJNMTIxLjc0NSAxMTNsLTguNzI1LTkuMzYyTDk2IDExM2wxOC43MjUtMjAgOC45MzUgOS4zNjNMMTQwLjQ2OCA5M3oiIGZpbGw9IiNmZmYiLz48L3N2Zz4=); width: 30px;}' +

	  // Вконтакте
	  '.nrx-socials__item--vk a {background-color:' + bgVk + ';}' + '.nrx-socials__item--vk a::before {background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNi42NDQ2ODkgOS40MTkzNzMxIiB3aWR0aD0iMjgiIGhlaWdodD0iMTUuODQ1Ij4gIDxwYXRoIGQ9Ik0xNC4zMjUgNS45OWMuNTUyLjUzOCAxLjEzNSAxLjA0NSAxLjYzIDEuNjQuMjIuMjYzLjQyNi41MzUuNTg0Ljg0LjIyNC40MzYuMDIuOTE1LS4zNy45NGgtMi40MjRjLS42MjYuMDUtMS4xMjUtLjItMS41NDQtLjYyOC0uMzM2LS4zNDItLjY0Ny0uNzA2LS45Ny0xLjA2LS4xMzItLjE0NC0uMjctLjI4LS40MzYtLjM4Ny0uMzMtLjIxNS0uNjE4LS4xNS0uODA3LjE5Ni0uMTk0LjM1Mi0uMjM4Ljc0LS4yNTcgMS4xMzItLjAyNi41Ny0uMTk4LjcyLS43NzIuNzQ3LTEuMjI1LjA1Ny0yLjM4OC0uMTI4LTMuNDctLjc0Ny0uOTUtLjU0NS0xLjY5LTEuMzE0LTIuMzMzLTIuMTg2QzEuOTA1IDQuNzguOTQ3IDIuOTE3LjA4NCAxLS4xMS41Ny4wMzIuMzM4LjUwOC4zMyAxLjI5OC4zMTIgMi4wOS4zMTQgMi44ODIuMzI3Yy4zMjIuMDA0LjUzNS4xOS42Ni40OTMuNDI3IDEuMDUzLjk1IDIuMDU0IDEuNjA4IDIuOTgyLjE3NS4yNDcuMzUzLjQ5NC42MDguNjY4LjI4LjE5My40OTUuMTMuNjI3LS4xODQuMDg0LS4yLjEyLS40MTMuMTQtLjYyNi4wNjItLjczLjA3LTEuNDYyLS4wNC0yLjE5LS4wNjctLjQ1Ny0uMzIzLS43NS0uNzc3LS44MzdDNS40NzYuNTkgNS41MS41MDMgNS42MjMuMzcgNS44MTguMTQyIDYgMCA2LjM2NiAwaDIuNzRjLjQzMi4wODUuNTI4LjI4LjU4Ny43MTNsLjAwMiAzLjA0NGMtLjAwNC4xNjguMDg0LjY2Ny4zODcuNzc4LjI0Mi4wOC40MDItLjExNC41NDctLjI2OC42NTYtLjY5NyAxLjEyNC0xLjUyIDEuNTQyLTIuMzcyLjE4Ni0uMzc0LjM0NS0uNzY0LjUtMS4xNTIuMTE1LS4yOS4yOTUtLjQzLjYyLS40MjVMMTUuOTMuMzJjLjA3NyAwIC4xNTcuMDAyLjIzMi4wMTUuNDQ1LjA3Ni41NjcuMjY3LjQzLjctLjIxNy42ODItLjYzOCAxLjI1LTEuMDUgMS44Mi0uNDQuNjA4LS45MSAxLjE5Ni0xLjM0NiAxLjgwOC0uNC41Ni0uMzcuODQuMTMgMS4zMjZ6bTAgMCIgY2xpcC1ydWxlPSJldmVub2RkIiBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=);}' +

	  // Viber
	  // '.nrx-socials__item--vb a {background-color:' + bgVb + ';}' +
	  // '.nrx-socials__item--vb a::before {background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNy42MDkzNzcgMTguMDgyMjkiIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOC43NTIiPiAgPHBhdGggZD0iTTE1LjIzMiA3LjU4N2MuMDIyLTIuNTUtMi4xNS00Ljg4Ny00Ljg0LTUuMjEtLjA1NC0uMDA2LS4xMTItLjAxNi0uMTc0LS4wMjYtLjEzMy0uMDItLjI3LS4wNDQtLjQxLS4wNDQtLjU1MiAwLS43LjM4OC0uNzM4LjYyLS4wMzguMjIzLS4wMDIuNDEyLjEwNy41Ni4xODIuMjQ4LjUwNC4yOTIuNzYyLjMyNy4wNzUuMDEuMTQ2LjAyLjIwNi4wMzQgMi40MTcuNTQgMy4yMyAxLjM5IDMuNjMgMy43ODYuMDEuMDYuMDEzLjEzLjAxOC4yMDguMDE3LjI4Ny4wNTMuODgzLjY5NC44ODMuMDU0IDAgLjExLS4wMDUuMTctLjAxMy41OTgtLjA5LjU4LS42MzYuNTctLjg5OC0uMDAzLS4wNzQtLjAwNS0uMTQzIDAtLjE5LjAwMy0uMDEuMDA0LS4wMjMuMDA0LS4wMzV6IiBmaWxsPSIjZmZmIi8+ICA8cGF0aCBkPSJNOS42NSAxLjQ0Yy4wNzMuMDA2LjE0LjAxLjE5Ny4wMiAzLjk3LjYxIDUuNzk2IDIuNDkyIDYuMzAyIDYuNDkyLjAwNy4wNjguMDEuMTUuMDEuMjQuMDA1LjMxMi4wMTYuOTYyLjcxNC45NzVoLjAyMmMuMjIgMCAuMzkzLS4wNjUuNTE3LS4xOTYuMjE4LS4yMjYuMjAzLS41NjQuMTktLjgzNi0uMDAzLS4wNjYtLjAwNS0uMTMtLjAwNS0uMTg0LjA1LTQuMDktMy40OS03LjgwMi03LjU4LTcuOTQtLjAxNiAwLS4wMzMgMC0uMDUuMDAzLS4wMDcgMC0uMDIyLjAwMy0uMDQ3LjAwMy0uMDQgMC0uMDktLjAwNC0uMTQzLS4wMDdDOS43MTIuMDA0IDkuNjQgMCA5LjU2NSAwYy0uNjUgMC0uNzc0LjQ2My0uNzkuNzQtLjAzNy42MzYuNTguNjguODc2LjcwM3ptNi4zMDcgMTEuNjgzYy0uMDg0LS4wNjQtLjE3Mi0uMTMtLjI1My0uMTk3LS40MzQtLjM0OC0uODk1LS42Ny0xLjM0LS45OGwtLjI3OC0uMTk1Yy0uNTctLjQtMS4wODUtLjU5NS0xLjU3LS41OTUtLjY1NCAwLTEuMjIzLjM2LTEuNjk0IDEuMDczLS4yMDguMzE2LS40Ni40Ny0uNzcyLjQ3LS4xODUgMC0uMzk0LS4wNTMtLjYyMi0uMTU3LTEuODQ0LS44MzUtMy4xNi0yLjExNy0zLjkxNC0zLjgxLS4zNjQtLjgxNy0uMjQ2LTEuMzUyLjM5NS0xLjc4Ny4zNjItLjI0NyAxLjA0LS43MDcuOTkyLTEuNTg3LS4wNTUtMS0yLjI2LTQuMDA2LTMuMTktNC4zNDgtLjM5My0uMTQ1LS44MDYtLjE0Ni0xLjIzLS4wMDMtMS4wNjguMzYtMS44MzUuOTktMi4yMTcgMS44MjQtLjM3LjgwNC0uMzUyIDEuNzUuMDUgMi43MzVDMS40NyA4LjQxIDMuMSAxMC44OSA1LjE1NiAxMi45MzhjMi4wMSAyLjAwNCA0LjQ4MyAzLjY0NSA3LjM0OCA0Ljg4LjI1OC4xMS41My4xNy43MjYuMjE0bC4xNy4wNGMuMDIzLjAwNi4wNDcuMDEuMDcuMDFoLjAyNGMxLjM0NyAwIDIuOTY0LTEuMjMgMy40Ni0yLjYzNC40MzYtMS4yMy0uMzU4LTEuODM2LS45OTctMi4zMjR6bS01LjcxLTguNDNjLS4yMy4wMDUtLjcxLjAxNi0uODguNTA1LS4wNzguMjMtLjA2OC40MjcuMDMuNTkuMTQyLjIzOC40MTYuMzEyLjY2NS4zNTIuOTA0LjE0NSAxLjM2OC42NDUgMS40NiAxLjU3Mi4wNDQuNDMzLjMzNS43MzUuNzEuNzM1LjAyNyAwIC4wNTUgMCAuMDgzLS4wMDUuNDUtLjA1My42NjgtLjM4NC42NS0uOTgyLjAwNi0uNjI1LS4zMi0xLjMzMy0uODc3LTEuODk4LS41NTctLjU2Ni0xLjIzLS44ODUtMS44NC0uODd6IiBmaWxsPSIjZmZmIi8+PC9zdmc+);}' +

	  // Анимация появления панели с кнопками
	  '@-webkit-keyframes nrx-fadeInRight {from { opacity: 0; -webkit-transform: translate(100%, 0); transform: translate(100%, 0);} to {opacity: 1; -webkit-transform: none; transform: none;}}' + '@-moz-keyframes nrx-fadeInRight {from { opacity: 0; -webkit-transform: translate(100%, 0); transform: translate(100%, 0);} to {opacity: 1; -webkit-transform: none; transform: none;}}' + '@keyframes nrx-fadeInRight {from {opacity: 0; -webkit-transform: translate(100%, 0); transform: translate(100%, 0);} to {opacity: 1; -webkit-transform: none; transform: none;}}';

	  insertStylesToDOM(css);
	}

	/**
	 * Вставка стилей в DOM-дерево
	 * @param  {String} css Стили, которые нужно вставить
	 */
	function insertStylesToDOM(css) {
	  var head = document.head || document.querySelector('head')[0];
	  var style = document.createElement('style');
	  style.type = 'text/css';

	  if (style.styleSheet) {
	    style.styleSheet.cssText = css;
	  } else {
	    style.appendChild(document.createTextNode(css));
	  }

	  head.appendChild(style);
	}

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var pageVisibility = {
	  b: null,
	  q: document,
	  p: undefined,
	  prefixes: ['', 'webkit', 'ms', 'moz'],
	  props: ['VisibilityState', 'visibilitychange', 'Hidden'],
	  m: ['focus', 'blur'],
	  visibleCallbacks: [],
	  hiddenCallbacks: [],
	  _callbacks: [],
	  onVisible: function onVisible(_callback) {
	    this.visibleCallbacks.push(_callback);
	  },
	  onHidden: function onHidden(_callback) {
	    this.hiddenCallbacks.push(_callback);
	  },
	  isSupported: function isSupported() {
	    var self = this;
	    return this.prefixes.some(function (prefix) {
	      return self._supports(prefix);
	    });
	  },
	  _supports: function _supports(prefix) {
	    return lowerFirst(prefix + this.props[2]) in this.q;
	  },
	  runCallbacks: function runCallbacks(index) {
	    if (index) {
	      this._callbacks = index === 1 ? this.visibleCallbacks : this.hiddenCallbacks;
	      for (var i = 0; i < this._callbacks.length; i++) {
	        this._callbacks[i]();
	      }
	    }
	  },
	  _visible: function _visible() {
	    pageVisibility.runCallbacks(1);
	  },
	  _hidden: function _hidden() {
	    pageVisibility.runCallbacks(2);
	  },
	  _nativeSwitch: function _nativeSwitch() {
	    this.q[lowerFirst(this.b + this.props[2])] === true ? this._hidden() : this._visible();
	  },
	  listen: function listen() {
	    try {
	      if (!this.isSupported()) {
	        if (document.addEventListener) {
	          window.addEventListener(this.m[0], this._visible, 1);
	          window.addEventListener(this.m[1], this._hidden, 1);
	        } else {
	          this.q.attachEvent('onfocusin', this._visible);
	          this.q.attachEvent('onfocusout', this._hidden);
	        }
	      } else {
	        var self = this;
	        this.b = this.prefixes.reduce(function (memo, prefix) {
	          if (memo !== false) {
	            return memo;
	          }
	          if (self._supports(prefix)) {
	            return prefix;
	          }
	          return memo;
	        }, false);
	        this.q.addEventListener(lowerFirst(this.b + this.props[1]), function () {
	          pageVisibility._nativeSwitch.apply(pageVisibility, arguments);
	        }, 1);
	      }
	    } catch (e) {}
	  },
	  init: function init() {
	    this.listen();
	  }
	};

	pageVisibility.init();

	function lowerFirst(str) {
	  return str[0].toLowerCase() + str.substr(1);
	}

	exports.default = pageVisibility;

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjJkMjVlZGIzMjNhMDM0YTM3OWUiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL3NjcmlwdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvY29tcG9uZW50cy9DaGF0LmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9jb21wb25lbnRzL0RpYWxvZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvY29tbW9uL2FqYXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2NvbW1vbi9tZXNzYWdlcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvY29tbW9uL3V0aWxzLmpzIiwid2VicGFjazovLy8uL3NyYy9qcy9jb21wb25lbnRzL0NvbnRhY3RzLmpzIiwid2VicGFjazovLy8uL3NyYy9hdWRpby9hdWRpby5qc29uIiwid2VicGFjazovLy8uL3NyYy9qcy9jb21wb25lbnRzL1NvY2lhbHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2NvbW1vbi9zdHlsZXMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2pzL2NvbW1vbi9wYWdlVmlzaWJpbGl0eS5qcyJdLCJuYW1lcyI6WyJBQ1RJVkVfUEVSSU9EIiwiU0hPV19CVE5fREVMQVkiLCJjaGF0Iiwic29jaWFscyIsImxhc3RUYWJJbmRleCIsInNob3dUaW1lcyIsIl9nZXRTZXR0aW5ncyIsInBhcmFtcyIsInJlc3BvbnNlIiwic29jaWFsc1NldHRpbmdzIiwiY2hhbm5lbHMiLCJjb2xvclNldHRpbmdzIiwiY29sb3JzIiwiY2hhdFNldHRpbmdzIiwicHVzaCIsInRpbWVTaG93MSIsInRpbWVTaG93MiIsInRpbWVTaG93MyIsImhlYWRlciIsIndlbGNvbWUiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsIl9hY3RpdmF0ZVBhZ2UiLCJsZW5ndGgiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3IiLCJyZW5kZXJDb250YWluZXIiLCJmb3JFYWNoIiwiaXRlbSIsImNoYW5uZWwiLCJyZW5kZXJUbCIsImlkIiwicmVuZGVyRmIiLCJyZW5kZXJWayIsInNob3dTb2NpYWxzIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsInNldEl0ZW0iLCJEYXRlIiwibm93IiwiYWN0aXZhdGVDaGF0IiwiX29uU3RvcmFnZUNoYW5nZSIsImV2ZW50Iiwia2V5IiwiZGVhY3RpdmF0ZUNoYXQiLCJfb25QYWdlSXNMb2FkZWQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwib25WaXNpYmxlIiwiQ2hhdCIsIkNPUFlSSUdIVF9VUkwiLCJDTE9TRV9DSEFUX0FOSU1BVEVfREVMQVkiLCJPUEVOX0NIQVRfREVMQVkiLCJsaXN0ZW5lclRpbWVvdXREZWxheSIsImhlYWRlclRleHQiLCJ3ZWxjb21lVGV4dCIsInRpbWVzIiwiY2hhdEhlYWRlciIsImNoYXRXZWxjb21lIiwidGltZXNTaG93Iiwidm9pY2VzIiwiYXV0b09wZW5UaW1lcklkIiwiZ2V0TWVzc2FnZVRpbWVySWQiLCJzYXZlZFNlc3Npb25JZCIsInNlc3Npb25JZCIsIm5ld1Nlc3Npb25JZCIsImdlbmVyYXRlU2Vzc2lvbklkIiwiZGlhbG9nIiwic2hvd0NvbnRhY3RzIiwiY29udGFjdHMiLCJzaG93RGlhbG9nIiwicHJvdG90eXBlIiwiX3JlbmRlckNoYXRDb250YWluZXIiLCJjaGF0Q29udGFpbmVyIiwiYXBwZW5kQ2hpbGQiLCJfcmVuZGVyQ2hhdEJ0biIsImJ0bkNoYXQiLCJpbm5lckhUTUwiLCJfb25CdG5DaGF0Q2xpY2siLCJzZXRCdG5DaGF0IiwiX3JlbmRlckNoYXQiLCJjaGF0Q29udGFjdHNTZXJ2ZXJSZXN1bHRNZXNzYWdlIiwic2V0Q2hhdCIsImNoYXRIZWFkZXJJbWciLCJjaGF0SGVhZGVyVGV4dCIsImNoYXRDbG9zZUJ0biIsIl9jbG9zZUNoYXQiLCJjaGF0Qm9keSIsInNldENoYXRCb2R5IiwiY2hhdENvcHlyaWdodCIsImNoYXRDb3B5cmlnaHRUZXh0IiwiY2hhdENvcHlyaWdodExpbmsiLCJyZW5kZXJEaWFsb2ciLCJfZ2V0TWVzc2FnZSIsInNlbGYiLCJ1c2VySXNUeXBpbmdOb3ciLCJfc2V0T3BlcmF0b3JOYW1lIiwibmFtZSIsIl9zZXRPcGVyYXRvclBob3RvIiwicGhvdG8iLCJtZXNzYWdlIiwicmVuZGVyTWVzc2FnZSIsIndyaXRlcyIsIl9yZW5kZXJPcGVyYXRvcklzVHlwaW5nTWVzc2FnZSIsIl9oaWRlT3BlcmF0b3JJc1R5cGluZ01lc3NhZ2UiLCJzZXRMb2FkVGltZW91dCIsInBob3RvVXJsIiwiX3JlbmRlckhpc3RvcnkiLCJoaXN0b3J5Iiwic2hvd0hpc3RvcnkiLCJ0aW1lIiwibG9hZEhpc3RvcnkiLCJjbGVhckxvYWRUaW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwiX3NldE9wZW5lZFRhYiIsImhpZGVEaWFsb2ciLCJjbG9zZUNvbnRhY3RzIiwiY2xlYXJDb250YWN0c0Zvcm0iLCJyZXN1bHQiLCJfb3BlbkNoYXQiLCJjaGF0QXV0b09wZW4iLCJjaGF0TWVzc2FnZUlucHV0IiwicmVtb3ZlSXRlbSIsInRpbWVJbmRleCIsIm9wZW4iLCJuZXdUaW1lIiwic3RyIiwicmVwbGFjZSIsImMiLCJyIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwiRGlhbG9nIiwiRU5URVJfQ09ERSIsInNob3dDb250YWN0c0Z1bmMiLCJfc3RvcFVzZXJUeXBpbmdEZWJvdW5jZSIsIl9zdG9wVXNlclR5cGluZyIsImJ0biIsIl9yZW5kZXJDaGF0RGlhbG9nIiwiX3JlbmRlckNoYXRNZXNzYWdlRm9ybSIsImNoYXREaWFsb2ciLCJjaGF0TWVzc2FnZUZvcm0iLCJfb25NZXNzYWdlRm9ybUVudGVyRG93biIsImNoYXRNZXNzYWdlRmllbGQiLCJmb2N1cyIsIl9vbk1lc3NhZ2VGb3JtRmllbGRzQ2hhbmdlIiwiX29uVHlwaW5nSW5NZXNzYWdlRm9ybUZpZWxkcyIsImNoYXRNZXNzYWdlRXJyb3IiLCJjaGF0TWVzc2FnZUZvcm1Db250cm9scyIsImNoYXRTZXRDb250YWN0c0J0biIsIl9zZXRDb250YWN0c0J0blRleHQiLCJjaGF0TWVzc2FnZVNlbmRCdG4iLCJfb25NZXNzYWdlU2VuZENsaWNrIiwidXNlclR5cGUiLCJ0ZXh0IiwiaXNIaXN0b3J5IiwiY2hhdE1lc3NhZ2VXcmFwcGVyIiwiY2hhdE1lc3NhZ2UiLCJ2YWx1ZSIsImNoYXRNZXNzYWdlVGltZSIsInNjcm9sbFRvcCIsInNjcm9sbEhlaWdodCIsImNoYXRPcGVySXNUeXBpbmciLCJvcGVySXNUeXBpbmciLCJjb250YWN0c0xpbmtGdWxsIiwiY29udGFjdHNMaW5rRW1wdHkiLCJfY2xlYXJEaWFsb2ciLCJpIiwiY2hpbGRyZW4iLCJzZXROYW1lRnVuYyIsInNldFBob3RvRnVuYyIsIm1lc3NhZ2VMaXN0Iiwic29ydCIsIm1lc3NhZ2UxIiwibWVzc2FnZTIiLCJkYXRlMSIsImRhdGV0aW1lIiwiZGF0ZTIiLCJ0aW1lMSIsImdldFRpbWUiLCJ0aW1lMiIsImNsblNlcnZlclRpbWVEZWx0YSIsIm1lc3NhZ2VBdXRob3IiLCJvdXRjb21pbmciLCJtZXNzYWdlRGF0ZVRpbWUiLCJyZXF1aXJlZEZpZWxkIiwicHJldmVudERlZmF1bHQiLCJnZXRSYW5kb21WaXNpdG9yTnVtYmVyIiwia2V5Q29kZSIsImZsb29yIiwiZ2V0IiwiZ2V0U3luYyIsInBvc3QiLCJzaG93TG9hZGluZ09rIiwiaGlkZVNlcnZlclJlc3VsdE1lc3NhZ2UiLCJTRVJWRVJfVVJMIiwicmVxdWVzdFBhcmFtc09iaiIsImNhbGxiYWNrIiwicmVxdWVzdFBhcmFtcyIsIl9yZXF1ZXN0UGFyYW1zVG9TdHJpbmciLCJ4aHIiLCJfY3JlYXRlQ29yc1JlcXVlc3QiLCJFcnJvciIsIm9ubG9hZCIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlVGV4dCIsInNlbmQiLCJfc2hvd0xvYWRpbmdFcnJvciIsIm9uZXJyb3IiLCJ1cmwiLCJTRVJWRVJfMUNfVVJMIiwiaGFzT3duUHJvcGVydHkiLCJlbmNvZGVVUkkiLCJtZXRob2QiLCJzeW5jIiwiWE1MSHR0cFJlcXVlc3QiLCJYRG9tYWluUmVxdWVzdCIsInJlc3VsdEVsZW1lbnQiLCJpbm5lclRleHQiLCJzZXJ2ZXJFcnJvciIsImRlZmF1bHRUZXh0IiwiZXJyb3JNZXNzYWdlcyIsImNyZWF0ZURPTUVsZW1lbnQiLCJyZW1vdmVET01FbGVtZW50IiwiaGFzQ2xhc3MiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwidmFsaWRhdGVFbWFpbCIsInZhbGlkYXRlUGhvbmUiLCJjcmVhdGVEYXRlRnJvbVN0cmluZyIsImZvcm1hdFRpbWUiLCJwbGF5QXVkaW8iLCJzaG93RXJyb3IiLCJoaWRlRXJyb3IiLCJvbkZpZWxkc0ZvY3VzIiwiYmluZEFsbEZ1bmMiLCJzZXRFbnRlckluVGV4dCIsInJlbmRlckltZyIsInNldEltZ1BhcmFtcyIsImRlYm91bmNlIiwiZWxlbWVudFR5cGUiLCJhdHRyTGlzdCIsImVsZW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiYXR0ciIsInNldEF0dHJpYnV0ZSIsInBhcmVudCIsInJlbW92ZUNoaWxkIiwiY2xhc3NOYW1lIiwibWF0Y2giLCJSZWdFeHAiLCJlbGVtZW50Q2xhc3NlcyIsInNwbGl0Iiwic3BsaWNlIiwiam9pbiIsImVtYWlsIiwicmUiLCJ0ZXN0IiwicGhvbmUiLCJ5ZWFyIiwic3Vic3RyaW5nIiwibW9udGgiLCJkYXRlIiwiaG91cnMiLCJtaW51dGVzIiwic2Vjb25kcyIsImdldEhvdXJzIiwiZ2V0TWludXRlcyIsInNyYyIsInZvaWNlIiwiQXVkaW8iLCJhdXRvcGxheSIsImVycm9yIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiY3VycmVudFRhcmdldCIsIm9iamVjdCIsInByb3BlcnR5IiwiYmluZCIsImltZ0VsZW1lbnQiLCJ3aWR0aCIsImhlaWdodCIsImRlZmF1bHRTcmMiLCJhbHQiLCJpbWciLCJJbWFnZSIsImZ1bmMiLCJ3YWl0IiwiaW1tZWRpYXRlIiwiY29udGV4dCIsImFyZ3MiLCJhcmd1bWVudHMiLCJsYXRlciIsImFwcGx5IiwiY2FsbE5vdyIsIkNvbnRhY3RzIiwic2hvd0RpYWxvZ0Z1bmMiLCJfcmVuZGVyQ29udGFjdHNGb3JtIiwiY2hhdENvbnRhY3RzRm9ybSIsIl9vbkNvbnRhY3RzRm9ybUVudGVyRG93biIsImNoYXRDb250YWN0c1RpcCIsImNvbnRhY3RzVGlwRW1wdHkiLCJjaGF0U3VybmFtZUZpZWxkIiwiY2hhdFN1cm5hbWVJbnB1dCIsImNoYXRTdXJuYW1lRXJyb3IiLCJjaGF0TmFtZUZpZWxkIiwiY2hhdE5hbWVJbnB1dCIsImNoYXROYW1lRXJyb3IiLCJjaGF0UGF0cm9ueW1pY0ZpZWxkIiwiY2hhdFBhdHJvbnltaWNJbnB1dCIsImNoYXRQYXRyb255bWljRXJyb3IiLCJjaGF0UGhvbmVGaWVsZCIsImNoYXRQaG9uZUlucHV0IiwiX3VzZXJQaG9uZUlzVmFsaWQiLCJjaGF0UGhvbmVFcnJvciIsImNoYXRFbWFpbEZpZWxkIiwiY2hhdEVtYWlsSW5wdXQiLCJfdXNlckVtYWlsSXNWYWxpZCIsImNoYXRFbWFpbEVycm9yIiwiY2hhdENvbnRhY3RzRm9ybUNvbnRyb2xzIiwiY2hhdENsb3NlQ29udGFjdHNCdG4iLCJjaGF0U2VuZENvbnRhY3RzQnRuIiwiX29uQ29udGFjdHNTZW5kQ2xpY2siLCJjb250YWN0c1RpcEZ1bGwiLCJzdXJuYW1lIiwicGF0cm9ueW1pYyIsImZpZWxkcyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJlbWFpbEZvcm1hdCIsInBob25lRm9ybWF0IiwibmVlZEZpbGxMZWFzdE9uZUZpZWxkIiwiY29udGFjdHNTYXZlZCIsIlNvY2lhbHMiLCJzb2NpYWxzQ29udGFpbmVyIiwiYm90TmFtZSIsInRsIiwidGxJY29uIiwic29jaWFsQnRuIiwiZmIiLCJmYkljb24iLCJ2a1VzZXJJZCIsInZrIiwidmtJY29uIiwic2V0Q2hhdFN0eWxlcyIsInNldEljb25TdHlsZXMiLCJtYWluQmciLCJtYWluQ29sb3IiLCJib2R5QmciLCJtZXNzYWdlVGltZUNvbG9yIiwidXNlck1lc3NhZ2VCZyIsInVzZXJNZXNzYWdlQ29sb3IiLCJvcmdNZXNzYWdlQmciLCJvcmdNZXNzYWdlQ29sb3IiLCJjc3MiLCJpbnNlcnRTdHlsZXNUb0RPTSIsImNvbG9yIiwiYmdUbCIsImJnRmIiLCJiZ1ZiIiwiYmdWayIsImhlYWQiLCJzdHlsZSIsInR5cGUiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsImNyZWF0ZVRleHROb2RlIiwicGFnZVZpc2liaWxpdHkiLCJiIiwicSIsInAiLCJ1bmRlZmluZWQiLCJwcmVmaXhlcyIsInByb3BzIiwibSIsInZpc2libGVDYWxsYmFja3MiLCJoaWRkZW5DYWxsYmFja3MiLCJfY2FsbGJhY2tzIiwiX2NhbGxiYWNrIiwib25IaWRkZW4iLCJpc1N1cHBvcnRlZCIsInNvbWUiLCJwcmVmaXgiLCJfc3VwcG9ydHMiLCJsb3dlckZpcnN0IiwicnVuQ2FsbGJhY2tzIiwiaW5kZXgiLCJfdmlzaWJsZSIsIl9oaWRkZW4iLCJfbmF0aXZlU3dpdGNoIiwibGlzdGVuIiwiYXR0YWNoRXZlbnQiLCJyZWR1Y2UiLCJtZW1vIiwiZSIsImluaXQiLCJ0b0xvd2VyQ2FzZSIsInN1YnN0ciJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0Q0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQTs7Ozs7QUFLQSxLQUFNQSxnQkFBZ0IsSUFBSSxFQUFKLEdBQVMsSUFBL0I7O0FBRUE7Ozs7O0FBS0EsS0FBTUMsaUJBQWlCLElBQXZCOztBQUVBOzs7QUFHQSxLQUFJQyxhQUFKOztBQUVBOzs7QUFHQSxLQUFJQyxnQkFBSjs7QUFFQTs7OztBQUlBLEtBQUlDLHFCQUFKOztBQUVBOzs7O0FBSUEsS0FBSUMsWUFBWSxFQUFoQjs7QUFFQTs7O0FBR0EsVUFBU0MsWUFBVCxHQUF3QjtBQUN0QixPQUFNQyxTQUFTLEVBQUMsVUFBVSxVQUFYLEVBQWY7QUFDQSxrQkFBSUEsTUFBSixFQUFZLFVBQVNDLFFBQVQsRUFBbUI7QUFDN0IsU0FBSUMsa0JBQWtCRCxTQUFTRSxRQUEvQjtBQUNBLFNBQUlDLGdCQUFnQkgsU0FBU0ksTUFBN0I7QUFDQSxTQUFJQyxlQUFlTCxTQUFTTixJQUE1Qjs7QUFFQTtBQUNBLFNBQUdXLFlBQUgsRUFBaUI7QUFDZlIsaUJBQVVTLElBQVYsQ0FBZUQsYUFBYUUsU0FBNUIsRUFBdUNGLGFBQWFHLFNBQXBELEVBQStESCxhQUFhSSxTQUE1RTtBQUNBZixjQUFPLG1CQUFTTSxTQUFTTixJQUFULENBQWNnQixNQUF2QixFQUErQlYsU0FBU04sSUFBVCxDQUFjaUIsT0FBN0MsRUFBc0RYLFNBQVNZLE9BQS9ELEVBQXdFZixTQUF4RSxDQUFQO0FBQ0Esa0NBQWNNLGFBQWQ7QUFDQVUsa0JBQVcsWUFBVztBQUNwQkM7QUFDRCxRQUZELEVBRUdyQixjQUZIO0FBR0Q7O0FBRUQ7QUFDQSxTQUFHUSxnQkFBZ0JjLE1BQWhCLEdBQXlCLENBQTVCLEVBQStCO0FBQzdCO0FBQ0FwQixpQkFBVSx1QkFBVjtBQUNBLGtDQUFjUSxhQUFkO0FBQ0EsV0FBRyxDQUFDYSxTQUFTQyxhQUFULENBQXVCLFVBQXZCLENBQUosRUFBd0M7QUFDdEN0QixpQkFBUXVCLGVBQVI7QUFDRDs7QUFFRDtBQUNBTCxrQkFBVyxZQUFXO0FBQ3BCWix5QkFBZ0JrQixPQUFoQixDQUF3QixVQUFTQyxJQUFULEVBQWU7QUFDckMsbUJBQU9BLEtBQUtDLE9BQVo7QUFDRSxrQkFBSyxDQUFMO0FBQ0UxQix1QkFBUTJCLFFBQVIsQ0FBaUJGLEtBQUtHLEVBQXRCO0FBQ0E7QUFDRixrQkFBSyxDQUFMO0FBQ0U1Qix1QkFBUTZCLFFBQVIsQ0FBaUJKLEtBQUtHLEVBQXRCO0FBQ0E7QUFDRixrQkFBSyxDQUFMO0FBQ0U1Qix1QkFBUThCLFFBQVIsQ0FBaUJMLEtBQUtHLEVBQXRCO0FBQ0E7QUFDRjtBQUNBO0FBQ0E7QUFaRjtBQWNELFVBZkQ7QUFnQkE1QixpQkFBUStCLFdBQVI7QUFDRCxRQWxCRCxFQWtCR2pDLGNBbEJIO0FBbUJEO0FBQ0YsSUE3Q0Q7QUE4Q0Q7O0FBRUQ7OztBQUdBLFVBQVNxQixhQUFULEdBQXlCO0FBQ3ZCO0FBQ0EsT0FBRyxDQUFDcEIsSUFBSixFQUFVO0FBQ1I7QUFDRDs7QUFFRDtBQUNBRSxrQkFBZSxDQUFDK0IsYUFBYUMsT0FBYixDQUFxQixjQUFyQixDQUFELEdBQXdDLENBQXZEO0FBQ0FELGdCQUFhRSxPQUFiLENBQXFCLGNBQXJCLEVBQXFDakMsWUFBckM7O0FBRUE7QUFDQSxPQUFNa0MsS0FBS0MsR0FBTCxLQUFhLENBQUNKLGFBQWFDLE9BQWIsQ0FBc0IsMkJBQXRCLENBQWhCLEdBQXVFcEMsYUFBM0UsRUFBMkY7QUFDekY7QUFDQW1DLGtCQUFhRSxPQUFiLENBQXNCLDhCQUF0QixFQUFzRCxHQUF0RDtBQUNEOztBQUVEO0FBQ0FuQyxRQUFLc0MsWUFBTDtBQUNEOztBQUVEOzs7QUFHQSxVQUFTQyxnQkFBVCxDQUEwQkMsS0FBMUIsRUFBaUM7QUFDL0IsT0FBR0EsTUFBTUMsR0FBTixLQUFjLGNBQWpCLEVBQWlDO0FBQy9CLFNBQUd2QyxpQkFBaUIsQ0FBQytCLGFBQWFDLE9BQWIsQ0FBcUIsY0FBckIsQ0FBckIsRUFBMkQ7QUFDekRsQyxZQUFLMEMsY0FBTDtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDs7O0FBR0EsVUFBU0MsZUFBVCxHQUEyQjtBQUN6QnpDLGtCQUFlLENBQUMrQixhQUFhQyxPQUFiLENBQXFCLGNBQXJCLENBQWhCO0FBQ0FVLFVBQU9DLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DTixnQkFBbkM7QUFDQSw0QkFBZU8sU0FBZixDQUF5QjFCLGFBQXpCO0FBQ0FoQjtBQUNEOztBQUVEO0FBQ0F3QyxRQUFPQyxnQkFBUCxDQUF3QixNQUF4QixFQUFnQ0YsZUFBaEMsRTs7Ozs7Ozs7Ozs7O0FDMUlBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7Ozs7O21CQVRlSSxJOzs7QUFXZjs7Ozs7QUFLQSxLQUFNQyxnQkFBZ0Isa0NBQXRCOztBQUVBOzs7OztBQUtBLEtBQU1DLDJCQUEyQixJQUFqQzs7QUFFQTs7Ozs7QUFLQSxLQUFNQyxrQkFBa0IsR0FBeEI7O0FBRUE7Ozs7QUFJQSxLQUFJQyw2QkFBSjs7QUFFQTs7Ozs7OztBQU9BLFVBQVNKLElBQVQsQ0FBY0ssVUFBZCxFQUEwQkMsV0FBMUIsRUFBdUNuQyxPQUF2QyxFQUFnRG9DLEtBQWhELEVBQXVEO0FBQ3JELDJCQUFZLElBQVo7QUFDQSxRQUFLRixVQUFMLEdBQWtCQSxjQUFjLHNCQUFZRyxVQUE1QztBQUNBLFFBQUtGLFdBQUwsR0FBbUJBLGVBQWUsc0JBQVlHLFdBQTlDO0FBQ0EsUUFBS0MsU0FBTCxHQUFpQkgsUUFBUUEsS0FBUixHQUFnQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUFqQztBQUNBLFFBQUtJLE1BQUw7QUFDQSxRQUFLQyxlQUFMLEdBQXVCLEVBQXZCO0FBQ0EsUUFBS0MsaUJBQUwsR0FBeUIsRUFBekI7O0FBRUE7QUFDQSxPQUFJQyxpQkFBaUI1QixhQUFhQyxPQUFiLENBQXFCLGVBQXJCLENBQXJCO0FBQ0EsT0FBRzJCLGNBQUgsRUFBbUI7QUFDakI7QUFDQSxVQUFLQyxTQUFMLEdBQWlCRCxjQUFqQjtBQUNELElBSEQsTUFHTztBQUNMO0FBQ0EsU0FBSUUsZUFBZUMsa0JBQWtCLHNDQUFsQixDQUFuQjtBQUNBLFVBQUtGLFNBQUwsR0FBaUJDLFlBQWpCO0FBQ0E5QixrQkFBYUUsT0FBYixDQUFxQixlQUFyQixFQUFzQzRCLFlBQXRDO0FBQ0Q7O0FBRUQsUUFBS0UsTUFBTCxHQUFjLHFCQUFXLEtBQUtaLFdBQWhCLEVBQTZCLEtBQUtLLE1BQWxDLEVBQTBDLEtBQUtJLFNBQS9DLEVBQTBELEtBQUtJLFlBQS9ELEVBQTZFLEtBQUtQLGVBQWxGLENBQWQ7QUFDQSxRQUFLUSxRQUFMLEdBQWdCLHVCQUFhLEtBQUtMLFNBQWxCLEVBQTZCLEtBQUtNLFVBQWxDLENBQWhCO0FBQ0FqQiwwQkFBdUJqQyxVQUFXQSxVQUFVLElBQXJCLEdBQTZCLElBQXBEO0FBQ0Q7O0FBRUQ7OztBQUdBNkIsTUFBS3NCLFNBQUwsQ0FBZUMsb0JBQWYsR0FBc0MsWUFBVztBQUMvQyxRQUFLQyxhQUFMLEdBQXFCLDZCQUFpQixLQUFqQixFQUF3QixFQUFDLFNBQVMsVUFBVixFQUF4QixDQUFyQjtBQUNBakQsWUFBU0MsYUFBVCxDQUF1QixNQUF2QixFQUErQmlELFdBQS9CLENBQTJDLEtBQUtELGFBQWhEO0FBQ0QsRUFIRDs7QUFLQTs7O0FBR0F4QixNQUFLc0IsU0FBTCxDQUFlSSxjQUFmLEdBQWdDLFlBQVc7QUFDekM7QUFDQSxPQUFHLENBQUNuRCxTQUFTQyxhQUFULENBQXVCLFdBQXZCLENBQUosRUFBeUM7QUFDdkMsVUFBSytDLG9CQUFMO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFLSSxPQUFMLEdBQWUsNkJBQWlCLFFBQWpCLEVBQTJCO0FBQ3hDLGNBQVMsNkJBRCtCO0FBRXhDLGFBQVE7QUFGZ0MsSUFBM0IsQ0FBZjtBQUlBLFFBQUtBLE9BQUwsQ0FBYUMsU0FBYixHQUF5QixLQUFLdkIsVUFBOUI7QUFDQSxRQUFLbUIsYUFBTCxDQUFtQkMsV0FBbkIsQ0FBK0IsS0FBS0UsT0FBcEM7QUFDQSxRQUFLQSxPQUFMLENBQWE3QixnQkFBYixDQUE4QixPQUE5QixFQUF1QyxLQUFLK0IsZUFBNUM7QUFDQSxRQUFLWCxNQUFMLENBQVlZLFVBQVosQ0FBdUIsS0FBS0gsT0FBNUI7QUFDRCxFQWZEOztBQWlCQTs7O0FBR0EzQixNQUFLc0IsU0FBTCxDQUFlUyxXQUFmLEdBQTZCLFlBQVc7QUFDdEM7QUFDQSxPQUFHLENBQUN4RCxTQUFTQyxhQUFULENBQXVCLFdBQXZCLENBQUosRUFBeUM7QUFDdkMsVUFBSytDLG9CQUFMO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFLUywrQkFBTCxHQUF1Qyw2QkFBaUIsR0FBakIsRUFBc0IsRUFBQyxTQUFTLG9CQUFWLEVBQXRCLENBQXZDO0FBQ0EsUUFBS1IsYUFBTCxDQUFtQkMsV0FBbkIsQ0FBK0IsS0FBS08sK0JBQXBDOztBQUVBO0FBQ0EsUUFBSy9FLElBQUwsR0FBWSw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLGlDQUFWLEVBQXhCLENBQVo7QUFDQSxRQUFLdUUsYUFBTCxDQUFtQkMsV0FBbkIsQ0FBK0IsS0FBS3hFLElBQXBDO0FBQ0EsUUFBS2lFLE1BQUwsQ0FBWWUsT0FBWixDQUFvQixLQUFLaEYsSUFBekI7O0FBRUE7QUFDQSxRQUFLdUQsVUFBTCxHQUFrQiw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLGtCQUFWLEVBQXhCLENBQWxCO0FBQ0EsUUFBS3ZELElBQUwsQ0FBVXdFLFdBQVYsQ0FBc0IsS0FBS2pCLFVBQTNCOztBQUVBLFFBQUswQixhQUFMLEdBQXFCLDZCQUFpQixLQUFqQixFQUF3QjtBQUMzQyxjQUFTLHNCQURrQztBQUUzQyxjQUFTLElBRmtDO0FBRzNDLGVBQVUsSUFIaUM7QUFJM0MsWUFBTyxFQUpvQztBQUszQyxZQUFPO0FBTG9DLElBQXhCLENBQXJCO0FBT0EsUUFBSzFCLFVBQUwsQ0FBZ0JpQixXQUFoQixDQUE0QixLQUFLUyxhQUFqQzs7QUFFQSxRQUFLQyxjQUFMLEdBQXNCLDZCQUFpQixHQUFqQixFQUFzQixFQUFDLFNBQVMsdUJBQVYsRUFBdEIsQ0FBdEI7QUFDQSxRQUFLQSxjQUFMLENBQW9CUCxTQUFwQixHQUFnQyxLQUFLdkIsVUFBckM7QUFDQSxRQUFLRyxVQUFMLENBQWdCaUIsV0FBaEIsQ0FBNEIsS0FBS1UsY0FBakM7O0FBRUEsUUFBS0MsWUFBTCxHQUFvQiw2QkFBaUIsUUFBakIsRUFBMkI7QUFDN0MsY0FBUyxlQURvQztBQUU3QyxhQUFRO0FBRnFDLElBQTNCLENBQXBCO0FBSUEsUUFBSzVCLFVBQUwsQ0FBZ0JpQixXQUFoQixDQUE0QixLQUFLVyxZQUFqQztBQUNBLFFBQUtBLFlBQUwsQ0FBa0J0QyxnQkFBbEIsQ0FBbUMsT0FBbkMsRUFBNEMsS0FBS3VDLFVBQWpEOztBQUVBO0FBQ0EsUUFBS0MsUUFBTCxHQUFnQiw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLGdCQUFWLEVBQXhCLENBQWhCO0FBQ0EsUUFBS3JGLElBQUwsQ0FBVXdFLFdBQVYsQ0FBc0IsS0FBS2EsUUFBM0I7QUFDQSxRQUFLcEIsTUFBTCxDQUFZcUIsV0FBWixDQUF3QixLQUFLRCxRQUE3QjtBQUNBLFFBQUtsQixRQUFMLENBQWNtQixXQUFkLENBQTBCLEtBQUtELFFBQS9COztBQUVBO0FBQ0EsUUFBS0UsYUFBTCxHQUFxQiw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLHFCQUFWLEVBQXhCLENBQXJCO0FBQ0EsUUFBS0YsUUFBTCxDQUFjYixXQUFkLENBQTBCLEtBQUtlLGFBQS9COztBQUVBLFFBQUtDLGlCQUFMLEdBQXlCLDZCQUFpQixHQUFqQixFQUFzQixFQUF0QixDQUF6QjtBQUNBLFFBQUtBLGlCQUFMLENBQXVCYixTQUF2QixHQUFtQyxzQkFBbkM7QUFDQSxRQUFLWSxhQUFMLENBQW1CZixXQUFuQixDQUErQixLQUFLZ0IsaUJBQXBDOztBQUVBLFFBQUtDLGlCQUFMLEdBQXlCLDZCQUFpQixHQUFqQixFQUFzQjtBQUM3QyxhQUFRekMsYUFEcUM7QUFFN0MsZUFBVTtBQUZtQyxJQUF0QixDQUF6QjtBQUlBLFFBQUt5QyxpQkFBTCxDQUF1QmQsU0FBdkIsR0FBbUMsT0FBbkM7QUFDQSxRQUFLWSxhQUFMLENBQW1CZixXQUFuQixDQUErQixLQUFLaUIsaUJBQXBDOztBQUVBO0FBQ0EsUUFBS3hCLE1BQUwsQ0FBWXlCLFlBQVo7QUFDRCxFQTlERDs7QUFnRUE7OztBQUdBM0MsTUFBS3NCLFNBQUwsQ0FBZXNCLFdBQWYsR0FBNkIsWUFBVztBQUN0QyxPQUFJQyxPQUFPLElBQVg7QUFDQSxPQUFNdkYsU0FBUyxLQUFLNEQsTUFBTCxDQUFZNEIsZUFBWixHQUNYLEVBQUMsVUFBVSxRQUFYLEVBQXFCLFdBQVcsS0FBSy9CLFNBQXJDLEVBQWdELFVBQVUsS0FBS0csTUFBTCxDQUFZNEIsZUFBdEUsRUFEVyxHQUVYLEVBQUMsVUFBVSxRQUFYLEVBQXFCLFdBQVcsS0FBSy9CLFNBQXJDLEVBRko7QUFHQSxrQkFBSXpELE1BQUosRUFBWSxVQUFTQyxRQUFULEVBQW1CO0FBQzdCc0YsVUFBS0UsZ0JBQUwsQ0FBc0J4RixTQUFTeUYsSUFBL0I7QUFDQUgsVUFBS0ksaUJBQUwsQ0FBdUIxRixTQUFTMkYsS0FBaEM7QUFDQSxTQUFHM0YsU0FBUzRGLE9BQVosRUFBcUI7QUFDbkJOLFlBQUszQixNQUFMLENBQVlrQyxhQUFaLENBQTBCLEtBQTFCLEVBQWlDLDJCQUFlN0YsU0FBUzRGLE9BQXhCLENBQWpDO0FBQ0Q7QUFDRCxTQUFHNUYsU0FBUzhGLE1BQVosRUFBb0I7QUFDbEJSLFlBQUszQixNQUFMLENBQVlvQyw4QkFBWjtBQUNELE1BRkQsTUFFTztBQUNMVCxZQUFLM0IsTUFBTCxDQUFZcUMsNEJBQVo7QUFDRDtBQUNGLElBWEQ7QUFZQSxRQUFLQyxjQUFMO0FBQ0EsUUFBS3RDLE1BQUwsQ0FBWXFDLDRCQUFaOztBQUVBO0FBQ0FyRSxnQkFBYUUsT0FBYixDQUFzQiwyQkFBdEIsRUFBbURDLEtBQUtDLEdBQUwsRUFBbkQ7QUFDRCxFQXRCRDs7QUF3QkE7Ozs7QUFJQVUsTUFBS3NCLFNBQUwsQ0FBZXlCLGdCQUFmLEdBQWtDLFVBQVNDLElBQVQsRUFBZTtBQUMvQyxPQUFHQSxJQUFILEVBQVM7QUFDUCxVQUFLYixjQUFMLENBQW9CUCxTQUFwQixHQUFnQywyQkFBZW9CLElBQWYsQ0FBaEM7QUFDRDtBQUNGLEVBSkQ7O0FBTUE7Ozs7QUFJQWhELE1BQUtzQixTQUFMLENBQWUyQixpQkFBZixHQUFtQyxVQUFTUSxRQUFULEVBQW1CO0FBQ3BELE9BQUdBLFFBQUgsRUFBYTtBQUNYLDJCQUFVLEtBQUt2QixhQUFmLEVBQThCLElBQTlCLEVBQW9DLElBQXBDLEVBQTBDdUIsUUFBMUMsRUFBb0QsNnZFQUFwRDtBQUNEO0FBQ0YsRUFKRDs7QUFNQTs7OztBQUlBekQsTUFBS3NCLFNBQUwsQ0FBZW9DLGNBQWYsR0FBZ0MsVUFBU0MsT0FBVCxFQUFrQjtBQUNoRCxPQUFHQSxPQUFILEVBQVk7QUFDVixVQUFLWixnQkFBTCxDQUFzQlksUUFBUVgsSUFBOUI7QUFDQSxVQUFLQyxpQkFBTCxDQUF1QlUsUUFBUVQsS0FBL0I7QUFDQSxVQUFLaEMsTUFBTCxDQUFZMEMsV0FBWixDQUF3QkQsUUFBUXpDLE1BQWhDLEVBQXdDeUMsUUFBUUUsSUFBaEQ7QUFDRCxJQUpELE1BSU87QUFDTCxVQUFLM0MsTUFBTCxDQUFZNEMsV0FBWixDQUF3QixLQUFLZixnQkFBN0IsRUFBK0MsS0FBS0UsaUJBQXBEO0FBQ0Q7QUFDRixFQVJEOztBQVVBOzs7QUFHQWpELE1BQUtzQixTQUFMLENBQWVrQyxjQUFmLEdBQWdDLFlBQVc7QUFDekMsUUFBSzNDLGlCQUFMLEdBQXlCekMsV0FBVyxLQUFLd0UsV0FBaEIsRUFBNkJ4QyxvQkFBN0IsQ0FBekI7QUFDRCxFQUZEOztBQUlBOzs7QUFHQUosTUFBS3NCLFNBQUwsQ0FBZXlDLGdCQUFmLEdBQWtDLFlBQVc7QUFDM0NDLGdCQUFhLEtBQUtuRCxpQkFBbEI7QUFDRCxFQUZEOztBQUlBOzs7QUFHQWIsTUFBS3NCLFNBQUwsQ0FBZTJDLGFBQWYsR0FBK0IsWUFBVztBQUN4QyxPQUFJL0UsYUFBYUMsT0FBYixDQUFxQixvQkFBckIsTUFBK0MsVUFBbkQsRUFBZ0U7QUFDOUQsVUFBS2dDLFlBQUw7QUFDRCxJQUZELE1BRU87QUFDTCxVQUFLRSxVQUFMO0FBQ0Q7QUFDRixFQU5EOztBQVFBOzs7QUFHQXJCLE1BQUtzQixTQUFMLENBQWVILFlBQWYsR0FBOEIsWUFBVztBQUN2QyxRQUFLRCxNQUFMLENBQVlnRCxVQUFaO0FBQ0E7QUFDQSxRQUFLOUMsUUFBTCxDQUFjRCxZQUFkO0FBQ0FqQyxnQkFBYUUsT0FBYixDQUFxQixvQkFBckIsRUFBMkMsVUFBM0M7QUFDRCxFQUxEOztBQU9BOzs7QUFHQVksTUFBS3NCLFNBQUwsQ0FBZUQsVUFBZixHQUE0QixZQUFXO0FBQ3JDLFFBQUtELFFBQUwsQ0FBYytDLGFBQWQ7QUFDQTtBQUNBLFFBQUtqRCxNQUFMLENBQVlHLFVBQVo7QUFDQW5DLGdCQUFhRSxPQUFiLENBQXFCLG9CQUFyQixFQUEyQyxRQUEzQztBQUNELEVBTEQ7O0FBT0E7OztBQUdBWSxNQUFLc0IsU0FBTCxDQUFlM0IsY0FBZixHQUFnQyxZQUFXO0FBQ3pDcUUsZ0JBQWEsS0FBS3BELGVBQWxCO0FBQ0EsUUFBS21ELGdCQUFMO0FBQ0EsUUFBSzNDLFFBQUwsQ0FBY2dELGlCQUFkO0FBQ0QsRUFKRDs7QUFNQTs7O0FBR0FwRSxNQUFLc0IsU0FBTCxDQUFlL0IsWUFBZixHQUE4QixZQUFXO0FBQ3ZDO0FBQ0EsT0FBSWhDLFdBQVcsbUJBQVE7QUFDckIsZUFBVSxRQURXO0FBRXJCLGdCQUFXLEtBQUt3RDtBQUZLLElBQVIsQ0FBZjs7QUFLQTtBQUNBLE9BQUk3QixhQUFhQyxPQUFiLENBQXFCLGdCQUFyQixNQUEyQyxNQUEzQyxJQUNHNUIsU0FBUzhHLE1BRFosSUFFRzlHLFNBQVMyRCxNQUFULENBQWdCNUMsTUFBaEIsR0FBeUIsQ0FGaEMsRUFHSTtBQUNGO0FBQ0EsU0FBSSxDQUFDLEtBQUtyQixJQUFOLElBQWMscUJBQVMsS0FBS0EsSUFBZCxFQUFvQixRQUFwQixDQUFsQixFQUFrRDtBQUNoRDtBQUNBLFlBQUtxSCxTQUFMLENBQWUvRyxRQUFmO0FBQ0QsTUFIRCxNQUdPO0FBQ0w7QUFDQSxZQUFLMEcsYUFBTDtBQUNBLFlBQUtQLGNBQUwsQ0FBb0JuRyxRQUFwQjtBQUNEO0FBQ0YsSUFiRCxNQWFPO0FBQ0w7QUFDQSxTQUFJLENBQUMsS0FBS04sSUFBTixJQUFjLHFCQUFTLEtBQUtBLElBQWQsRUFBb0IsUUFBcEIsQ0FBbEIsRUFBa0Q7QUFDaEQ7QUFDQSxXQUFHLENBQUMsS0FBSzBFLE9BQVQsRUFBa0I7QUFDaEIsY0FBS0QsY0FBTDtBQUNEO0FBQ0QsWUFBSzZDLFlBQUw7QUFDRCxNQU5ELE1BTU87QUFDTDtBQUNBLFlBQUtsQyxVQUFMO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBLFFBQUswQixnQkFBTDtBQUNBLFFBQUtQLGNBQUw7QUFDRCxFQXRDRDs7QUF3Q0E7Ozs7QUFJQXhELE1BQUtzQixTQUFMLENBQWVnRCxTQUFmLEdBQTJCLFVBQVNYLE9BQVQsRUFBa0I7QUFDM0MsT0FBSWQsT0FBTyxJQUFYOztBQUVBO0FBQ0EsT0FBRyxLQUFLbEIsT0FBUixFQUFpQjtBQUNmLDZCQUFZLEtBQUtBLE9BQWpCLEVBQTBCLGdCQUExQjtBQUNBLDBCQUFTLEtBQUtBLE9BQWQsRUFBdUIsa0JBQXZCO0FBQ0Q7O0FBRUR2RCxjQUFXLFlBQVc7QUFDcEI7QUFDQSxTQUFHeUUsS0FBS2xCLE9BQVIsRUFBaUI7QUFDZiw0QkFBU2tCLEtBQUtsQixPQUFkLEVBQXVCLFFBQXZCO0FBQ0EsK0JBQVlrQixLQUFLbEIsT0FBakIsRUFBMEIsa0JBQTFCO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFHa0IsS0FBSzVGLElBQVIsRUFBYztBQUNaLDRCQUFTNEYsS0FBSzVGLElBQWQsRUFBb0IsZUFBcEI7QUFDQSwrQkFBWTRGLEtBQUs1RixJQUFqQixFQUF1QixRQUF2QjtBQUNBLCtCQUFZNEYsS0FBS2IsK0JBQWpCLEVBQWtELFFBQWxEO0FBQ0QsTUFKRCxNQUlPO0FBQ0xhLFlBQUtkLFdBQUw7QUFDRDs7QUFFRDtBQUNBYyxVQUFLb0IsYUFBTDs7QUFFQTtBQUNBcEIsVUFBS2EsY0FBTCxDQUFvQkMsT0FBcEI7O0FBRUE7QUFDQXpFLGtCQUFhRSxPQUFiLENBQXFCLGdCQUFyQixFQUF1QyxNQUF2Qzs7QUFFQTtBQUNBNEUsa0JBQWFuQixLQUFLakMsZUFBbEI7QUFDRCxJQTNCRCxFQTJCR1QsZUEzQkg7QUE0QkQsRUFyQ0Q7O0FBdUNBOzs7QUFHQUgsTUFBS3NCLFNBQUwsQ0FBZWUsVUFBZixHQUE0QixZQUFXO0FBQ3JDLE9BQUlRLE9BQU8sSUFBWDs7QUFFQTtBQUNBLE9BQUcsS0FBS2IsK0JBQVIsRUFBeUM7QUFDdkMsMEJBQVMsS0FBS0EsK0JBQWQsRUFBK0MsUUFBL0M7QUFDRDs7QUFFRDtBQUNBLDJCQUFZLEtBQUsvRSxJQUFqQixFQUF1QixlQUF2QjtBQUNBLHdCQUFTLEtBQUtBLElBQWQsRUFBb0IsaUJBQXBCOztBQUVBbUIsY0FBVyxZQUFXO0FBQ3BCO0FBQ0EsMEJBQVN5RSxLQUFLNUYsSUFBZCxFQUFvQixRQUFwQjtBQUNBLDZCQUFZNEYsS0FBSzVGLElBQWpCLEVBQXVCLGlCQUF2Qjs7QUFFQTtBQUNBLDJCQUFVNEYsS0FBSzNCLE1BQUwsQ0FBWXNELGdCQUF0Qjs7QUFFQTtBQUNBLFNBQUcsQ0FBQzNCLEtBQUtsQixPQUFULEVBQWtCO0FBQ2hCa0IsWUFBS25CLGNBQUw7QUFDRDtBQUNELDZCQUFZbUIsS0FBS2xCLE9BQWpCLEVBQTBCLFFBQTFCO0FBQ0EsNkJBQVlrQixLQUFLbEIsT0FBakIsRUFBMEIsa0JBQTFCO0FBQ0EsMEJBQVNrQixLQUFLbEIsT0FBZCxFQUF1QixnQkFBdkI7QUFDRCxJQWZELEVBZUd6Qix3QkFmSDs7QUFpQkEsUUFBS3FFLFlBQUw7QUFDQXJGLGdCQUFhdUYsVUFBYixDQUF3QixnQkFBeEI7QUFDRCxFQS9CRDs7QUFpQ0E7OztBQUdBekUsTUFBS3NCLFNBQUwsQ0FBZWlELFlBQWYsR0FBOEIsWUFBVztBQUN2QyxPQUFJMUIsT0FBTyxJQUFYO0FBQ0EsT0FBSTZCLFlBQVksQ0FBQ3hGLGFBQWFDLE9BQWIsQ0FBc0IsOEJBQXRCLENBQWpCOztBQUVBLE9BQUcsS0FBS3VCLFNBQUwsQ0FBZWdFLFNBQWYsTUFBOEIsQ0FBakMsRUFBb0M7QUFDbEM7QUFDQSxVQUFLOUQsZUFBTCxHQUF1QnhDLFdBQVcsWUFBVztBQUMzQztBQUNBeUUsWUFBS3lCLFNBQUw7O0FBRUE7QUFDQWxHLGtCQUFXLFlBQVc7QUFDcEIsK0JBQVV5RSxLQUFLbEMsTUFBTCxDQUFZZ0UsSUFBdEI7QUFDRCxRQUZELEVBRUd4RSxrQkFBa0IsSUFGckI7O0FBSUE7QUFDQSxXQUFHakIsYUFBYUMsT0FBYixDQUFzQiw4QkFBdEIsSUFBd0QsQ0FBM0QsRUFBOEQ7QUFDNUQsYUFBSXlGLFVBQVUsQ0FBQzFGLGFBQWFDLE9BQWIsQ0FBc0IsOEJBQXRCLENBQUQsR0FBeUQsQ0FBdkU7QUFDQUQsc0JBQWFFLE9BQWIsQ0FBc0IsOEJBQXRCLEVBQXNEd0YsT0FBdEQ7QUFDRDtBQUNGLE1BZHNCLEVBY3BCLEtBQUtsRSxTQUFMLENBQWVnRSxTQUFmLElBQTRCLElBZFIsQ0FBdkI7QUFlRCxJQWpCRCxNQWlCTztBQUNMO0FBQ0E7QUFDRDtBQUNGLEVBekJEOztBQTJCQTs7O0FBR0ExRSxNQUFLc0IsU0FBTCxDQUFlTyxlQUFmLEdBQWlDLFlBQVc7QUFDMUMsUUFBS3lDLFNBQUw7QUFDRCxFQUZEOztBQUlBOzs7OztBQUtBLFVBQVNyRCxpQkFBVCxDQUEyQjRELEdBQTNCLEVBQWdDO0FBQzlCLFVBQU9BLElBQUlDLE9BQUosQ0FBWSxPQUFaLEVBQXFCLFVBQVNDLENBQVQsRUFBWTtBQUN0QyxTQUFJQyxJQUFJQyxLQUFLQyxNQUFMLEtBQWdCLEVBQWhCLEdBQXFCLENBQTdCO0FBQ0EsWUFBTyxDQUFDSCxNQUFNLEdBQU4sR0FBWUMsQ0FBWixHQUFpQkEsSUFBSSxHQUFKLEdBQVUsR0FBNUIsRUFBbUNHLFFBQW5DLENBQTRDLEVBQTVDLENBQVA7QUFDRCxJQUhNLENBQVA7QUFJRCxFOzs7Ozs7Ozs7Ozs7QUNoY0Q7O0FBQ0E7O0FBQ0E7O21CQUplQyxNOzs7QUFPZjs7Ozs7QUFLQSxLQUFNQyxhQUFhLEVBQW5COztBQUVBOzs7Ozs7O0FBT0EsVUFBU0QsTUFBVCxDQUFnQjlFLFdBQWhCLEVBQTZCSyxNQUE3QixFQUFxQ0ksU0FBckMsRUFBZ0R1RSxnQkFBaEQsRUFBa0U7QUFDaEUsMkJBQVksSUFBWjtBQUNBLFFBQUtoRixXQUFMLEdBQW1CQSxXQUFuQjtBQUNBLFFBQUtLLE1BQUwsR0FBY0EsTUFBZDtBQUNBLFFBQUtJLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsUUFBS3VFLGdCQUFMLEdBQXdCQSxnQkFBeEI7QUFDQSxRQUFLeEMsZUFBTCxHQUF1QixLQUF2QjtBQUNBLFFBQUt5Qyx1QkFBTCxHQUErQixxQkFBUyxLQUFLQyxlQUFkLEVBQStCLElBQS9CLENBQS9CO0FBQ0Q7O0FBRUQ7Ozs7QUFJQUosUUFBTzlELFNBQVAsQ0FBaUJRLFVBQWpCLEdBQThCLFVBQVMyRCxHQUFULEVBQWM7QUFDMUMsUUFBSzlELE9BQUwsR0FBZThELEdBQWY7QUFDRCxFQUZEOztBQUlBOzs7O0FBSUFMLFFBQU85RCxTQUFQLENBQWlCVyxPQUFqQixHQUEyQixVQUFTaEYsSUFBVCxFQUFlO0FBQ3hDLFFBQUtBLElBQUwsR0FBWUEsSUFBWjtBQUNELEVBRkQ7O0FBSUE7Ozs7QUFJQW1JLFFBQU85RCxTQUFQLENBQWlCaUIsV0FBakIsR0FBK0IsVUFBU0QsUUFBVCxFQUFtQjtBQUNoRCxRQUFLQSxRQUFMLEdBQWdCQSxRQUFoQjtBQUNELEVBRkQ7O0FBSUE7OztBQUdBOEMsUUFBTzlELFNBQVAsQ0FBaUJxQixZQUFqQixHQUFnQyxZQUFXO0FBQ3pDLFFBQUsrQyxpQkFBTDtBQUNBLFFBQUt0QyxhQUFMLENBQW1CLEtBQW5CLEVBQTBCLEtBQUs5QyxXQUEvQixFQUE0QyxJQUE1QztBQUNBLFFBQUtxRixzQkFBTDtBQUNELEVBSkQ7O0FBTUE7OztBQUdBUCxRQUFPOUQsU0FBUCxDQUFpQm9FLGlCQUFqQixHQUFxQyxZQUFXO0FBQzlDLFFBQUtFLFVBQUwsR0FBa0IsNkJBQWlCLEtBQWpCLEVBQXdCLEVBQUMsU0FBUyxrQkFBVixFQUF4QixDQUFsQjtBQUNBLFFBQUt0RCxRQUFMLENBQWNiLFdBQWQsQ0FBMEIsS0FBS21FLFVBQS9CO0FBQ0QsRUFIRDs7QUFLQTs7O0FBR0FSLFFBQU85RCxTQUFQLENBQWlCcUUsc0JBQWpCLEdBQTBDLFlBQVc7QUFDbkQsUUFBS0UsZUFBTCxHQUF1Qiw2QkFBaUIsTUFBakIsRUFBeUI7QUFDOUMsY0FBUyx3Q0FEcUM7QUFFOUMsZUFBVTtBQUZvQyxJQUF6QixDQUF2QjtBQUlBLFFBQUt2RCxRQUFMLENBQWNiLFdBQWQsQ0FBMEIsS0FBS29FLGVBQS9CO0FBQ0EsUUFBS0EsZUFBTCxDQUFxQi9GLGdCQUFyQixDQUFzQyxTQUF0QyxFQUFpRCxLQUFLZ0csdUJBQXREOztBQUVBLFFBQUtDLGdCQUFMLEdBQXdCLDZCQUFpQixLQUFqQixFQUF3QixFQUFDLFNBQVMsaUJBQVYsRUFBeEIsQ0FBeEI7QUFDQSxRQUFLRixlQUFMLENBQXFCcEUsV0FBckIsQ0FBaUMsS0FBS3NFLGdCQUF0Qzs7QUFFQSxRQUFLdkIsZ0JBQUwsR0FBd0IsNkJBQWlCLFVBQWpCLEVBQTZCO0FBQ25ELG9CQUFlLG1DQURvQztBQUVuRCxhQUFRLFNBRjJDO0FBR25ELGtCQUFhO0FBSHNDLElBQTdCLENBQXhCO0FBS0EsUUFBS3VCLGdCQUFMLENBQXNCdEUsV0FBdEIsQ0FBa0MsS0FBSytDLGdCQUF2QztBQUNBLFFBQUtBLGdCQUFMLENBQXNCd0IsS0FBdEI7QUFDQSxRQUFLeEIsZ0JBQUwsQ0FBc0IxRSxnQkFBdEIsQ0FBdUMsT0FBdkM7QUFDQSxRQUFLMEUsZ0JBQUwsQ0FBc0IxRSxnQkFBdEIsQ0FBdUMsUUFBdkMsRUFBaUQsS0FBS21HLDBCQUF0RDtBQUNBLFFBQUt6QixnQkFBTCxDQUFzQjFFLGdCQUF0QixDQUF1QyxPQUF2QyxFQUFnRCxLQUFLb0csNEJBQXJEOztBQUVBLFFBQUtDLGdCQUFMLEdBQXdCLDZCQUFpQixHQUFqQixFQUFzQixFQUFDLFNBQVMsbUJBQVYsRUFBdEIsQ0FBeEI7QUFDQSxRQUFLSixnQkFBTCxDQUFzQnRFLFdBQXRCLENBQWtDLEtBQUswRSxnQkFBdkM7O0FBRUEsUUFBS0MsdUJBQUwsR0FBK0IsNkJBQWlCLEtBQWpCLEVBQXdCLEVBQUMsU0FBUyxvQkFBVixFQUF4QixDQUEvQjtBQUNBLFFBQUtQLGVBQUwsQ0FBcUJwRSxXQUFyQixDQUFpQyxLQUFLMkUsdUJBQXRDOztBQUVBLFFBQUtDLGtCQUFMLEdBQTBCLDZCQUFpQixRQUFqQixFQUEyQjtBQUNuRCxjQUFTLHNCQUQwQztBQUVuRCxhQUFRO0FBRjJDLElBQTNCLENBQTFCO0FBSUEsUUFBS0Esa0JBQUwsQ0FBd0J6RSxTQUF4QixHQUFvQyxLQUFLMEUsbUJBQUwsRUFBcEM7QUFDQSxRQUFLRix1QkFBTCxDQUE2QjNFLFdBQTdCLENBQXlDLEtBQUs0RSxrQkFBOUM7QUFDQSxRQUFLQSxrQkFBTCxDQUF3QnZHLGdCQUF4QixDQUF5QyxPQUF6QyxFQUFrRCxLQUFLd0YsZ0JBQXZEOztBQUVBLFFBQUtpQixrQkFBTCxHQUEwQiw2QkFBaUIsUUFBakIsRUFBMkI7QUFDbkQsY0FBUyxzQkFEMEM7QUFFbkQsYUFBUTtBQUYyQyxJQUEzQixDQUExQjtBQUlBLFFBQUtBLGtCQUFMLENBQXdCM0UsU0FBeEIsR0FBb0MsV0FBcEM7QUFDQSxRQUFLd0UsdUJBQUwsQ0FBNkIzRSxXQUE3QixDQUF5QyxLQUFLOEUsa0JBQTlDO0FBQ0EsUUFBS0Esa0JBQUwsQ0FBd0J6RyxnQkFBeEIsQ0FBeUMsT0FBekMsRUFBa0QsS0FBSzBHLG1CQUF2RDtBQUNELEVBM0NEOztBQTZDQTs7Ozs7OztBQU9BcEIsUUFBTzlELFNBQVAsQ0FBaUI4QixhQUFqQixHQUFpQyxVQUFTcUQsUUFBVCxFQUFtQkMsSUFBbkIsRUFBeUI3QyxJQUF6QixFQUErQjhDLFNBQS9CLEVBQTBDO0FBQ3pFLE9BQUkscUJBQVMsS0FBSzFKLElBQWQsRUFBb0IsUUFBcEIsQ0FBSixFQUFvQztBQUNsQyw2QkFBWSxLQUFLQSxJQUFqQixFQUF1QixRQUF2QjtBQUNBLDBCQUFTLEtBQUswRSxPQUFkLEVBQXVCLFFBQXZCO0FBQ0Q7O0FBRUQ7QUFDQSxRQUFLaUYsa0JBQUwsR0FBMEIsNkJBQWlCLEtBQWpCLEVBQXdCLEVBQUMsU0FBUywyQkFBVixFQUF4QixDQUExQjtBQUNBLFFBQUtoQixVQUFMLENBQWdCbkUsV0FBaEIsQ0FBNEIsS0FBS21GLGtCQUFqQzs7QUFFQSxRQUFLQyxXQUFMLEdBQW1CLDZCQUFpQixHQUFqQixFQUFzQixFQUFDLFNBQVMsbUJBQVYsRUFBdEIsQ0FBbkI7QUFDQSxRQUFLQSxXQUFMLENBQWlCakYsU0FBakIsR0FBNkI4RSxJQUE3QjtBQUNBLFFBQUtFLGtCQUFMLENBQXdCbkYsV0FBeEIsQ0FBb0MsS0FBS29GLFdBQXpDOztBQUVBLE9BQUdKLGFBQWEsTUFBaEIsRUFBd0I7QUFDdEI7QUFDQSwwQkFBUyxLQUFLSSxXQUFkLEVBQTJCLHlCQUEzQjtBQUNBLFVBQUtyQyxnQkFBTCxDQUFzQnNDLEtBQXRCLEdBQThCLEVBQTlCO0FBQ0EsVUFBS3RDLGdCQUFMLENBQXNCd0IsS0FBdEI7QUFDRCxJQUxELE1BS08sSUFBR1MsYUFBYSxLQUFoQixFQUF1QjtBQUM1QjtBQUNBLDBCQUFTLEtBQUtJLFdBQWQsRUFBMkIsd0JBQTNCO0FBQ0Q7O0FBRUQ7QUFDQSxPQUFHaEQsU0FBUyxJQUFaLEVBQWtCO0FBQ2hCLFVBQUtrRCxlQUFMLEdBQXVCLDZCQUFpQixNQUFqQixFQUF5QixFQUFDLFNBQVMsd0JBQVYsRUFBekIsQ0FBdkI7QUFDQSxVQUFLQSxlQUFMLENBQXFCbkYsU0FBckIsR0FBaUNpQyxPQUFPLHVCQUFXQSxJQUFYLENBQVAsR0FBMEIsdUJBQVksSUFBSXhFLElBQUosRUFBWixDQUEzRDtBQUNBLFVBQUt3SCxXQUFMLENBQWlCcEYsV0FBakIsQ0FBNkIsS0FBS3NGLGVBQWxDOztBQUVBLFNBQUcsQ0FBQ0osU0FBRCxJQUFlRixhQUFhLEtBQS9CLEVBQXdDO0FBQ3RDLDZCQUFVLEtBQUs5RixNQUFMLENBQVl3QyxPQUF0QjtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxRQUFLeUMsVUFBTCxDQUFnQm9CLFNBQWhCLEdBQTRCLEtBQUtwQixVQUFMLENBQWdCcUIsWUFBNUM7O0FBRUE7QUFDQWpELGdCQUFhLEtBQUtwRCxlQUFsQjtBQUNELEVBeENEOztBQTBDQTs7O0FBR0F3RSxRQUFPOUQsU0FBUCxDQUFpQmdDLDhCQUFqQixHQUFrRCxZQUFXO0FBQzNELE9BQUcsQ0FBQyxLQUFLNEQsZ0JBQVQsRUFBMkI7QUFDekIsVUFBS0EsZ0JBQUwsR0FBd0IsNkJBQWlCLEdBQWpCLEVBQXNCLEVBQUMsU0FBUyx1QkFBVixFQUF0QixDQUF4QjtBQUNBLFVBQUtBLGdCQUFMLENBQXNCdEYsU0FBdEIsR0FBa0Msc0JBQVl1RixZQUE5QztBQUNBLFVBQUt0QixlQUFMLENBQXFCcEUsV0FBckIsQ0FBaUMsS0FBS3lGLGdCQUF0QztBQUNEO0FBQ0YsRUFORDs7QUFRQTs7O0FBR0E5QixRQUFPOUQsU0FBUCxDQUFpQmlDLDRCQUFqQixHQUFnRCxZQUFXO0FBQ3pELE9BQUcsS0FBSzJELGdCQUFSLEVBQTBCO0FBQ3hCLGtDQUFpQixLQUFLckIsZUFBdEIsRUFBdUMsS0FBS3FCLGdCQUE1QztBQUNBLFVBQUtBLGdCQUFMLEdBQXdCLElBQXhCO0FBQ0Q7QUFDRixFQUxEOztBQU9BOzs7QUFHQTlCLFFBQU85RCxTQUFQLENBQWlCZ0YsbUJBQWpCLEdBQXVDLFlBQVc7QUFDaEQsVUFBT3BILGFBQWFDLE9BQWIsQ0FBcUIscUJBQXJCLElBQ0gsc0JBQVlpSSxnQkFEVCxHQUVILHNCQUFZQyxpQkFGaEI7QUFHRCxFQUpEOztBQU1BOzs7QUFHQWpDLFFBQU85RCxTQUFQLENBQWlCRCxVQUFqQixHQUE4QixZQUFXO0FBQ3ZDLE9BQUcsS0FBS3dFLGVBQVIsRUFBeUI7QUFDdkIsNkJBQVksS0FBS0QsVUFBakIsRUFBNkIsUUFBN0I7QUFDQSw2QkFBWSxLQUFLQyxlQUFqQixFQUFrQyxRQUFsQztBQUNBLFVBQUtyQixnQkFBTCxDQUFzQndCLEtBQXRCO0FBQ0EsVUFBS0ssa0JBQUwsQ0FBd0J6RSxTQUF4QixHQUFvQyxLQUFLMEUsbUJBQUwsRUFBcEM7QUFDRDtBQUNGLEVBUEQ7O0FBU0E7OztBQUdBbEIsUUFBTzlELFNBQVAsQ0FBaUI0QyxVQUFqQixHQUE4QixZQUFXO0FBQ3ZDLE9BQUcsS0FBSzJCLGVBQVIsRUFBeUI7QUFDdkIsMEJBQVMsS0FBS0QsVUFBZCxFQUEwQixRQUExQjtBQUNBLDBCQUFTLEtBQUtDLGVBQWQsRUFBK0IsUUFBL0I7QUFDQSwyQkFBVSxLQUFLckIsZ0JBQWY7QUFDRDtBQUNGLEVBTkQ7O0FBUUE7OztBQUdBWSxRQUFPOUQsU0FBUCxDQUFpQmdHLFlBQWpCLEdBQWdDLFlBQVc7QUFDekMsUUFBSyxJQUFJQyxJQUFLLEtBQUszQixVQUFMLENBQWdCNEIsUUFBaEIsQ0FBeUJsSixNQUF6QixHQUFrQyxDQUFoRCxFQUFvRGlKLElBQUksQ0FBeEQsRUFBMkRBLEdBQTNELEVBQWdFO0FBQzlELGtDQUFpQixLQUFLM0IsVUFBdEIsRUFBa0MsS0FBS0EsVUFBTCxDQUFnQjRCLFFBQWhCLENBQXlCRCxDQUF6QixDQUFsQztBQUNEO0FBQ0YsRUFKRDs7QUFNQTs7Ozs7QUFLQW5DLFFBQU85RCxTQUFQLENBQWlCd0MsV0FBakIsR0FBK0IsVUFBUzJELFdBQVQsRUFBc0JDLFlBQXRCLEVBQW9DO0FBQ2pFLE9BQUk3RSxPQUFPLElBQVg7O0FBRUEsT0FBSXZGLFNBQVM7QUFDWCxlQUFVLFFBREM7QUFFWCxnQkFBVyxLQUFLeUQ7QUFGTCxJQUFiOztBQUtBLGtCQUFJekQsTUFBSixFQUFZLFVBQVNDLFFBQVQsRUFBbUI7QUFDN0I7QUFDQWtLLGlCQUFZbEssU0FBU3lGLElBQXJCO0FBQ0EwRSxrQkFBYW5LLFNBQVMyRixLQUF0Qjs7QUFFQTtBQUNBLFNBQUczRixTQUFTMkQsTUFBVCxDQUFnQjVDLE1BQWhCLEdBQXlCLENBQTVCLEVBQStCO0FBQzdCdUUsWUFBS2UsV0FBTCxDQUFpQnJHLFNBQVMyRCxNQUExQixFQUFrQzNELFNBQVNzRyxJQUEzQztBQUNEO0FBQ0YsSUFURDtBQVVELEVBbEJEOztBQW9CQTs7Ozs7QUFLQXVCLFFBQU85RCxTQUFQLENBQWlCc0MsV0FBakIsR0FBK0IsVUFBUytELFdBQVQsRUFBc0I5RCxJQUF0QixFQUE0QjtBQUN6RDtBQUNBOEQsZUFBWUMsSUFBWixDQUFpQixVQUFTQyxRQUFULEVBQW1CQyxRQUFuQixFQUE2QjtBQUM1QyxTQUFJQyxRQUFRLGlDQUFxQkYsU0FBU0csUUFBOUIsQ0FBWjtBQUNBLFNBQUlDLFFBQVEsaUNBQXFCSCxTQUFTRSxRQUE5QixDQUFaO0FBQ0EsU0FBSUUsUUFBUyxJQUFJN0ksSUFBSixDQUFTMEksS0FBVCxDQUFELENBQWtCSSxPQUFsQixFQUFaO0FBQ0EsU0FBSUMsUUFBUyxJQUFJL0ksSUFBSixDQUFTNEksS0FBVCxDQUFELENBQWtCRSxPQUFsQixFQUFaO0FBQ0EsWUFBUUQsUUFBUUUsS0FBaEI7QUFDRCxJQU5EOztBQVFBO0FBQ0EsT0FBSUMscUJBQXFCLGlDQUFxQnhFLElBQXJCLEVBQTJCc0UsT0FBM0IsS0FBdUM5SSxLQUFLQyxHQUFMLEVBQWhFOztBQUVBO0FBQ0EsT0FBRyxLQUFLc0csVUFBUixFQUFvQjtBQUNsQixVQUFLMEIsWUFBTDtBQUNEOztBQUVELE9BQUl6RSxPQUFPLElBQVg7QUFDQThFLGVBQVlqSixPQUFaLENBQW9CLFVBQVN5RSxPQUFULEVBQWtCO0FBQ3BDLFNBQUltRixnQkFBZ0JuRixRQUFRb0YsU0FBUixHQUFvQixNQUFwQixHQUE2QixLQUFqRDtBQUNBLFNBQUlDLGtCQUFrQixJQUFJbkosSUFBSixDQUFTLGlDQUFxQjhELFFBQVE2RSxRQUE3QixJQUF5Q0ssa0JBQWxELENBQXRCO0FBQ0F4RixVQUFLTyxhQUFMLENBQW1Ca0YsYUFBbkIsRUFBa0MsMkJBQWVuRixRQUFRQSxPQUF2QixDQUFsQyxFQUFtRXFGLGVBQW5FLEVBQW9GLElBQXBGO0FBQ0QsSUFKRDtBQUtELEVBeEJEOztBQTBCQTs7O0FBR0FwRCxRQUFPOUQsU0FBUCxDQUFpQjJFLDBCQUFqQixHQUE4QyxZQUFXO0FBQ3ZELE9BQUcsS0FBS3pCLGdCQUFMLENBQXNCc0MsS0FBekIsRUFBZ0M7QUFDOUIsMkJBQVUsS0FBS3RDLGdCQUFmO0FBQ0QsSUFGRCxNQUVPO0FBQ0wsMkJBQVUsS0FBS0EsZ0JBQWYsRUFBaUMsd0JBQWNpRSxhQUEvQztBQUNEO0FBQ0YsRUFORDs7QUFRQTs7OztBQUlBckQsUUFBTzlELFNBQVAsQ0FBaUJrRixtQkFBakIsR0FBdUMsVUFBUy9HLEtBQVQsRUFBZ0I7QUFDckRBLFNBQU1pSixjQUFOO0FBQ0EsT0FBSTdGLE9BQU8sSUFBWDs7QUFFQSxPQUFHLEtBQUsyQixnQkFBTCxDQUFzQnNDLEtBQXpCLEVBQWdDO0FBQzlCLFNBQUl4SixTQUFTO0FBQ1gsaUJBQVUsU0FEQztBQUVYLGtCQUFXLEtBQUt5RCxTQUZMO0FBR1gsa0JBQVcsZ0JBQWdCNEgsd0JBSGhCO0FBSVgsa0JBQVdwSyxTQUFTQyxhQUFULENBQXVCLG1DQUF2QixFQUE0RHNJO0FBSjVELE1BQWI7O0FBT0EscUJBQUt4SixNQUFMLEVBQWEsWUFBVztBQUN0QnVGLFlBQUtPLGFBQUwsQ0FBbUIsTUFBbkIsRUFBMkJQLEtBQUsyQixnQkFBTCxDQUFzQnNDLEtBQWpEO0FBQ0E7QUFDRCxNQUhEO0FBSUQsSUFaRCxNQVlPO0FBQ0wsMkJBQVUsS0FBS3RDLGdCQUFmLEVBQWlDLHdCQUFjaUUsYUFBL0M7QUFDRDtBQUNGLEVBbkJEOztBQXFCQTs7OztBQUlBckQsUUFBTzlELFNBQVAsQ0FBaUJ3RSx1QkFBakIsR0FBMkMsVUFBU3JHLEtBQVQsRUFBZ0I7QUFDekQsT0FBSUEsTUFBTW1KLE9BQU4sS0FBa0J2RCxVQUF0QixFQUFrQztBQUNoQyxVQUFLbUIsbUJBQUwsQ0FBeUIvRyxLQUF6QjtBQUNEO0FBQ0YsRUFKRDs7QUFNQTs7O0FBR0EyRixRQUFPOUQsU0FBUCxDQUFpQjRFLDRCQUFqQixHQUFnRCxZQUFXO0FBQ3pELFFBQUtwRCxlQUFMLEdBQXVCLElBQXZCO0FBQ0EsUUFBS3lDLHVCQUFMO0FBQ0QsRUFIRDs7QUFLQTs7O0FBR0FILFFBQU85RCxTQUFQLENBQWlCa0UsZUFBakIsR0FBbUMsWUFBVztBQUM1QyxRQUFLMUMsZUFBTCxHQUF1QixLQUF2QjtBQUNELEVBRkQ7O0FBSUE7Ozs7QUFJQSxVQUFTNkYsc0JBQVQsR0FBa0M7QUFDaEMsVUFBTzFELEtBQUs0RCxLQUFMLENBQVc1RCxLQUFLQyxNQUFMLE1BQWlCLE1BQU0sQ0FBTixHQUFVLENBQTNCLENBQVgsSUFBNEMsQ0FBbkQ7QUFDRCxFOzs7Ozs7Ozs7Ozs7O0FDaldEOztBQUNBOztTQUZTNEQsRyxHQUFBQSxHO1NBQUtDLE8sR0FBQUEsTztTQUFTQyxJLEdBQUFBLEk7U0FBTUMsYSxHQUFBQSxhO1NBQWVDLHVCLEdBQUFBLHVCOzs7QUFJNUM7Ozs7QUFJQTtBQUNBLEtBQU1DLGFBQWEscUNBQW5CLEMsQ0FBMkQ7O0FBRTNEOzs7OztBQUtBLFVBQVNMLEdBQVQsQ0FBYU0sZ0JBQWIsRUFBK0JDLFFBQS9CLEVBQXlDO0FBQ3ZDLE9BQUlDLGdCQUFnQkMsdUJBQXVCSCxnQkFBdkIsQ0FBcEI7QUFDQSxPQUFJSSxNQUFNQyxtQkFBbUIsS0FBbkIsRUFBMEJOLGFBQWFHLGFBQXZDLENBQVY7QUFDQSxPQUFJLENBQUNFLEdBQUwsRUFBVTtBQUNSLFdBQU0sSUFBSUUsS0FBSixDQUFVLG9CQUFWLENBQU47QUFDRDs7QUFFREYsT0FBSUcsTUFBSixHQUFhLFlBQVc7QUFDdEIsU0FBSXBNLFdBQVdxTSxLQUFLQyxLQUFMLENBQVdMLElBQUlNLFlBQWYsQ0FBZjtBQUNBLFNBQUd2TSxTQUFTOEcsTUFBWixFQUFvQjtBQUNsQmdGLGdCQUFTOUwsUUFBVDtBQUNEO0FBQ0YsSUFMRDs7QUFPQWlNLE9BQUlPLElBQUosQ0FBUyxJQUFUO0FBQ0Q7O0FBRUQ7Ozs7QUFJQSxVQUFTaEIsT0FBVCxDQUFpQkssZ0JBQWpCLEVBQW1DO0FBQ2pDLE9BQUlFLGdCQUFnQkMsdUJBQXVCSCxnQkFBdkIsQ0FBcEI7QUFDQSxPQUFJSSxNQUFNQyxtQkFBbUIsS0FBbkIsRUFBMEJOLGFBQWFHLGFBQXZDLEVBQXNELElBQXRELENBQVY7QUFDQSxPQUFJLENBQUNFLEdBQUwsRUFBVTtBQUNSLFdBQU0sSUFBSUUsS0FBSixDQUFVLG9CQUFWLENBQU47QUFDRDs7QUFFRCxPQUFJbk0saUJBQUo7QUFDQWlNLE9BQUlHLE1BQUosR0FBYSxZQUFXO0FBQ3RCcE0sZ0JBQVdxTSxLQUFLQyxLQUFMLENBQVdMLElBQUlNLFlBQWYsQ0FBWDtBQUNELElBRkQ7O0FBSUFOLE9BQUlPLElBQUosQ0FBUyxJQUFUO0FBQ0EsVUFBT3hNLFFBQVA7QUFDRDs7QUFFRDs7Ozs7QUFLQSxVQUFTeUwsSUFBVCxDQUFjSSxnQkFBZCxFQUFnQ0MsUUFBaEMsRUFBMEM7QUFDeEMsT0FBSUMsZ0JBQWdCQyx1QkFBdUJILGdCQUF2QixDQUFwQjtBQUNBLE9BQUlJLE1BQU1DLG1CQUFtQixLQUFuQixFQUEwQk4sYUFBYUcsYUFBdkMsQ0FBVjtBQUNBLE9BQUksQ0FBQ0UsR0FBTCxFQUFVO0FBQ1IsV0FBTSxJQUFJRSxLQUFKLENBQVUsb0JBQVYsQ0FBTjtBQUNEOztBQUVERixPQUFJRyxNQUFKLEdBQWEsWUFBVztBQUN0QixTQUFJcE0sV0FBV3FNLEtBQUtDLEtBQUwsQ0FBV0wsSUFBSU0sWUFBZixDQUFmO0FBQ0EsU0FBR3ZNLFNBQVM4RyxNQUFaLEVBQW9CO0FBQ2xCZ0YsZ0JBQVM5TCxRQUFUO0FBQ0QsTUFGRCxNQUVPO0FBQ0x5TTtBQUNEO0FBQ0YsSUFQRDs7QUFTQVIsT0FBSVMsT0FBSixHQUFjLFlBQVc7QUFDdkJEO0FBQ0QsSUFGRDs7QUFJQVIsT0FBSU8sSUFBSixDQUFTLElBQVQ7QUFDRDs7QUFFRDs7Ozs7QUFLQSxVQUFTUixzQkFBVCxDQUFnQ0gsZ0JBQWhDLEVBQWtEO0FBQ2hELE9BQUlFLHNCQUFKO0FBQ0FGLG9CQUFpQmMsR0FBakIsR0FBdUJySyxPQUFPc0ssYUFBOUI7QUFDQSxRQUFJLElBQUl6SyxHQUFSLElBQWUwSixnQkFBZixFQUFpQztBQUMvQixTQUFHQSxpQkFBaUJnQixjQUFqQixDQUFnQzFLLEdBQWhDLENBQUgsRUFBeUM7QUFDdkM0Six1QkFBZ0JBLGdCQUFpQkEsZ0JBQWdCLEdBQWpDLEdBQXdDLEdBQXhEO0FBQ0FBLHdCQUFpQjVKLE1BQU0sR0FBTixHQUFZMkssVUFBVWpCLGlCQUFpQjFKLEdBQWpCLENBQVYsQ0FBN0I7QUFDRDtBQUNGO0FBQ0QsVUFBTzRKLGFBQVA7QUFDRDs7QUFFRDs7Ozs7OztBQU9BLFVBQVNHLGtCQUFULENBQTRCYSxNQUE1QixFQUFvQ0osR0FBcEMsRUFBeUNLLElBQXpDLEVBQStDO0FBQzdDLE9BQUlmLE1BQU0sSUFBSWdCLGNBQUosRUFBVjtBQUNBLE9BQUkscUJBQXFCaEIsR0FBekIsRUFBOEI7QUFDNUJBLFNBQUk3RSxJQUFKLENBQVMyRixNQUFULEVBQWlCSixHQUFqQixFQUFzQixDQUFDSyxJQUF2QjtBQUNELElBRkQsTUFFTyxJQUFJLE9BQU9FLGNBQVAsS0FBMEIsV0FBOUIsRUFBMkM7QUFDaEQ7QUFDQWpCLFdBQU0sSUFBSWlCLGNBQUosRUFBTjtBQUNBakIsU0FBSTdFLElBQUosQ0FBUzJGLE1BQVQsRUFBaUJKLEdBQWpCO0FBQ0QsSUFKTSxNQUlBO0FBQ0xWLFdBQU0sSUFBTjtBQUNEO0FBQ0QsVUFBT0EsR0FBUDtBQUNEOztBQUVEOzs7QUFHQSxVQUFTUSxpQkFBVCxHQUE2QjtBQUMzQixPQUFJVSxnQkFBZ0JuTSxTQUFTQyxhQUFULENBQXVCLHFCQUF2QixDQUFwQjtBQUNBLDJCQUFZa00sYUFBWixFQUEyQixnQkFBM0I7QUFDQSx3QkFBU0EsYUFBVCxFQUF3QixtQkFBeEI7QUFDQUEsaUJBQWNDLFNBQWQsR0FBMEIsd0JBQWNDLFdBQXhDO0FBQ0Esd0JBQVNGLGFBQVQsRUFBd0IsaUJBQXhCO0FBQ0F0TSxjQUFXLFlBQVc7QUFDcEI4SztBQUNELElBRkQsRUFFRyxJQUZIO0FBR0Q7O0FBRUQ7Ozs7QUFJQSxVQUFTRCxhQUFULENBQXVCOUYsT0FBdkIsRUFBZ0M7QUFDOUIsT0FBSXVILGdCQUFnQm5NLFNBQVNDLGFBQVQsQ0FBdUIscUJBQXZCLENBQXBCO0FBQ0EsMkJBQVlrTSxhQUFaLEVBQTJCLG1CQUEzQjtBQUNBLHdCQUFTQSxhQUFULEVBQXdCLGdCQUF4QjtBQUNBQSxpQkFBY0MsU0FBZCxHQUEwQnhILE9BQTFCO0FBQ0Esd0JBQVN1SCxhQUFULEVBQXdCLGlCQUF4QjtBQUNBdE0sY0FBVyxZQUFXO0FBQ3BCOEs7QUFDRCxJQUZELEVBRUcsSUFGSDtBQUdEOztBQUVEOzs7QUFHQSxVQUFTQSx1QkFBVCxHQUFtQztBQUNqQyxPQUFJd0IsZ0JBQWdCbk0sU0FBU0MsYUFBVCxDQUF1QixxQkFBdkIsQ0FBcEI7QUFDQSxPQUFHa00saUJBQWlCQSxjQUFjQyxTQUFsQyxFQUE2QztBQUMzQywwQkFBU0QsYUFBVCxFQUF3QixhQUF4QjtBQUNBdE0sZ0JBQVcsWUFBVztBQUNwQiwrQkFBWXNNLGFBQVosRUFBMkIsbUJBQTNCO0FBQ0EsK0JBQVlBLGFBQVosRUFBMkIsZ0JBQTNCO0FBQ0EsK0JBQVlBLGFBQVosRUFBMkIsaUJBQTNCO0FBQ0EsK0JBQVlBLGFBQVosRUFBMkIsYUFBM0I7QUFDQUEscUJBQWNDLFNBQWQsR0FBMEIsRUFBMUI7QUFDRCxNQU5ELEVBTUcsSUFOSDtBQU9EO0FBQ0YsRTs7Ozs7Ozs7Ozs7QUNuS0Q7Ozs7O0FBS08sS0FBTUUsb0NBQWM7QUFDekIsZ0JBQWEsY0FEWTtBQUV6QixpQkFBYywwQkFGVztBQUd6QixrQkFBZSxzREFIVTtBQUl6Qix3QkFBcUIsd0JBSkk7QUFLekIsdUJBQW9CLGVBTEs7QUFNekIsdUJBQW9CLDBFQU5LO0FBT3pCLHNCQUFtQixtRUFQTTtBQVF6QixvQkFBaUIsb0JBUlE7QUFTekIsbUJBQWdCO0FBVFMsRUFBcEI7O0FBWVA7Ozs7O0FBS08sS0FBTUMsd0NBQWdCO0FBQzNCLGtCQUFlLDRCQURZO0FBRTNCLG9CQUFpQixtQkFGVTtBQUczQiw0QkFBeUIseUNBSEU7QUFJM0Isa0JBQWUsOENBSlk7QUFLM0Isa0JBQWU7QUFMWSxFQUF0QixDOzs7Ozs7Ozs7OztTQ3RCRUMsZ0IsR0FBQUEsZ0I7U0FBa0JDLGdCLEdBQUFBLGdCO1NBQWtCQyxRLEdBQUFBLFE7U0FBVUMsUSxHQUFBQSxRO1NBQVVDLFcsR0FBQUEsVztTQUFhQyxhLEdBQUFBLGE7U0FDdEVDLGEsR0FBQUEsYTtTQUFlQyxvQixHQUFBQSxvQjtTQUFzQkMsVSxHQUFBQSxVO1NBQVlDLFMsR0FBQUEsUztTQUFXQyxTLEdBQUFBLFM7U0FBV0MsUyxHQUFBQSxTO1NBQ3ZFQyxhLEdBQUFBLGE7U0FBZUMsVyxHQUFBQSxXO1NBQWFDLGMsR0FBQUEsYztTQUFnQkMsUyxHQUFBQSxTO1NBQVdDLFksR0FBQUEsWTtTQUFjQyxRLEdBQUFBLFE7O0FBRTdFOzs7Ozs7O0FBTUEsVUFBU2pCLGdCQUFULENBQTBCa0IsV0FBMUIsRUFBdUNDLFFBQXZDLEVBQWlEO0FBQy9DLE9BQUlDLGdCQUFKO0FBQ0FBLGFBQVU1TixTQUFTNk4sYUFBVCxDQUF1QkgsV0FBdkIsQ0FBVjtBQUNBLFFBQUssSUFBSUksSUFBVCxJQUFpQkgsUUFBakIsRUFBMkI7QUFDekIsU0FBR0EsU0FBUzlCLGNBQVQsQ0FBd0JpQyxJQUF4QixDQUFILEVBQWtDO0FBQ2hDRixlQUFRRyxZQUFSLENBQXFCRCxJQUFyQixFQUEyQkgsU0FBU0csSUFBVCxDQUEzQjtBQUNEO0FBQ0Y7QUFDRCxVQUFPRixPQUFQO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0EsVUFBU25CLGdCQUFULENBQTBCdUIsTUFBMUIsRUFBa0NKLE9BQWxDLEVBQTJDO0FBQ3pDSSxVQUFPQyxXQUFQLENBQW1CTCxPQUFuQjtBQUNEOztBQUVEOzs7OztBQUtBLFVBQVNsQixRQUFULENBQWtCa0IsT0FBbEIsRUFBMkJNLFNBQTNCLEVBQXNDO0FBQ3BDLFVBQU8sQ0FBQyxDQUFDTixRQUFRTSxTQUFSLENBQWtCQyxLQUFsQixDQUF3QixJQUFJQyxNQUFKLENBQVcsWUFBWUYsU0FBWixHQUF3QixTQUFuQyxDQUF4QixDQUFUO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0EsVUFBU3ZCLFFBQVQsQ0FBa0JpQixPQUFsQixFQUEyQk0sU0FBM0IsRUFBc0M7QUFDcEMsT0FBRyxDQUFDeEIsU0FBU2tCLE9BQVQsRUFBa0JNLFNBQWxCLENBQUosRUFBa0M7QUFDaENOLGFBQVFNLFNBQVIsSUFBcUIsTUFBTUEsU0FBM0I7QUFDRDtBQUNGOztBQUVEOzs7OztBQUtBLFVBQVN0QixXQUFULENBQXFCZ0IsT0FBckIsRUFBOEJNLFNBQTlCLEVBQXlDO0FBQ3ZDLE9BQUl4QixTQUFTa0IsT0FBVCxFQUFrQk0sU0FBbEIsQ0FBSixFQUFrQztBQUNoQyxTQUFJRyxpQkFBaUJULFFBQVFNLFNBQVIsQ0FBa0JJLEtBQWxCLENBQXdCLEdBQXhCLENBQXJCO0FBQ0EsVUFBSyxJQUFJdEYsSUFBSSxDQUFiLEVBQWdCQSxJQUFJcUYsZUFBZXRPLE1BQW5DLEVBQTJDaUosR0FBM0MsRUFBZ0Q7QUFDOUMsV0FBSXFGLGVBQWVyRixDQUFmLE1BQXNCa0YsU0FBMUIsRUFBcUM7QUFDbkNHLHdCQUFlRSxNQUFmLENBQXNCdkYsQ0FBdEIsRUFBeUIsQ0FBekI7QUFDQUE7QUFDRDtBQUNGO0FBQ0Q0RSxhQUFRTSxTQUFSLEdBQW9CRyxlQUFlRyxJQUFmLENBQW9CLEdBQXBCLENBQXBCO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7QUFLQSxVQUFTM0IsYUFBVCxDQUF1QjRCLEtBQXZCLEVBQThCO0FBQzVCLE9BQUlDLEtBQUssMkpBQVQ7QUFDQSxVQUFPQSxHQUFHQyxJQUFILENBQVFGLEtBQVIsQ0FBUDtBQUNEOztBQUVEOzs7OztBQUtBLFVBQVMzQixhQUFULENBQXVCOEIsS0FBdkIsRUFBOEI7QUFDNUIsT0FBSUYsS0FBSyxzQkFBVDtBQUNBLFVBQU9BLEdBQUdDLElBQUgsQ0FBUUMsS0FBUixDQUFQO0FBQ0Q7O0FBRUQ7Ozs7O0FBS0EsVUFBUzdCLG9CQUFULENBQThCekcsR0FBOUIsRUFBbUM7QUFDakMsT0FBSXVJLE9BQU92SSxJQUFJd0ksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsQ0FBWDtBQUNBLE9BQUlDLFFBQVF6SSxJQUFJd0ksU0FBSixDQUFjLENBQWQsRUFBaUIsQ0FBakIsSUFBc0IsQ0FBbEM7QUFDQSxPQUFJRSxPQUFPMUksSUFBSXdJLFNBQUosQ0FBYyxDQUFkLEVBQWlCLENBQWpCLENBQVg7QUFDQSxPQUFJRyxRQUFRM0ksSUFBSXdJLFNBQUosQ0FBYyxDQUFkLEVBQWlCLEVBQWpCLENBQVo7QUFDQSxPQUFJSSxVQUFVNUksSUFBSXdJLFNBQUosQ0FBYyxFQUFkLEVBQWtCLEVBQWxCLENBQWQ7QUFDQSxPQUFJSyxVQUFVN0ksSUFBSXdJLFNBQUosQ0FBYyxFQUFkLEVBQWtCLEVBQWxCLENBQWQ7QUFDQSxVQUFPLElBQUloTyxJQUFKLENBQVMrTixJQUFULEVBQWVFLEtBQWYsRUFBc0JDLElBQXRCLEVBQTRCQyxLQUE1QixFQUFtQ0MsT0FBbkMsRUFBNENDLE9BQTVDLENBQVA7QUFDRDs7QUFFRDs7Ozs7QUFLQSxVQUFTbkMsVUFBVCxDQUFvQnZELFFBQXBCLEVBQThCO0FBQzVCLE9BQUl3RixRQUFReEYsU0FBUzJGLFFBQVQsRUFBWjtBQUNBLE9BQUlGLFVBQVV6RixTQUFTNEYsVUFBVCxFQUFkO0FBQ0FKLFdBQVFBLFFBQVEsRUFBUixHQUFhLE1BQU1BLEtBQW5CLEdBQTJCQSxLQUFuQztBQUNBQyxhQUFVQSxVQUFVLEVBQVYsR0FBZSxNQUFNQSxPQUFyQixHQUErQkEsT0FBekM7QUFDQSxVQUFPRCxRQUFRLEdBQVIsR0FBY0MsT0FBckI7QUFDRDs7QUFFRDs7OztBQUlBLFVBQVNqQyxTQUFULENBQW1CcUMsR0FBbkIsRUFBd0I7QUFDdEIsT0FBSUMsUUFBUSxJQUFJQyxLQUFKLEVBQVo7QUFDQUQsU0FBTUQsR0FBTixHQUFZQSxHQUFaO0FBQ0FDLFNBQU1FLFFBQU4sR0FBaUIsSUFBakI7QUFDRDs7QUFFRDs7Ozs7QUFLQSxVQUFTdkMsU0FBVCxDQUFtQlUsT0FBbkIsRUFBNEI4QixLQUE1QixFQUFtQztBQUNqQy9DLFlBQVNpQixPQUFULEVBQWtCLE9BQWxCO0FBQ0FBLFdBQVErQixrQkFBUixDQUEyQnZELFNBQTNCLEdBQXVDc0QsS0FBdkM7QUFDRDs7QUFFRDs7OztBQUlBLFVBQVN2QyxTQUFULENBQW1CUyxPQUFuQixFQUE0QjtBQUMxQmhCLGVBQVlnQixPQUFaLEVBQXFCLE9BQXJCO0FBQ0FBLFdBQVErQixrQkFBUixDQUEyQnZELFNBQTNCLEdBQXVDLEVBQXZDO0FBQ0Q7O0FBRUQ7Ozs7QUFJQSxVQUFTZ0IsYUFBVCxDQUF1QmxNLEtBQXZCLEVBQThCO0FBQzVCLE9BQUcsQ0FBQ0EsTUFBTTBPLGFBQU4sQ0FBb0JySCxLQUF4QixFQUErQjtBQUM3QnJILFdBQU0wTyxhQUFOLENBQW9CbkksS0FBcEI7QUFDQTBGLGVBQVVqTSxNQUFNME8sYUFBaEI7QUFDRDtBQUNGOztBQUVEOzs7O0FBSUEsVUFBU3ZDLFdBQVQsQ0FBcUJ3QyxNQUFyQixFQUE2QjtBQUMzQixRQUFLLElBQUlDLFFBQVQsSUFBcUJELE1BQXJCLEVBQTZCO0FBQzNCLFNBQUksT0FBT0EsT0FBT0MsUUFBUCxDQUFQLEtBQTRCLFVBQWhDLEVBQTRDO0FBQzFDRCxjQUFPQyxRQUFQLElBQW1CRCxPQUFPQyxRQUFQLEVBQWlCQyxJQUFqQixDQUFzQkYsTUFBdEIsQ0FBbkI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7O0FBS0EsVUFBU3ZDLGNBQVQsQ0FBd0JuRixJQUF4QixFQUE4QjtBQUM1QixVQUFPQSxLQUFLNUIsT0FBTCxDQUFhLEtBQWIsRUFBb0IsTUFBcEIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7QUFTQSxVQUFTZ0gsU0FBVCxDQUFtQnlDLFVBQW5CLEVBQStCQyxLQUEvQixFQUFzQ0MsTUFBdEMsRUFBOENaLEdBQTlDLEVBQW1EYSxVQUFuRCxFQUErREMsR0FBL0QsRUFBb0U7QUFDbEUsT0FBSUMsTUFBTSxJQUFJQyxLQUFKLEVBQVY7QUFDQUQsT0FBSWYsR0FBSixHQUFVQSxHQUFWOztBQUVBZSxPQUFJakYsTUFBSixHQUFhLFlBQVc7QUFDdEJvQyxrQkFBYXdDLFVBQWIsRUFBeUJDLEtBQXpCLEVBQWdDQyxNQUFoQyxFQUF3Q1osR0FBeEMsRUFBNkNjLEdBQTdDO0FBQ0QsSUFGRDs7QUFJQUMsT0FBSTNFLE9BQUosR0FBYyxZQUFXO0FBQ3ZCOEIsa0JBQWF3QyxVQUFiLEVBQXlCQyxLQUF6QixFQUFnQ0MsTUFBaEMsRUFBd0NDLFVBQXhDLEVBQW9EQyxHQUFwRDtBQUNELElBRkQ7QUFHRDs7QUFFRDs7Ozs7OztBQU9BLFVBQVM1QyxZQUFULENBQXNCd0MsVUFBdEIsRUFBa0NDLEtBQWxDLEVBQXlDQyxNQUF6QyxFQUFpRFosR0FBakQsRUFBc0RjLEdBQXRELEVBQTJEO0FBQ3pESixjQUFXakMsWUFBWCxDQUF3QixPQUF4QixFQUFpQ2tDLEtBQWpDO0FBQ0FELGNBQVdqQyxZQUFYLENBQXdCLFFBQXhCLEVBQWtDbUMsTUFBbEM7QUFDQUYsY0FBV2pDLFlBQVgsQ0FBd0IsS0FBeEIsRUFBK0J1QixHQUEvQjs7QUFFQWMsU0FBTUEsTUFBTUEsR0FBTixHQUFZLEVBQWxCO0FBQ0FKLGNBQVdqQyxZQUFYLENBQXdCLEtBQXhCLEVBQStCcUMsR0FBL0I7QUFDRDs7QUFFRDs7Ozs7O0FBTUEsVUFBUzNDLFFBQVQsQ0FBa0I4QyxJQUFsQixFQUF3QkMsSUFBeEIsRUFBOEJDLFNBQTlCLEVBQXlDO0FBQ3hDLE9BQUk3USxPQUFKO0FBQ0EsVUFBTyxZQUFXO0FBQ2pCLFNBQUk4USxVQUFVLElBQWQ7QUFBQSxTQUFvQkMsT0FBT0MsU0FBM0I7QUFDQSxTQUFJQyxRQUFRLFNBQVJBLEtBQVEsR0FBVztBQUN0QmpSLGlCQUFVLElBQVY7QUFDQSxXQUFJLENBQUM2USxTQUFMLEVBQWdCRixLQUFLTyxLQUFMLENBQVdKLE9BQVgsRUFBb0JDLElBQXBCO0FBQ2hCLE1BSEQ7QUFJQSxTQUFJSSxVQUFVTixhQUFhLENBQUM3USxPQUE1QjtBQUNBNkYsa0JBQWE3RixPQUFiO0FBQ0FBLGVBQVVDLFdBQVdnUixLQUFYLEVBQWtCTCxJQUFsQixDQUFWO0FBQ0EsU0FBSU8sT0FBSixFQUFhUixLQUFLTyxLQUFMLENBQVdKLE9BQVgsRUFBb0JDLElBQXBCO0FBQ2IsSUFWRDtBQVdBLEc7Ozs7Ozs7Ozs7OztBQ3hPRDs7QUFDQTs7QUFDQTs7bUJBSmVLLFE7OztBQU9mOzs7OztBQUtBLEtBQU1sSyxhQUFhLEVBQW5COztBQUVBOzs7OztBQUtBLFVBQVNrSyxRQUFULENBQWtCeE8sU0FBbEIsRUFBNkJ5TyxjQUE3QixFQUE2QztBQUMzQywyQkFBWSxJQUFaO0FBQ0EsUUFBS3pPLFNBQUwsR0FBaUJBLFNBQWpCO0FBQ0EsUUFBS3lPLGNBQUwsR0FBc0JBLGNBQXRCO0FBQ0Q7O0FBRUQ7Ozs7QUFJQUQsVUFBU2pPLFNBQVQsQ0FBbUJpQixXQUFuQixHQUFpQyxVQUFTRCxRQUFULEVBQW1CO0FBQ2xELFFBQUtBLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0QsRUFGRDs7QUFJQTs7O0FBR0FpTixVQUFTak8sU0FBVCxDQUFtQm1PLG1CQUFuQixHQUF5QyxZQUFXO0FBQ2xELFFBQUtDLGdCQUFMLEdBQXdCLDZCQUFpQixNQUFqQixFQUF5QjtBQUMvQyxjQUFTLHlDQURzQztBQUUvQyxlQUFVO0FBRnFDLElBQXpCLENBQXhCO0FBSUEsUUFBS3BOLFFBQUwsQ0FBY2IsV0FBZCxDQUEwQixLQUFLaU8sZ0JBQS9CO0FBQ0EsUUFBS0EsZ0JBQUwsQ0FBc0I1UCxnQkFBdEIsQ0FBdUMsU0FBdkMsRUFBa0QsS0FBSzZQLHdCQUF2RDs7QUFFQTtBQUNBLFFBQUtDLGVBQUwsR0FBdUIsNkJBQWlCLEdBQWpCLEVBQXNCLEVBQUMsU0FBUyxlQUFWLEVBQXRCLENBQXZCO0FBQ0EsUUFBS0EsZUFBTCxDQUFxQmpGLFNBQXJCLEdBQWlDLHNCQUFZa0YsZ0JBQTdDO0FBQ0EsUUFBS0gsZ0JBQUwsQ0FBc0JqTyxXQUF0QixDQUFrQyxLQUFLbU8sZUFBdkM7O0FBRUE7QUFDQSxRQUFLRSxnQkFBTCxHQUF3Qiw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLGlCQUFWLEVBQXhCLENBQXhCO0FBQ0EsUUFBS0osZ0JBQUwsQ0FBc0JqTyxXQUF0QixDQUFrQyxLQUFLcU8sZ0JBQXZDOztBQUVBLFFBQUtDLGdCQUFMLEdBQXdCLDZCQUFpQixPQUFqQixFQUEwQjtBQUNoRCxhQUFRLE1BRHdDO0FBRWhELG9CQUFlLFNBRmlDO0FBR2hELGFBQVEsU0FId0M7QUFJaEQsa0JBQWE7QUFKbUMsSUFBMUIsQ0FBeEI7QUFNQSxRQUFLRCxnQkFBTCxDQUFzQnJPLFdBQXRCLENBQWtDLEtBQUtzTyxnQkFBdkM7QUFDQSxRQUFLQSxnQkFBTCxDQUFzQi9KLEtBQXRCO0FBQ0EsUUFBSytKLGdCQUFMLENBQXNCalEsZ0JBQXRCLENBQXVDLE9BQXZDOztBQUVBLFFBQUtrUSxnQkFBTCxHQUF3Qiw2QkFBaUIsR0FBakIsRUFBc0IsRUFBQyxTQUFTLG1CQUFWLEVBQXRCLENBQXhCO0FBQ0EsUUFBS0YsZ0JBQUwsQ0FBc0JyTyxXQUF0QixDQUFrQyxLQUFLdU8sZ0JBQXZDOztBQUVBO0FBQ0EsUUFBS0MsYUFBTCxHQUFxQiw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLGlCQUFWLEVBQXhCLENBQXJCO0FBQ0EsUUFBS1AsZ0JBQUwsQ0FBc0JqTyxXQUF0QixDQUFrQyxLQUFLd08sYUFBdkM7O0FBRUEsUUFBS0MsYUFBTCxHQUFxQiw2QkFBaUIsT0FBakIsRUFBMEI7QUFDN0MsYUFBUSxNQURxQztBQUU3QyxvQkFBZSxLQUY4QjtBQUc3QyxhQUFRLE1BSHFDO0FBSTdDLGtCQUFhO0FBSmdDLElBQTFCLENBQXJCO0FBTUEsUUFBS0QsYUFBTCxDQUFtQnhPLFdBQW5CLENBQStCLEtBQUt5TyxhQUFwQztBQUNBLFFBQUtBLGFBQUwsQ0FBbUJwUSxnQkFBbkIsQ0FBb0MsT0FBcEM7O0FBRUEsUUFBS3FRLGFBQUwsR0FBcUIsNkJBQWlCLEdBQWpCLEVBQXNCLEVBQUMsU0FBUyxtQkFBVixFQUF0QixDQUFyQjtBQUNBLFFBQUtGLGFBQUwsQ0FBbUJ4TyxXQUFuQixDQUErQixLQUFLME8sYUFBcEM7O0FBRUE7QUFDQSxRQUFLQyxtQkFBTCxHQUEyQiw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLGlCQUFWLEVBQXhCLENBQTNCO0FBQ0EsUUFBS1YsZ0JBQUwsQ0FBc0JqTyxXQUF0QixDQUFrQyxLQUFLMk8sbUJBQXZDOztBQUVBLFFBQUtDLG1CQUFMLEdBQTJCLDZCQUFpQixPQUFqQixFQUEwQjtBQUNuRCxhQUFRLE1BRDJDO0FBRW5ELG9CQUFlLFVBRm9DO0FBR25ELGFBQVEsWUFIMkM7QUFJbkQsa0JBQWE7QUFKc0MsSUFBMUIsQ0FBM0I7QUFNQSxRQUFLRCxtQkFBTCxDQUF5QjNPLFdBQXpCLENBQXFDLEtBQUs0TyxtQkFBMUM7QUFDQSxRQUFLQSxtQkFBTCxDQUF5QnZRLGdCQUF6QixDQUEwQyxPQUExQzs7QUFFQSxRQUFLd1EsbUJBQUwsR0FBMkIsNkJBQWlCLEdBQWpCLEVBQXNCLEVBQUMsU0FBUyxtQkFBVixFQUF0QixDQUEzQjtBQUNBLFFBQUtGLG1CQUFMLENBQXlCM08sV0FBekIsQ0FBcUMsS0FBSzZPLG1CQUExQzs7QUFFQTtBQUNBLFFBQUtDLGNBQUwsR0FBc0IsNkJBQWlCLEtBQWpCLEVBQXdCLEVBQUMsU0FBUyxpQkFBVixFQUF4QixDQUF0QjtBQUNBLFFBQUtiLGdCQUFMLENBQXNCak8sV0FBdEIsQ0FBa0MsS0FBSzhPLGNBQXZDOztBQUVBLFFBQUtDLGNBQUwsR0FBc0IsNkJBQWlCLE9BQWpCLEVBQTBCO0FBQzlDLGFBQVEsTUFEc0M7QUFFOUMsb0JBQWUsZ0JBRitCO0FBRzlDLGFBQVEsT0FIc0M7QUFJOUMsa0JBQWE7QUFKaUMsSUFBMUIsQ0FBdEI7QUFNQSxRQUFLRCxjQUFMLENBQW9COU8sV0FBcEIsQ0FBZ0MsS0FBSytPLGNBQXJDO0FBQ0EsUUFBS0EsY0FBTCxDQUFvQjFRLGdCQUFwQixDQUFxQyxPQUFyQztBQUNBLFFBQUswUSxjQUFMLENBQW9CMVEsZ0JBQXBCLENBQXFDLFFBQXJDLEVBQStDLEtBQUsyUSxpQkFBcEQ7O0FBRUEsUUFBS0MsY0FBTCxHQUFzQiw2QkFBaUIsR0FBakIsRUFBc0IsRUFBQyxTQUFTLG1CQUFWLEVBQXRCLENBQXRCO0FBQ0EsUUFBS0gsY0FBTCxDQUFvQjlPLFdBQXBCLENBQWdDLEtBQUtpUCxjQUFyQzs7QUFFQTtBQUNBLFFBQUtDLGNBQUwsR0FBc0IsNkJBQWlCLEtBQWpCLEVBQXdCLEVBQUMsU0FBUyxpQkFBVixFQUF4QixDQUF0QjtBQUNBLFFBQUtqQixnQkFBTCxDQUFzQmpPLFdBQXRCLENBQWtDLEtBQUtrUCxjQUF2Qzs7QUFFQSxRQUFLQyxjQUFMLEdBQXNCLDZCQUFpQixPQUFqQixFQUEwQjtBQUM5QyxhQUFRLE9BRHNDO0FBRTlDLG9CQUFlLG1CQUYrQjtBQUc5QyxhQUFRLE9BSHNDO0FBSTlDLGtCQUFhO0FBSmlDLElBQTFCLENBQXRCO0FBTUEsUUFBS0QsY0FBTCxDQUFvQmxQLFdBQXBCLENBQWdDLEtBQUttUCxjQUFyQztBQUNBLFFBQUtBLGNBQUwsQ0FBb0I5USxnQkFBcEIsQ0FBcUMsT0FBckM7QUFDQSxRQUFLOFEsY0FBTCxDQUFvQjlRLGdCQUFwQixDQUFxQyxRQUFyQyxFQUErQyxLQUFLK1EsaUJBQXBEOztBQUVBLFFBQUtDLGNBQUwsR0FBc0IsNkJBQWlCLEdBQWpCLEVBQXNCLEVBQUMsU0FBUyxtQkFBVixFQUF0QixDQUF0QjtBQUNBLFFBQUtILGNBQUwsQ0FBb0JsUCxXQUFwQixDQUFnQyxLQUFLcVAsY0FBckM7O0FBRUE7QUFDQSxRQUFLQyx3QkFBTCxHQUFnQyw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLG9CQUFWLEVBQXhCLENBQWhDO0FBQ0EsUUFBS3JCLGdCQUFMLENBQXNCak8sV0FBdEIsQ0FBa0MsS0FBS3NQLHdCQUF2Qzs7QUFFQSxRQUFLQyxvQkFBTCxHQUE0Qiw2QkFBaUIsUUFBakIsRUFBMkI7QUFDckQsY0FBUyx3QkFENEM7QUFFckQsYUFBUTtBQUY2QyxJQUEzQixDQUE1QjtBQUlBLFFBQUtBLG9CQUFMLENBQTBCcFAsU0FBMUIsR0FBc0Msd0JBQXRDO0FBQ0EsUUFBS21QLHdCQUFMLENBQThCdFAsV0FBOUIsQ0FBMEMsS0FBS3VQLG9CQUEvQztBQUNBLFFBQUtBLG9CQUFMLENBQTBCbFIsZ0JBQTFCLENBQTJDLE9BQTNDLEVBQW9ELEtBQUswUCxjQUF6RDs7QUFFQSxRQUFLeUIsbUJBQUwsR0FBMkIsNkJBQWlCLFFBQWpCLEVBQTJCO0FBQ3BELGNBQVMsdUJBRDJDO0FBRXBELGFBQVE7QUFGNEMsSUFBM0IsQ0FBM0I7QUFJQSxRQUFLQSxtQkFBTCxDQUF5QnJQLFNBQXpCLEdBQXFDLFdBQXJDO0FBQ0EsUUFBS21QLHdCQUFMLENBQThCdFAsV0FBOUIsQ0FBMEMsS0FBS3dQLG1CQUEvQztBQUNBLFFBQUtBLG1CQUFMLENBQXlCblIsZ0JBQXpCLENBQTBDLE9BQTFDLEVBQW1ELEtBQUtvUixvQkFBeEQ7QUFDRCxFQW5IRDs7QUFxSEE7OztBQUdBM0IsVUFBU2pPLFNBQVQsQ0FBbUJILFlBQW5CLEdBQWtDLFlBQVc7QUFDM0M7QUFDQSxPQUFHLEtBQUt1TyxnQkFBUixFQUEwQjtBQUN4Qiw2QkFBWSxLQUFLQSxnQkFBakIsRUFBbUMsUUFBbkM7QUFDRCxJQUZELE1BRU87QUFDTCxVQUFLRCxtQkFBTDtBQUNEOztBQUVEO0FBQ0EsT0FBSTVNLE9BQU8sSUFBWDs7QUFFQSxPQUFJdkYsU0FBUztBQUNYLGVBQVUsYUFEQztBQUVYLGdCQUFXLEtBQUt5RDtBQUZMLElBQWI7O0FBS0Esa0JBQUl6RCxNQUFKLEVBQVksVUFBU0MsUUFBVCxFQUFtQjtBQUM3QixTQUFHQSxTQUFTOEcsTUFBWixFQUFvQjtBQUNsQjtBQUNBLFdBQUc5RyxTQUFTeVAsS0FBVCxJQUFrQnpQLFNBQVM0UCxLQUE5QixFQUFxQztBQUNuQ2pPLHNCQUFhRSxPQUFiLENBQXFCLHFCQUFyQixFQUE0QyxNQUE1QztBQUNELFFBRkQsTUFFTztBQUNMRixzQkFBYXVGLFVBQWIsQ0FBd0IscUJBQXhCO0FBQ0Q7QUFDRixNQVBELE1BT087QUFDTDtBQUNBdkYsb0JBQWF1RixVQUFiLENBQXdCLHFCQUF4QjtBQUNEOztBQUVEO0FBQ0EsU0FBSXZGLGFBQWFDLE9BQWIsQ0FBcUIscUJBQXJCLENBQUosRUFBa0Q7QUFDaEQwRCxZQUFLK00sZUFBTCxDQUFxQmpGLFNBQXJCLEdBQWlDLHNCQUFZd0csZUFBN0M7QUFDRCxNQUZELE1BRU87QUFDTHRPLFlBQUsrTSxlQUFMLENBQXFCakYsU0FBckIsR0FBaUMsc0JBQVlrRixnQkFBN0M7QUFDRDs7QUFFRDtBQUNBaE4sVUFBSytOLGNBQUwsQ0FBb0I5SixLQUFwQixHQUE0QnZKLFNBQVN5UCxLQUFULElBQWtCLEVBQTlDO0FBQ0FuSyxVQUFLMk4sY0FBTCxDQUFvQjFKLEtBQXBCLEdBQTRCdkosU0FBUzRQLEtBQVQsSUFBa0IsRUFBOUM7QUFDQXRLLFVBQUtrTixnQkFBTCxDQUFzQmpKLEtBQXRCLEdBQThCdkosU0FBUzZULE9BQVQsSUFBb0IsRUFBbEQ7QUFDQXZPLFVBQUtxTixhQUFMLENBQW1CcEosS0FBbkIsR0FBMkJ2SixTQUFTeUYsSUFBVCxJQUFpQixFQUE1QztBQUNBSCxVQUFLd04sbUJBQUwsQ0FBeUJ2SixLQUF6QixHQUFpQ3ZKLFNBQVM4VCxVQUFULElBQXVCLEVBQXhEO0FBQ0QsSUExQkQ7O0FBNEJBO0FBQ0EsUUFBS3RCLGdCQUFMLENBQXNCL0osS0FBdEI7QUFDRCxFQTlDRDs7QUFnREE7OztBQUdBdUosVUFBU2pPLFNBQVQsQ0FBbUI2QyxhQUFuQixHQUFtQyxZQUFXO0FBQzVDLE9BQUcsS0FBS3VMLGdCQUFSLEVBQTBCO0FBQ3hCLDBCQUFTLEtBQUtBLGdCQUFkLEVBQWdDLFFBQWhDO0FBQ0EsMkJBQVUsS0FBS2tCLGNBQWY7QUFDQSwyQkFBVSxLQUFLSixjQUFmO0FBQ0Q7QUFDRixFQU5EOztBQVFBOzs7QUFHQWpCLFVBQVNqTyxTQUFULENBQW1COEMsaUJBQW5CLEdBQXVDLFlBQVc7QUFDaEQsT0FBRyxLQUFLc0wsZ0JBQVIsRUFBMEI7QUFDeEIsU0FBSTRCLFNBQVMsS0FBSzVCLGdCQUFMLENBQXNCNkIsZ0JBQXRCLENBQXVDLGtCQUF2QyxDQUFiO0FBQ0EsVUFBSSxJQUFJaEssSUFBSSxDQUFaLEVBQWVBLElBQUkrSixPQUFPaFQsTUFBMUIsRUFBa0NpSixHQUFsQyxFQUF1QztBQUNyQytKLGNBQU8vSixDQUFQLEVBQVUvSSxhQUFWLENBQXdCLE9BQXhCLEVBQWlDc0ksS0FBakMsR0FBeUMsRUFBekM7QUFDQXdLLGNBQU8vSixDQUFQLEVBQVUvSSxhQUFWLENBQXdCLG9CQUF4QixFQUE4Q21NLFNBQTlDLEdBQTBELEVBQTFEO0FBQ0EsK0JBQWEyRyxPQUFPL0osQ0FBUCxFQUFVL0ksYUFBVixDQUF3QixPQUF4QixDQUFiLEVBQStDLE9BQS9DO0FBQ0Q7QUFDRjtBQUNGLEVBVEQ7O0FBV0E7Ozs7QUFJQStRLFVBQVNqTyxTQUFULENBQW1CdVAsaUJBQW5CLEdBQXVDLFlBQVc7QUFDaEQsT0FBRyxLQUFLRCxjQUFMLENBQW9COUosS0FBcEIsSUFBNkIsQ0FBQywwQkFBYyxLQUFLOEosY0FBTCxDQUFvQjlKLEtBQWxDLENBQWpDLEVBQTJFO0FBQ3pFLDJCQUFVLEtBQUs4SixjQUFmLEVBQStCLHdCQUFjWSxXQUE3QztBQUNBLFlBQU8sS0FBUDtBQUNEO0FBQ0QsVUFBTyxJQUFQO0FBQ0QsRUFORDs7QUFRQTs7OztBQUlBakMsVUFBU2pPLFNBQVQsQ0FBbUJtUCxpQkFBbkIsR0FBdUMsWUFBVztBQUNoRCxPQUFHLEtBQUtELGNBQUwsQ0FBb0IxSixLQUFwQixJQUE2QixDQUFDLDBCQUFjLEtBQUswSixjQUFMLENBQW9CMUosS0FBbEMsQ0FBakMsRUFBMkU7QUFDekUsMkJBQVUsS0FBSzBKLGNBQWYsRUFBK0Isd0JBQWNpQixXQUE3QztBQUNBLFlBQU8sS0FBUDtBQUNEO0FBQ0QsVUFBTyxJQUFQO0FBQ0QsRUFORDs7QUFRQTs7O0FBR0FsQyxVQUFTak8sU0FBVCxDQUFtQjRQLG9CQUFuQixHQUEwQyxVQUFTelIsS0FBVCxFQUFnQjtBQUFBOztBQUN4REEsU0FBTWlKLGNBQU47QUFDQTtBQUNBLE9BQUcsQ0FBQyxLQUFLa0ksY0FBTCxDQUFvQjlKLEtBQXJCLElBQThCLENBQUMsS0FBSzBKLGNBQUwsQ0FBb0IxSixLQUF0RCxFQUE2RDtBQUMzRCwyQkFBVSxLQUFLOEosY0FBZixFQUErQix3QkFBY2MscUJBQTdDO0FBQ0EsMkJBQVUsS0FBS2xCLGNBQWYsRUFBK0Isd0JBQWNrQixxQkFBN0M7QUFDQTtBQUNEOztBQUVEO0FBQ0EsT0FBRyxLQUFLYixpQkFBTCxNQUE0QixLQUFLSixpQkFBTCxFQUEvQixFQUF5RDtBQUFBO0FBQ3ZELFdBQUk1TixZQUFKO0FBQ0EsV0FBSXZGLFNBQVM7QUFDWCxtQkFBVSxVQURDO0FBRVgsb0JBQVcsTUFBS3lELFNBRkw7QUFHWCxrQkFBU3hDLFNBQVNDLGFBQVQsQ0FBdUIsK0NBQXZCLEVBQXdFc0ksS0FIdEU7QUFJWCxrQkFBU3ZJLFNBQVNDLGFBQVQsQ0FBdUIsK0NBQXZCLEVBQXdFc0ksS0FKdEU7QUFLWCxvQkFBV3ZJLFNBQVNDLGFBQVQsQ0FBdUIsaURBQXZCLEVBQTBFc0ksS0FMMUU7QUFNWCxpQkFBUXZJLFNBQVNDLGFBQVQsQ0FBdUIsOENBQXZCLEVBQXVFc0ksS0FOcEU7QUFPWCx1QkFBY3ZJLFNBQVNDLGFBQVQsQ0FBdUIsb0RBQXZCLEVBQTZFc0k7QUFQaEYsUUFBYjs7QUFVQSx1QkFBS3hKLE1BQUwsRUFBYSxZQUFXO0FBQ3RCNEIsc0JBQWFFLE9BQWIsQ0FBcUIscUJBQXJCLEVBQTRDLE1BQTVDO0FBQ0F5RCxjQUFLMk0sY0FBTDtBQUNBLGtDQUFjLHNCQUFZbUMsYUFBMUI7QUFDRCxRQUpEO0FBWnVEO0FBaUJ4RDtBQUNGLEVBNUJEOztBQThCQTs7OztBQUlBcEMsVUFBU2pPLFNBQVQsQ0FBbUJxTyx3QkFBbkIsR0FBOEMsVUFBU2xRLEtBQVQsRUFBZ0I7QUFDNUQsT0FBSUEsTUFBTW1KLE9BQU4sS0FBa0J2RCxVQUF0QixFQUFrQztBQUNoQyxVQUFLNkwsb0JBQUwsQ0FBMEJ6UixLQUExQjtBQUNEO0FBQ0YsRUFKRCxDOzs7Ozs7QUNsU0E7QUFDQSw2QkFBNEI7QUFDNUIsMEJBQXlCO0FBQ3pCLEc7Ozs7Ozs7Ozs7OztBQ0RBOztBQUNBOzttQkFIZW1TLE87OztBQUtmOzs7QUFHQSxVQUFTQSxPQUFULEdBQW1CO0FBQ2pCLDJCQUFZLElBQVo7QUFDRDs7QUFFRDs7O0FBR0FBLFNBQVF0USxTQUFSLENBQWtCN0MsZUFBbEIsR0FBb0MsWUFBVztBQUM3QyxRQUFLb1QsZ0JBQUwsR0FBd0IsNkJBQWlCLEtBQWpCLEVBQXdCLEVBQUMsU0FBUyxhQUFWLEVBQXhCLENBQXhCO0FBQ0F0VCxZQUFTQyxhQUFULENBQXVCLE1BQXZCLEVBQStCaUQsV0FBL0IsQ0FBMkMsS0FBS29RLGdCQUFoRDtBQUNELEVBSEQ7O0FBS0E7OztBQUdBRCxTQUFRdFEsU0FBUixDQUFrQnJDLFdBQWxCLEdBQWdDLFlBQVc7QUFDekMsd0JBQVMsS0FBSzRTLGdCQUFkLEVBQWdDLGlCQUFoQztBQUNELEVBRkQ7O0FBSUE7OztBQUdBRCxTQUFRdFEsU0FBUixDQUFrQnpDLFFBQWxCLEdBQTZCLFVBQVNpVCxPQUFULEVBQWtCO0FBQzdDLFFBQUtDLEVBQUwsR0FBVSw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLHlDQUFWLEVBQXhCLENBQVY7QUFDQSxRQUFLRixnQkFBTCxDQUFzQnBRLFdBQXRCLENBQWtDLEtBQUtzUSxFQUF2Qzs7QUFFQSxRQUFLQyxNQUFMLEdBQWMsNkJBQWlCLEdBQWpCLEVBQXNCO0FBQ2xDLGFBQVEseUJBQXlCRixPQURDO0FBRWxDLGVBQVU7QUFGd0IsSUFBdEIsQ0FBZDtBQUlBLFFBQUtFLE1BQUwsQ0FBWXBRLFNBQVosR0FBd0Isc0JBQVlxUSxTQUFwQztBQUNBLFFBQUtGLEVBQUwsQ0FBUXRRLFdBQVIsQ0FBb0IsS0FBS3VRLE1BQXpCO0FBQ0QsRUFWRDs7QUFZQTs7O0FBR0FKLFNBQVF0USxTQUFSLENBQWtCdkMsUUFBbEIsR0FBNkIsVUFBUytTLE9BQVQsRUFBa0I7QUFDN0MsUUFBS0ksRUFBTCxHQUFVLDZCQUFpQixLQUFqQixFQUF3QixFQUFDLFNBQVMseUNBQVYsRUFBeEIsQ0FBVjtBQUNBLFFBQUtMLGdCQUFMLENBQXNCcFEsV0FBdEIsQ0FBa0MsS0FBS3lRLEVBQXZDOztBQUVBLFFBQUtDLE1BQUwsR0FBYyw2QkFBaUIsR0FBakIsRUFBc0I7QUFDbEMsYUFBUSxpQkFBaUJMLE9BQWpCLEdBQTJCLE9BQTNCLEdBQXFDalMsT0FBT3NLLGFBRGxCO0FBRWxDLGVBQVU7QUFGd0IsSUFBdEIsQ0FBZDtBQUlBLFFBQUtnSSxNQUFMLENBQVl2USxTQUFaLEdBQXdCLHNCQUFZcVEsU0FBcEM7QUFDQSxRQUFLQyxFQUFMLENBQVF6USxXQUFSLENBQW9CLEtBQUswUSxNQUF6QjtBQUNELEVBVkQ7O0FBWUE7OztBQUdBUCxTQUFRdFEsU0FBUixDQUFrQnRDLFFBQWxCLEdBQTZCLFVBQVNvVCxRQUFULEVBQW1CO0FBQzlDLFFBQUtDLEVBQUwsR0FBVSw2QkFBaUIsS0FBakIsRUFBd0IsRUFBQyxTQUFTLHlDQUFWLEVBQXhCLENBQVY7QUFDQSxRQUFLUixnQkFBTCxDQUFzQnBRLFdBQXRCLENBQWtDLEtBQUs0USxFQUF2Qzs7QUFFQSxRQUFLQyxNQUFMLEdBQWMsNkJBQWlCLEdBQWpCLEVBQXNCO0FBQ2xDLGFBQVEsbUJBQW1CRixRQURPO0FBRWxDLGVBQVU7QUFGd0IsSUFBdEIsQ0FBZDtBQUlBLFFBQUtFLE1BQUwsQ0FBWTFRLFNBQVosR0FBd0Isc0JBQVlxUSxTQUFwQztBQUNBLFFBQUtJLEVBQUwsQ0FBUTVRLFdBQVIsQ0FBb0IsS0FBSzZRLE1BQXpCO0FBQ0QsRUFWRDs7QUFZQTs7O0FBR0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE07Ozs7Ozs7Ozs7O1NDckZTQyxhLEdBQUFBLGE7U0FBZUMsYSxHQUFBQSxhOztBQUV4Qjs7Ozs7QUFJQSxVQUFTRCxhQUFULENBQXVCNVUsTUFBdkIsRUFBK0I7QUFDN0IsT0FBSThVLGVBQUosQ0FENkIsQ0FDRjtBQUMzQixPQUFJQyxrQkFBSixDQUY2QixDQUVGO0FBQzNCLE9BQUlDLGVBQUosQ0FINkIsQ0FHRjtBQUMzQixPQUFJQyx5QkFBSixDQUo2QixDQUlGO0FBQzNCLE9BQUlDLHNCQUFKLENBTDZCLENBS0Y7QUFDM0IsT0FBSUMseUJBQUosQ0FONkIsQ0FNRjtBQUMzQixPQUFJQyxxQkFBSixDQVA2QixDQU9GO0FBQzNCLE9BQUlDLHdCQUFKLENBUjZCLENBUUY7O0FBRTNCLE9BQUdyVixNQUFILEVBQVc7QUFDVDhVLGNBQVM5VSxPQUFPOFUsTUFBaEI7QUFDQUMsaUJBQVkvVSxPQUFPK1UsU0FBbkI7QUFDQUMsY0FBU2hWLE9BQU9nVixNQUFoQjtBQUNBQyx3QkFBbUJqVixPQUFPaVYsZ0JBQTFCO0FBQ0FDLHFCQUFnQmxWLE9BQU9rVixhQUF2QjtBQUNBQyx3QkFBbUJuVixPQUFPbVYsZ0JBQTFCO0FBQ0FDLG9CQUFlcFYsT0FBT29WLFlBQXRCO0FBQ0FDLHVCQUFrQnJWLE9BQU9xVixlQUF6QjtBQUNELElBVEQsTUFTTztBQUNMUCxjQUFTLFNBQVQ7QUFDQUMsaUJBQVksTUFBWjtBQUNBQyxjQUFTLE1BQVQ7QUFDQUMsd0JBQW1CLE1BQW5CO0FBQ0FDLHFCQUFnQixNQUFoQjtBQUNBQyx3QkFBbUIsU0FBbkI7QUFDQUMsb0JBQWUsU0FBZjtBQUNBQyx1QkFBa0IsU0FBbEI7QUFDRDs7QUFFRCxPQUFJQyxNQUFNLHdFQUNBLGtFQURBO0FBRUE7QUFDQSwwQ0FIQSxHQUcwQ04sTUFIMUMsR0FHbUQsc0ZBSG5ELEdBSUEsdVFBSkEsR0FLQSw4SUFMQSxHQU1BLHNKQU5BOztBQVFBO0FBQ0EscU9BVEEsR0FVQSx5RkFWQSxHQVdBLDBDQVhBLEdBWUEsZ25DQVpBLEdBYUEsK1BBYkEsR0FjQSw2SUFkQSxHQWVBLHFKQWZBOztBQWlCQTtBQUNBLDBFQWxCQSxHQW1CQSwyRkFuQkEsR0FvQkEsb0hBcEJBLEdBcUJBLHMyQkFyQkEsR0FzQkEsNERBdEJBLEdBdUJBLHVDQXZCQSxHQXdCQSx1Q0F4QkE7O0FBMEJBO0FBQ0EsK0VBM0JBLEdBNEJBLDRHQTVCQSxHQTZCQSxnQ0E3QkEsR0E2Qm1DQyxnQkE3Qm5DLEdBNkJzRCxxQkE3QnREOztBQStCQTtBQUNBLDRGQWhDQSxHQWlDQSxzVkFqQ0EsR0FrQ0Esc1VBbENBLEdBbUNBLGlFQW5DQSxHQW9DQSxvRUFwQ0E7O0FBc0NBO0FBQ0EscUlBdkNBLEdBd0NBLGtEQXhDQSxHQXlDQSwrUUF6Q0EsR0EwQ0Esa0NBMUNBLEdBMENxQ0UsZ0JBMUNyQyxHQTBDd0QscUJBMUN4RCxHQTBDZ0ZELGFBMUNoRixHQTBDZ0csa0JBMUNoRyxHQTJDQSxpREEzQ0EsR0EyQ29ERyxlQTNDcEQsR0EyQ3NFLHFCQTNDdEUsR0EyQzhGRCxZQTNDOUYsR0EyQzZHLElBM0M3RyxHQTRDQSx3Q0E1Q0EsR0E2Q0EsbU5BN0NBLEdBOENBLGlEQTlDQSxHQThDb0RGLGFBOUNwRCxHQThDb0UseUpBOUNwRSxHQStDQSx3RUEvQ0EsR0ErQzJFRSxZQS9DM0UsR0ErQzBGLHFEQS9DMUYsR0FnREEsMEVBaERBLEdBZ0Q2RUgsZ0JBaEQ3RSxHQWdEZ0csdUtBaERoRyxHQWlEQSxpRUFqREEsR0FrREEsaUVBbERBLEdBbURBLGdLQW5EQSxHQW9EQSw4RUFwREE7O0FBc0RBO0FBQ0EsMEVBdkRBLEdBdUQwRUEsZ0JBdkQxRSxHQXVENkYsd0ZBdkQ3RixHQXdEQSx3b0NBeERBOztBQTBEQTtBQUNBLDJEQTNEQSxHQTREQSwrRkE1REEsR0E2REEsa0VBN0RBOztBQStEQTtBQUNBLHNPQWhFQSxHQWlFQSxpQ0FqRUEsR0FrRUEsMEVBbEVBLEdBbUVBLGlHQW5FQSxHQW9FQSxvSEFwRUEsR0FxRUEsZ0VBckVBLEdBcUVtRUgsTUFyRW5FLEdBcUU0RSxtQkFyRTVFLEdBc0VBLDZHQXRFQSxHQXVFQSwyRkF2RUEsR0F3RUEsbUdBeEVBOztBQTBFQTtBQUNBLDRDQTNFQSxHQTRFQSwwTEE1RUEsR0E2RUEscUpBN0VBLEdBOEVBLDZFQTlFQSxHQStFQSxzSkEvRUEsR0FnRkEsdURBaEZBLEdBZ0YwREEsTUFoRjFELEdBZ0ZtRSwyQkFoRm5FLEdBaUZBLG9LQWpGQSxHQWtGQSw2R0FsRkEsR0FtRkEsNkVBbkZBLEdBb0ZBLGlDQXBGQSxHQW9Gb0NHLGdCQXBGcEMsR0FvRnVELDJCQXBGdkQ7O0FBc0ZBO0FBQ0EseUxBdkZBLEdBd0ZBLHFGQXhGQTs7QUEwRkE7QUFDQSxxSUEzRkEsR0EyRnFJRixTQTNGckksR0EyRmlKLHFCQTNGakosR0EyRnlLRCxNQTNGekssR0EyRmtMLCtEQTNGbEwsR0E0RkEsK0VBNUZBOztBQThGQTtBQUNBLG9KQS9GQSxHQWdHQSx3SUFoR0EsR0FpR0EseUhBakdBOztBQW1HQTtBQUNBLHNKQXBHQSxHQXFHQSwwSUFyR0EsR0FzR0EsMkhBdEdBOztBQXdHQTtBQUNBLDhMQXpHQSxHQTBHQSx3TEExR0EsR0EyR0Esa0xBM0dBOztBQTZHQTtBQUNBLHlFQTlHQSxHQStHQSxtRUEvR0EsR0FnSEEsOERBaEhBOztBQWtIQTtBQUNBLHFKQW5IQSxHQW9IQSx5SUFwSEEsR0FxSEEsMEhBckhBOztBQXVIQTtBQUNBLHVKQXhIQSxHQXlIQSwySUF6SEEsR0EwSEEsNEhBMUhWOztBQTRIQVMscUJBQWtCRCxHQUFsQjtBQUNEOztBQUVEOzs7O0FBSUEsVUFBU1QsYUFBVCxDQUF1QjdVLE1BQXZCLEVBQStCO0FBQzdCLE9BQUl3VixjQUFKO0FBQUEsT0FBV0MsYUFBWDtBQUFBLE9BQWlCQyxhQUFqQjtBQUFBLE9BQXVCQyxhQUF2QjtBQUFBLE9BQTZCQyxhQUE3QjtBQUNBLE9BQUc1VixNQUFILEVBQVc7QUFDVHdWLGFBQVF4VixPQUFPK1UsU0FBZjtBQUNBVSxZQUFPelYsT0FBTzhVLE1BQWQ7QUFDQVksWUFBTzFWLE9BQU84VSxNQUFkO0FBQ0FjLFlBQU81VixPQUFPOFUsTUFBZDtBQUNBYSxZQUFPM1YsT0FBTzhVLE1BQWQ7QUFDRCxJQU5ELE1BTU87QUFDTFUsYUFBUSxNQUFSO0FBQ0FDLFlBQU8sU0FBUDtBQUNBQyxZQUFPLFNBQVA7QUFDQUUsWUFBTyxTQUFQO0FBQ0FELFlBQU8sU0FBUDtBQUNEOztBQUVELE9BQUlMLE1BQU0sMEVBQ0EsK1VBREEsR0FHQSwwQ0FIQSxHQUlBLDZEQUpBLEdBTUEsdUVBTkEsR0FNMEVFLEtBTjFFLEdBTWtGLDZSQU5sRixHQU9BLHlKQVBBLEdBUUEsbUpBUkEsR0FTQSxtSkFUQSxHQVVBLDBTQVZBOztBQVlBO0FBQ0EsZ0RBYkEsR0FhZ0RDLElBYmhELEdBYXVELElBYnZELEdBY0EsMnVCQWRBOztBQWdCQTtBQUNBLGdEQWpCQSxHQWlCZ0RDLElBakJoRCxHQWlCdUQsSUFqQnZELEdBa0JBLHdXQWxCQTs7QUFvQkE7QUFDQSxnREFyQkEsR0FxQmdERSxJQXJCaEQsR0FxQnVELElBckJ2RCxHQXNCQSx1aURBdEJBOztBQXdCQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4TEE3QkEsR0E4QkEsd0xBOUJBLEdBK0JBLGtMQS9CVjs7QUFpQ0FMLHFCQUFrQkQsR0FBbEI7QUFDRDs7QUFFRDs7OztBQUlBLFVBQVNDLGlCQUFULENBQTJCRCxHQUEzQixFQUFnQztBQUM5QixPQUFJTyxPQUFPalYsU0FBU2lWLElBQVQsSUFBaUJqVixTQUFTQyxhQUFULENBQXVCLE1BQXZCLEVBQStCLENBQS9CLENBQTVCO0FBQ0EsT0FBSWlWLFFBQVFsVixTQUFTNk4sYUFBVCxDQUF1QixPQUF2QixDQUFaO0FBQ0FxSCxTQUFNQyxJQUFOLEdBQWEsVUFBYjs7QUFFQSxPQUFJRCxNQUFNRSxVQUFWLEVBQXNCO0FBQ3BCRixXQUFNRSxVQUFOLENBQWlCQyxPQUFqQixHQUEyQlgsR0FBM0I7QUFDRCxJQUZELE1BRU87QUFDTFEsV0FBTWhTLFdBQU4sQ0FBa0JsRCxTQUFTc1YsY0FBVCxDQUF3QlosR0FBeEIsQ0FBbEI7QUFDRDs7QUFFRE8sUUFBSy9SLFdBQUwsQ0FBaUJnUyxLQUFqQjtBQUNELEU7Ozs7Ozs7Ozs7O0FDM09ELEtBQUlLLGlCQUFpQjtBQUNuQkMsTUFBRyxJQURnQjtBQUVuQkMsTUFBR3pWLFFBRmdCO0FBR25CMFYsTUFBR0MsU0FIZ0I7QUFJbkJDLGFBQVUsQ0FBQyxFQUFELEVBQUssUUFBTCxFQUFlLElBQWYsRUFBcUIsS0FBckIsQ0FKUztBQUtuQkMsVUFBTyxDQUFDLGlCQUFELEVBQW9CLGtCQUFwQixFQUF3QyxRQUF4QyxDQUxZO0FBTW5CQyxNQUFHLENBQUMsT0FBRCxFQUFVLE1BQVYsQ0FOZ0I7QUFPbkJDLHFCQUFrQixFQVBDO0FBUW5CQyxvQkFBaUIsRUFSRTtBQVNuQkMsZUFBWSxFQVRPO0FBVW5CelUsY0FBVyxtQkFBUzBVLFNBQVQsRUFBb0I7QUFDN0IsVUFBS0gsZ0JBQUwsQ0FBc0J6VyxJQUF0QixDQUEyQjRXLFNBQTNCO0FBQ0QsSUFaa0I7QUFhbkJDLGFBQVUsa0JBQVNELFNBQVQsRUFBb0I7QUFDNUIsVUFBS0YsZUFBTCxDQUFxQjFXLElBQXJCLENBQTBCNFcsU0FBMUI7QUFDRCxJQWZrQjtBQWdCbkJFLGdCQUFhLHVCQUFXO0FBQ3RCLFNBQUk5UixPQUFPLElBQVg7QUFDQSxZQUFPLEtBQUtzUixRQUFMLENBQWNTLElBQWQsQ0FBbUIsVUFBU0MsTUFBVCxFQUFpQjtBQUN6QyxjQUFPaFMsS0FBS2lTLFNBQUwsQ0FBZUQsTUFBZixDQUFQO0FBQ0QsTUFGTSxDQUFQO0FBR0QsSUFyQmtCO0FBc0JuQkMsY0FBVyxtQkFBU0QsTUFBVCxFQUFpQjtBQUMxQixZQUFRRSxXQUFXRixTQUFTLEtBQUtULEtBQUwsQ0FBVyxDQUFYLENBQXBCLEtBQXNDLEtBQUtKLENBQW5EO0FBQ0QsSUF4QmtCO0FBeUJuQmdCLGlCQUFjLHNCQUFTQyxLQUFULEVBQWdCO0FBQzVCLFNBQUtBLEtBQUwsRUFBYTtBQUNYLFlBQUtULFVBQUwsR0FBbUJTLFVBQVUsQ0FBWCxHQUFnQixLQUFLWCxnQkFBckIsR0FBd0MsS0FBS0MsZUFBL0Q7QUFDQSxZQUFLLElBQUloTixJQUFJLENBQWIsRUFBZ0JBLElBQUksS0FBS2lOLFVBQUwsQ0FBZ0JsVyxNQUFwQyxFQUE0Q2lKLEdBQTVDLEVBQWlEO0FBQy9DLGNBQUtpTixVQUFMLENBQWdCak4sQ0FBaEI7QUFDRDtBQUNGO0FBQ0YsSUFoQ2tCO0FBaUNuQjJOLGFBQVUsb0JBQVc7QUFDbkJwQixvQkFBZWtCLFlBQWYsQ0FBNEIsQ0FBNUI7QUFDRCxJQW5Da0I7QUFvQ25CRyxZQUFTLG1CQUFXO0FBQ2xCckIsb0JBQWVrQixZQUFmLENBQTRCLENBQTVCO0FBQ0QsSUF0Q2tCO0FBdUNuQkksa0JBQWUseUJBQVc7QUFDckIsVUFBS3BCLENBQUwsQ0FBT2UsV0FBVyxLQUFLaEIsQ0FBTCxHQUFTLEtBQUtLLEtBQUwsQ0FBVyxDQUFYLENBQXBCLENBQVAsQ0FBRCxLQUFpRCxJQUFuRCxHQUE0RCxLQUFLZSxPQUFMLEVBQTVELEdBQTZFLEtBQUtELFFBQUwsRUFBN0U7QUFDRCxJQXpDa0I7QUEwQ25CRyxXQUFRLGtCQUFXO0FBQ2pCLFNBQUk7QUFDRixXQUFJLENBQUUsS0FBS1YsV0FBTCxFQUFOLEVBQTJCO0FBQ3pCLGFBQUlwVyxTQUFTdUIsZ0JBQWIsRUFBK0I7QUFDN0JELGtCQUFPQyxnQkFBUCxDQUF3QixLQUFLdVUsQ0FBTCxDQUFPLENBQVAsQ0FBeEIsRUFBbUMsS0FBS2EsUUFBeEMsRUFBa0QsQ0FBbEQ7QUFDQXJWLGtCQUFPQyxnQkFBUCxDQUF3QixLQUFLdVUsQ0FBTCxDQUFPLENBQVAsQ0FBeEIsRUFBbUMsS0FBS2MsT0FBeEMsRUFBaUQsQ0FBakQ7QUFDRCxVQUhELE1BR087QUFDTCxnQkFBS25CLENBQUwsQ0FBT3NCLFdBQVAsQ0FBbUIsV0FBbkIsRUFBZ0MsS0FBS0osUUFBckM7QUFDQSxnQkFBS2xCLENBQUwsQ0FBT3NCLFdBQVAsQ0FBbUIsWUFBbkIsRUFBaUMsS0FBS0gsT0FBdEM7QUFDRDtBQUNGLFFBUkQsTUFRTztBQUNMLGFBQUl0UyxPQUFPLElBQVg7QUFDQSxjQUFLa1IsQ0FBTCxHQUFTLEtBQUtJLFFBQUwsQ0FBY29CLE1BQWQsQ0FBcUIsVUFBU0MsSUFBVCxFQUFlWCxNQUFmLEVBQXVCO0FBQ25ELGVBQUlXLFNBQVMsS0FBYixFQUFvQjtBQUNsQixvQkFBT0EsSUFBUDtBQUNEO0FBQ0QsZUFBSTNTLEtBQUtpUyxTQUFMLENBQWVELE1BQWYsQ0FBSixFQUE0QjtBQUMxQixvQkFBT0EsTUFBUDtBQUNEO0FBQ0Qsa0JBQU9XLElBQVA7QUFDRCxVQVJRLEVBUU4sS0FSTSxDQUFUO0FBU0EsY0FBS3hCLENBQUwsQ0FBT2xVLGdCQUFQLENBQXdCaVYsV0FBVyxLQUFLaEIsQ0FBTCxHQUFTLEtBQUtLLEtBQUwsQ0FBVyxDQUFYLENBQXBCLENBQXhCLEVBQTRELFlBQVc7QUFDckVOLDBCQUFlc0IsYUFBZixDQUE2Qi9GLEtBQTdCLENBQW1DeUUsY0FBbkMsRUFBbUQzRSxTQUFuRDtBQUNELFVBRkQsRUFFRyxDQUZIO0FBR0Q7QUFDRixNQXhCRCxDQXdCRSxPQUFPc0csQ0FBUCxFQUFVLENBQUU7QUFDZixJQXBFa0I7QUFxRW5CQyxTQUFNLGdCQUFXO0FBQ2YsVUFBS0wsTUFBTDtBQUNEO0FBdkVrQixFQUFyQjs7QUEwRUF2QixnQkFBZTRCLElBQWY7O0FBRUEsVUFBU1gsVUFBVCxDQUFvQmxRLEdBQXBCLEVBQXlCO0FBQ3ZCLFVBQU9BLElBQUksQ0FBSixFQUFPOFEsV0FBUCxLQUF1QjlRLElBQUkrUSxNQUFKLENBQVcsQ0FBWCxDQUE5QjtBQUNEOzttQkFFYzlCLGMiLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBmMmQyNWVkYjMyM2EwMzRhMzc5ZVxuICoqLyIsImltcG9ydCBDaGF0IGZyb20gJy4vY29tcG9uZW50cy9DaGF0JztcbmltcG9ydCBTb2NpYWxzIGZyb20gJy4vY29tcG9uZW50cy9Tb2NpYWxzJztcbmltcG9ydCB7IGdldCB9IGZyb20gJy4vY29tbW9uL2FqYXgnO1xuaW1wb3J0IHsgc2V0Q2hhdFN0eWxlcywgc2V0SWNvblN0eWxlcyB9IGZyb20gJy4vY29tbW9uL3N0eWxlcyc7XG5pbXBvcnQgcGFnZVZpc2liaWxpdHkgZnJvbSAnLi9jb21tb24vcGFnZVZpc2liaWxpdHknO1xuXG4vKipcbiAqINCS0YDQtdC80Y8gKNCyINC80LjQu9C70LjRgdC10LrRg9C90LTQsNGFKSwg0L/RgNC4INC60L7RgtC+0YDQvtC8INGB0YfQuNGC0LDQtdGC0YHRjywg0YfRgtC+INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjCDQtdGJ0LUg0LDQutGC0LjQstC10L0g0L3QsCDRgdCw0LnRgtC1XG4gKiBAY29uc3RhbnRcbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmNvbnN0IEFDVElWRV9QRVJJT0QgPSAxICogNjAgKiAxMDAwO1xuXG4vKipcbiAqINCX0LDQtNC10YDQttC60LAgKNCyINC80LjQu9C70LjRgdC10LrRg9C90LTQsNGFKSDRgSDQvNC+0LzQtdC90YLQsCDQt9Cw0LPRgNGD0LfQutC4INGB0YLRgNCw0L3QuNGG0Ysg0YHQsNC50YLQsCDQtNC+INC+0YLRgNC40YHQvtCy0LrQuCDRgdC+0YbQuNCw0LvRjNC90YvRhSDQutC90L7Qv9C+0Log0Lgg0YfQsNGC0LBcbiAqIEBjb25zdGFudFxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgU0hPV19CVE5fREVMQVkgPSAyMDAwO1xuXG4vKipcbiAqINCt0LrQt9C10LzQv9C70Y/RgCDQutC70LDRgdGB0LAgJ9Ce0L3Qu9Cw0LnQvS3Rh9Cw0YInXG4gKi9cbmxldCBjaGF0O1xuXG4vKipcbiAqINCt0LrQt9C10LzQv9C70Y/RgCDQutC70LDRgdGB0LAgJ9Ch0L7RhtC40LDQu9GM0L3Ri9C1INGB0LXRgtC4J1xuICovXG5sZXQgc29jaWFscztcblxuLyoqXG4gKiDQmNC90LTQtdC60YEg0LLRi9Cx0YDQsNC90L3QvtC5INGB0YLRgNCw0L3QuNGG0Ysg0YHQsNC50YLQsFxuICogQHR5cGUge051bWJlcn1cbiAqL1xubGV0IGxhc3RUYWJJbmRleDtcblxuLyoqXG4gKiDQktGA0LXQvNC10L3QsCAo0LIg0YHQtdC60YPQvdC00LDRhSksINGH0LXRgNC10Lcg0LrQvtGC0L7RgNGL0LUg0L3QtdC+0LHRhdC+0LTQuNC80L4g0LDQstGC0L7QvNCw0YLQuNGH0LXRgdC60Lgg0L7RgtC60YDRi9Cy0LDRgtGMINGH0LDRglxuICogQHR5cGUge0FycmF5fVxuICovXG5sZXQgc2hvd1RpbWVzID0gW107XG5cbi8qKlxuICog0J/QvtC70YPRh9C10L3QuNC1INC90LDRgdGC0YDQvtC10Log0LTQu9GPINGB0LXRgNCy0LjRgdCwICjQuCDQtNC70Y8g0YHQvtGG0LjQsNC70YzQvdGL0YUg0LrQvdC+0L/QvtC6LCDQuCDQtNC70Y8g0YfQsNGC0LApXG4gKi9cbmZ1bmN0aW9uIF9nZXRTZXR0aW5ncygpIHtcbiAgY29uc3QgcGFyYW1zID0geydhY3Rpb24nOiAnc2V0dGluZ3MnfTtcbiAgZ2V0KHBhcmFtcywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICBsZXQgc29jaWFsc1NldHRpbmdzID0gcmVzcG9uc2UuY2hhbm5lbHM7XG4gICAgbGV0IGNvbG9yU2V0dGluZ3MgPSByZXNwb25zZS5jb2xvcnM7XG4gICAgbGV0IGNoYXRTZXR0aW5ncyA9IHJlc3BvbnNlLmNoYXQ7XG5cbiAgICAvLyDQldGB0LvQuCDQvdCw0YHRgtGA0L7QudC60Lgg0LTQu9GPINGH0LDRgtCwINC/0L7Qu9GD0YfQtdC90YtcbiAgICBpZihjaGF0U2V0dGluZ3MpIHtcbiAgICAgIHNob3dUaW1lcy5wdXNoKGNoYXRTZXR0aW5ncy50aW1lU2hvdzEsIGNoYXRTZXR0aW5ncy50aW1lU2hvdzIsIGNoYXRTZXR0aW5ncy50aW1lU2hvdzMpO1xuICAgICAgY2hhdCA9IG5ldyBDaGF0KHJlc3BvbnNlLmNoYXQuaGVhZGVyLCByZXNwb25zZS5jaGF0LndlbGNvbWUsIHJlc3BvbnNlLnRpbWVvdXQsIHNob3dUaW1lcyk7XG4gICAgICBzZXRDaGF0U3R5bGVzKGNvbG9yU2V0dGluZ3MpO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgX2FjdGl2YXRlUGFnZSgpO1xuICAgICAgfSwgU0hPV19CVE5fREVMQVkpO1xuICAgIH1cblxuICAgIC8vINCV0YHQu9C4INC/0YDQuNGI0LvQuCDQvdCw0YHRgtGA0L7QudC60Lgg0YXQvtGC0Y8g0LHRiyDQtNC70Y8g0L7QtNC90L7QuSDRgdC+0YbQuNCw0LvRjNC90L7QuSDQutC90L7Qv9C60LhcbiAgICBpZihzb2NpYWxzU2V0dGluZ3MubGVuZ3RoID4gMCkge1xuICAgICAgLy8g0JjQvdC40YbQuNCw0LvQuNC30LDRhtC40Y8g0YHQvtGG0LjQsNC70YzQvdGL0YUg0LrQvdC+0L/QvtC6XG4gICAgICBzb2NpYWxzID0gbmV3IFNvY2lhbHMoKTtcbiAgICAgIHNldEljb25TdHlsZXMoY29sb3JTZXR0aW5ncyk7XG4gICAgICBpZighZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNvY2lhbHMnKSkge1xuICAgICAgICBzb2NpYWxzLnJlbmRlckNvbnRhaW5lcigpO1xuICAgICAgfVxuXG4gICAgICAvLyDQntGC0YDQuNGB0L7QstC60LAg0YHQvtGG0LjQsNC70YzQvdGL0YUg0LrQvdC+0L/QvtC6XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NpYWxzU2V0dGluZ3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgc3dpdGNoKGl0ZW0uY2hhbm5lbCkge1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICBzb2NpYWxzLnJlbmRlclRsKGl0ZW0uaWQpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgc29jaWFscy5yZW5kZXJGYihpdGVtLmlkKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgIHNvY2lhbHMucmVuZGVyVmsoaXRlbS5pZCk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gY2FzZSA2OlxuICAgICAgICAgICAgLy8gICBzb2NpYWxzLnJlbmRlclZiKGl0ZW0uaWQpO1xuICAgICAgICAgICAgLy8gICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBzb2NpYWxzLnNob3dTb2NpYWxzKCk7XG4gICAgICB9LCBTSE9XX0JUTl9ERUxBWSk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiDQkNC60YLQuNCy0LDRhtC40Y8g0YHRgtGA0LDQvdC40YbRi1xuICovXG5mdW5jdGlvbiBfYWN0aXZhdGVQYWdlKCkge1xuICAvLyDQldGB0LvQuCDRh9Cw0YIg0L3QtSDQuNC90LjRhtC40LDQu9C40LfQuNGA0L7QstCw0L0gKNGH0LDRgiDQvtGC0LrQu9GO0YfQtdC9KVxuICBpZighY2hhdCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vINCe0LHQvdC+0LLQu9C10L3QuNC1INC40L3QtNC10LrRgdCwINC00LvRjyDQstGL0LHRgNCw0L3QvdC+0Lkg0YHRgtGA0LDQvdC40YbRiyDQsdGA0LDRg9C30LXRgNCwXG4gIGxhc3RUYWJJbmRleCA9ICtsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbnJ4LXRhYkluZGV4JykgKyAxO1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbnJ4LXRhYkluZGV4JywgbGFzdFRhYkluZGV4KTtcblxuICAvLyDQntCx0L3QvtCy0LvQtdC90LjQtSDRgNCw0YHQv9C40YHQsNC90LjRjyDQsNCy0YLQvtC+0YLQutGA0YvRgtC40Y8g0YfQsNGC0LBcbiAgaWYoICggRGF0ZS5ub3coKSAtICtsb2NhbFN0b3JhZ2UuZ2V0SXRlbSggJ25yeC1sYXN0R2V0TWVzc2FnZVJlcXVlc3QnKSApID4gQUNUSVZFX1BFUklPRCApIHtcbiAgICAvLyDQkNC60YLQuNCy0L3QvtGB0YLRjCDQvdCwINGB0LDQudGC0LUg0L3QtSDQv9GA0L7Rj9Cy0LvRj9C10YLRgdGPLCDQv9C+0Y3RgtC+0LzRgyDQv9C10YDQtdC30LDQv9GD0YHQutCw0LXQvCDQsNCy0YLQvtC+0YLQutGA0YvRgtC40LUg0YfQsNGC0LAg0YEg0L3QsNGH0LDQu9CwXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oICducngtY3VycmVudEF1dG9PcGVuVGltZUluZGV4JywgJzAnKTtcbiAgfVxuXG4gIC8vINCQ0LrRgtC40LLQsNGG0LjRjyDRh9Cw0YLQsFxuICBjaGF0LmFjdGl2YXRlQ2hhdCgpO1xufVxuXG4vKipcbiAqINCe0LHRgNCw0LHQvtGC0YfQuNC6INGB0L7QsdGL0YLQuNGPINC40LfQvNC10L3QtdC90LjRjyDQt9C90LDRh9C10L3QuNGPINCyIGxvY2FsU3RvcmFnZVxuICovXG5mdW5jdGlvbiBfb25TdG9yYWdlQ2hhbmdlKGV2ZW50KSB7XG4gIGlmKGV2ZW50LmtleSA9PT0gJ25yeC10YWJJbmRleCcpIHtcbiAgICBpZihsYXN0VGFiSW5kZXggIT09ICtsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbnJ4LXRhYkluZGV4JykpIHtcbiAgICAgIGNoYXQuZGVhY3RpdmF0ZUNoYXQoKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiDQntCx0YDQsNCx0L7RgtGH0LjQuiDRgdC+0LHRi9GC0LjRjyDQt9Cw0LPRgNGD0LfQutC4INGB0YLRgNCw0L3QuNGG0YtcbiAqL1xuZnVuY3Rpb24gX29uUGFnZUlzTG9hZGVkKCkge1xuICBsYXN0VGFiSW5kZXggPSArbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ25yeC10YWJJbmRleCcpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc3RvcmFnZScsIF9vblN0b3JhZ2VDaGFuZ2UpO1xuICBwYWdlVmlzaWJpbGl0eS5vblZpc2libGUoX2FjdGl2YXRlUGFnZSk7XG4gIF9nZXRTZXR0aW5ncygpO1xufVxuXG4vLyDQndCw0LLQtdGI0LjQstCw0L3QuNC1INC+0LHRgNCw0LHQvtGC0YfQuNC60L7QsiDRgdC+0LHRi9GC0LjQuVxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBfb25QYWdlSXNMb2FkZWQpO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvanMvc2NyaXB0LmpzXG4gKiovIiwiZXhwb3J0IGRlZmF1bHQgQ2hhdDtcblxuaW1wb3J0IERpYWxvZyBmcm9tICcuL0RpYWxvZyc7XG5pbXBvcnQgQ29udGFjdHMgZnJvbSAnLi9Db250YWN0cyc7XG5pbXBvcnQgeyBnZXQsIGdldFN5bmMsIGhpZGVTZXJ2ZXJSZXN1bHRNZXNzYWdlIH0gZnJvbSAnLi8uLi9jb21tb24vYWpheCc7XG5pbXBvcnQgeyBkZWZhdWx0VGV4dCB9IGZyb20gJy4vLi4vY29tbW9uL21lc3NhZ2VzJztcbmltcG9ydCB7IGNyZWF0ZURPTUVsZW1lbnQsIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsIHBsYXlBdWRpbywgYmluZEFsbEZ1bmMsIGhpZGVFcnJvcixcbiAgICAgICAgc2V0RW50ZXJJblRleHQsIHJlbmRlckltZyB9IGZyb20gJy4vLi4vY29tbW9uL3V0aWxzJztcblxuaW1wb3J0IGF1ZGlvIGZyb20gJy4vLi4vLi4vYXVkaW8vYXVkaW8uanNvbic7XG5cbi8qKlxuICogVVJMLdCw0LTRgNC10YEg0LrQvtC80L/QsNC90LjQuC3RgNCw0LfRgNCw0LHQvtGC0YfQuNC60LAg0YfQsNGC0LBcbiAqIEBjb25zdGFudFxuICogQHR5cGUge1N0cmluZ31cbiAqL1xuY29uc3QgQ09QWVJJR0hUX1VSTCA9ICdodHRwczovL25pcmF4LnJ1L3Byb2R1Y3RzL29ubGluZSc7XG5cbi8qKlxuICog0JLRgNC10LzRjyDQsNC90LjQvNCw0YbQuNC4INGB0LrRgNGL0YLQuNGPINC+0LrQvdCwINGH0LDRgtCwICjQsiDQvNC40LvQu9C40YHQtdC60YPQvdC00LDRhSlcbiAqIEBjb25zdGFudFxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgQ0xPU0VfQ0hBVF9BTklNQVRFX0RFTEFZID0gMTAwMDtcblxuLyoqXG4gKiDQktGA0LXQvNGPICjQsiDQvNC40LvQu9C40YHQtdC60YPQvdC00LDRhSkg0LfQsNC00LXRgNC20LrQuCDQsNC90LjQvNCw0YbQuNC4INC+0YLQutGA0YvRgtC40Y8g0L7QutC90LAg0YfQsNGC0LBcbiAqIEBjb25zdGFudFxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgT1BFTl9DSEFUX0RFTEFZID0gOTAwO1xuXG4vKipcbiAqINCS0YDQtdC80Y8g0L7Qv9GA0L7RgdCwINGB0LXRgNCy0LXRgNCwINC90LAg0L3QsNC70LjRh9C40LUg0L3QvtCy0YvRhSDQstGFLiDRgdC+0L7QsdGJ0LXQvdC40LlcbiAqIEB0eXBlIHtOdW1iZXJ9XG4gKi9cbmxldCBsaXN0ZW5lclRpbWVvdXREZWxheTtcblxuLyoqXG4gKiDQmtC+0L3RgdGC0YDRg9C60YLQvtGAINGC0LjQv9CwICfQntC90LvQsNC50L0t0YfQsNGCJ1xuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlclRleHQgINCi0LXQutGB0YIg0LrQvdC+0L/QutC4INGA0LDRgdC60YDRi9GC0LjRjyDRh9Cw0YLQsCDQuCDQt9Cw0LPQvtC70L7QstC60LAg0YfQsNGC0LBcbiAqIEBwYXJhbSB7U3RyaW5nfSB3ZWxjb21lVGV4dCDQn9GA0LjQstC10YLRgdGC0LLQtdC90L3QvtC1INGB0L7QvtCx0YnQtdC90LjQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y4g0L/RgNC4INC+0YLQutGA0YvRgtC40Lgg0YfQsNGC0LBcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0ICAgICDQktGA0LXQvNGPICjQsiDRgdC10LrRg9C90LTQsNGFKSDQt9Cw0LTQtdGA0LbQutC4INC00LvRjyDRgdC70YPRiNCw0YLQtdC70Y8g0LLRhS4g0YHQvtC+0LHRidC10L3QuNC5ICjRgdC+0L7QsdGJ0LXQvdC40Lkg0L7Qv9C10YDQsNGC0L7RgNCwKVxuICogQHBhcmFtIHtBcnJheX0gdGltZXMgICAgICAgINCS0YDQtdC80LXQvdCwINCw0LLRgtC+0YDQsNGB0LrRgNGL0YLQuNGPINGH0LDRgtCwICjQsiDRgdC10LrRg9C90LTQsNGFKVxuICovXG5mdW5jdGlvbiBDaGF0KGhlYWRlclRleHQsIHdlbGNvbWVUZXh0LCB0aW1lb3V0LCB0aW1lcykge1xuICBiaW5kQWxsRnVuYyh0aGlzKTtcbiAgdGhpcy5oZWFkZXJUZXh0ID0gaGVhZGVyVGV4dCB8fCBkZWZhdWx0VGV4dC5jaGF0SGVhZGVyO1xuICB0aGlzLndlbGNvbWVUZXh0ID0gd2VsY29tZVRleHQgfHwgZGVmYXVsdFRleHQuY2hhdFdlbGNvbWU7XG4gIHRoaXMudGltZXNTaG93ID0gdGltZXMgPyB0aW1lcyA6IFs1LCAwLCAwXTtcbiAgdGhpcy52b2ljZXMgPSBhdWRpbztcbiAgdGhpcy5hdXRvT3BlblRpbWVySWQgPSAnJztcbiAgdGhpcy5nZXRNZXNzYWdlVGltZXJJZCA9ICcnO1xuXG4gIC8vINCk0L7RgNC80LjRgNC+0LLQsNC90LjQtSDQuNC00LXQvdGC0LjRhNC40LrQsNGC0L7RgNCwINGC0LXQutGD0YnQtdC5INGB0LXRgdGB0LjQuCDRh9Cw0YLQsFxuICBsZXQgc2F2ZWRTZXNzaW9uSWQgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbnJ4LXNlc3Npb25JZCcpO1xuICBpZihzYXZlZFNlc3Npb25JZCkge1xuICAgIC8vINCV0YHQu9C4INGA0LDQvdC10LUg0LTQu9GPINGA0LDQsdC+0YLRiyDQsiDRh9Cw0YLQtSDRgdC10YHRgdC40Y8g0LHRi9C70LAg0YHQs9C10L3QtdGA0LjRgNC+0LLQsNC90LAsINGC0L4g0LjRgdC/0L7Qu9GM0LfRg9C10YLRgdGPINGB0L7QvtGC0LLQtdGC0YHRgtCy0YPRjtGJ0LjQuSBpZFxuICAgIHRoaXMuc2Vzc2lvbklkID0gc2F2ZWRTZXNzaW9uSWQ7XG4gIH0gZWxzZSB7XG4gICAgLy8g0JXRgdC70Lgg0LIg0LHRgNCw0YPQt9C10YDQtSDRgdC+0YXRgNCw0L3QtdC90L3QvtCz0L4g0LjQtNC10L3RgtC40YTQuNC60LDRgtC+0YDQsCDRgdC10YHRgdC40Lgg0L3QtdGCLCDRgtC+INCz0LXQvdC10YDQuNGA0YPQtdGC0YHRjyDQvdC+0LLRi9C5IGlkINGB0LXRgdGB0LjQuFxuICAgIGxldCBuZXdTZXNzaW9uSWQgPSBnZW5lcmF0ZVNlc3Npb25JZCgneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jyk7XG4gICAgdGhpcy5zZXNzaW9uSWQgPSBuZXdTZXNzaW9uSWQ7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ25yeC1zZXNzaW9uSWQnLCBuZXdTZXNzaW9uSWQpO1xuICB9XG5cbiAgdGhpcy5kaWFsb2cgPSBuZXcgRGlhbG9nKHRoaXMud2VsY29tZVRleHQsIHRoaXMudm9pY2VzLCB0aGlzLnNlc3Npb25JZCwgdGhpcy5zaG93Q29udGFjdHMsIHRoaXMuYXV0b09wZW5UaW1lcklkKTtcbiAgdGhpcy5jb250YWN0cyA9IG5ldyBDb250YWN0cyh0aGlzLnNlc3Npb25JZCwgdGhpcy5zaG93RGlhbG9nKTtcbiAgbGlzdGVuZXJUaW1lb3V0RGVsYXkgPSB0aW1lb3V0ID8gKHRpbWVvdXQgKiAxMDAwKSA6IDUwMDA7XG59XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINC60L7QvdGC0LXQudC90LXRgNCwINGH0LDRgtCwXG4gKi9cbkNoYXQucHJvdG90eXBlLl9yZW5kZXJDaGF0Q29udGFpbmVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2hhdENvbnRhaW5lciA9IGNyZWF0ZURPTUVsZW1lbnQoJ2RpdicsIHsnY2xhc3MnOiAnbnJ4LWNoYXQnfSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hcHBlbmRDaGlsZCh0aGlzLmNoYXRDb250YWluZXIpO1xufTtcblxuLyoqXG4gKiDQntGC0YDQuNGB0L7QstC60LAg0LrQvdC+0L/QutC4INGA0LDRgdC60YDRi9GC0LjRjyDRh9Cw0YLQsFxuICovXG5DaGF0LnByb3RvdHlwZS5fcmVuZGVyQ2hhdEJ0biA9IGZ1bmN0aW9uKCkge1xuICAvLyDQntGC0YDQuNGB0L7QstC60LAg0LrQvtC90YLQtdC50L3QtdGA0LAg0YfQsNGC0LAsINC10YHQu9C4INC+0L0g0LXRidC1INC90LUg0L7RgtGA0LjRgdC+0LLQsNC9XG4gIGlmKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubnJ4LWNoYXQnKSkge1xuICAgIHRoaXMuX3JlbmRlckNoYXRDb250YWluZXIoKTtcbiAgfVxuXG4gIC8vINCe0YLRgNC40YHQvtCy0LrQsCDQvdC10L/QvtGB0YDQtdGC0YHQstC10L3QvdC+INC60L3QvtC/0LrQuCDRgNCw0YHQutGA0YvRgtC40Y8g0YfQsNGC0LBcbiAgdGhpcy5idG5DaGF0ID0gY3JlYXRlRE9NRWxlbWVudCgnYnV0dG9uJywge1xuICAgICdjbGFzcyc6ICducngtYnRuLWNoYXQgbnJ4LWJ0blNsaWRlVXAnLFxuICAgICd0eXBlJzogJ2J1dHRvbidcbiAgfSk7XG4gIHRoaXMuYnRuQ2hhdC5pbm5lckhUTUwgPSB0aGlzLmhlYWRlclRleHQ7XG4gIHRoaXMuY2hhdENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmJ0bkNoYXQpO1xuICB0aGlzLmJ0bkNoYXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkJ0bkNoYXRDbGljayk7XG4gIHRoaXMuZGlhbG9nLnNldEJ0bkNoYXQodGhpcy5idG5DaGF0KTtcbn07XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINC+0LrQvdCwINGH0LDRgtCwXG4gKi9cbkNoYXQucHJvdG90eXBlLl9yZW5kZXJDaGF0ID0gZnVuY3Rpb24oKSB7XG4gIC8vINCe0YLRgNC40YHQvtCy0LrQsCDQutC+0L3RgtC10LnQvdC10YDQsCDRh9Cw0YLQsCwg0LXRgdC70Lgg0L7QvSDQtdGJ0LUg0L3QtSDQvtGC0YDQuNGB0L7QstCw0L1cbiAgaWYoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ucngtY2hhdCcpKSB7XG4gICAgdGhpcy5fcmVuZGVyQ2hhdENvbnRhaW5lcigpO1xuICB9XG5cbiAgLy8g0KHQtdGA0LLQtdGA0L3QvtC1INGB0L7QvtCx0YnQtdC90LjQtSDQvtCxINC+0YjQuNCx0LrQtVxuICB0aGlzLmNoYXRDb250YWN0c1NlcnZlclJlc3VsdE1lc3NhZ2UgPSBjcmVhdGVET01FbGVtZW50KCdwJywgeydjbGFzcyc6ICducngtc2VydmVyLW1lc3NhZ2UnfSk7XG4gIHRoaXMuY2hhdENvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNoYXRDb250YWN0c1NlcnZlclJlc3VsdE1lc3NhZ2UpO1xuXG4gIC8vINCe0LrQvdC+INGH0LDRgtCwXG4gIHRoaXMuY2hhdCA9IGNyZWF0ZURPTUVsZW1lbnQoJ2RpdicsIHsnY2xhc3MnOiAnbnJ4LWNoYXRfX3dyYXBwZXIgbnJ4LXNsaWRlSW5VcCd9KTtcbiAgdGhpcy5jaGF0Q29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuY2hhdCk7XG4gIHRoaXMuZGlhbG9nLnNldENoYXQodGhpcy5jaGF0KTtcblxuICAvLyDQl9Cw0LPQvtC70L7QstC+0Log0YfQsNGC0LBcbiAgdGhpcy5jaGF0SGVhZGVyID0gY3JlYXRlRE9NRWxlbWVudCgnZGl2JywgeydjbGFzcyc6ICducngtY2hhdF9faGVhZGVyJ30pO1xuICB0aGlzLmNoYXQuYXBwZW5kQ2hpbGQodGhpcy5jaGF0SGVhZGVyKTtcblxuICB0aGlzLmNoYXRIZWFkZXJJbWcgPSBjcmVhdGVET01FbGVtZW50KCdpbWcnLCB7XG4gICAgJ2NsYXNzJzogJ25yeC1jaGF0X19oZWFkZXItaW1nJyxcbiAgICAnd2lkdGgnOiAnMjUnLFxuICAgICdoZWlnaHQnOiAnMzInLFxuICAgICdhbHQnOiAnJyxcbiAgICAnc3JjJzogJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUlIZHBaSFJvUFNJeU5pNHdOallpSUdobGFXZG9kRDBpTWpBaUlIWnBaWGRDYjNnOUlqY3VPREU1SURZZ01qWXVNRFkySURJd0lqNGdJRHh3WVhSb0lHWnBiR3c5SWlObVptWWlJR1E5SWsweE5pNHdNU0F4TWk0eE1UZGpMVFF1TkRVMExTNHdPRGd0T0M0eE1pQXlMalkxT0MwNExqRTVJRFl1TVRNeUxTNHdNak1nTVM0eU1EY3VNemt5SURJdU16UTBJREV1TVRNZ015NHpNVGRETVRBdU1qRTJJREl6TGpFNU55QTRMamd6SURJMklEZ3VPRE1nTWpac05DNHdPUzB4TGpjMk1tTXVPRGd1TWpnZ01TNDRNemd1TkRReUlESXVPRFF1TkRZZ05DNDBOVFV1TURrZ09DNHhNak10TWk0Mk5UZ2dPQzR4T1MwMkxqRXpNeTR3TnkwekxqUTNNaTB6TGpRNE5pMDJMak0yTFRjdU9UUXROaTQwTkRodE1UWXVOelEwSURNdU16TXpZeTQzTXpndExqazNNeUF4TGpFMU15MHlMakV4SURFdU1UTXRNeTR6TVRndExqQTNMVE11TkRjMExUTXVOek00TFRZdU1qSXRPQzR4T1RRdE5pNHhNeTB6TGpjek15NHdOeTAyTGpnek5pQXlMakV4TkMwM0xqY2dOQzQ0TVRjZ01TNDNOREl1TXpJNElETXVNelF5SURFdU1EUXlJRFF1TmpNeUlESXVNRGtnTVM0NE5pQXhMalV4SURJdU9EWTBJRE11TlRJMElESXVPREk0SURVdU5qY3VNVFl5TGpBd05DNHpNalV1TURBMUxqUTRPQ0F3SURFdU1EQTFMUzR3TVRZZ01TNDVOaTB1TVRjNElESXVPRFF6TFM0ME5tdzBMakE1SURFdU56WTBZeTB1TURBeUlEQXRNUzR6T0RjdE1pNDRNRFF0TGpFeE55MDBMalF6TkNJdlBqd3ZjM1puUGc9PSdcbiAgfSk7XG4gIHRoaXMuY2hhdEhlYWRlci5hcHBlbmRDaGlsZCh0aGlzLmNoYXRIZWFkZXJJbWcpO1xuXG4gIHRoaXMuY2hhdEhlYWRlclRleHQgPSBjcmVhdGVET01FbGVtZW50KCdwJywgeydjbGFzcyc6ICducngtY2hhdF9faGVhZGVyLXRleHQnfSk7XG4gIHRoaXMuY2hhdEhlYWRlclRleHQuaW5uZXJIVE1MID0gdGhpcy5oZWFkZXJUZXh0O1xuICB0aGlzLmNoYXRIZWFkZXIuYXBwZW5kQ2hpbGQodGhpcy5jaGF0SGVhZGVyVGV4dCk7XG5cbiAgdGhpcy5jaGF0Q2xvc2VCdG4gPSBjcmVhdGVET01FbGVtZW50KCdidXR0b24nLCB7XG4gICAgJ2NsYXNzJzogJ25yeC1idG4tY2xvc2UnLFxuICAgICd0eXBlJzogJ2J1dHRvbidcbiAgfSk7XG4gIHRoaXMuY2hhdEhlYWRlci5hcHBlbmRDaGlsZCh0aGlzLmNoYXRDbG9zZUJ0bik7XG4gIHRoaXMuY2hhdENsb3NlQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xvc2VDaGF0KTtcblxuICAvLyDQotC10LvQviDRh9Cw0YLQsFxuICB0aGlzLmNoYXRCb2R5ID0gY3JlYXRlRE9NRWxlbWVudCgnZGl2JywgeydjbGFzcyc6ICducngtY2hhdF9fYm9keSd9KTtcbiAgdGhpcy5jaGF0LmFwcGVuZENoaWxkKHRoaXMuY2hhdEJvZHkpO1xuICB0aGlzLmRpYWxvZy5zZXRDaGF0Qm9keSh0aGlzLmNoYXRCb2R5KTtcbiAgdGhpcy5jb250YWN0cy5zZXRDaGF0Qm9keSh0aGlzLmNoYXRCb2R5KTtcblxuICAvLyDQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDRgNCw0LfRgNCw0LHQvtGC0YfQuNC60LUg0YfQsNGC0LBcbiAgdGhpcy5jaGF0Q29weXJpZ2h0ID0gY3JlYXRlRE9NRWxlbWVudCgnZGl2JywgeydjbGFzcyc6ICducngtY2hhdF9fY29weXJpZ2h0J30pO1xuICB0aGlzLmNoYXRCb2R5LmFwcGVuZENoaWxkKHRoaXMuY2hhdENvcHlyaWdodCk7XG5cbiAgdGhpcy5jaGF0Q29weXJpZ2h0VGV4dCA9IGNyZWF0ZURPTUVsZW1lbnQoJ3AnLCB7fSk7XG4gIHRoaXMuY2hhdENvcHlyaWdodFRleHQuaW5uZXJIVE1MID0gJ9Ch0LXRgNCy0LjRgSDQv9GA0LXQtNC+0YHRgtCw0LLQu9C10L0gJztcbiAgdGhpcy5jaGF0Q29weXJpZ2h0LmFwcGVuZENoaWxkKHRoaXMuY2hhdENvcHlyaWdodFRleHQpO1xuXG4gIHRoaXMuY2hhdENvcHlyaWdodExpbmsgPSBjcmVhdGVET01FbGVtZW50KCdhJywge1xuICAgICdocmVmJzogQ09QWVJJR0hUX1VSTCxcbiAgICAndGFyZ2V0JzogJ19ibGFuaydcbiAgfSk7XG4gIHRoaXMuY2hhdENvcHlyaWdodExpbmsuaW5uZXJIVE1MID0gJ05pcmF4JztcbiAgdGhpcy5jaGF0Q29weXJpZ2h0LmFwcGVuZENoaWxkKHRoaXMuY2hhdENvcHlyaWdodExpbmspO1xuXG4gIC8vINCe0YLRgNC40YHQvtCy0LrQsCDQtNC40LDQu9C+0LPQsCDRh9Cw0YLQsCDQuCDRhNC+0YDQvNGLINC00LvRjyDQstC+0L7QtNCwINGB0L7QvtCx0YnQtdC90LjQuVxuICB0aGlzLmRpYWxvZy5yZW5kZXJEaWFsb2coKTtcbn07XG5cbi8qKlxuICog0J/QvtC70YPRh9C10L3QuNC1INCy0YUuINGB0L7QvtCx0YnQtdC90LjQuSAo0YHQvtC+0LHRidC10L3QuNC5INC+0YIg0L7Qv9C10YDQsNGC0L7RgNCwKVxuICovXG5DaGF0LnByb3RvdHlwZS5fZ2V0TWVzc2FnZSA9IGZ1bmN0aW9uKCkge1xuICBsZXQgc2VsZiA9IHRoaXM7XG4gIGNvbnN0IHBhcmFtcyA9IHRoaXMuZGlhbG9nLnVzZXJJc1R5cGluZ05vd1xuICAgID8geydhY3Rpb24nOiAndmVyaWZ5JywgJ3Nlc3Npb24nOiB0aGlzLnNlc3Npb25JZCwgJ3dyaXRlcyc6IHRoaXMuZGlhbG9nLnVzZXJJc1R5cGluZ05vd31cbiAgICA6IHsnYWN0aW9uJzogJ3ZlcmlmeScsICdzZXNzaW9uJzogdGhpcy5zZXNzaW9uSWR9O1xuICBnZXQocGFyYW1zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgIHNlbGYuX3NldE9wZXJhdG9yTmFtZShyZXNwb25zZS5uYW1lKTtcbiAgICBzZWxmLl9zZXRPcGVyYXRvclBob3RvKHJlc3BvbnNlLnBob3RvKTtcbiAgICBpZihyZXNwb25zZS5tZXNzYWdlKSB7XG4gICAgICBzZWxmLmRpYWxvZy5yZW5kZXJNZXNzYWdlKCdvcmcnLCBzZXRFbnRlckluVGV4dChyZXNwb25zZS5tZXNzYWdlKSk7XG4gICAgfVxuICAgIGlmKHJlc3BvbnNlLndyaXRlcykge1xuICAgICAgc2VsZi5kaWFsb2cuX3JlbmRlck9wZXJhdG9ySXNUeXBpbmdNZXNzYWdlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuZGlhbG9nLl9oaWRlT3BlcmF0b3JJc1R5cGluZ01lc3NhZ2UoKTtcbiAgICB9XG4gIH0pO1xuICB0aGlzLnNldExvYWRUaW1lb3V0KCk7XG4gIHRoaXMuZGlhbG9nLl9oaWRlT3BlcmF0b3JJc1R5cGluZ01lc3NhZ2UoKTtcblxuICAvLyDQodC+0YXRgNCw0L3QtdC90LjQtSDQstGA0LXQvNC10L3QuCDQvtGC0L/RgNCw0LLQutC4INC30LDQv9GA0L7RgdCwXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnbnJ4LWxhc3RHZXRNZXNzYWdlUmVxdWVzdCcsIERhdGUubm93KCkgKTtcbn07XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINC40LzQtdC90Lgg0L7Qv9C10YDQsNGC0L7RgNCwLCDQvtCx0YDQsNCx0LDRgtGL0LLQsNGO0YnQtdCz0L4g0L7QsdGA0LDRidC10L3QuNC1INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1xuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUg0JjQvNGPINC+0L/QtdGA0LDRgtC+0YDQsFxuICovXG5DaGF0LnByb3RvdHlwZS5fc2V0T3BlcmF0b3JOYW1lID0gZnVuY3Rpb24obmFtZSkge1xuICBpZihuYW1lKSB7XG4gICAgdGhpcy5jaGF0SGVhZGVyVGV4dC5pbm5lckhUTUwgPSBzZXRFbnRlckluVGV4dChuYW1lKTtcbiAgfVxufTtcblxuLyoqXG4gKiDQntGC0YDQuNGB0L7QstC60LAg0YTQvtGC0L7Qs9GA0LDRhNC40Lgg0L7Qv9C10YDQsNGC0L7RgNCwLCDQvtCx0YDQsNCx0LDRgtGL0LLQsNGO0YnQtdCz0L4g0L7QsdGA0LDRidC10L3QuNC1INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1xuICogQHBhcmFtIHtTdHJpbmd9IHBob3RvVXJsIFVSTC3RgdGB0YvQu9C60LAg0L3QsCDRhNC+0YLQvtCz0YDQsNGE0LjRjiDQvtC/0LXRgNCw0YLQvtGA0LAgKNC40LvQuCDQutCw0YDRgtC40L3QutCwINC+0L/QtdGA0LDRgtC+0YDQsCDQv9C+LdGD0LzQvtC70YfQsNC90LjRjilcbiAqL1xuQ2hhdC5wcm90b3R5cGUuX3NldE9wZXJhdG9yUGhvdG8gPSBmdW5jdGlvbihwaG90b1VybCkge1xuICBpZihwaG90b1VybCkge1xuICAgIHJlbmRlckltZyh0aGlzLmNoYXRIZWFkZXJJbWcsICc1MCcsICc1MCcsIHBob3RvVXJsLCAnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwvOWovNEFBUVNrWkpSZ0FCQVFBQUFRQUJBQUQvMndDRUFBTURBd01EQXdRRUJBUUZCUVVGQlFjSEJnWUhCd3NJQ1FnSkNBc1JDd3dMQ3d3TEVROFNEdzRQRWc4YkZSTVRGUnNmR2hrYUh5WWlJaVl3TFRBK1BsUUJBd01EQXdNREJBUUVCQVVGQlFVRkJ3Y0dCZ2NIQ3dnSkNBa0lDeEVMREFzTERBc1JEeElQRGc4U0R4c1ZFeE1WR3g4YUdSb2ZKaUlpSmpBdE1ENCtWUC9DQUJFSUFEd0FQQU1CSWdBQ0VRRURFUUgveEFBY0FBQURBUUFDQXdBQUFBQUFBQUFBQUFBQUJnY0lBUWtEQkFYLzJnQUlBUUVBQUFBQTdVeGN6N0dMenBMa0V0QitGQU4xTWdaelYvSXNiTjlvSWdqa1o3QS9hQk56RXM2ZXE0Q3AxazdLcWRFT0UrZVFHb1VWMVp1WjNLZk5BTmJmU2JQL3hBQWFBUUVBQWdNQkFBQUFBQUFBQUFBQUFBQUZBQVFCQWdNRy85b0FDQUVDRUFBQUFJVWI2ZUI0ZGh1eUZ1bHpTLy9FQUJvQkFBRUZBUUFBQUFBQUFBQUFBQUFBQUFZQUFRSUVCUVAvMmdBSUFRTVFBQUFBV3hmRjNNSWlLSk9HRlhJSTRILy94QUF5RUFBQ0FnRUVBQVVDQkFRSEFBQUFBQUFCQWdNRUJRQUdFUklUSVNJeFFRY2dGbEZTWVVKeGtiRUlFQlV5TkdLaC85b0FDQUVCQUFFL0FQOEFMZEdlTzJzRmJ5WW8yYjd3K0dzZFd1dmFTV1NWeEdpajM0QlpoeTN3UFBXNjk1N2h6SGFwSDFqTUxueDJRRXdoZ3dLaE9mOEFjRjQ4bkk1UDdheU83Wjl1MlRmdnlpZW9yZWtQQXJjbnR4MTVrQjZnZTdlV3RqL1ZRckRRdVhKcDVzUGs3b2dFay9yYW5OTzNWQ3JEMW1zWFBRbCtlakVlcnI3Zlp1NjgwTlpLOFRnUEk0N0Q1NjhFOC84QW1xRUZWajFhTlFXUG1TQjVuVzdkajdZekZLYU8xVGhrOFJmVWRIYU5qRVBkeG5JOEs1VHNRVjdnZCtrS3lLZWU4SytUTXZ4eDc2MmVtWGgybGc0Y3ZhRnZJeDQyc0xsam5ueFpoR081NTRISTUremVtY3ZXYjJmL0FORWpndVpuSDFJWUdxeXlHSkZNc2pTQldaZVNHNmVmOGpyWkdiM1paRnBNemp6VVJXa01QYVVTanJHM0JkWFBxNk9QVUZmMURWLzZtYmRPV2l3OXExUnFUei84VkpyUFNXeDhlaEFoMWxKVCtJOE5CS3lxdHpJTFdSQ09lWGRTNVB6d0ZVRWsrMnFFMEUrUHFTUUVHSjRJeWhBS2pxVjVIQUlIMmJ5cVlYYStTc1pHcFJyMUd1RTI3MHNhS25peWNkREpJMzdLbzVKMVozSlZtaExPSlovSEFXSjYwVFdJM1IvTWtQRjNIOHllTlpiR2JQeWNKbnU0MnJhbWhLamlhTVB3eU9KQi9SZ0dINytldDE3bHY0L2Q3Vlk4RmJzWlNQQkdmYnNDSnk5KzNiTFJza0NuMzRTTXh5T09mRGlkMkk0MVFhdytQcU5ZZ01FeGdpTXNYY1NlRzVIcVh1dmszQitmczNiaW12VTBzeCtiMXV4Sy9xUmg2dFRZS3hIUWVMSFZNYVVXYnc0YjBNclJUUktnNEVibXVZeXhUL3MyckdSd1czNXNmU3lXNEdkNUpFOGUxWmxFc3JjdDdJa1k1YytmQ3FBV0pJR3ZwN1FmS3ZMdWk0aGlhYnZYeHRCaXBOR29uRVk3bFN3YWFid3d6OEhxdnN2eVQ5bTZybFJjSGs2MHpTQlpxYzBUdEc1UmxFaUZTUXc5aUFkZlNuL0RXTUJ2TE5tanViTzE4UUlaS3pTMW5pcnl1U1FVSEpWMWNwcjhENHUzRFVUTEdQTFNRY0tsNnpCREhhaGJyMU1rVWtLUmxXUDhZMXRLbFV3T09vMUt2SzE0NElvUUNlZUZSZXFrbjVJK3pkVm0rc1VhVWJocnlvM2M4S3JkZ1BodVFmVCtmenI2bDVLU3J0MHhRb1drdVdFZ0IvU0Nwa0xmMFhqV0svRU45Y2xnNkxwVG12UlRPbGtTZFpsRE1rYlRJcDU5TVhQdjdjbmpublc0TnlwdCt2VXBrdGFuU0hpU1YySEw5VjZxekFjZW9uVzNNbTEvRDFYZnB6SURKMVhrZ0t4SlVjbjUxajhtOFRCWldCaVBrRCtuUVBJNUdnZjdheVRzMSt4eWY0Mkg5UExYMUZkNWN2dGFvV1BoVG0yWEErU0RFdjhBWTZiSFVNVlptc1ZhOGFUdFhVUE4xOWJxcTlncGI4dWZqV2R5TnF6dXJHUVN0M1M3a0VoazU1NUNjZkdzVkJGVXJwRkVvVkVBVlIrUUhHcDVuWHNvNDRDQTYyL0xKUGpoM1lubzdLUDVEWC8veEFBbUVRQUNBZ0lCQXdJSEFBQUFBQUFBQUFBQkFnTUVBQkVoQlJCUkVrRUdFeUl4TWtKaC85b0FDQUVDQVFFL0FNNmhOSUNrU0hXK1dJeXZQUFVzQkdMRldia2ZjYXc4ZHJraW1lUUVlTk40eXRCSFl0Sm90OUs3WTk3c2F4bjFFK2huWGhkYkJ6cE1RS3pBZmx3ZjZmSTdVb3hKTHMrdzNsK21KM3N6UEl3V3VxcXFqM0xaOE8xL21SejJ5ZjNLSXZnRExVQ3FRd3oveEFBakVRQUNBUU1EQkFNQUFBQUFBQUFBQUFBQkFnTUFCQkVGSVRFUUVrRlJCaFF5LzlvQUNBRURBUUUvQUsweTBTVU5LNHlCd0t2TEtLVzNNaWNyeDRvZE5KZ0p0SWlwNXozYmVhMU9SN1cwYmI5dGhSMTBLOG5SV1JVVjBVN3RuR0sxK2Z1YUU1MjNIb0RwY3VVajI4MXBONTlLQ3lpU05TOXlXY3NlQUVyNUpJRmVHMnh1RkVqdDd6NnFLUWtWLzlrPScpO1xuICB9XG59O1xuXG4vKipcbiAqINCe0YLRgNC40YHQvtCy0LrQsCDQv9C10YDQtdC/0LjRgdC60Lgg0LzQtdC20LTRgyDQv9C+0LvRjNC30L7QstCw0YLQtdC70LXQvCDQuCDQvtC/0LXRgNCw0YLQvtGA0L7QvFxuICogQHBhcmFtIHtPYmplY3R9IGhpc3Rvcnkg0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0L/QtdGA0LXQv9C40YHQutC1XG4gKi9cbkNoYXQucHJvdG90eXBlLl9yZW5kZXJIaXN0b3J5ID0gZnVuY3Rpb24oaGlzdG9yeSkge1xuICBpZihoaXN0b3J5KSB7XG4gICAgdGhpcy5fc2V0T3BlcmF0b3JOYW1lKGhpc3RvcnkubmFtZSk7XG4gICAgdGhpcy5fc2V0T3BlcmF0b3JQaG90byhoaXN0b3J5LnBob3RvKTtcbiAgICB0aGlzLmRpYWxvZy5zaG93SGlzdG9yeShoaXN0b3J5LmRpYWxvZywgaGlzdG9yeS50aW1lKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmRpYWxvZy5sb2FkSGlzdG9yeSh0aGlzLl9zZXRPcGVyYXRvck5hbWUsIHRoaXMuX3NldE9wZXJhdG9yUGhvdG8pO1xuICB9XG59O1xuXG4vKipcbiAqINCX0LDQv9GD0YHQuiDRgdC70YPRiNCw0YLQtdC70Y8g0L3QvtCy0YvRhSDQstGFLiDRgdC+0L7QsdGJ0LXQvdC40Lkg0L/QviDQv9GA0LXQtNC+0L/RgNC10LTQtdC70LXQvdC90L7QvNGDINGA0LDRgdC/0LjRgdCw0L3QuNGOXG4gKi9cbkNoYXQucHJvdG90eXBlLnNldExvYWRUaW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZ2V0TWVzc2FnZVRpbWVySWQgPSBzZXRUaW1lb3V0KHRoaXMuX2dldE1lc3NhZ2UsIGxpc3RlbmVyVGltZW91dERlbGF5KTtcbn07XG5cbi8qKlxuICog0J7RgdGC0LDQvdC+0LLQutCwINGB0LvRg9GI0LDRgtC10LvRjyDQvdC+0LLRi9GFINCy0YUuINGB0L7QvtCx0YnQtdC90LjQuSDQv9C+INC/0YDQtdC00L7Qv9GA0LXQtNC10LvQtdC90L3QvtC80YMg0YDQsNGB0L/QuNGB0LDQvdC40Y5cbiAqL1xuQ2hhdC5wcm90b3R5cGUuY2xlYXJMb2FkVGltZW91dCA9IGZ1bmN0aW9uKCkge1xuICBjbGVhclRpbWVvdXQodGhpcy5nZXRNZXNzYWdlVGltZXJJZCk7XG59O1xuXG4vKipcbiAqINCe0YLQutGA0YvRgtC40LUg0L3Rg9C20L3QvtC5INCy0LrQu9Cw0LTQutC4INGH0LDRgtCwXG4gKi9cbkNoYXQucHJvdG90eXBlLl9zZXRPcGVuZWRUYWIgPSBmdW5jdGlvbigpIHtcbiAgaWYoIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCducngtY3VycmVudENoYXRUYWInKSA9PT0gJ2NvbnRhY3RzJyApIHtcbiAgICB0aGlzLnNob3dDb250YWN0cygpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc2hvd0RpYWxvZygpO1xuICB9XG59O1xuXG4vKipcbiAqINCe0YLQvtCx0YDQsNC20LXQvdC40LUg0YTQvtGA0LzRiyDQutC+0L3RgtCw0LrRgtC+0LIg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXG4gKi9cbkNoYXQucHJvdG90eXBlLnNob3dDb250YWN0cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmRpYWxvZy5oaWRlRGlhbG9nKCk7XG4gIGhpZGVTZXJ2ZXJSZXN1bHRNZXNzYWdlKCk7XG4gIHRoaXMuY29udGFjdHMuc2hvd0NvbnRhY3RzKCk7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCducngtY3VycmVudENoYXRUYWInLCAnY29udGFjdHMnKTtcbn07XG5cbi8qKlxuICog0J7RgtC+0LHRgNCw0LbQtdC90LjQtSDRhNC+0YDQvNGLINC00LjQsNC70L7Qs9CwXG4gKi9cbkNoYXQucHJvdG90eXBlLnNob3dEaWFsb2cgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb250YWN0cy5jbG9zZUNvbnRhY3RzKCk7XG4gIGhpZGVTZXJ2ZXJSZXN1bHRNZXNzYWdlKCk7XG4gIHRoaXMuZGlhbG9nLnNob3dEaWFsb2coKTtcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ25yeC1jdXJyZW50Q2hhdFRhYicsICdkaWFsb2cnKTtcbn07XG5cbi8qKlxuICog0JTQtdCw0LrRgtC40LLQsNGG0LjRjyDRh9Cw0YLQsFxuICovXG5DaGF0LnByb3RvdHlwZS5kZWFjdGl2YXRlQ2hhdCA9IGZ1bmN0aW9uKCkge1xuICBjbGVhclRpbWVvdXQodGhpcy5hdXRvT3BlblRpbWVySWQpO1xuICB0aGlzLmNsZWFyTG9hZFRpbWVvdXQoKTtcbiAgdGhpcy5jb250YWN0cy5jbGVhckNvbnRhY3RzRm9ybSgpO1xufTtcblxuLyoqXG4gKiDQkNC60YLQuNCy0LDRhtC40Y8g0YfQsNGC0LBcbiAqL1xuQ2hhdC5wcm90b3R5cGUuYWN0aXZhdGVDaGF0ID0gZnVuY3Rpb24oKSB7XG4gIC8vINCf0L7Qu9GD0YfQtdC90LjQtSDQstGB0LXQuSDQv9C10YDQtdC/0LjRgdC60Lgg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXG4gIGxldCByZXNwb25zZSA9IGdldFN5bmMoe1xuICAgICdhY3Rpb24nOiAnZGlhbG9nJyxcbiAgICAnc2Vzc2lvbic6IHRoaXMuc2Vzc2lvbklkXG4gIH0pO1xuXG4gIC8vINCg0LDRgdC60YDRi9GC0LjQtS/RgdCy0LXRgNGC0YvQstCw0L3QuNC1INGH0LDRgtCwXG4gIGlmKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbnJ4LWNoYXRPcGVuZWQnKSA9PT0gJ3RydWUnXG4gICAgICAmJiByZXNwb25zZS5yZXN1bHRcbiAgICAgICYmIHJlc3BvbnNlLmRpYWxvZy5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgLy8g0JXRgdC70Lgg0L/RgNC40LfQvdCw0Log0L7RgtC60YDRi9GC0LjRjyDRh9Cw0YLQsCDQstC30LLQtdC00LXQvSwg0LAg0L/QtdGA0LXQv9C40YHQutCwINC/0L7Qu9GD0YfQtdC90LAg0Lgg0L3QtdC/0YPRgdGC0LBcbiAgICBpZiggIXRoaXMuY2hhdCB8fCBoYXNDbGFzcyh0aGlzLmNoYXQsICdoaWRkZW4nKSApIHtcbiAgICAgIC8vINCV0YHQu9C4INC+0LrQvdC+INGH0LDRgtCwINGB0LLQtdGA0L3Rg9GC0L4g0LjQu9C4INC90LUg0L7RgtGA0LjRgdC+0LLQsNC90L5cbiAgICAgIHRoaXMuX29wZW5DaGF0KHJlc3BvbnNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8g0JXRgdC70Lgg0L7QutC90L4g0YfQsNGC0LAg0YDQsNC60YDRi9GC0L5cbiAgICAgIHRoaXMuX3NldE9wZW5lZFRhYigpO1xuICAgICAgdGhpcy5fcmVuZGVySGlzdG9yeShyZXNwb25zZSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vINCV0YHQu9C4INC/0YDQuNC30L3QsNC6INC+0YLQutGA0YvRgtC40Y8g0YfQsNGC0LAg0YHQvdGP0YJcbiAgICBpZiggIXRoaXMuY2hhdCB8fCBoYXNDbGFzcyh0aGlzLmNoYXQsICdoaWRkZW4nKSApIHtcbiAgICAgIC8vINCV0YHQu9C4INC+0LrQvdC+INGH0LDRgtCwINGB0LLQtdGA0L3Rg9GC0L4g0LjQu9C4INC90LUg0L7RgtGA0LjRgdC+0LLQsNC90L5cbiAgICAgIGlmKCF0aGlzLmJ0bkNoYXQpIHtcbiAgICAgICAgdGhpcy5fcmVuZGVyQ2hhdEJ0bigpO1xuICAgICAgfVxuICAgICAgdGhpcy5jaGF0QXV0b09wZW4oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8g0JXRgdC70Lgg0L7QutC90L4g0YfQsNGC0LAg0YDQsNC60YDRi9GC0L5cbiAgICAgIHRoaXMuX2Nsb3NlQ2hhdCgpO1xuICAgIH1cbiAgfVxuXG4gIC8vINCf0LXRgNC10LfQsNC/0YPRgdC6INGB0LvRg9GI0LDRgtC10LvRjyDQvdC+0LLRi9GFINGB0L7QvtCx0YnQtdC90LjQuVxuICB0aGlzLmNsZWFyTG9hZFRpbWVvdXQoKTtcbiAgdGhpcy5zZXRMb2FkVGltZW91dCgpO1xufTtcblxuLyoqXG4gKiDQoNCw0YHQutGA0YvRgtC40LUg0YfQsNGC0LBcbiAqIEBwYXJhbSB7T2JqZWN0fSBoaXN0b3J5INCY0L3RhNC+0YDQvNCw0YbQuNGPINC+INC/0LXRgNC10L/QuNGB0LrQtSDQvNC10LbQtNGDINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtdC8INC4INC+0L/QtdGA0LDRgtC+0YDQvtC8XG4gKi9cbkNoYXQucHJvdG90eXBlLl9vcGVuQ2hhdCA9IGZ1bmN0aW9uKGhpc3RvcnkpIHtcbiAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gIC8vINCh0LrRgNGL0YLQuNC1INC60L3QvtC/0LrQuCDRgNCw0YHQutGA0YvRgtC40Y8g0YfQsNGC0LAg0LfQsCDQv9GA0LXQtNC10LvRiyDRjdC60YDQsNC90LBcbiAgaWYodGhpcy5idG5DaGF0KSB7XG4gICAgcmVtb3ZlQ2xhc3ModGhpcy5idG5DaGF0LCAnbnJ4LWJ0blNsaWRlVXAnKTtcbiAgICBhZGRDbGFzcyh0aGlzLmJ0bkNoYXQsICducngtYnRuU2xpZGVEb3duJyk7XG4gIH1cblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vINCh0LrRgNGL0YLQuNC1INC60L3QvtC/0LrQuCDRgNCw0YHQutGA0YvRgtC40Y8g0YfQsNGC0LAg0LjQtyBET00t0LTQtdGA0LXQstCwXG4gICAgaWYoc2VsZi5idG5DaGF0KSB7XG4gICAgICBhZGRDbGFzcyhzZWxmLmJ0bkNoYXQsICdoaWRkZW4nKTtcbiAgICAgIHJlbW92ZUNsYXNzKHNlbGYuYnRuQ2hhdCwgJ25yeC1idG5TbGlkZURvd24nKTtcbiAgICB9XG5cbiAgICAvLyDQoNCw0YHQutGA0YvRgtC40LUg0L7QutC90LAg0YfQsNGC0LBcbiAgICBpZihzZWxmLmNoYXQpIHtcbiAgICAgIGFkZENsYXNzKHNlbGYuY2hhdCwgJ25yeC1zbGlkZUluVXAnKTtcbiAgICAgIHJlbW92ZUNsYXNzKHNlbGYuY2hhdCwgJ2hpZGRlbicpO1xuICAgICAgcmVtb3ZlQ2xhc3Moc2VsZi5jaGF0Q29udGFjdHNTZXJ2ZXJSZXN1bHRNZXNzYWdlLCAnaGlkZGVuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYuX3JlbmRlckNoYXQoKTtcbiAgICB9XG5cbiAgICAvLyDQntGC0LrRgNGL0YLQuNC1INC90YPQttC90L7QuSDQstC60LvQsNC00LrQuCDRh9Cw0YLQsFxuICAgIHNlbGYuX3NldE9wZW5lZFRhYigpO1xuXG4gICAgLy8g0J7RgtGA0LjRgdC+0LLQutCwINC/0LXRgNC10L/QuNGB0LrQuCDQvNC10LbQtNGDINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtdC8INC4INC+0L/QtdGA0LDRgtC+0YDQvtC8XG4gICAgc2VsZi5fcmVuZGVySGlzdG9yeShoaXN0b3J5KTtcblxuICAgIC8vINCh0L7RhdGA0LDQvdC10L3QuNC1INC/0YDQuNC30L3QsNC60LAg0L7RgtC60YDRi9GC0L7Qs9C+INGH0LDRgtCwXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ25yeC1jaGF0T3BlbmVkJywgJ3RydWUnKTtcblxuICAgIC8vINCh0LHRgNC+0YEg0YHRh9C10YLRh9C40LrQsCDQsNCy0YLQvtGA0LDRgdC60YDRi9GC0LjRjyDRh9Cw0YLQsFxuICAgIGNsZWFyVGltZW91dChzZWxmLmF1dG9PcGVuVGltZXJJZCk7XG4gIH0sIE9QRU5fQ0hBVF9ERUxBWSk7XG59O1xuXG4vKipcbiAqINCX0LDQutGA0YvRgtC40LUg0YfQsNGC0LBcbiAqL1xuQ2hhdC5wcm90b3R5cGUuX2Nsb3NlQ2hhdCA9IGZ1bmN0aW9uKCkge1xuICBsZXQgc2VsZiA9IHRoaXM7XG5cbiAgLy8g0KHQutGA0YvRgtC40LUg0YHQvtC+0LHRidC10L3QuNGPINC+INGA0LXQt9GD0LvRjNGC0LDRgtC1INCy0YvQv9C+0LvQvdC10L3QuNGPINC30LDQv9GA0L7RgdCwINGB0LXRgNCy0LXRgNC+0LxcbiAgaWYodGhpcy5jaGF0Q29udGFjdHNTZXJ2ZXJSZXN1bHRNZXNzYWdlKSB7XG4gICAgYWRkQ2xhc3ModGhpcy5jaGF0Q29udGFjdHNTZXJ2ZXJSZXN1bHRNZXNzYWdlLCAnaGlkZGVuJyk7XG4gIH1cblxuICAvLyDQodC60YDRi9GC0LjQtSDQvtC60L3QsCDRh9Cw0YLQsCDQt9CwINC/0YDQtdC00LXQu9GLINGN0LrRgNCw0L3QsFxuICByZW1vdmVDbGFzcyh0aGlzLmNoYXQsICducngtc2xpZGVJblVwJyk7XG4gIGFkZENsYXNzKHRoaXMuY2hhdCwgJ25yeC1zbGlkZUluRG93bicpO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgLy8g0KHQutGA0YvRgtC40LUg0L7QutC90LAg0YfQsNGC0LAg0LjQtyBET00t0LTQtdGA0LXQstCwXG4gICAgYWRkQ2xhc3Moc2VsZi5jaGF0LCAnaGlkZGVuJyk7XG4gICAgcmVtb3ZlQ2xhc3Moc2VsZi5jaGF0LCAnbnJ4LXNsaWRlSW5Eb3duJyk7XG5cbiAgICAvLyDQodC60YDRi9GC0LjQtSDRgdC+0L7QsdGJ0LXQvdC40Lkg0L7QsSDQvtGI0LjQsdC60LDRhSDRhNC+0YDQvNGLXG4gICAgaGlkZUVycm9yKHNlbGYuZGlhbG9nLmNoYXRNZXNzYWdlSW5wdXQpO1xuXG4gICAgLy8g0J/QvtC60LDQtyDQutC90L7Qv9C60Lgg0YDQsNGB0LrRgNGL0YLQuNGPINGH0LDRgtCwXG4gICAgaWYoIXNlbGYuYnRuQ2hhdCkge1xuICAgICAgc2VsZi5fcmVuZGVyQ2hhdEJ0bigpO1xuICAgIH1cbiAgICByZW1vdmVDbGFzcyhzZWxmLmJ0bkNoYXQsICdoaWRkZW4nKTtcbiAgICByZW1vdmVDbGFzcyhzZWxmLmJ0bkNoYXQsICducngtYnRuU2xpZGVEb3duJyk7XG4gICAgYWRkQ2xhc3Moc2VsZi5idG5DaGF0LCAnbnJ4LWJ0blNsaWRlVXAnKTtcbiAgfSwgQ0xPU0VfQ0hBVF9BTklNQVRFX0RFTEFZKTtcblxuICB0aGlzLmNoYXRBdXRvT3BlbigpO1xuICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnbnJ4LWNoYXRPcGVuZWQnKTtcbn07XG5cbi8qKlxuICog0JDQstGC0L7QvNCw0YLQuNGH0LXRgdC60L7QtSDQvtGC0LrRgNGL0YLQuNC1INGH0LDRgtCwXG4gKi9cbkNoYXQucHJvdG90eXBlLmNoYXRBdXRvT3BlbiA9IGZ1bmN0aW9uKCkge1xuICBsZXQgc2VsZiA9IHRoaXM7XG4gIGxldCB0aW1lSW5kZXggPSArbG9jYWxTdG9yYWdlLmdldEl0ZW0oICducngtY3VycmVudEF1dG9PcGVuVGltZUluZGV4Jyk7XG5cbiAgaWYodGhpcy50aW1lc1Nob3dbdGltZUluZGV4XSAhPT0gMCkge1xuICAgIC8vINCS0YDQtdC80Y8g0LDQstGC0L7QvtGC0LrRgNGL0YLQuNGPINGH0LDRgtCwINC+0YLQu9C40YfQvdC+INC+0YIg0L3Rg9C70Y8sINC/0L7RjdGC0L7QvNGDINC40L3QuNGG0LjQuNGA0YPQtdC8INCw0LLRgtC+0L7RgtC60YDRi9GC0LjQtSDRh9Cw0YLQsFxuICAgIHRoaXMuYXV0b09wZW5UaW1lcklkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIC8vINCe0YLQutGA0YvRgtC40LUg0YfQsNGC0LBcbiAgICAgIHNlbGYuX29wZW5DaGF0KCk7XG5cbiAgICAgIC8vINCf0YDQvtC40LPRgNGL0LLQsNC90LjQtSDQt9Cy0YPQutC+0LLQvtCz0L4g0YPQstC10LTQvtC80LvQtdC90LjRjyDQvtCxINC+0YLQutGA0YvRgtC40Lgg0L7QutC90LAg0YfQsNGC0LBcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBsYXlBdWRpbyhzZWxmLnZvaWNlcy5vcGVuKTtcbiAgICAgIH0sIE9QRU5fQ0hBVF9ERUxBWSArIDEwMDApO1xuXG4gICAgICAvLyDQntCx0L3QvtCy0LvQtdC90LjQtSDRgNCw0YHQv9C40YHQsNC90LjRjyDQsNCy0YLQvtC+0YLQutGA0YvRgtC40Y8g0YfQsNGC0LBcbiAgICAgIGlmKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCAnbnJ4LWN1cnJlbnRBdXRvT3BlblRpbWVJbmRleCcpIDwgMikge1xuICAgICAgICBsZXQgbmV3VGltZSA9ICtsb2NhbFN0b3JhZ2UuZ2V0SXRlbSggJ25yeC1jdXJyZW50QXV0b09wZW5UaW1lSW5kZXgnKSArIDE7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCAnbnJ4LWN1cnJlbnRBdXRvT3BlblRpbWVJbmRleCcsIG5ld1RpbWUpO1xuICAgICAgfVxuICAgIH0sIHRoaXMudGltZXNTaG93W3RpbWVJbmRleF0gKiAxMDAwKTtcbiAgfSBlbHNlIHtcbiAgICAvLyDQktGA0LXQvNGPINCw0LLRgtC+0L7RgtC60YDRi9GC0LjRjyDRh9Cw0YLQsCDQvdGD0LvQtdCy0L7QtSwg0L/QvtGN0YLQvtC80YMg0LDQstGC0L7QvtGC0LrRgNGL0YLQuNC1INGH0LDRgtCwINC+0YLQutC70Y7Rh9Cw0LXQvFxuICAgIHJldHVybjtcbiAgfVxufTtcblxuLyoqXG4gKiDQntCx0YDQsNCx0L7RgtGH0LjQuiDRgdC+0LHRi9GC0LjRjyDQvdCw0LbQsNGC0LjRjyDQvdCwINC60L3QvtC/0LrRgyDRgNCw0YHQutGA0YvRgtC40Y8g0YfQsNGC0LBcbiAqL1xuQ2hhdC5wcm90b3R5cGUuX29uQnRuQ2hhdENsaWNrID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX29wZW5DaGF0KCk7XG59O1xuXG4vKipcbiAqINCT0LXQvdC10YDQsNGG0LjRjyBpZCDRgdC10YHRgdC40LhcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyINCo0LDQsdC70L7QvSwg0L/QviDQutC+0YLQvtGA0L7QvNGDINCx0YPQtNC10YIg0YTQvtGA0LzQuNGA0L7QstCw0YLRjNGB0Y8gaWRcbiAqIEByZXR1cm4ge1N0cmluZ30gICAgINCY0LTQtdC90YLQuNGE0LjQutCw0YLQvtGAINGB0LXRgdGB0LjQuFxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZVNlc3Npb25JZChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICBsZXQgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDA7XG4gICAgcmV0dXJuIChjID09PSAneCcgPyByIDogKHIgJiAweDMgfCAweDggKSkudG9TdHJpbmcoMTYpO1xuICB9KTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2pzL2NvbXBvbmVudHMvQ2hhdC5qc1xuICoqLyIsImV4cG9ydCBkZWZhdWx0IERpYWxvZztcblxuaW1wb3J0IHsgcG9zdCwgZ2V0LCBoaWRlU2VydmVyUmVzdWx0TWVzc2FnZSB9IGZyb20gJy4vLi4vY29tbW9uL2FqYXgnO1xuaW1wb3J0IHsgZGVmYXVsdFRleHQsIGVycm9yTWVzc2FnZXMgfSBmcm9tICcuLy4uL2NvbW1vbi9tZXNzYWdlcyc7XG5pbXBvcnQgeyBjcmVhdGVET01FbGVtZW50LCByZW1vdmVET01FbGVtZW50LCBoYXNDbGFzcywgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLCBjcmVhdGVEYXRlRnJvbVN0cmluZyxcbiAgICAgICAgZm9ybWF0VGltZSwgcGxheUF1ZGlvLCBiaW5kQWxsRnVuYywgc2hvd0Vycm9yLCBoaWRlRXJyb3IsIG9uRmllbGRzRm9jdXMsIHNldEVudGVySW5UZXh0LCBkZWJvdW5jZSB9IGZyb20gJy4vLi4vY29tbW9uL3V0aWxzJztcblxuLyoqXG4gKiDQmtC+0LQg0LrQu9Cw0LLQuNGI0LggJ0VudGVyJ1xuICogQGNvbnN0YW50XG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5jb25zdCBFTlRFUl9DT0RFID0gMTM7XG5cbi8qKlxuICog0JrQvtC90YHRgtGA0YPQutGC0L7RgCDRgtC40L/QsCAn0JTQuNCw0LvQvtCzJ1xuICogQHBhcmFtIHtTdHJpbmd9ICAgd2VsY29tZVRleHQgICAgICDQn9GA0LjQstC10YLRgdGC0LLQtdC90L3QvtC1INGB0L7QvtCx0YnQtdC90LjQtVxuICogQHBhcmFtIHtTdHJpbmd9ICAgdm9pY2VzICAgICAgICAgICDQl9Cy0YPQutC4XG4gKiBAcGFyYW0ge1N0cmluZ30gICBzZXNzaW9uSWQgICAgICAgINCY0LTQtdC90YLQuNGE0LjQutCw0YLQvtGAINGB0LXRgdGB0LjQuFxuICogQHBhcmFtIHtGdW5jdGlvbn0gc2hvd0NvbnRhY3RzRnVuYyDQpNGD0L3QutGG0LjRjyDQv9C+0LrQsNC30LAg0YTQvtGA0LzRiyDQutC+0L3RgtCw0LrRgtC+0LIg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXG4gKi9cbmZ1bmN0aW9uIERpYWxvZyh3ZWxjb21lVGV4dCwgdm9pY2VzLCBzZXNzaW9uSWQsIHNob3dDb250YWN0c0Z1bmMpIHtcbiAgYmluZEFsbEZ1bmModGhpcyk7XG4gIHRoaXMud2VsY29tZVRleHQgPSB3ZWxjb21lVGV4dDtcbiAgdGhpcy52b2ljZXMgPSB2b2ljZXM7XG4gIHRoaXMuc2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuICB0aGlzLnNob3dDb250YWN0c0Z1bmMgPSBzaG93Q29udGFjdHNGdW5jO1xuICB0aGlzLnVzZXJJc1R5cGluZ05vdyA9IGZhbHNlO1xuICB0aGlzLl9zdG9wVXNlclR5cGluZ0RlYm91bmNlID0gZGVib3VuY2UodGhpcy5fc3RvcFVzZXJUeXBpbmcsIDIwMDApO1xufVxuXG4vKipcbiAqINCf0L7Qu9GD0YfQtdC90LjQtSBET00t0Y3Qu9C10LzQtdC90YLQsCDQutC90L7Qv9C60Lgg0YDQsNGB0LrRgNGL0YLQuNGPINGH0LDRgtCwXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNoYXQgRE9NLdGN0LvQtdC80LXQvdGCINC60L3QvtC/0LrQuCDRgNCw0YHQutGA0YvRgtC40Y8g0YfQsNGC0LBcbiAqL1xuRGlhbG9nLnByb3RvdHlwZS5zZXRCdG5DaGF0ID0gZnVuY3Rpb24oYnRuKSB7XG4gIHRoaXMuYnRuQ2hhdCA9IGJ0bjtcbn07XG5cbi8qKlxuICog0J/QvtC70YPRh9C10L3QuNC1IERPTS3RjdC70LXQvNC10L3RgtCwINC+0LrQvdCwINGH0LDRgtCwXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNoYXQgRE9NLdGN0LvQtdC80LXQvdGCINC+0LrQvdCwINGH0LDRgtCwXG4gKi9cbkRpYWxvZy5wcm90b3R5cGUuc2V0Q2hhdCA9IGZ1bmN0aW9uKGNoYXQpIHtcbiAgdGhpcy5jaGF0ID0gY2hhdDtcbn07XG5cbi8qKlxuICog0J/QvtC70YPRh9C10L3QuNC1IERPTS3RjdC70LXQvNC10L3RgtCwINGC0LXQu9CwINGH0LDRgtCwXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNoYXQgRE9NLdGN0LvQtdC80LXQvdGCINGC0LXQu9CwINGH0LDRgtCwXG4gKi9cbkRpYWxvZy5wcm90b3R5cGUuc2V0Q2hhdEJvZHkgPSBmdW5jdGlvbihjaGF0Qm9keSkge1xuICB0aGlzLmNoYXRCb2R5ID0gY2hhdEJvZHk7XG59O1xuXG4vKipcbiAqINCe0YLRgNC40YHQvtCy0LrQsCDQtNC40LDQu9C+0LPQsCAo0L7QsdC70LDRgdGC0Lgg0L/QtdGA0LXQv9C40YHQutC4INC4INGE0L7RgNC80Ysg0L7RgtC/0YDQsNCy0LrQuCDRgdC+0L7QsdGJ0LXQvdC40LkpXG4gKi9cbkRpYWxvZy5wcm90b3R5cGUucmVuZGVyRGlhbG9nID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX3JlbmRlckNoYXREaWFsb2coKTtcbiAgdGhpcy5yZW5kZXJNZXNzYWdlKCdvcmcnLCB0aGlzLndlbGNvbWVUZXh0LCBudWxsKTtcbiAgdGhpcy5fcmVuZGVyQ2hhdE1lc3NhZ2VGb3JtKCk7XG59O1xuXG4vKipcbiAqINCe0YLRgNC40YHQvtCy0LrQsCDQvtCx0LvQsNGB0YLQuCDQv9C10YDQtdC/0LjRgdC60LhcbiAqL1xuRGlhbG9nLnByb3RvdHlwZS5fcmVuZGVyQ2hhdERpYWxvZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNoYXREaWFsb2cgPSBjcmVhdGVET01FbGVtZW50KCdkaXYnLCB7J2NsYXNzJzogJ25yeC1jaGF0X19kaWFsb2cnfSk7XG4gIHRoaXMuY2hhdEJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jaGF0RGlhbG9nKTtcbn07XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINGE0L7RgNC80Ysg0L7RgtC/0YDQsNCy0LrQuCDRgdC+0L7QsdGJ0LXQvdC40LlcbiAqL1xuRGlhbG9nLnByb3RvdHlwZS5fcmVuZGVyQ2hhdE1lc3NhZ2VGb3JtID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2hhdE1lc3NhZ2VGb3JtID0gY3JlYXRlRE9NRWxlbWVudCgnZm9ybScsIHtcbiAgICAnY2xhc3MnOiAnbnJ4LWNoYXRfX2Zvcm0gbnJ4LWNoYXRfX2Zvcm0tLW1lc3NhZ2UnLFxuICAgICdhY3Rpb24nOiAnJ1xuICB9KTtcbiAgdGhpcy5jaGF0Qm9keS5hcHBlbmRDaGlsZCh0aGlzLmNoYXRNZXNzYWdlRm9ybSk7XG4gIHRoaXMuY2hhdE1lc3NhZ2VGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbk1lc3NhZ2VGb3JtRW50ZXJEb3duKTtcblxuICB0aGlzLmNoYXRNZXNzYWdlRmllbGQgPSBjcmVhdGVET01FbGVtZW50KCdkaXYnLCB7J2NsYXNzJzogJ25yeC1jaGF0X19maWVsZCd9KTtcbiAgdGhpcy5jaGF0TWVzc2FnZUZvcm0uYXBwZW5kQ2hpbGQodGhpcy5jaGF0TWVzc2FnZUZpZWxkKTtcblxuICB0aGlzLmNoYXRNZXNzYWdlSW5wdXQgPSBjcmVhdGVET01FbGVtZW50KCd0ZXh0YXJlYScsIHtcbiAgICAncGxhY2Vob2xkZXInOiAn0JLQstC10LTQuNGC0LUg0YHQvtC+0LHRidC10L3QuNC1INC4INC90LDQttC80LjRgtC1IEVudGVyJyxcbiAgICAnbmFtZSc6ICdtZXNzYWdlJyxcbiAgICAnbWF4bGVuZ3RoJzogJzIwMCdcbiAgfSk7XG4gIHRoaXMuY2hhdE1lc3NhZ2VGaWVsZC5hcHBlbmRDaGlsZCh0aGlzLmNoYXRNZXNzYWdlSW5wdXQpO1xuICB0aGlzLmNoYXRNZXNzYWdlSW5wdXQuZm9jdXMoKTtcbiAgdGhpcy5jaGF0TWVzc2FnZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgb25GaWVsZHNGb2N1cyk7XG4gIHRoaXMuY2hhdE1lc3NhZ2VJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl9vbk1lc3NhZ2VGb3JtRmllbGRzQ2hhbmdlKTtcbiAgdGhpcy5jaGF0TWVzc2FnZUlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgdGhpcy5fb25UeXBpbmdJbk1lc3NhZ2VGb3JtRmllbGRzKTtcblxuICB0aGlzLmNoYXRNZXNzYWdlRXJyb3IgPSBjcmVhdGVET01FbGVtZW50KCdwJywgeydjbGFzcyc6ICducngtZXJyb3ItbWVzc2FnZSd9KTtcbiAgdGhpcy5jaGF0TWVzc2FnZUZpZWxkLmFwcGVuZENoaWxkKHRoaXMuY2hhdE1lc3NhZ2VFcnJvcik7XG5cbiAgdGhpcy5jaGF0TWVzc2FnZUZvcm1Db250cm9scyA9IGNyZWF0ZURPTUVsZW1lbnQoJ2RpdicsIHsnY2xhc3MnOiAnbnJ4LWNoYXRfX2NvbnRyb2xzJ30pO1xuICB0aGlzLmNoYXRNZXNzYWdlRm9ybS5hcHBlbmRDaGlsZCh0aGlzLmNoYXRNZXNzYWdlRm9ybUNvbnRyb2xzKTtcblxuICB0aGlzLmNoYXRTZXRDb250YWN0c0J0biA9IGNyZWF0ZURPTUVsZW1lbnQoJ2J1dHRvbicsIHtcbiAgICAnY2xhc3MnOiAnbnJ4LWJ0bi1zZXQtY29udGFjdHMnLFxuICAgICd0eXBlJzogJ2J1dHRvbidcbiAgfSk7XG4gIHRoaXMuY2hhdFNldENvbnRhY3RzQnRuLmlubmVySFRNTCA9IHRoaXMuX3NldENvbnRhY3RzQnRuVGV4dCgpO1xuICB0aGlzLmNoYXRNZXNzYWdlRm9ybUNvbnRyb2xzLmFwcGVuZENoaWxkKHRoaXMuY2hhdFNldENvbnRhY3RzQnRuKTtcbiAgdGhpcy5jaGF0U2V0Q29udGFjdHNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnNob3dDb250YWN0c0Z1bmMpO1xuXG4gIHRoaXMuY2hhdE1lc3NhZ2VTZW5kQnRuID0gY3JlYXRlRE9NRWxlbWVudCgnYnV0dG9uJywge1xuICAgICdjbGFzcyc6ICducngtYnRuLXNlbmQtbWVzc2FnZScsXG4gICAgJ3R5cGUnOiAnc3VibWl0J1xuICB9KTtcbiAgdGhpcy5jaGF0TWVzc2FnZVNlbmRCdG4uaW5uZXJIVE1MID0gJ9Ce0YLQv9GA0LDQstC40YLRjCc7XG4gIHRoaXMuY2hhdE1lc3NhZ2VGb3JtQ29udHJvbHMuYXBwZW5kQ2hpbGQodGhpcy5jaGF0TWVzc2FnZVNlbmRCdG4pO1xuICB0aGlzLmNoYXRNZXNzYWdlU2VuZEJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uTWVzc2FnZVNlbmRDbGljayk7XG59O1xuXG4vKipcbiAqINCe0YLRgNC40YHQvtCy0LrQsCDRgdC+0L7QsdGJ0LXQvdC40Y9cbiAqIEBwYXJhbSB7U3RyaW5nfSAgdXNlclR5cGUgINCi0LjQvyDRgdC+0L7QsdGJ0LXQvdC40Y86IHVzZXIgKNC40YHRhS4g0YHQvtC+0LHRidC10L3QuNC1KSDQuCBvcmcgKNCy0YUuINGB0L7QvtCx0YnQtdC90LjQtSlcbiAqIEBwYXJhbSB7U3RyaW5nfSAgdGV4dCAgICAgINCi0LXQutGB0YIg0YHQvtC+0LHRidC10L3QuNGPXG4gKiBAcGFyYW0ge1N0cmluZ30gIHRpbWUgICAgICDQktGA0LXQvNGPINGB0L7QvtCx0YnQtdC90LjRj1xuICogQHBhcmFtIHtCb29sZWFufSBpc0hpc3Rvcnkg0J/RgNC40LfQvdCw0Log0YLQvtCz0L4sINGH0YLQviDRjdGC0L4g0YHQvtC+0LHRidC10L3QuNC1INC40Lcg0LjRgdGC0L7RgNC40Lgg0L/QtdGA0LXQv9C40YHQutC4XG4gKi9cbkRpYWxvZy5wcm90b3R5cGUucmVuZGVyTWVzc2FnZSA9IGZ1bmN0aW9uKHVzZXJUeXBlLCB0ZXh0LCB0aW1lLCBpc0hpc3RvcnkpIHtcbiAgaWYoIGhhc0NsYXNzKHRoaXMuY2hhdCwgJ2hpZGRlbicpICkge1xuICAgIHJlbW92ZUNsYXNzKHRoaXMuY2hhdCwgJ2hpZGRlbicpO1xuICAgIGFkZENsYXNzKHRoaXMuYnRuQ2hhdCwgJ2hpZGRlbicpO1xuICB9XG5cbiAgLy8g0J7RgtGA0LjRgdC+0LLQutCwINGB0L7QvtCx0YnQtdC90LjRj1xuICB0aGlzLmNoYXRNZXNzYWdlV3JhcHBlciA9IGNyZWF0ZURPTUVsZW1lbnQoJ2RpdicsIHsnY2xhc3MnOiAnbnJ4LWNoYXRfX21lc3NhZ2Utd3JhcHBlcid9KTtcbiAgdGhpcy5jaGF0RGlhbG9nLmFwcGVuZENoaWxkKHRoaXMuY2hhdE1lc3NhZ2VXcmFwcGVyKTtcblxuICB0aGlzLmNoYXRNZXNzYWdlID0gY3JlYXRlRE9NRWxlbWVudCgncCcsIHsnY2xhc3MnOiAnbnJ4LWNoYXRfX21lc3NhZ2UnfSk7XG4gIHRoaXMuY2hhdE1lc3NhZ2UuaW5uZXJIVE1MID0gdGV4dDtcbiAgdGhpcy5jaGF0TWVzc2FnZVdyYXBwZXIuYXBwZW5kQ2hpbGQodGhpcy5jaGF0TWVzc2FnZSk7XG5cbiAgaWYodXNlclR5cGUgPT09ICd1c2VyJykge1xuICAgIC8vINCe0YLRgNC40YHQvtCy0LrQsCDQuNGB0YUuINGB0L7QvtCx0YnQtdC90LjRj1xuICAgIGFkZENsYXNzKHRoaXMuY2hhdE1lc3NhZ2UsICducngtY2hhdF9fbWVzc2FnZS0tdXNlcicpO1xuICAgIHRoaXMuY2hhdE1lc3NhZ2VJbnB1dC52YWx1ZSA9ICcnO1xuICAgIHRoaXMuY2hhdE1lc3NhZ2VJbnB1dC5mb2N1cygpO1xuICB9IGVsc2UgaWYodXNlclR5cGUgPT09ICdvcmcnKSB7XG4gICAgLy8g0J7RgtGA0LjRgdC+0LLQutCwINCy0YUuINGB0L7QvtCx0YnQtdC90LjRj1xuICAgIGFkZENsYXNzKHRoaXMuY2hhdE1lc3NhZ2UsICducngtY2hhdF9fbWVzc2FnZS0tb3JnJyk7XG4gIH1cblxuICAvLyDQntGC0YDQuNGB0L7QstC60LAg0LLRgNC10LzQtdC90Lgg0YHQvtC+0LHRidC10L3QuNGPXG4gIGlmKHRpbWUgIT09IG51bGwpIHtcbiAgICB0aGlzLmNoYXRNZXNzYWdlVGltZSA9IGNyZWF0ZURPTUVsZW1lbnQoJ3NwYW4nLCB7J2NsYXNzJzogJ25yeC1jaGF0X19tZXNzYWdlLXRpbWUnfSk7XG4gICAgdGhpcy5jaGF0TWVzc2FnZVRpbWUuaW5uZXJIVE1MID0gdGltZSA/IGZvcm1hdFRpbWUodGltZSkgOiBmb3JtYXRUaW1lKCBuZXcgRGF0ZSgpICk7XG4gICAgdGhpcy5jaGF0TWVzc2FnZS5hcHBlbmRDaGlsZCh0aGlzLmNoYXRNZXNzYWdlVGltZSk7XG5cbiAgICBpZighaXNIaXN0b3J5ICYmICh1c2VyVHlwZSA9PT0gJ29yZycpICkge1xuICAgICAgcGxheUF1ZGlvKHRoaXMudm9pY2VzLm1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIC8vINCf0YDQvtC60YDRg9GC0LrQsCDQtNC40LDQu9C+0LPQsCDRh9Cw0YLQsCDQuiDQv9C+0YHQu9C10LTQvdC10LzRgyDRgdC+0L7QsdGJ0LXQvdC40Y5cbiAgdGhpcy5jaGF0RGlhbG9nLnNjcm9sbFRvcCA9IHRoaXMuY2hhdERpYWxvZy5zY3JvbGxIZWlnaHQ7XG5cbiAgLy8g0KHQsdGA0L7RgSDQsNCy0YLQvtC+0YLQutGA0YvRgtC40Y8g0L7QutC90LAg0YfQsNGC0LBcbiAgY2xlYXJUaW1lb3V0KHRoaXMuYXV0b09wZW5UaW1lcklkKTtcbn07XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINC40L3RhNC+0YDQvNCw0YbQuNC4INC+INGC0L7QvCwg0YfRgtC+INC+0L/QtdGA0LDRgtC+0YAg0L3QsNCx0LjRgNCw0LXRgiDRgtC10LrRgdGCINGB0L7QvtCx0YnQtdC90LjRj1xuICovXG5EaWFsb2cucHJvdG90eXBlLl9yZW5kZXJPcGVyYXRvcklzVHlwaW5nTWVzc2FnZSA9IGZ1bmN0aW9uKCkge1xuICBpZighdGhpcy5jaGF0T3BlcklzVHlwaW5nKSB7XG4gICAgdGhpcy5jaGF0T3BlcklzVHlwaW5nID0gY3JlYXRlRE9NRWxlbWVudCgncCcsIHsnY2xhc3MnOiAnbnJ4LWNoYXRfX29wZXItdHlwaW5nJ30pO1xuICAgIHRoaXMuY2hhdE9wZXJJc1R5cGluZy5pbm5lckhUTUwgPSBkZWZhdWx0VGV4dC5vcGVySXNUeXBpbmc7XG4gICAgdGhpcy5jaGF0TWVzc2FnZUZvcm0uYXBwZW5kQ2hpbGQodGhpcy5jaGF0T3BlcklzVHlwaW5nKTtcbiAgfVxufTtcblxuLyoqXG4gKiDQodC60YDRi9GC0LjQtSDQuNC90YTQvtGA0LzQsNGG0LjQuCDQviDRgtC+0LwsINGH0YLQviDQvtC/0LXRgNCw0YLQvtGAINC90LDQsdC40YDQsNC10YIg0YLQtdC60YHRgiDRgdC+0L7QsdGJ0LXQvdC40Y9cbiAqL1xuRGlhbG9nLnByb3RvdHlwZS5faGlkZU9wZXJhdG9ySXNUeXBpbmdNZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gIGlmKHRoaXMuY2hhdE9wZXJJc1R5cGluZykge1xuICAgIHJlbW92ZURPTUVsZW1lbnQodGhpcy5jaGF0TWVzc2FnZUZvcm0sIHRoaXMuY2hhdE9wZXJJc1R5cGluZyk7XG4gICAgdGhpcy5jaGF0T3BlcklzVHlwaW5nID0gbnVsbDtcbiAgfVxufTtcblxuLyoqXG4gKiDQo9GB0YLQsNC90L7QstC60LAg0YLQtdC60YHRgtCwINC60L3QvtC/0LrQuCDQv9C+0LrQsNC30LAg0LrQvtC90YLQsNC60YLQvtCyINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1xuICovXG5EaWFsb2cucHJvdG90eXBlLl9zZXRDb250YWN0c0J0blRleHQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCducngtdXNlclNldENvbnRhY3RzJylcbiAgICA/IGRlZmF1bHRUZXh0LmNvbnRhY3RzTGlua0Z1bGxcbiAgICA6IGRlZmF1bHRUZXh0LmNvbnRhY3RzTGlua0VtcHR5O1xufTtcblxuLyoqXG4gKiDQn9C+0LrQsNC3INC00LjQsNC70L7Qs9CwXG4gKi9cbkRpYWxvZy5wcm90b3R5cGUuc2hvd0RpYWxvZyA9IGZ1bmN0aW9uKCkge1xuICBpZih0aGlzLmNoYXRNZXNzYWdlRm9ybSkge1xuICAgIHJlbW92ZUNsYXNzKHRoaXMuY2hhdERpYWxvZywgJ2hpZGRlbicpO1xuICAgIHJlbW92ZUNsYXNzKHRoaXMuY2hhdE1lc3NhZ2VGb3JtLCAnaGlkZGVuJyk7XG4gICAgdGhpcy5jaGF0TWVzc2FnZUlucHV0LmZvY3VzKCk7XG4gICAgdGhpcy5jaGF0U2V0Q29udGFjdHNCdG4uaW5uZXJIVE1MID0gdGhpcy5fc2V0Q29udGFjdHNCdG5UZXh0KCk7XG4gIH1cbn07XG5cbi8qKlxuICog0KHQutGA0YvRgtC40LUg0LTQuNCw0LvQvtCz0LBcbiAqL1xuRGlhbG9nLnByb3RvdHlwZS5oaWRlRGlhbG9nID0gZnVuY3Rpb24oKSB7XG4gIGlmKHRoaXMuY2hhdE1lc3NhZ2VGb3JtKSB7XG4gICAgYWRkQ2xhc3ModGhpcy5jaGF0RGlhbG9nLCAnaGlkZGVuJyk7XG4gICAgYWRkQ2xhc3ModGhpcy5jaGF0TWVzc2FnZUZvcm0sICdoaWRkZW4nKTtcbiAgICBoaWRlRXJyb3IodGhpcy5jaGF0TWVzc2FnZUlucHV0KTtcbiAgfVxufTtcblxuLyoqXG4gKiDQntGH0LjRgdGC0LrQsCDQvtCx0LvQsNGB0YLQuCDQv9C10YDQtdC/0LjRgdC60LhcbiAqL1xuRGlhbG9nLnByb3RvdHlwZS5fY2xlYXJEaWFsb2cgPSBmdW5jdGlvbigpIHtcbiAgZm9yIChsZXQgaSA9ICh0aGlzLmNoYXREaWFsb2cuY2hpbGRyZW4ubGVuZ3RoIC0gMSk7IGkgPiAwOyBpLS0pIHtcbiAgICByZW1vdmVET01FbGVtZW50KHRoaXMuY2hhdERpYWxvZywgdGhpcy5jaGF0RGlhbG9nLmNoaWxkcmVuW2ldKTtcbiAgfVxufTtcblxuLyoqXG4gKiDQl9Cw0LPRgNGD0LfQutCwINCy0YHQtdC5INC/0LXRgNC10L/QuNGB0LrQuCDQvNC10LbQtNGDINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtdC8INC4INC+0L/QtdGA0LDRgtC+0YDQvtC8XG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gc2V0TmFtZUZ1bmMgINCk0YPQvdC60YbQuNGPINGD0YHRgtCw0L3QvtCy0LrQuCDQuNC80LXQvdC4INC+0L/QtdGA0LDRgtC+0YDQsFxuICogQHBhcmFtICB7RnVuY3Rpb259IHNldFBob3RvRnVuYyDQpNGD0L3QutGG0LjRjyDRg9GB0YLQsNC90L7QstC60Lgg0YTQvtGC0L7Qs9GA0LDRhNC40Lgg0L7Qv9C10YDQsNGC0L7RgNCwXG4gKi9cbkRpYWxvZy5wcm90b3R5cGUubG9hZEhpc3RvcnkgPSBmdW5jdGlvbihzZXROYW1lRnVuYywgc2V0UGhvdG9GdW5jKSB7XG4gIGxldCBzZWxmID0gdGhpcztcblxuICBsZXQgcGFyYW1zID0ge1xuICAgICdhY3Rpb24nOiAnZGlhbG9nJyxcbiAgICAnc2Vzc2lvbic6IHRoaXMuc2Vzc2lvbklkXG4gIH07XG5cbiAgZ2V0KHBhcmFtcywgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAvLyDQo9GB0YLQsNC90L7QstC60LAg0LjQvNC10L3QuCDQuCDRhNC+0YLQviDQvtC/0LXRgNCw0YLQvtGA0LBcbiAgICBzZXROYW1lRnVuYyhyZXNwb25zZS5uYW1lKTtcbiAgICBzZXRQaG90b0Z1bmMocmVzcG9uc2UucGhvdG8pO1xuXG4gICAgLy8g0KDQsNC30LHQvtGAINC4INC+0YLRgNC40YHQvtCy0LrQsCDQv9C10YDQtdC/0LjRgdC60Lgg0LzQtdC20LTRgyDQv9C+0YHQtdGC0LjRgtC10LvQtdC8INC4INC+0L/QtdGA0LDRgtC+0YDQvtC8XG4gICAgaWYocmVzcG9uc2UuZGlhbG9nLmxlbmd0aCA+IDApIHtcbiAgICAgIHNlbGYuc2hvd0hpc3RvcnkocmVzcG9uc2UuZGlhbG9nLCByZXNwb25zZS50aW1lKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiDQntGC0YDQuNGB0L7QstC60LAg0L/QtdGA0LXQv9C40YHQutC4INC80LXQttC00YMg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9C10Lwg0Lgg0L7Qv9C10YDQsNGC0L7RgNC+0LxcbiAqIEBwYXJhbSB7T2JqZWN0fSBtZXNzYWdlTGlzdCDQodC+0L7QsdGJ0LXQvdC40Y8g0LjQtyDQv9C10YDQtdC/0LjRgdC60LhcbiAqIEBwYXJhbSB7U3RyaW5nfSB0aW1lICAgICAgICDQotC10LrRg9GJ0LXQtSDQstGA0LXQvNGPINGB0LXRgNCy0LXRgNCwXG4gKi9cbkRpYWxvZy5wcm90b3R5cGUuc2hvd0hpc3RvcnkgPSBmdW5jdGlvbihtZXNzYWdlTGlzdCwgdGltZSkge1xuICAvLyDQodC+0YDRgtC40YDQvtCy0LrQsCDRgdC+0L7QsdGJ0LXQvdC40Lkg0LTQuNCw0LvQvtCz0LAg0L/QviDQtNCw0YLQtVxuICBtZXNzYWdlTGlzdC5zb3J0KGZ1bmN0aW9uKG1lc3NhZ2UxLCBtZXNzYWdlMikge1xuICAgIGxldCBkYXRlMSA9IGNyZWF0ZURhdGVGcm9tU3RyaW5nKG1lc3NhZ2UxLmRhdGV0aW1lKTtcbiAgICBsZXQgZGF0ZTIgPSBjcmVhdGVEYXRlRnJvbVN0cmluZyhtZXNzYWdlMi5kYXRldGltZSk7XG4gICAgbGV0IHRpbWUxID0gKG5ldyBEYXRlKGRhdGUxKSkuZ2V0VGltZSgpO1xuICAgIGxldCB0aW1lMiA9IChuZXcgRGF0ZShkYXRlMikpLmdldFRpbWUoKTtcbiAgICByZXR1cm4gKHRpbWUxIC0gdGltZTIpO1xuICB9KTtcblxuICAvLyDQktGL0YfQuNGB0LvQtdC90LjQtSDRgNCw0LfQvdC40YbRiyDQstC+INCy0YDQtdC80LXQvdC4INC80LXQttC00YMg0YHQtdGA0LLQtdGA0L7QvCDQuCDQutC70LjQtdC90YLQvtC8ICjQutC+0LzQv9GM0Y7RgtC10YDQvtC8INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjylcbiAgbGV0IGNsblNlcnZlclRpbWVEZWx0YSA9IGNyZWF0ZURhdGVGcm9tU3RyaW5nKHRpbWUpLmdldFRpbWUoKSAtIERhdGUubm93KCk7XG5cbiAgLy8g0KPQtNCw0LvQtdC90LjQtSDRgdGC0LDRgNC+0LPQviDQtNC40LDQu9C+0LPQsCDQuCDQvtGC0YDQuNGB0L7QstC60LAg0L3QvtCy0L7Qs9C+XG4gIGlmKHRoaXMuY2hhdERpYWxvZykge1xuICAgIHRoaXMuX2NsZWFyRGlhbG9nKCk7XG4gIH1cblxuICBsZXQgc2VsZiA9IHRoaXM7XG4gIG1lc3NhZ2VMaXN0LmZvckVhY2goZnVuY3Rpb24obWVzc2FnZSkge1xuICAgIGxldCBtZXNzYWdlQXV0aG9yID0gbWVzc2FnZS5vdXRjb21pbmcgPyAndXNlcicgOiAnb3JnJztcbiAgICBsZXQgbWVzc2FnZURhdGVUaW1lID0gbmV3IERhdGUoY3JlYXRlRGF0ZUZyb21TdHJpbmcobWVzc2FnZS5kYXRldGltZSkgLSBjbG5TZXJ2ZXJUaW1lRGVsdGEpO1xuICAgIHNlbGYucmVuZGVyTWVzc2FnZShtZXNzYWdlQXV0aG9yLCBzZXRFbnRlckluVGV4dChtZXNzYWdlLm1lc3NhZ2UpLCBtZXNzYWdlRGF0ZVRpbWUsIHRydWUpO1xuICB9KTtcbn07XG5cbi8qKlxuICog0J7QsdGA0LDQsdC+0YLRh9C40Log0YHQvtCx0YvRgtC40Y8g0LjQt9C80LXQvdC10L3QuNGPINGB0L7QtNC10YDQttC40LzQvtCz0L4g0L/QvtC70LXQuSDRhNC+0YDQvNGLINC+0YLQv9GA0LDQstC60Lgg0YHQvtC+0LHRidC10L3QuNGPXG4gKi9cbkRpYWxvZy5wcm90b3R5cGUuX29uTWVzc2FnZUZvcm1GaWVsZHNDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgaWYodGhpcy5jaGF0TWVzc2FnZUlucHV0LnZhbHVlKSB7XG4gICAgaGlkZUVycm9yKHRoaXMuY2hhdE1lc3NhZ2VJbnB1dCk7XG4gIH0gZWxzZSB7XG4gICAgc2hvd0Vycm9yKHRoaXMuY2hhdE1lc3NhZ2VJbnB1dCwgZXJyb3JNZXNzYWdlcy5yZXF1aXJlZEZpZWxkKTtcbiAgfVxufTtcblxuLyoqXG4gKiDQntCx0YDQsNCx0L7RgtGH0LjQuiDRgdC+0LHRi9GC0LjRjyDQvdCw0LbQsNGC0LjRjyDQvdCwINC60L3QvtC/0LrRgyAn0J7RgtC/0YDQsNCy0LjRgtGMJyDRhNC+0YDQvNGLINC+0YLQv9GA0LDQstC60Lgg0YHQvtC+0LHRidC10L3QuNC5XG4gKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcbiAqL1xuRGlhbG9nLnByb3RvdHlwZS5fb25NZXNzYWdlU2VuZENsaWNrID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gIGlmKHRoaXMuY2hhdE1lc3NhZ2VJbnB1dC52YWx1ZSkge1xuICAgIGxldCBwYXJhbXMgPSB7XG4gICAgICAnYWN0aW9uJzogJ21lc3NhZ2UnLFxuICAgICAgJ3Nlc3Npb24nOiB0aGlzLnNlc3Npb25JZCxcbiAgICAgICd2aXNpdG9yJzogJ9Cf0L7RgdC10YLQuNGC0LXQu9GMICcgKyBnZXRSYW5kb21WaXNpdG9yTnVtYmVyKCksXG4gICAgICAnbWVzc2FnZSc6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ucngtY2hhdF9fZm9ybS0tbWVzc2FnZSB0ZXh0YXJlYScpLnZhbHVlXG4gICAgfTtcblxuICAgIHBvc3QocGFyYW1zLCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYucmVuZGVyTWVzc2FnZSgndXNlcicsIHNlbGYuY2hhdE1lc3NhZ2VJbnB1dC52YWx1ZSk7XG4gICAgICBoaWRlU2VydmVyUmVzdWx0TWVzc2FnZSgpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHNob3dFcnJvcih0aGlzLmNoYXRNZXNzYWdlSW5wdXQsIGVycm9yTWVzc2FnZXMucmVxdWlyZWRGaWVsZCk7XG4gIH1cbn07XG5cbi8qKlxuICog0J7QsdGA0LDQsdC+0YLRh9C40Log0YHQvtCx0YvRgtC40Y8g0L3QsNC20LDRgtC40Y8g0LrQu9Cw0LLQuNGI0LggJ0VudGVyJyDQv9GA0Lgg0LfQsNC/0L7Qu9C90LXQvdC40Lgg0YTQvtGA0LzRiyDQvtGC0L/RgNCw0LLQutC4INGB0L7QvtCx0YnQtdC90LjRj1xuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gKi9cbkRpYWxvZy5wcm90b3R5cGUuX29uTWVzc2FnZUZvcm1FbnRlckRvd24gPSBmdW5jdGlvbihldmVudCkge1xuICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gRU5URVJfQ09ERSkge1xuICAgIHRoaXMuX29uTWVzc2FnZVNlbmRDbGljayhldmVudCk7XG4gIH1cbn07XG5cbi8qKlxuICog0J7QsdGA0LDQsdC+0YLRh9C40Log0YHQvtCx0YvRgtC40Y8g0LLQstC+0LTQsCDRgdC40LzQstC+0LvQvtCyINCyINC/0L7Qu9C1INGC0LXQutGB0YLQsCDRgdC+0L7QsdGJ0LXQvdC40Y9cbiAqL1xuRGlhbG9nLnByb3RvdHlwZS5fb25UeXBpbmdJbk1lc3NhZ2VGb3JtRmllbGRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMudXNlcklzVHlwaW5nTm93ID0gdHJ1ZTtcbiAgdGhpcy5fc3RvcFVzZXJUeXBpbmdEZWJvdW5jZSgpO1xufTtcblxuLyoqXG4gKiDQodCx0YDQvtGBINC/0YDQuNC30L3QsNC60LAg0YLQvtCz0L4sINGH0YLQviDQv9C+0LvRjNC30L7QstCw0YLQtdC70Ywg0L3QsNCx0LjRgNCw0LXRgiDRgtC10LrRgdGCXG4gKi9cbkRpYWxvZy5wcm90b3R5cGUuX3N0b3BVc2VyVHlwaW5nID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMudXNlcklzVHlwaW5nTm93ID0gZmFsc2U7XG59O1xuXG4vKipcbiAqINCT0LXQvdC10YDQsNGG0LjRjyDRgdC70YPRh9Cw0LnQvdC+0LPQviDQv9C+0YDRj9C00LrQvtCy0L7Qs9C+INC90L7QvNC10YDQsCDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbiAqIEByZXR1cm4ge051bWJlcn0g0J/QvtGA0Y/QtNC60L7QstGL0Lkg0L3QvtC80LXRgCDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbiAqL1xuZnVuY3Rpb24gZ2V0UmFuZG9tVmlzaXRvck51bWJlcigpIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICg1MDAgLSAxICsgMSkpICsgMTtcbn1cblxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvanMvY29tcG9uZW50cy9EaWFsb2cuanNcbiAqKi8iLCJleHBvcnQgeyBnZXQsIGdldFN5bmMsIHBvc3QsIHNob3dMb2FkaW5nT2ssIGhpZGVTZXJ2ZXJSZXN1bHRNZXNzYWdlIH07XG5pbXBvcnQgeyBlcnJvck1lc3NhZ2VzIH0gZnJvbSAnLi9tZXNzYWdlcyc7XG5pbXBvcnQgeyBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MgfSBmcm9tICcuL3V0aWxzJztcblxuLyoqINCQ0LTRgNC10YEg0LLQtdCxLdGB0LXRgNCy0LXRgNCwLCDQutC+0YLQvtGA0YvQuSDQuNGB0L/QvtC70YzQt9GD0LXRgtGB0Y8g0LTQu9GPINC+0LHQvNC10L3QsCDRgdC+0L7QsdGJ0LXQvdC40Y/QvNC4XG4gKiBAY29uc3RhbnRcbiAqIEB0eXBlIHtTdHJpbmd9XG4gKi9cbi8vIGNvbnN0IFNFUlZFUl9VUkwgPSAnaHR0cHM6Ly9uaXJheC5ydS9vbmxpbmUvYWR2aXNlci5waHAnO1xuY29uc3QgU0VSVkVSX1VSTCA9ICdodHRwczovL2R6Z2Fuc2wucnUvdGVzdC9hZHZpc2VyLnBocCc7ICAvLyDQlNC70Y8g0YLQtdGB0YLQuNGA0L7QstCw0L3QuNGPXG5cbi8qKlxuICog0JDRgdGB0LjQvdGF0YDQvtC90L3QvtC1INC/0L7Qu9GD0YfQtdC90LjQtSDQtNCw0L3QvdGL0YUg0YEg0YHQtdGA0LLQtdGA0LBcbiAqIEBwYXJhbSAge09iamVjdH0gICByZXF1ZXN0UGFyYW1zT2JqINCf0LDRgNCw0LzQtdGC0YDRiyDQt9Cw0L/RgNC+0YHQsFxuICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrICAgICAgICAg0KTRg9C90LrRhtC40Y8g0L7QsdGA0LDQsdC+0YLQutC4INC+0YLQstC10YLQsCDRgdC10YDQstC10YDQsFxuICovXG5mdW5jdGlvbiBnZXQocmVxdWVzdFBhcmFtc09iaiwgY2FsbGJhY2spIHtcbiAgbGV0IHJlcXVlc3RQYXJhbXMgPSBfcmVxdWVzdFBhcmFtc1RvU3RyaW5nKHJlcXVlc3RQYXJhbXNPYmopO1xuICBsZXQgeGhyID0gX2NyZWF0ZUNvcnNSZXF1ZXN0KCdHRVQnLCBTRVJWRVJfVVJMICsgcmVxdWVzdFBhcmFtcyk7XG4gIGlmICgheGhyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDT1JTIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxuXG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgIGlmKHJlc3BvbnNlLnJlc3VsdCkge1xuICAgICAgY2FsbGJhY2socmVzcG9uc2UpO1xuICAgIH1cbiAgfTtcblxuICB4aHIuc2VuZChudWxsKTtcbn1cblxuLyoqXG4gKiDQodC40L3RhdGA0L7QvdC90L7QtSDQv9C+0LvRg9GH0LXQvdC40LUg0LTQsNC90L3Ri9GFINGBINGB0LXRgNCy0LXRgNCwXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgcmVxdWVzdFBhcmFtc09iaiDQn9Cw0YDQsNC80LXRgtGA0Ysg0LfQsNC/0YDQvtGB0LBcbiAqL1xuZnVuY3Rpb24gZ2V0U3luYyhyZXF1ZXN0UGFyYW1zT2JqKSB7XG4gIGxldCByZXF1ZXN0UGFyYW1zID0gX3JlcXVlc3RQYXJhbXNUb1N0cmluZyhyZXF1ZXN0UGFyYW1zT2JqKTtcbiAgbGV0IHhociA9IF9jcmVhdGVDb3JzUmVxdWVzdCgnR0VUJywgU0VSVkVSX1VSTCArIHJlcXVlc3RQYXJhbXMsIHRydWUpO1xuICBpZiAoIXhocikge1xuICAgIHRocm93IG5ldyBFcnJvcignQ09SUyBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cblxuICBsZXQgcmVzcG9uc2U7XG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gIH07XG5cbiAgeGhyLnNlbmQobnVsbCk7XG4gIHJldHVybiByZXNwb25zZTtcbn1cblxuLyoqXG4gKiDQntGC0L/RgNCw0LLQutCwINC00LDQvdC90YvRhSDQvdCwINGB0LXRgNCy0LXRgFxuICogQHBhcmFtICB7T2JqZWN0fSAgIHJlcXVlc3RQYXJhbXNPYmog0J/QsNGA0LDQvNC10YLRgNGLINC30LDQv9GA0L7RgdCwXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgICAgICAgICDQpNGD0L3QutGG0LjRjyDQvtCx0YDQsNCx0L7RgtC60Lgg0L7RgtCy0LXRgtCwINGB0LXRgNCy0LXRgNCwXG4gKi9cbmZ1bmN0aW9uIHBvc3QocmVxdWVzdFBhcmFtc09iaiwgY2FsbGJhY2spIHtcbiAgbGV0IHJlcXVlc3RQYXJhbXMgPSBfcmVxdWVzdFBhcmFtc1RvU3RyaW5nKHJlcXVlc3RQYXJhbXNPYmopO1xuICBsZXQgeGhyID0gX2NyZWF0ZUNvcnNSZXF1ZXN0KCdHRVQnLCBTRVJWRVJfVVJMICsgcmVxdWVzdFBhcmFtcyk7XG4gIGlmICgheGhyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDT1JTIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxuXG4gIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xuICAgIGlmKHJlc3BvbnNlLnJlc3VsdCkge1xuICAgICAgY2FsbGJhY2socmVzcG9uc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBfc2hvd0xvYWRpbmdFcnJvcigpO1xuICAgIH1cbiAgfTtcblxuICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIF9zaG93TG9hZGluZ0Vycm9yKCk7XG4gIH07XG5cbiAgeGhyLnNlbmQobnVsbCk7XG59XG5cbi8qKlxuICog0J/RgNC10L7QsdGA0LDQt9C+0LLQsNC90LjQtSDQv9Cw0YDQsNC80LXRgtGA0L7QsiDQt9Cw0L/RgNC+0YHQsCDQuNC3INC+0LHRitC10LrRgtCwINCyINGB0YLRgNC+0LrRg1xuICogQHBhcmFtICB7T25qZWN0fSByZXF1ZXN0UGFyYW1zT2JqINCf0LDRgNCw0LzQtdGC0YDRiyDQt9Cw0L/RgNC+0YHQsCDQsiDQstC40LTQtSDQvtCx0YrQtdC60YLQsFxuICogQHJldHVybiB7U3RyaW5nfSAgICAgICAgICAgICAgICAgINCf0LDRgNCw0LzQtdGC0YDRiyDQt9Cw0L/RgNC+0YHQsCDQsiDQstC40LTQtSDRgdGC0YDQvtC60LhcbiAqL1xuZnVuY3Rpb24gX3JlcXVlc3RQYXJhbXNUb1N0cmluZyhyZXF1ZXN0UGFyYW1zT2JqKSB7XG4gIGxldCByZXF1ZXN0UGFyYW1zO1xuICByZXF1ZXN0UGFyYW1zT2JqLnVybCA9IHdpbmRvdy5TRVJWRVJfMUNfVVJMO1xuICBmb3IodmFyIGtleSBpbiByZXF1ZXN0UGFyYW1zT2JqKSB7XG4gICAgaWYocmVxdWVzdFBhcmFtc09iai5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXF1ZXN0UGFyYW1zID0gcmVxdWVzdFBhcmFtcyA/IChyZXF1ZXN0UGFyYW1zICsgJyYnKSA6ICc/JztcbiAgICAgIHJlcXVlc3RQYXJhbXMgKz0ga2V5ICsgJz0nICsgZW5jb2RlVVJJKHJlcXVlc3RQYXJhbXNPYmpba2V5XSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXF1ZXN0UGFyYW1zO1xufVxuXG4vKipcbiAqINCh0L7Qt9C00LDQvdC40LUg0LrRgNC+0YHRgS3QsdGA0LDRg9C30LXRgNC90L7Qs9C+INC30LDQv9GA0L7RgdCwXG4gKiBAcGFyYW0gIHtTdHJpbmd9ICBtZXRob2Qg0KLQuNC/INC30LDQv9GA0L7RgdCwIChHRVQsIFBPU1QuLi4uKVxuICogQHBhcmFtICB7U3RyaW5nfSAgdXJsICAgINCQ0LTRgNC10YEg0JLQtdCxLdGB0LXRgNCy0LXRgNCwXG4gKiBAcGFyYW0gIHtCb29sZWFufSBzeW5jICAg0J/RgNC40LfQvdCw0Log0YLQvtCz0L4sINGH0YLQviDQvtGC0L/RgNCw0LLQu9GP0LXQvNGL0Lkg0LfQsNC/0YDQvtGBINGB0LjQvdGF0YDQvtC90L3Ri9C5XG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICAgICAg0JrRgNC+0YHRgS3QsdGA0LDRg9C30LXRgNC90YvQuSDRjdC60LfQtdC80L/Qu9GP0YAg0LfQsNC/0YDQvtGB0LBcbiAqL1xuZnVuY3Rpb24gX2NyZWF0ZUNvcnNSZXF1ZXN0KG1ldGhvZCwgdXJsLCBzeW5jKSB7XG4gIGxldCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgaWYgKCd3aXRoQ3JlZGVudGlhbHMnIGluIHhocikge1xuICAgIHhoci5vcGVuKG1ldGhvZCwgdXJsLCAhc3luYyk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIFhEb21haW5SZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuICAgIC8vINCU0LvRjyBJRVxuICAgIHhociA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKG1ldGhvZCwgdXJsKTtcbiAgfSBlbHNlIHtcbiAgICB4aHIgPSBudWxsO1xuICB9XG4gIHJldHVybiB4aHI7XG59XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINGB0L7QvtCx0YnQtdC90LjRjyDQvtCxINC+0YjQuNCx0LrQtSwg0LLQvtC30L3QuNC60YjQtdC5INC/0YDQuCDQstGL0L/QvtC70L3QtdC90LjQuCDQt9Cw0L/RgNC+0YHQsCDQuiDRgdC10YDQstC10YDRg1xuICovXG5mdW5jdGlvbiBfc2hvd0xvYWRpbmdFcnJvcigpIHtcbiAgbGV0IHJlc3VsdEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubnJ4LXNlcnZlci1tZXNzYWdlJyk7XG4gIHJlbW92ZUNsYXNzKHJlc3VsdEVsZW1lbnQsICducngtb2stbWVzc2FnZScpO1xuICBhZGRDbGFzcyhyZXN1bHRFbGVtZW50LCAnbnJ4LWVycm9yLW1lc3NhZ2UnKTtcbiAgcmVzdWx0RWxlbWVudC5pbm5lclRleHQgPSBlcnJvck1lc3NhZ2VzLnNlcnZlckVycm9yO1xuICBhZGRDbGFzcyhyZXN1bHRFbGVtZW50LCAnbnJ4LWZhZGVJblJpZ2h0Jyk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgaGlkZVNlcnZlclJlc3VsdE1lc3NhZ2UoKTtcbiAgfSwgMzAwMCk7XG59XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINGB0L7QvtCx0YnQtdC90LjRjyDQvtCxINGD0YHQv9C10YjQvdC+0Lwg0LLRi9C/0L7Qu9C90LXQvdC40Lgg0LfQsNC/0YDQvtGB0LAg0Log0YHQtdGA0LLQtdGA0YNcbiAqIEBwYXJhbSAge1N0cmluZ30gbWVzc2FnZSDQotC10LrRgdGCINGB0L7QvtCx0YnQtdC90LjRj1xuICovXG5mdW5jdGlvbiBzaG93TG9hZGluZ09rKG1lc3NhZ2UpIHtcbiAgbGV0IHJlc3VsdEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubnJ4LXNlcnZlci1tZXNzYWdlJyk7XG4gIHJlbW92ZUNsYXNzKHJlc3VsdEVsZW1lbnQsICducngtZXJyb3ItbWVzc2FnZScpO1xuICBhZGRDbGFzcyhyZXN1bHRFbGVtZW50LCAnbnJ4LW9rLW1lc3NhZ2UnKTtcbiAgcmVzdWx0RWxlbWVudC5pbm5lclRleHQgPSBtZXNzYWdlO1xuICBhZGRDbGFzcyhyZXN1bHRFbGVtZW50LCAnbnJ4LWZhZGVJblJpZ2h0Jyk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgaGlkZVNlcnZlclJlc3VsdE1lc3NhZ2UoKTtcbiAgfSwgMzAwMCk7XG59XG5cbi8qKlxuICog0KHQutGA0YvRgtC40LUg0YHQtdGA0LLQtdGA0L3QvtCz0L4g0YHQvtC+0LHRidC10L3QuNGPINC+0LEg0L7RiNC40LHQutC1XG4gKi9cbmZ1bmN0aW9uIGhpZGVTZXJ2ZXJSZXN1bHRNZXNzYWdlKCkge1xuICBsZXQgcmVzdWx0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ucngtc2VydmVyLW1lc3NhZ2UnKTtcbiAgaWYocmVzdWx0RWxlbWVudCAmJiByZXN1bHRFbGVtZW50LmlubmVyVGV4dCkge1xuICAgIGFkZENsYXNzKHJlc3VsdEVsZW1lbnQsICducngtZmFkZU91dCcpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICByZW1vdmVDbGFzcyhyZXN1bHRFbGVtZW50LCAnbnJ4LWVycm9yLW1lc3NhZ2UnKTtcbiAgICAgIHJlbW92ZUNsYXNzKHJlc3VsdEVsZW1lbnQsICducngtb2stbWVzc2FnZScpO1xuICAgICAgcmVtb3ZlQ2xhc3MocmVzdWx0RWxlbWVudCwgJ25yeC1mYWRlSW5SaWdodCcpO1xuICAgICAgcmVtb3ZlQ2xhc3MocmVzdWx0RWxlbWVudCwgJ25yeC1mYWRlT3V0Jyk7XG4gICAgICByZXN1bHRFbGVtZW50LmlubmVyVGV4dCA9ICcnO1xuICAgIH0sIDEwMDApO1xuICB9XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9qcy9jb21tb24vYWpheC5qc1xuICoqLyIsIi8qKlxuICog0KLQtdC60YHRgtGLINC/0L4t0YPQvNC+0LvRh9Cw0L3QuNGOXG4gKiBAY29uc3RhbnRcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmV4cG9ydCBjb25zdCBkZWZhdWx0VGV4dCA9IHtcbiAgJ3NvY2lhbEJ0bic6ICfQndCw0L/QuNGI0LjRgtC1INC90LDQvCcsXG4gICdjaGF0SGVhZGVyJzogJ9Cd0LDQv9C40YjQuNGC0LUg0L3QsNC8LCDQvNGLINC+0L3Qu9Cw0LnQvSEnLFxuICAnY2hhdFdlbGNvbWUnOiAn0JTQvtCx0YDQviDQv9C+0LbQsNC70L7QstCw0YLRjCEg0JHRg9C00LXQvCDRgNCw0LTRiyDQvtGC0LLQtdGC0LjRgtGMINC90LAg0JLQsNGIINCy0L7Qv9GA0L7RgSEnLFxuICAnY29udGFjdHNMaW5rRW1wdHknOiAn0J7RgdGC0LDQstGM0YLQtSDRgdCy0L7QuCDQutC+0L3RgtCw0LrRgtGLJyxcbiAgJ2NvbnRhY3RzTGlua0Z1bGwnOiAn0JLQsNGI0Lgg0LrQvtC90YLQsNC60YLRiycsXG4gICdjb250YWN0c1RpcEVtcHR5JzogJ9Cj0LrQsNC20LjRgtC1LCDQv9C+0LbQsNC70YPQudGB0YLQsCwg0YHQstC+0Lgg0LrQvtC90YLQsNC60YLRiy4g0K3RgtC+INC/0L7QvNC+0LbQtdGCINC90LDQvCDQsdGL0YLRjCDRgSDQktCw0LzQuCDQvdCwINGB0LLRj9C30LgnLFxuICAnY29udGFjdHNUaXBGdWxsJzogJ9CS0Ysg0L7RgdGC0LDQstC40LvQuCDQvdCw0Lwg0YHQu9C10LTRg9GO0YnQuNC1INC60L7QvdGC0LDQutGC0YsuINCf0YDQuCDQvdC10L7QsdGF0L7QtNC40LzQvtGB0YLQuCDQvtCx0L3QvtCy0LjRgtC1INC4eCcsXG4gICdjb250YWN0c1NhdmVkJzogJ9Ca0L7QvdGC0LDQutGC0Ysg0YHQvtGF0YDQsNC90LXQvdGLJyxcbiAgJ29wZXJJc1R5cGluZyc6ICfQvtC/0LXRgNCw0YLQvtGAINC/0LXRh9Cw0YLQsNC10YIuLi4nXG59O1xuXG4vKipcbiAqINCi0LXQutGB0YLRiyDRgdC+0L7QsdGJ0LXQvdC40Lkg0L7QsSDQvtGI0LjQsdC60LDRhVxuICogQGNvbnN0YW50XG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5leHBvcnQgY29uc3QgZXJyb3JNZXNzYWdlcyA9IHtcbiAgJ3NlcnZlckVycm9yJzogJ9Ch0LXRgNCy0LjRgSDQstGA0LXQvNC10L3QvdC+INC90LXQtNC+0YHRgtGD0L/QtdC9JyxcbiAgJ3JlcXVpcmVkRmllbGQnOiAn0J7QsdGP0LfQsNGC0LXQu9GM0L3QvtC1INC/0L7Qu9C1JyxcbiAgJ25lZWRGaWxsTGVhc3RPbmVGaWVsZCc6ICfQlNC+0LvQttC90L4g0LHRi9GC0Ywg0LfQsNC/0L7Qu9C90LXQvdC+INGF0L7RgtGPINCx0Ysg0L7QtNC90L4g0L/QvtC70LUnLFxuICAnZW1haWxGb3JtYXQnOiAn0JTQvtC70LbQvdC+INCx0YvRgtGMINC30LDQv9C+0LvQvdC10L3QviDQsiDRhNC+0YDQvNCw0YLQtSBpdkB5YW5kZXgucnUnLFxuICAncGhvbmVGb3JtYXQnOiAn0JzQvtC20LXRgiDRgdC+0LTQtdGA0LbQsNGC0Ywg0YbQuNGE0YDRiywg0YHQuNC80LLQvtC70YsgKy1fKCkg0Lgg0L/RgNC+0LHQtdC7J1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2pzL2NvbW1vbi9tZXNzYWdlcy5qc1xuICoqLyIsImV4cG9ydCB7IGNyZWF0ZURPTUVsZW1lbnQsIHJlbW92ZURPTUVsZW1lbnQsIGhhc0NsYXNzLCBhZGRDbGFzcywgcmVtb3ZlQ2xhc3MsIHZhbGlkYXRlRW1haWwsXG4gICAgICAgIHZhbGlkYXRlUGhvbmUsIGNyZWF0ZURhdGVGcm9tU3RyaW5nLCBmb3JtYXRUaW1lLCBwbGF5QXVkaW8sIHNob3dFcnJvciwgaGlkZUVycm9yLFxuICAgICAgICBvbkZpZWxkc0ZvY3VzLCBiaW5kQWxsRnVuYywgc2V0RW50ZXJJblRleHQsIHJlbmRlckltZywgc2V0SW1nUGFyYW1zLCBkZWJvdW5jZSB9O1xuXG4vKipcbiAqINCh0L7Qt9C00LDQvdC40LUgRE9NLdGN0LvQtdC80LXQvdGC0LBcbiAqIEBwYXJhbSAge1N0cmluZ30gIGVsZW1lbnRUeXBlINCi0LjQvyDRgdC+0LfQtNCw0LLQsNC10LzQvtCz0L4g0Y3Qu9C10LzQtdC90YLQsCAoZGl2LCBpbnB1dC4uLilcbiAqIEBwYXJhbSAge09iamVjdH0gIGF0dHJMaXN0ICAgINCh0L/QuNGB0L7QuiDQsNGC0YDQuNCx0YPRgtC+0LIg0Y3Qu9C10LzQtdC90YLQsFxuICogQHJldHVybiB7RWxlbWVudH0gICAgICAgICAgICAg0KHQvtC30LTQsNC90L3Ri9C5INGN0LvQtdC80LXQvdGCXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURPTUVsZW1lbnQoZWxlbWVudFR5cGUsIGF0dHJMaXN0KSB7XG4gIGxldCBlbGVtZW50O1xuICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChlbGVtZW50VHlwZSk7XG4gIGZvciAobGV0IGF0dHIgaW4gYXR0ckxpc3QpIHtcbiAgICBpZihhdHRyTGlzdC5oYXNPd25Qcm9wZXJ0eShhdHRyKSkge1xuICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ciwgYXR0ckxpc3RbYXR0cl0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZWxlbWVudDtcbn1cblxuLyoqXG4gKiDQo9C00LDQu9C10L3QuNC1IERPTS3QtdC70LXQvNC10L3RgtCwXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHBhcmVudCAg0KDQvtC00LjRgtC10LvRjCDRg9C00LDQu9GP0LXQvNC+0LPQviDRjdC70LXQvNC10L3RgtCwXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQg0KPQtNCw0LvRj9C10LzRi9C5INGN0LvQtdC80LXQvdGCXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZURPTUVsZW1lbnQocGFyZW50LCBlbGVtZW50KSB7XG4gIHBhcmVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcbn1cblxuLyoqXG4gKiDQn9GA0L7QstC10YDQutCwINC90LDQu9C40YfQuNGPINGDIERPTS3RjdC70LXQvNC10L3RgtCwINC90LXQutC+0YLQvtGA0L7Qs9C+INC60LvQsNGB0YHQsFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50ICAgRE9NLdGN0LvQtdC80LXQvdGCXG4gKiBAcGFyYW0ge1N0cmluZ30gIGNsYXNzTmFtZSDQndCw0LfQstCw0L3QuNC1INC60LvQsNGB0YHQsFxuICovXG5mdW5jdGlvbiBoYXNDbGFzcyhlbGVtZW50LCBjbGFzc05hbWUpIHtcbiAgcmV0dXJuICEhZWxlbWVudC5jbGFzc05hbWUubWF0Y2gobmV3IFJlZ0V4cCgnKFxcXFxzfF4pJyArIGNsYXNzTmFtZSArICcoXFxcXHN8JCknKSk7XG59XG5cbi8qKlxuICog0JTQvtCx0LDQstC70LXQvdC40LUg0LrQu9Cw0YHRgdCwIERPTS3RjdC70LXQvNC10L3RgtGDXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgICBET00t0Y3Qu9C10LzQtdC90YJcbiAqIEBwYXJhbSB7U3RyaW5nfSAgY2xhc3NOYW1lINCd0LDQt9Cy0LDQvdC40LUg0LrQu9Cw0YHRgdCwXG4gKi9cbmZ1bmN0aW9uIGFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICBpZighaGFzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKSkge1xuICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcbiAgfVxufVxuXG4vKipcbiAqINCj0LTQsNC70LXQvdC40LUg0LrQu9Cw0YHRgdCwINGDIERPTS3RjdC70LXQvNC10L3RgtCwXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgICBET00t0Y3Qu9C10LzQtdC90YJcbiAqIEBwYXJhbSB7U3RyaW5nfSAgY2xhc3NOYW1lINCd0LDQt9Cy0LDQvdC40LUg0LrQu9Cw0YHRgdCwXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICBpZiAoaGFzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKSkge1xuICAgIGxldCBlbGVtZW50Q2xhc3NlcyA9IGVsZW1lbnQuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVtZW50Q2xhc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGVsZW1lbnRDbGFzc2VzW2ldID09PSBjbGFzc05hbWUpIHtcbiAgICAgICAgZWxlbWVudENsYXNzZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpLS07XG4gICAgICB9XG4gICAgfVxuICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudENsYXNzZXMuam9pbignICcpO1xuICB9XG59XG5cbi8qKlxuICog0J/RgNC+0LLQtdGA0LrQsCDRjdC70LXQutGC0YDQvtC90L3QvtC5INGE0L7RgNC80Ysg0L3QsCDRgdC+0L7RgtCy0LXRgtGB0YLQstC40LUg0YTQvtGA0LzQsNGC0YMgZW1haWxcbiAqIEBwYXJhbSAge1N0cmluZ30gIGVtYWlsINCX0L3QsNGH0LXQvdC40LUg0L/QvtGH0YLRiywg0LrQvtGC0L7RgNCw0Y8g0L/RgNC+0LLQtdGA0Y/QtdGC0YHRj1xuICogQHJldHVybiB7Qm9vbGVhbn0gICAgICAg0KDQtdC30YPQu9GM0YLQsNGCINC/0YDQvtCy0LXRgNC60Lg6IHRydWUgLSBlbWFpbCDQstC10YDQvdGL0LksIGZhbHNlIC0g0YTQvtGA0LzQsNGCIGVtYWlsINC90LXQstC10YDQvdGL0LlcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVFbWFpbChlbWFpbCkge1xuICB2YXIgcmUgPSAvXigoW148PigpW1xcXVxcXFwuLDs6XFxzQFxcXCJdKyhcXC5bXjw+KClbXFxdXFxcXC4sOzpcXHNAXFxcIl0rKSopfChcXFwiLitcXFwiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFxdKXwoKFthLXpBLVpcXC0wLTldK1xcLikrW2EtekEtWl17Mix9KSkkLztcbiAgcmV0dXJuIHJlLnRlc3QoZW1haWwpO1xufVxuXG4vKipcbiAqINCf0YDQvtCy0LXRgNC60LAg0YTQvtGA0LzQsNGC0LAg0L3QvtC80LXRgNCwINGC0LXQu9C10YTQvtC90LAg0L3QsCDQvdCw0LvQuNGH0LjQtSDRgtC+0LvRjNC60L4g0LTQvtC/0YPRgdGC0LjQvNGL0YXRhSDRgdC40LzQstC+0LvQvtCyIC0g0YbQuNGE0YAsINC/0YDQvtCx0LXQu9CwINC4INGB0LjQvNCy0L7Qu9C+0LIgKy1fKClcbiAqIEBwYXJhbSAge1N0cmluZ30gIHBob25lINCX0L3QsNGH0LXQvdC40LUg0L3QvtC80LXRgNCwINGC0LXQu9C10YTQvtC90LAsINC60L7RgtC+0YDRi9C5INC/0YDQvtCy0LXRgNGP0LXRgtGB0Y9cbiAqIEByZXR1cm4ge0Jvb2xlYW59ICAgICAgINCg0LXQt9GD0LvRjNGC0LDRgiDQv9GA0L7QstC10YDQutC4OiB0cnVlIC0g0YLQtdC70LXRhNC+0L0g0YHQvtC00LXRgNC20LjRgiDRgtC+0LvRjNC60L4g0LTQvtC/0YPRgdGC0LjQvNGL0LUg0YHQuNC80LLQvtC70YssIGZhbHNlIC0g0YLQtdC70LXRhNC+0L0g0YHQvtC00LXRgNC20LjRgiDQvdC10LTQvtC/0YPRgdGC0LjQvNGL0LUg0YHQuNC80LLQvtC70YtcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVQaG9uZShwaG9uZSkge1xuICB2YXIgcmUgPSAvXihbMC05XFwrXFxzLV9cXChcXCldKSokLztcbiAgcmV0dXJuIHJlLnRlc3QocGhvbmUpO1xufVxuXG4vKipcbiAqINCh0L7Qt9C00LDQvdC40LUg0Y3Qu9C10LzQtdC90YLQsCDRgtC40L/QsCBEYXRlINC40Lcg0YHRgtGA0L7QutC4XG4gKiBAcGFyYW0gIHtTdHJpbmd9IHN0ciDQodGC0YDQvtC60LAg0YEg0LjQvdGE0L7RgNC80LDRhtC40LXQuSDQviDQtNCw0YLQtSDQuCDQstGA0LXQvNC10L3QuFxuICogQHJldHVybiB7RGF0ZX0gICAgICAg0JTQsNGC0LAg0Lgg0LLRgNC10LzRjyDQsiDRhNC+0YDQvNCw0YLQtSBEYXRlXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZURhdGVGcm9tU3RyaW5nKHN0cikge1xuICBsZXQgeWVhciA9IHN0ci5zdWJzdHJpbmcoMCwgNCk7XG4gIGxldCBtb250aCA9IHN0ci5zdWJzdHJpbmcoNCwgNikgLSAxO1xuICBsZXQgZGF0ZSA9IHN0ci5zdWJzdHJpbmcoNiwgOCk7XG4gIGxldCBob3VycyA9IHN0ci5zdWJzdHJpbmcoOCwgMTApO1xuICBsZXQgbWludXRlcyA9IHN0ci5zdWJzdHJpbmcoMTAsIDEyKTtcbiAgbGV0IHNlY29uZHMgPSBzdHIuc3Vic3RyaW5nKDEyLCAxNCk7XG4gIHJldHVybiBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSwgaG91cnMsIG1pbnV0ZXMsIHNlY29uZHMpO1xufVxuXG4vKipcbiAqINCf0L7Qu9GD0YfQtdC90LjQtSDQstGA0LXQvNC10L3QuCDQuNC3INC00LDRgtGLINC4INC/0YDQtdC+0LHRgNCw0LfQvtCy0LDQvdC40LUg0LXQs9C+INCyINC90YPQttC90YvQuSDRhNC+0YDQvNCw0YIgKNGH0Yc60LzQvClcbiAqIEByZXR1cm4ge1N0cmluZ30g0JLRgNC10LzRjyDQsiDQvdGD0LbQvdC+0Lwg0YTQvtGA0LzQsNGC0LVcbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRUaW1lKGRhdGV0aW1lKSB7XG4gIGxldCBob3VycyA9IGRhdGV0aW1lLmdldEhvdXJzKCk7XG4gIGxldCBtaW51dGVzID0gZGF0ZXRpbWUuZ2V0TWludXRlcygpO1xuICBob3VycyA9IGhvdXJzIDwgMTAgPyAnMCcgKyBob3VycyA6IGhvdXJzO1xuICBtaW51dGVzID0gbWludXRlcyA8IDEwID8gJzAnICsgbWludXRlcyA6IG1pbnV0ZXM7XG4gIHJldHVybiBob3VycyArICc6JyArIG1pbnV0ZXM7XG59XG5cbi8qKlxuICog0JLQvtGB0L/RgNC+0LjQt9Cy0LXQtNC10L3QuNC1INC30LLRg9C60LBcbiAqIEBwYXJhbSB7U3RyaW5nfSBzcmMg0JfQstGD0LrQvtCy0L7QuSDRhNCw0LnQuywg0LrQvtGC0L7RgNGL0Lkg0L3Rg9C20L3QviDQv9GA0L7QuNCz0YDQsNGC0YwgKNCyINGE0L7RgNC80LDRgtC1IGJhc2U2NClcbiAqL1xuZnVuY3Rpb24gcGxheUF1ZGlvKHNyYykge1xuICBsZXQgdm9pY2UgPSBuZXcgQXVkaW8oKTtcbiAgdm9pY2Uuc3JjID0gc3JjO1xuICB2b2ljZS5hdXRvcGxheSA9IHRydWU7XG59XG5cbi8qKlxuICog0J7RgtC+0LHRgNCw0LbQtdC90LjQtSDRgtC10LrRgdGC0LAg0YHQvtC+0LHRidC10L3QuNGPINC+0LEg0L7RiNC40LHQutC1INC00LvRjyDQv9C+0LvRjyDRhNC+0YDQvNGLXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgRE9NLdGN0LvQtdC80LXQvdGCINC/0L7Qu9GPINGE0L7RgNC80YssINCyINC60L7RgtC+0YDQvtC8INCy0L7Qt9C90LjQutC70LAg0L7RiNC40LHQutCwXG4gKiBAcGFyYW0ge1N0cmluZ30gIGVycm9yICAg0KLQtdC60YHRgiDQvtGI0LjQsdC60LhcbiAqL1xuZnVuY3Rpb24gc2hvd0Vycm9yKGVsZW1lbnQsIGVycm9yKSB7XG4gIGFkZENsYXNzKGVsZW1lbnQsICdlcnJvcicpO1xuICBlbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5pbm5lclRleHQgPSBlcnJvcjtcbn1cblxuLyoqXG4gKiDQodC60YDRi9GC0LjQtSDRgdC+0L7QsdGJ0LXQvdC40Y8g0L7QsSDQvtGI0LjQsdC60LUg0LTQu9GPINC/0L7Qu9GPINGE0L7RgNC80YtcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbWVudCBET00t0Y3Qu9C10LzQtdC90YIg0L/QvtC70Y8g0YTQvtGA0LzRiywg0L7RiNC40LHQutGDINC00LvRjyDQutC+0YLQvtGA0L7Qs9C+INC90YPQttC90L4g0YHQutGA0YvRgtGMXG4gKi9cbmZ1bmN0aW9uIGhpZGVFcnJvcihlbGVtZW50KSB7XG4gIHJlbW92ZUNsYXNzKGVsZW1lbnQsICdlcnJvcicpO1xuICBlbGVtZW50Lm5leHRFbGVtZW50U2libGluZy5pbm5lclRleHQgPSAnJztcbn1cblxuLyoqXG4gKiDQntCx0YDQsNCx0L7RgtGH0LjQuiDRgdC+0LHRi9GC0LjRjyDQv9GA0LjQvtCx0YDQtdGC0LXQvdC40Y8g0L/QvtC70LXQvCDRhNC+0YDQvNGLINGE0L7QutGD0YHQsFxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIG9uRmllbGRzRm9jdXMoZXZlbnQpIHtcbiAgaWYoIWV2ZW50LmN1cnJlbnRUYXJnZXQudmFsdWUpIHtcbiAgICBldmVudC5jdXJyZW50VGFyZ2V0LmZvY3VzKCk7XG4gICAgaGlkZUVycm9yKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICB9XG59XG5cbi8qKlxuICog0KTRg9C90LrRhtC40Y8sINC/0L7Qt9Cy0L7Qu9GP0Y7RidCw0Y8g0LjQt9Cx0LXQttCw0YLRjCDQv9C+0YLQtdGA0Lgg0LrQvtC90YLQtdC60YHRgtCwXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9iamVjdCDQntCx0YrQtdC60YIsINC60L7QvdGC0LXQutGB0YIg0LrQvtGC0L7RgNC+0LPQviDQvdGD0LbQvdC+INC/0YDQuNCy0Y/Qt9Cw0YLRjFxuICovXG5mdW5jdGlvbiBiaW5kQWxsRnVuYyhvYmplY3QpIHtcbiAgZm9yICh2YXIgcHJvcGVydHkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3RbcHJvcGVydHldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvYmplY3RbcHJvcGVydHldID0gb2JqZWN0W3Byb3BlcnR5XS5iaW5kKG9iamVjdCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICog0KPRgdGC0LDQvdC+0LLQutCwINCyIGh0bWwg0L/QtdGA0LXQvdC+0YHQsCDRgdGC0YDQvtC6XG4gKiBAcGFyYW0ge1N0cmluZ30gIHRleHQg0KLQtdC60YHRgiBjINC/0LXRgNC10L3QvtGB0L7QvCDRgdGC0YDQvtC6INGH0LXRgNC10LcgXFxuXG4gKiBAcmV0dXJuIHtTdHJpbmd9ICAgICAg0KLQtdC60YHRgiDRgSDQv9C10YDQtdC90L7RgdC+0Lwg0YHRgtGA0L7QuiDRgSDQv9C+0LzQvtGJ0YzRjiDRgtC10LPQsCA8YnI+XG4gKi9cbmZ1bmN0aW9uIHNldEVudGVySW5UZXh0KHRleHQpIHtcbiAgcmV0dXJuIHRleHQucmVwbGFjZSgvXFxuL2csICc8YnI+Jyk7XG59XG5cbi8qKlxuICogW2lzSW1nRXhpc3RzU2V0SXQgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGltZ0VsZW1lbnQgRE9NLdGN0LvQtdC80LXQvdGCINC60LDRgNGC0LjQvdC60LhcbiAqIEBwYXJhbSB7U3RyaW5nfSB3aWR0aCAgICAgICDQqNC40YDQuNC90LAg0LrQsNGA0YLQuNC90LrQuFxuICogQHBhcmFtIHtTdHJpbmd9IGhlaWdodCAgICAgINCS0YvRgdC+0YLQsCDQutCw0YDRgtC40L3QutC4XG4gKiBAcGFyYW0ge1N0cmluZ30gc3JjICAgICAgICAg0JDQtNGA0LXRgSDQutCw0YDRgtC40L3QutC4XG4gKiBAcGFyYW0ge1N0cmluZ30gZGVmYXVsdFNyYyAg0JDQtNGA0LXRgSBkYWZhdWx0LdC60LDRgNGC0LjQvdC60LhcbiAqIEBwYXJhbSB7U3RyaW5nfSBhbHQgICAgICAgICBBbHQt0YLQtdC60YHRgiDQtNC70Y8g0LrQsNGA0YLQuNC90LrQuFxuICovXG5mdW5jdGlvbiByZW5kZXJJbWcoaW1nRWxlbWVudCwgd2lkdGgsIGhlaWdodCwgc3JjLCBkZWZhdWx0U3JjLCBhbHQpIHtcbiAgbGV0IGltZyA9IG5ldyBJbWFnZSgpO1xuICBpbWcuc3JjID0gc3JjO1xuXG4gIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICBzZXRJbWdQYXJhbXMoaW1nRWxlbWVudCwgd2lkdGgsIGhlaWdodCwgc3JjLCBhbHQpO1xuICB9O1xuXG4gIGltZy5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgc2V0SW1nUGFyYW1zKGltZ0VsZW1lbnQsIHdpZHRoLCBoZWlnaHQsIGRlZmF1bHRTcmMsIGFsdCk7XG4gIH07XG59XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINGE0L7RgtC+0LPRgNCw0YTQuNC4INC+0L/QtdGA0LDRgtC+0YDQsCwg0L7QsdGA0LDQsdCw0YLRi9Cy0LDRjtGJ0LXQs9C+INC+0LHRgNCw0YnQtdC90LjQtSDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbiAqIEBwYXJhbSB7U3RyaW5nfSB3aWR0aCAg0KjQuNGA0LjQvdCwINC60LDRgNGC0LjQvdC60LhcbiAqIEBwYXJhbSB7U3RyaW5nfSBoZWlnaHQg0JLRi9GB0L7RgtCwINC60LDRgNGC0LjQvdC60LhcbiAqIEBwYXJhbSB7U3RyaW5nfSBzcmMgICAg0JDQtNGA0LXRgSDQutCw0YDRgtC40L3QutC4XG4gKiBAcGFyYW0ge1N0cmluZ30gYWx0ICAgIEFsdC3RgtC10LrRgdGCINC00LvRjyDQutCw0YDRgtC40L3QutC4XG4gKi9cbmZ1bmN0aW9uIHNldEltZ1BhcmFtcyhpbWdFbGVtZW50LCB3aWR0aCwgaGVpZ2h0LCBzcmMsIGFsdCkge1xuICBpbWdFbGVtZW50LnNldEF0dHJpYnV0ZSgnd2lkdGgnLCB3aWR0aCk7XG4gIGltZ0VsZW1lbnQuc2V0QXR0cmlidXRlKCdoZWlnaHQnLCBoZWlnaHQpO1xuICBpbWdFbGVtZW50LnNldEF0dHJpYnV0ZSgnc3JjJywgc3JjKTtcblxuICBhbHQgPSBhbHQgPyBhbHQgOiAnJztcbiAgaW1nRWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2FsdCcsIGFsdCk7XG59XG5cbi8qKlxuICog0KTRg9C90LrRhtC40Y8sINC/0L7Qt9Cy0L7Qu9GP0Y7RidCw0Y8g0LLRi9C30YvQstCw0YLRjCDQtNGA0YPQs9GD0Y4g0YTRg9C90LrRhtC40Y4g0L3QtSDRh9Cw0YnQtSwg0YfQtdC8INC90LXQutC+0YLQvtGA0L7QtSDQv9GA0LXQtNC+0L/RgNC10LTQtdC70LXQvdC90L7QtSDQstGA0LXQvNGPXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZnVuYyAg0JLRi9C30YvQstCw0LXQvNCw0Y8g0YTRg9C90LrRhtC40Y9cbiAqIEBwYXJhbSAge051bWJlcn0gICB3YWl0INCf0LXRgNC40L7QtCDQvNC10LbQtNGDINCy0YvQt9C+0LLQsNC80Lgg0YTRg9C90LrRhtC40LhcbiAqIEByZXR1cm5cbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gdmFyIHRpbWVvdXQ7XG4gcmV0dXJuIGZ1bmN0aW9uKCkge1xuICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgdGltZW91dCA9IG51bGw7XG4gICBpZiAoIWltbWVkaWF0ZSkgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgfTtcbiAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICBpZiAoY2FsbE5vdykgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiB9O1xufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2pzL2NvbW1vbi91dGlscy5qc1xuICoqLyIsImV4cG9ydCBkZWZhdWx0IENvbnRhY3RzO1xuXG5pbXBvcnQgeyBwb3N0LCBnZXQsIHNob3dMb2FkaW5nT2sgfSBmcm9tICcuLy4uL2NvbW1vbi9hamF4JztcbmltcG9ydCB7IGRlZmF1bHRUZXh0LCBlcnJvck1lc3NhZ2VzIH0gZnJvbSAnLi8uLi9jb21tb24vbWVzc2FnZXMnO1xuaW1wb3J0IHsgY3JlYXRlRE9NRWxlbWVudCwgYWRkQ2xhc3MsIHJlbW92ZUNsYXNzLCB2YWxpZGF0ZUVtYWlsLCB2YWxpZGF0ZVBob25lLCBiaW5kQWxsRnVuYyxcbiAgICAgICAgc2hvd0Vycm9yLCBoaWRlRXJyb3IsIG9uRmllbGRzRm9jdXMgfSBmcm9tICcuLy4uL2NvbW1vbi91dGlscyc7XG5cbi8qKlxuICog0JrQvtC0INC60LvQsNCy0LjRiNC4ICdFbnRlcidcbiAqIEBjb25zdGFudFxuICogQHR5cGUge051bWJlcn1cbiAqL1xuY29uc3QgRU5URVJfQ09ERSA9IDEzO1xuXG4vKipcbiAqINCa0L7QvdGB0YLRgNGD0LrRgtC+0YAg0YLQuNC/0LAgJ9Ca0L7QvdGC0LDQutGC0Ysg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPJ1xuICogQHBhcmFtIHtTdHJpbmd9ICAgc2Vzc2lvbklkICAgICAg0JjQtNC10L3RgtC40YTQuNC60LDRgtC+0YAg0YHQtdGB0YHQuNC4INGA0LDQsdC+0YLRiyDQsiDRh9Cw0YLQtVxuICogQHBhcmFtIHtGdW5jdGlvbn0gc2hvd0RpYWxvZ0Z1bmMg0KTRg9C90LrRhtC40Y8g0L/QvtC60LDQt9CwINC00LjQsNC70L7Qs9CwINGH0LDRgtCwXG4gKi9cbmZ1bmN0aW9uIENvbnRhY3RzKHNlc3Npb25JZCwgc2hvd0RpYWxvZ0Z1bmMpIHtcbiAgYmluZEFsbEZ1bmModGhpcyk7XG4gIHRoaXMuc2Vzc2lvbklkID0gc2Vzc2lvbklkO1xuICB0aGlzLnNob3dEaWFsb2dGdW5jID0gc2hvd0RpYWxvZ0Z1bmM7XG59XG5cbi8qKlxuICog0J/QvtC70YPRh9C10L3QuNC1IERPTS3RjdC70LXQvNC10L3RgtCwINGC0LXQu9CwINGH0LDRgtCwXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGNoYXRCb2R5IERPTS3RjdC70LXQvNC10L3RgtCwINGC0LXQu9CwINGH0LDRgtCwXG4gKi9cbkNvbnRhY3RzLnByb3RvdHlwZS5zZXRDaGF0Qm9keSA9IGZ1bmN0aW9uKGNoYXRCb2R5KSB7XG4gIHRoaXMuY2hhdEJvZHkgPSBjaGF0Qm9keTtcbn07XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINGE0L7RgNC80Ysg0LLQstC+0LTQsCDQuCDQv9GA0L7RgdC80L7RgtGA0LAg0LrQvtC90YLQsNC60YLQvtCyINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1xuICovXG5Db250YWN0cy5wcm90b3R5cGUuX3JlbmRlckNvbnRhY3RzRm9ybSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNoYXRDb250YWN0c0Zvcm0gPSBjcmVhdGVET01FbGVtZW50KCdmb3JtJywge1xuICAgICdjbGFzcyc6ICducngtY2hhdF9fZm9ybSBucngtY2hhdF9fZm9ybS0tY29udGFjdHMnLFxuICAgICdhY3Rpb24nOiAnJ1xuICB9KTtcbiAgdGhpcy5jaGF0Qm9keS5hcHBlbmRDaGlsZCh0aGlzLmNoYXRDb250YWN0c0Zvcm0pO1xuICB0aGlzLmNoYXRDb250YWN0c0Zvcm0uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uQ29udGFjdHNGb3JtRW50ZXJEb3duKTtcblxuICAvLyDQn9C+0LTRgdC60LDQt9C60LAg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GOXG4gIHRoaXMuY2hhdENvbnRhY3RzVGlwID0gY3JlYXRlRE9NRWxlbWVudCgncCcsIHsnY2xhc3MnOiAnbnJ4LWNoYXRfX3RpcCd9KTtcbiAgdGhpcy5jaGF0Q29udGFjdHNUaXAuaW5uZXJUZXh0ID0gZGVmYXVsdFRleHQuY29udGFjdHNUaXBFbXB0eTtcbiAgdGhpcy5jaGF0Q29udGFjdHNGb3JtLmFwcGVuZENoaWxkKHRoaXMuY2hhdENvbnRhY3RzVGlwKTtcblxuICAvLyDQpNCw0LzQuNC70LjRj1xuICB0aGlzLmNoYXRTdXJuYW1lRmllbGQgPSBjcmVhdGVET01FbGVtZW50KCdkaXYnLCB7J2NsYXNzJzogJ25yeC1jaGF0X19maWVsZCd9KTtcbiAgdGhpcy5jaGF0Q29udGFjdHNGb3JtLmFwcGVuZENoaWxkKHRoaXMuY2hhdFN1cm5hbWVGaWVsZCk7XG5cbiAgdGhpcy5jaGF0U3VybmFtZUlucHV0ID0gY3JlYXRlRE9NRWxlbWVudCgnaW5wdXQnLCB7XG4gICAgJ3R5cGUnOiAndGV4dCcsXG4gICAgJ3BsYWNlaG9sZGVyJzogJ9Ck0LDQvNC40LvQuNGPJyxcbiAgICAnbmFtZSc6ICdzdXJuYW1lJyxcbiAgICAnbWF4bGVuZ3RoJzogJzM1J1xuICB9KTtcbiAgdGhpcy5jaGF0U3VybmFtZUZpZWxkLmFwcGVuZENoaWxkKHRoaXMuY2hhdFN1cm5hbWVJbnB1dCk7XG4gIHRoaXMuY2hhdFN1cm5hbWVJbnB1dC5mb2N1cygpO1xuICB0aGlzLmNoYXRTdXJuYW1lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBvbkZpZWxkc0ZvY3VzKTtcblxuICB0aGlzLmNoYXRTdXJuYW1lRXJyb3IgPSBjcmVhdGVET01FbGVtZW50KCdwJywgeydjbGFzcyc6ICducngtZXJyb3ItbWVzc2FnZSd9KTtcbiAgdGhpcy5jaGF0U3VybmFtZUZpZWxkLmFwcGVuZENoaWxkKHRoaXMuY2hhdFN1cm5hbWVFcnJvcik7XG5cbiAgLy8g0JjQvNGPXG4gIHRoaXMuY2hhdE5hbWVGaWVsZCA9IGNyZWF0ZURPTUVsZW1lbnQoJ2RpdicsIHsnY2xhc3MnOiAnbnJ4LWNoYXRfX2ZpZWxkJ30pO1xuICB0aGlzLmNoYXRDb250YWN0c0Zvcm0uYXBwZW5kQ2hpbGQodGhpcy5jaGF0TmFtZUZpZWxkKTtcblxuICB0aGlzLmNoYXROYW1lSW5wdXQgPSBjcmVhdGVET01FbGVtZW50KCdpbnB1dCcsIHtcbiAgICAndHlwZSc6ICd0ZXh0JyxcbiAgICAncGxhY2Vob2xkZXInOiAn0JjQvNGPJyxcbiAgICAnbmFtZSc6ICduYW1lJyxcbiAgICAnbWF4bGVuZ3RoJzogJzM1J1xuICB9KTtcbiAgdGhpcy5jaGF0TmFtZUZpZWxkLmFwcGVuZENoaWxkKHRoaXMuY2hhdE5hbWVJbnB1dCk7XG4gIHRoaXMuY2hhdE5hbWVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIG9uRmllbGRzRm9jdXMpO1xuXG4gIHRoaXMuY2hhdE5hbWVFcnJvciA9IGNyZWF0ZURPTUVsZW1lbnQoJ3AnLCB7J2NsYXNzJzogJ25yeC1lcnJvci1tZXNzYWdlJ30pO1xuICB0aGlzLmNoYXROYW1lRmllbGQuYXBwZW5kQ2hpbGQodGhpcy5jaGF0TmFtZUVycm9yKTtcblxuICAvLyDQntGC0YfQtdGB0YLQstC+XG4gIHRoaXMuY2hhdFBhdHJvbnltaWNGaWVsZCA9IGNyZWF0ZURPTUVsZW1lbnQoJ2RpdicsIHsnY2xhc3MnOiAnbnJ4LWNoYXRfX2ZpZWxkJ30pO1xuICB0aGlzLmNoYXRDb250YWN0c0Zvcm0uYXBwZW5kQ2hpbGQodGhpcy5jaGF0UGF0cm9ueW1pY0ZpZWxkKTtcblxuICB0aGlzLmNoYXRQYXRyb255bWljSW5wdXQgPSBjcmVhdGVET01FbGVtZW50KCdpbnB1dCcsIHtcbiAgICAndHlwZSc6ICd0ZXh0JyxcbiAgICAncGxhY2Vob2xkZXInOiAn0J7RgtGH0LXRgdGC0LLQvicsXG4gICAgJ25hbWUnOiAncGF0cm9ueW1pYycsXG4gICAgJ21heGxlbmd0aCc6ICczNSdcbiAgfSk7XG4gIHRoaXMuY2hhdFBhdHJvbnltaWNGaWVsZC5hcHBlbmRDaGlsZCh0aGlzLmNoYXRQYXRyb255bWljSW5wdXQpO1xuICB0aGlzLmNoYXRQYXRyb255bWljSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBvbkZpZWxkc0ZvY3VzKTtcblxuICB0aGlzLmNoYXRQYXRyb255bWljRXJyb3IgPSBjcmVhdGVET01FbGVtZW50KCdwJywgeydjbGFzcyc6ICducngtZXJyb3ItbWVzc2FnZSd9KTtcbiAgdGhpcy5jaGF0UGF0cm9ueW1pY0ZpZWxkLmFwcGVuZENoaWxkKHRoaXMuY2hhdFBhdHJvbnltaWNFcnJvcik7XG5cbiAgLy8g0J3QvtC80LXRgCDRgtC10LvQtdGE0L7QvdCwXG4gIHRoaXMuY2hhdFBob25lRmllbGQgPSBjcmVhdGVET01FbGVtZW50KCdkaXYnLCB7J2NsYXNzJzogJ25yeC1jaGF0X19maWVsZCd9KTtcbiAgdGhpcy5jaGF0Q29udGFjdHNGb3JtLmFwcGVuZENoaWxkKHRoaXMuY2hhdFBob25lRmllbGQpO1xuXG4gIHRoaXMuY2hhdFBob25lSW5wdXQgPSBjcmVhdGVET01FbGVtZW50KCdpbnB1dCcsIHtcbiAgICAndHlwZSc6ICd0ZXh0JyxcbiAgICAncGxhY2Vob2xkZXInOiAn0J3QvtC80LXRgCDRgtC10LvQtdGE0L7QvdCwJyxcbiAgICAnbmFtZSc6ICdwaG9uZScsXG4gICAgJ21heGxlbmd0aCc6ICcyNSdcbiAgfSk7XG4gIHRoaXMuY2hhdFBob25lRmllbGQuYXBwZW5kQ2hpbGQodGhpcy5jaGF0UGhvbmVJbnB1dCk7XG4gIHRoaXMuY2hhdFBob25lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCBvbkZpZWxkc0ZvY3VzKTtcbiAgdGhpcy5jaGF0UGhvbmVJbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCB0aGlzLl91c2VyUGhvbmVJc1ZhbGlkKTtcblxuICB0aGlzLmNoYXRQaG9uZUVycm9yID0gY3JlYXRlRE9NRWxlbWVudCgncCcsIHsnY2xhc3MnOiAnbnJ4LWVycm9yLW1lc3NhZ2UnfSk7XG4gIHRoaXMuY2hhdFBob25lRmllbGQuYXBwZW5kQ2hpbGQodGhpcy5jaGF0UGhvbmVFcnJvcik7XG5cbiAgLy8g0K3Qu9C10LrRgtGA0L7QvdC90LDRjyDQv9C+0YfRgtCwXG4gIHRoaXMuY2hhdEVtYWlsRmllbGQgPSBjcmVhdGVET01FbGVtZW50KCdkaXYnLCB7J2NsYXNzJzogJ25yeC1jaGF0X19maWVsZCd9KTtcbiAgdGhpcy5jaGF0Q29udGFjdHNGb3JtLmFwcGVuZENoaWxkKHRoaXMuY2hhdEVtYWlsRmllbGQpO1xuXG4gIHRoaXMuY2hhdEVtYWlsSW5wdXQgPSBjcmVhdGVET01FbGVtZW50KCdpbnB1dCcsIHtcbiAgICAndHlwZSc6ICdlbWFpbCcsXG4gICAgJ3BsYWNlaG9sZGVyJzogJ9Ct0LvQtdC60YLRgNC+0L3QvdGL0Lkg0LDQtNGA0LXRgScsXG4gICAgJ25hbWUnOiAnZW1haWwnLFxuICAgICdtYXhsZW5ndGgnOiAnMzUnXG4gIH0pO1xuICB0aGlzLmNoYXRFbWFpbEZpZWxkLmFwcGVuZENoaWxkKHRoaXMuY2hhdEVtYWlsSW5wdXQpO1xuICB0aGlzLmNoYXRFbWFpbElucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgb25GaWVsZHNGb2N1cyk7XG4gIHRoaXMuY2hhdEVtYWlsSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgdGhpcy5fdXNlckVtYWlsSXNWYWxpZCk7XG5cbiAgdGhpcy5jaGF0RW1haWxFcnJvciA9IGNyZWF0ZURPTUVsZW1lbnQoJ3AnLCB7J2NsYXNzJzogJ25yeC1lcnJvci1tZXNzYWdlJ30pO1xuICB0aGlzLmNoYXRFbWFpbEZpZWxkLmFwcGVuZENoaWxkKHRoaXMuY2hhdEVtYWlsRXJyb3IpO1xuXG4gIC8vINCj0L/RgNCw0LLQu9GP0Y7RidC40LUg0LrQvdC+0L/QutC4XG4gIHRoaXMuY2hhdENvbnRhY3RzRm9ybUNvbnRyb2xzID0gY3JlYXRlRE9NRWxlbWVudCgnZGl2JywgeydjbGFzcyc6ICducngtY2hhdF9fY29udHJvbHMnfSk7XG4gIHRoaXMuY2hhdENvbnRhY3RzRm9ybS5hcHBlbmRDaGlsZCh0aGlzLmNoYXRDb250YWN0c0Zvcm1Db250cm9scyk7XG5cbiAgdGhpcy5jaGF0Q2xvc2VDb250YWN0c0J0biA9IGNyZWF0ZURPTUVsZW1lbnQoJ2J1dHRvbicsIHtcbiAgICAnY2xhc3MnOiAnbnJ4LWJ0bi1jbG9zZS1jb250YWN0cycsXG4gICAgJ3R5cGUnOiAnYnV0dG9uJ1xuICB9KTtcbiAgdGhpcy5jaGF0Q2xvc2VDb250YWN0c0J0bi5pbm5lckhUTUwgPSAnPDwg0JLQtdGA0L3Rg9GC0YzRgdGPINC6INC00LjQsNC70L7Qs9GDJztcbiAgdGhpcy5jaGF0Q29udGFjdHNGb3JtQ29udHJvbHMuYXBwZW5kQ2hpbGQodGhpcy5jaGF0Q2xvc2VDb250YWN0c0J0bik7XG4gIHRoaXMuY2hhdENsb3NlQ29udGFjdHNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLnNob3dEaWFsb2dGdW5jKTtcblxuICB0aGlzLmNoYXRTZW5kQ29udGFjdHNCdG4gPSBjcmVhdGVET01FbGVtZW50KCdidXR0b24nLCB7XG4gICAgJ2NsYXNzJzogJ25yeC1idG4tc2VuZC1jb250YWN0cycsXG4gICAgJ3R5cGUnOiAnc3VibWl0J1xuICB9KTtcbiAgdGhpcy5jaGF0U2VuZENvbnRhY3RzQnRuLmlubmVySFRNTCA9ICfQodC+0YXRgNCw0L3QuNGC0YwnO1xuICB0aGlzLmNoYXRDb250YWN0c0Zvcm1Db250cm9scy5hcHBlbmRDaGlsZCh0aGlzLmNoYXRTZW5kQ29udGFjdHNCdG4pO1xuICB0aGlzLmNoYXRTZW5kQ29udGFjdHNCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNvbnRhY3RzU2VuZENsaWNrKTtcbn07XG5cbi8qKlxuICog0J7RgtC+0LHRgNCw0LbQtdC90LjQtSDQutC+0L3RgtCw0LrRgtC+0LIg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXG4gKi9cbkNvbnRhY3RzLnByb3RvdHlwZS5zaG93Q29udGFjdHMgPSBmdW5jdGlvbigpIHtcbiAgLy8g0J7RgtGA0LjRgdC+0LLQutCwINGE0L7RgNC80YtcbiAgaWYodGhpcy5jaGF0Q29udGFjdHNGb3JtKSB7XG4gICAgcmVtb3ZlQ2xhc3ModGhpcy5jaGF0Q29udGFjdHNGb3JtLCAnaGlkZGVuJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fcmVuZGVyQ29udGFjdHNGb3JtKCk7XG4gIH1cblxuICAvLyDQn9C+0LvRg9GH0LXQvdC40LUg0LrQvtC90YLQsNC60YLQvtCyINGBINGB0LXRgNCy0LXRgNCwINC4INC30LDQv9C+0LvQvdC10L3QuNC1INC40LvQuCDRhNC+0YDQvNGLXG4gIGxldCBzZWxmID0gdGhpcztcblxuICBsZXQgcGFyYW1zID0ge1xuICAgICdhY3Rpb24nOiAnZ2V0Q29udGFjdHMnLFxuICAgICdzZXNzaW9uJzogdGhpcy5zZXNzaW9uSWRcbiAgfTtcblxuICBnZXQocGFyYW1zLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgIGlmKHJlc3BvbnNlLnJlc3VsdCkge1xuICAgICAgLy8g0KHQvtGF0YDQsNC90LXQvdC40LUg0LIgbG9jYWxTdG9yYWdlINC/0YDQuNC30L3QsNC60LAg0L4g0YLQvtC8LCDRh9GC0L4g0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GMINGA0LDQvdC10LUg0YPQttC1INGD0LrQsNC30LDQuyDRgdCy0L7QuCDQtNCw0L3QvdGL0LVcbiAgICAgIGlmKHJlc3BvbnNlLmVtYWlsIHx8IHJlc3BvbnNlLnBob25lKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCducngtdXNlclNldENvbnRhY3RzJywgJ3RydWUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCducngtdXNlclNldENvbnRhY3RzJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vINCa0L7QvdGC0LDQutGC0L3QsNGPINC40L3RhNC+0YDQvNCw0YbQuNGPINC+INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtSDQvdC1INC/0L7Qu9GD0YfQtdC90LAgKNGB0LXRgNCy0LXRgCDQstC10YDQvdGD0LsgcmVzdWx0PWZhbHNlKVxuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ25yeC11c2VyU2V0Q29udGFjdHMnKTtcbiAgICB9XG5cbiAgICAvLyDQntGC0YDQuNGB0L7QstC60LAg0L/QvtC00YHQutCw0LfQutC4INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjlxuICAgIGlmKCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbnJ4LXVzZXJTZXRDb250YWN0cycpICkge1xuICAgICAgc2VsZi5jaGF0Q29udGFjdHNUaXAuaW5uZXJUZXh0ID0gZGVmYXVsdFRleHQuY29udGFjdHNUaXBGdWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLmNoYXRDb250YWN0c1RpcC5pbm5lclRleHQgPSBkZWZhdWx0VGV4dC5jb250YWN0c1RpcEVtcHR5O1xuICAgIH1cblxuICAgIC8vINCf0YDQvtGB0YLQsNCy0LvQtdC90LjQtSDQv9C+0LvRg9GH0LXQvdC90L7QuSDQvtGCINGB0LXRgNCy0LXRgNCwINC60L7QvdGC0LDQutGC0L3QvtC5INC40L3RhNC+0YDQvNCw0YbQuNC4INCyINC/0L7Qu9GPINGE0L7RgNC80YtcbiAgICBzZWxmLmNoYXRFbWFpbElucHV0LnZhbHVlID0gcmVzcG9uc2UuZW1haWwgfHwgJyc7XG4gICAgc2VsZi5jaGF0UGhvbmVJbnB1dC52YWx1ZSA9IHJlc3BvbnNlLnBob25lIHx8ICcnO1xuICAgIHNlbGYuY2hhdFN1cm5hbWVJbnB1dC52YWx1ZSA9IHJlc3BvbnNlLnN1cm5hbWUgfHwgJyc7XG4gICAgc2VsZi5jaGF0TmFtZUlucHV0LnZhbHVlID0gcmVzcG9uc2UubmFtZSB8fCAnJztcbiAgICBzZWxmLmNoYXRQYXRyb255bWljSW5wdXQudmFsdWUgPSByZXNwb25zZS5wYXRyb255bWljIHx8ICcnO1xuICB9KTtcblxuICAvLyDQo9GB0YLQsNC90L7QstC60LAg0YTQvtC60YPRgdCwINCyINC/0LXRgNCy0L7QtSDQv9C+INGB0L/QuNGB0LrRgyDQv9C+0LvQtVxuICB0aGlzLmNoYXRTdXJuYW1lSW5wdXQuZm9jdXMoKTtcbn07XG5cbi8qKlxuICog0KHQutGA0YvRgtC40LUg0YTQvtGA0LzRiyDQutC+0L3RgtCw0LrRgtC+0LIg0L/QvtC70YzQt9C+0LLQsNGC0LXQu9GPXG4gKi9cbkNvbnRhY3RzLnByb3RvdHlwZS5jbG9zZUNvbnRhY3RzID0gZnVuY3Rpb24oKSB7XG4gIGlmKHRoaXMuY2hhdENvbnRhY3RzRm9ybSkge1xuICAgIGFkZENsYXNzKHRoaXMuY2hhdENvbnRhY3RzRm9ybSwgJ2hpZGRlbicpO1xuICAgIGhpZGVFcnJvcih0aGlzLmNoYXRFbWFpbElucHV0KTtcbiAgICBoaWRlRXJyb3IodGhpcy5jaGF0UGhvbmVJbnB1dCk7XG4gIH1cbn07XG5cbi8qKlxuICog0J7Rh9C40YHRgtC60LAg0YTQvtGA0LzRiyDQutC+0L3RgtCw0LrRgtC90L7QuSDQuNC90YTQvtGA0LzQsNGG0LjQuCDQviDQv9C+0LvRjNC30L7QstCw0YLQtdC70LVcbiAqL1xuQ29udGFjdHMucHJvdG90eXBlLmNsZWFyQ29udGFjdHNGb3JtID0gZnVuY3Rpb24oKSB7XG4gIGlmKHRoaXMuY2hhdENvbnRhY3RzRm9ybSkge1xuICAgIGxldCBmaWVsZHMgPSB0aGlzLmNoYXRDb250YWN0c0Zvcm0ucXVlcnlTZWxlY3RvckFsbCgnLm5yeC1jaGF0X19maWVsZCcpO1xuICAgIGZvcihsZXQgaSA9IDA7IGkgPCBmaWVsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZpZWxkc1tpXS5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLnZhbHVlID0gJyc7XG4gICAgICBmaWVsZHNbaV0ucXVlcnlTZWxlY3RvcignLm5yeC1lcnJvci1tZXNzYWdlJykuaW5uZXJUZXh0ID0gJyc7XG4gICAgICByZW1vdmVDbGFzcyggZmllbGRzW2ldLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JyksICdlcnJvcicgKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICog0J/RgNC+0LLQtdGA0LrQsCDRg9C60LDQt9Cw0L3QvdC+0LPQviDQv9C+0LvRjNC30L7QstCw0YLQtdC70LXQvCBlbWFpbCDQvdCwINC60L7RgNGA0LXQutGC0L3QvtGB0YLRjCAo0YHQvtC+0YLQstC10YLRgdGC0LLQuNC1INGE0L7RgNC80LDRgtGDKVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuQ29udGFjdHMucHJvdG90eXBlLl91c2VyRW1haWxJc1ZhbGlkID0gZnVuY3Rpb24oKSB7XG4gIGlmKHRoaXMuY2hhdEVtYWlsSW5wdXQudmFsdWUgJiYgIXZhbGlkYXRlRW1haWwodGhpcy5jaGF0RW1haWxJbnB1dC52YWx1ZSkpIHtcbiAgICBzaG93RXJyb3IodGhpcy5jaGF0RW1haWxJbnB1dCwgZXJyb3JNZXNzYWdlcy5lbWFpbEZvcm1hdCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiDQn9GA0L7QstC10YDQutCwINGD0LrQsNC30LDQvdC90L7Qs9C+INC/0L7Qu9GM0LfQvtCy0LDRgtC10LvQtdC8INC90L7QvNC10YDQsCDRgtC10LvQtdGE0L7QvdCwINC90LAg0LrQvtGA0YDQtdC60YLQvdC+0YHRgtGMICjRgdC+0L7RgtCy0LXRgtGB0YLQstC40LUg0YTQvtGA0LzQsNGC0YMpXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5Db250YWN0cy5wcm90b3R5cGUuX3VzZXJQaG9uZUlzVmFsaWQgPSBmdW5jdGlvbigpIHtcbiAgaWYodGhpcy5jaGF0UGhvbmVJbnB1dC52YWx1ZSAmJiAhdmFsaWRhdGVQaG9uZSh0aGlzLmNoYXRQaG9uZUlucHV0LnZhbHVlKSkge1xuICAgIHNob3dFcnJvcih0aGlzLmNoYXRQaG9uZUlucHV0LCBlcnJvck1lc3NhZ2VzLnBob25lRm9ybWF0KTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqINCe0LHRgNCw0LHQvtGC0YfQuNC6INGB0L7QsdGL0YLQuNGPINC90LDQttCw0YLQuNGPINC90LAg0LrQvdC+0L/QutGDINC+0YLQv9GA0LDQstC60Lgg0LrQvtC90YLQsNC60YLQvtCyINC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRj1xuICovXG5Db250YWN0cy5wcm90b3R5cGUuX29uQ29udGFjdHNTZW5kQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAvLyDQldGB0LvQuCDQv9C+0LvRjyDRhNC+0YDQvNGLINC30LDQv9C+0LvQvdC10L3RiyDQvdC10LLQtdGA0L3Qviwg0L7RgtC+0LHRgNCw0LbQsNGO0YLRgdGPINGB0L7QvtCx0YnQtdC90LjRjyDQvtCxINC+0YjQuNCx0LrQsNGFXG4gIGlmKCF0aGlzLmNoYXRFbWFpbElucHV0LnZhbHVlICYmICF0aGlzLmNoYXRQaG9uZUlucHV0LnZhbHVlKSB7XG4gICAgc2hvd0Vycm9yKHRoaXMuY2hhdEVtYWlsSW5wdXQsIGVycm9yTWVzc2FnZXMubmVlZEZpbGxMZWFzdE9uZUZpZWxkKTtcbiAgICBzaG93RXJyb3IodGhpcy5jaGF0UGhvbmVJbnB1dCwgZXJyb3JNZXNzYWdlcy5uZWVkRmlsbExlYXN0T25lRmllbGQpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vINCV0YHQu9C4INC/0L7Qu9GPINGE0L7RgNC80Ysg0LfQsNC/0L7Qu9C90LXQvdGLINCy0LXRgNC90L4sINGE0L7RgNC80LAg0L7RgtC/0YDQsNCy0LvRj9C10YLRgdGPINC90LAg0YHQtdGA0LLQtdGAINC4INGB0LrRgNGL0LLQsNC10YLRgdGPINC40Lcg0YfQsNGC0LBcbiAgaWYodGhpcy5fdXNlckVtYWlsSXNWYWxpZCgpICYmIHRoaXMuX3VzZXJQaG9uZUlzVmFsaWQoKSkge1xuICAgIGxldCBzZWxmID0gdGhpcztcbiAgICBsZXQgcGFyYW1zID0ge1xuICAgICAgJ2FjdGlvbic6ICdjb250YWN0cycsXG4gICAgICAnc2Vzc2lvbic6IHRoaXMuc2Vzc2lvbklkLFxuICAgICAgJ3Bob25lJzogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5yeC1jaGF0X19mb3JtLS1jb250YWN0cyBpbnB1dFtuYW1lPVwicGhvbmVcIl0nKS52YWx1ZSxcbiAgICAgICdlbWFpbCc6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ucngtY2hhdF9fZm9ybS0tY29udGFjdHMgaW5wdXRbbmFtZT1cImVtYWlsXCJdJykudmFsdWUsXG4gICAgICAnc3VybmFtZSc6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ucngtY2hhdF9fZm9ybS0tY29udGFjdHMgaW5wdXRbbmFtZT1cInN1cm5hbWVcIl0nKS52YWx1ZSxcbiAgICAgICduYW1lJzogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5yeC1jaGF0X19mb3JtLS1jb250YWN0cyBpbnB1dFtuYW1lPVwibmFtZVwiXScpLnZhbHVlLFxuICAgICAgJ3BhdHJvbnltaWMnOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubnJ4LWNoYXRfX2Zvcm0tLWNvbnRhY3RzIGlucHV0W25hbWU9XCJwYXRyb255bWljXCJdJykudmFsdWVcbiAgICB9O1xuXG4gICAgcG9zdChwYXJhbXMsIGZ1bmN0aW9uKCkge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ25yeC11c2VyU2V0Q29udGFjdHMnLCAndHJ1ZScpO1xuICAgICAgc2VsZi5zaG93RGlhbG9nRnVuYygpO1xuICAgICAgc2hvd0xvYWRpbmdPayhkZWZhdWx0VGV4dC5jb250YWN0c1NhdmVkKTtcbiAgICB9KTtcbiAgfVxufTtcblxuLyoqXG4gKiDQntCx0YDQsNCx0L7RgtGH0LjQuiDRgdC+0LHRi9GC0LjRjyDQvdCw0LbQsNGC0LjRjyDQutC70LDQstC40YjQuCAnRW50ZXInINC/0YDQuCDQt9Cw0L/QvtC70L3QtdC90LjQuCDRhNC+0YDQvNGLINC60L7QvdGC0LDQutGC0L7QsiDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICovXG5Db250YWN0cy5wcm90b3R5cGUuX29uQ29udGFjdHNGb3JtRW50ZXJEb3duID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEVOVEVSX0NPREUpIHtcbiAgICB0aGlzLl9vbkNvbnRhY3RzU2VuZENsaWNrKGV2ZW50KTtcbiAgfVxufTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2pzL2NvbXBvbmVudHMvQ29udGFjdHMuanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblx0XCJtZXNzYWdlXCI6IFwiZGF0YTphdWRpby9tcDM7YmFzZTY0LC8rT0F4QUFBQUFBQUFBQUFBRWx1Wm04QUFBQVBBQUFBQ2dBQUVmUUFHUmtaR1JrWkdSa1pNek16TXpNek16TXpNMHhNVEV4TVRFeE1URXhtWm1abVptWm1abVptZ0lDQWdJQ0FnSUNBZ0ptWm1abVptWm1abVptenM3T3pzN096czdPenM4ek16TXpNek16TXpPYm01dWJtNXVibTV1Ym0vLy8vLy8vLy8vLy9BQUFBT1V4QlRVVXpMams0Y2dFM0FBQUFBQUFBQUFBVVFDUUdNQ0lBQUVBQUFCSDAwV1o2aHdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUEvK09BeEFCZy9Db2tBVS9nQVFrQkxGOGI0bTR1WmN6bkoySm9RaENLc2F2WjhLeER6clE4MHpUSjJUc3VacHRjZHgvSXhTVWtNTllYWWl1aExMdmxsd0NBUUVBeTQ2NjZabGFYNWNNd0NCekJZUE1KaFV3dUZ6RElkTVNpRXhzTWpHUXdNWEM0eGNNakd3Nk1mRUl5QUtndWNUZHNqUGhhdzcxRmpRd25OZHhVNlRXenFNdk4vc0V6K054UVFHV3pXWjFPWm1zdm1WeW1aUktKazhtbVJ5Q1k1RjVpY05tSUFvWVNCd0NDREhRdUFUQklQTUpoY3d5SFRFSWJNV0NZeE1KREVBYU1LQTR3TUFFckhwTGRtQndTWVdDeGhZS0dFQWNZTUJSZ2dFR0NBTUFnSW1vOFpad3dBQUFFQUN6QmVCTUJ4SlpoYjFVc2NyeHVOeHVISXhTY3pwNVcvN08xU0xFYTVGTHJ0dGJaMjE5bkRrUTVqSzRiZitOMDlqbTg2ZW5wNmVucE1PWjA5UEs0M0w0eEdKWlNZYnJ5dC8zSWNoeUhJY2lITHpwcUJsbERBQUFBd0FSOGJxQ1FDWUhBNEtBN3RBRUJtQXdDWEhVSFltNzh2N1NQKy84UHh1WDA5dlA5NTUxNmVueno3Ly8vLy8vLy8vLy8vMy8vV0dHSE81NTUwOVBiMVNQL0Q4dnA4dzhQQUJDWWdwcUtabHh5Y0Z4a0FBQUFBQUFBLytPQ3hBQmlwQnF5WDVyNkFrQTBIRElxemdlQndlQjB1RmtEdUFuanMvWTlLRlFYUEg4M2dUbXRjejZYOUx3d2pIOVVtSEc3c0lNQUhBSEFzQVM2M3JmNGE2WUFvQU9HQWpnaEJnWkFHNllHSUJqbUFnQVdYL3ZEUHY3L013ZUlHRk1MNElFekd4VWdNMGlYODNOWUpKaERJc3lYeTFHYWpZazZwbi8vWDZNT2tDS1RCOEFaY3dZRU9hTUpXRE9UREJBc3NEQkhKZ1R3TkRLYW1mZWQ3K1dPZU92TUhzQ0p6QndnWEV3REVCcE1DR0FFVEFNUW44eGMwSXRNQytBQkRBQkFFTXdFc0EwM3I4OVk5Lys3L25LM00vTUFrQWF6QU5BRVF3RFlBcE1BMEFPd0lBVWpBRGVZRllCUW1BZEFKeGdIUUR5WURRQU5oUUErTUFzQUkvejcvLy84Ny8xOHNjczliNWovZEdBR0FDSWpBRURBS0FCTXdCNEFuQ0FBWXdCRUF0TUEyQUV6QUlBQ2tFZ0JaZ0FRQStZRW9CUG1BT0FSUmdkNHJxWVdpRUFHQU1BVUgvLy8vLy8vK1BQN2p2bXY3djkvdi8wWUFXQVZHQUpnRXlDa1FEZ0E0VUFEU3laZnB1N3l4bExsWFRMRXltbUxEdmV6RXdBc0FTMXYvLy8vLy9mOC9lc3VVLy8vLy8vLy8vLy8vLzF0ZWM2MHhCVFVVekxqazRMaklQL2pnc1FBWGF4dVRFZVo2QUVJQUFBQUFVQktoaXJGTkd5bXh3QUNLQlJvZy9zWlk2Q2hpOFZKR252aWxaWVl1OVZ3clJXL2kwbHhjSHg1K2NOZDFTVENwVWlXYnlOcHJsUSt3NHVza003N09IRlJ5UlpBd0RtQjRIaGdWbVJJVW1GUW5HRXdDTXhJUWtNS0RTTkdwOE1oaEJNUmhKTURBVk1EUklNSXhyQXhSbVdoRmdVT0RBd0JqQWdCRUJrNmo0ckExc01BNTFnUUM1Z0dBU0tTQllGQVl3UkNnRWdxQ0FHWXdsZVhvVUljMW1pUTcyckNDZ09tRUFTbWxoN0dLWXpxdVdnam9EZ2FRdE1FQW5NQVNBTXN4d01UeG9VWmJNNUxwWXA0dVVrYXo4TGdBRndDV0sxMlFRZERzelFYODlHRUlBaVFLSU90YWJESDNGbXQwc3hTdEFrVWFtYTB1NUtKWlAySytXVy95ejN2ZGUzUXdQU2R5MVozVGIzV3UyWTh6MEVBTVlDZ0REMHhYcGJGdVhVdEJIb2JoaCtRS0J3R0JwZ1ZpcHpYNi9EZjVkN3Y5MU82cG12dEpwcGUvUFl0K1VidHpjeGF1emtOUHMrbnZ2TVg4dVhzczgvd3JXWmZFNVU3ak9FM3djQmR6ZjYvZi8vMWNOMXMvL3c0RUliMVBLSmlDbW9wbVhISndYR1FBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUQvNDRMRUFHRWNkakFGbStBQUVDQkczQWdBaCtSQ29ZVHd1U2R4aG9TV0NNd2NZcjNRTUZoZ0dZcUlHR2lGN3pBQUlNRUFBQkF4VzF2Ym45NllIQWFMU2xhLzNoUWtsM1pyZjUrT0FNdU1BZ0F0SjViN0FVOWdLQURBWUkvV3J0aG41UUFUQndWQUFqQm9HTEFwU3BRVlNKWncrOG5xVTZFOHdTRjRnNXlIb0lBWUdDd1VFQUpBQWtGU3FBWUJjR013OUo1ZTljS2hsc2tHUCt3UlRVU0JBT0FRWEVES2hvQUdKaGlZc0lBQ0lobUFrSmltQWdhSVFRTkFjeFlKekN4NE12azQxc2xUZENOUitVeEN3SEN3WU1MakVDamt5MFNEak9rRWh3SUFmVkJRSlVvUkhMN016WG9pcXlocWFQUmlZRmhRRUFZQWwzVit1NnpsckwvUzZtMlpCQlFRR1N5ckdtVjA4SmwwYXUwR0x0c2NUbGNSemxobkhkVmxMeU5lYVU4N0xXazYxckxQZU90WmZ2KzZ0WHBUeTMycnl0YS82MHNxdDY3enBQY3lsNFc5Y3Awbm5YYTlMSldWU1JleThaR0FBYVJCSEw5WHJPcmx1bHVkejNWcHJtNktkMVh5bE1xclRFN2RyVXM3YmhxLzhaZnlJVnA0RUFGV0dETVkxSy8vNVBUV1pxekpmLzVYWnNVRmk0bUlLYWltWmNjbkJjWkFBQUFBQUFBQS8rT0N4QUJpQkhZb0paem9BQUlBZ1FVZ25NUEVNQ0UzNFZkdWtmS2VibTMwTjBjL1ZoVGZWOHFUUEhkRkdZWjd1V1E5ZXdsRU52MDdUbExuWFpTbDBBdUFvWUI5RzR6SUkwbGFvK3JPekJNWXdEQVF3REFrVkN3eCtGNHp6TWt5VkNjd3VDZ0tnYUtneVpSa1ViTFJpWm1rR1lFaE9BQURNSmc1TWJpZE1UU0lNVndJQmdJQ3cxR0RRSUxaQ0FrQ29EaXdEbHd6RFlGREJ3REJFQXcwQTQwQWFiY1ZJQU5FQUJnd0IxYmg0QWdjQnlUREVpK0RiTmNJUURGZ3NZZ3hKREpnczVPdUFLQUNZUGdPMHVHMkdJV29VcW1FWUNMYk1CQURXK2wrdlZkY0VZUmZDSDVSQWxITExGeU1UanZ3L1R6a2hzU3V2YXBIVGFlcHBEa3cvakVHOGUrUFF3MSs5WHNaMjZldFNUVWdsN0pJdlZpMVM5VHkvYzVMS1NINHZSclFFQU1Fd2RxQ08vSzdyOXcrL0dPMzBmeVdROGxVbDgvOHN1M3BYUGI1dWx3dVc0aFlpTlNMU3pDa1p4RUlQa2NjdFN5Z3ZXMzhsRVpoMTNPUkovRkgxaDQzSGFkLzM3Y0NYeHQySkJEa1FrRDJ5UGpxSzNrQUFrQUNVc1gxR3FLSi8vc25rY1hkMkI1WC8rSEFsT1E1S3E4WlRFRk5SVE11T1RndU1nQUFBUC9qZ3NRQVdpUmlLT2ZjMkFBSlNTbFVjSUdaalFOaHdCaHhBVXJFcmF4eFFKNUU1bDFNeFN0YnhsVEVwOXJURXBlNkxMWnh3bUpTS0duK3Z2cTEyQlhpWE5DbWRMRE52REs1WkxRT2ZGbEhuU1Z1ZmlaWFpRTEJTaUdWYTRvaExWVUtnQ0RRWURGQTBIbWl0Smpib2VoaEFxNU1ERUROaEovekNCWkdraEFSb1BkRXVQRlVHNVF0Rmo2bjFnRzNjSjBYZW9tUHZvMGgvV1ZOSWhVT1NoZlRUbmhiNTVWVVljZVZhY01yMUZRQUVnd0dNbDlHS0NvWEJUQ1dJQ1NaaVRZWUFJRGdJQWpOc3hNR0l4SkRLOWVsa01mZWgxb1ZZck5PZHFra00zRGxXWFVsMkNvSmpPTXBnbUhZWnV5YWd4eDVacFl6Rll6V25wVmFwdnY0Wi9UWEsxTlRVRS9EMTJ4all5clVrOUVMRDR6OE9vWnBPR0dBeTFaNUVkMGw1dXVxVmViT1ZEWFphSTFwalZuRnozMGFIQStMTW85R29lZDUrb1lydXk0anpycmY1c2pwUDlLb1puYTc4M3FmQy9hajhweG9iTTQzdFB1UDNwZFZoREJXR3B2dFZqY1AxN1V6WTNaeTdWdDJMRnJtTWJwMHhCVFVVekxqazRMaklBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFELzQ0TEVBRjdNWWhSRTV2RDlHbHlUM1FyRVFRUkZZdXp0a3l6VmcxaEVNbUFybVlLMEpqclEyek9PMzd1Tis2ak4ydU03WncwOW5hN0dWdHdWTzRrTnQyWiswdUVia3p3dTVGM1ZubmhkQm5iNVBTL0N3S3pWVlZBaTJTQVl3RUdNSERqRlJReDAwTkROREZ6QTJDM1BxM3dPTW1tcVFZakJjR0VncFFGaUtOeGVJdHNtRW5NV1dUNlFGS0RGMVd6SUNVNldtcjVSUmpMK3EzT003cXQwdmlqd05UWEJTdGhTT1RUY05oQmNPRU1PRWhVUWtna1NyRkZCWVVGekZsdzJ4d01lUFRTQVpQZ1lnQ0FoY3lscnZyS2dOMjNsZXhqN1haMS9tanY1QU1BU0tJNFB0S1k2N1Z4WFVobGpPbzIvRHBQMDVVQnZsSG4zWnk5RjFsTkhTczZhZE11bFRWZXkzODVUWnJ5Mk00MEVXdjFKVmJ5bDBhcFgxY21BVTBTMExxS2JUN0lYbG1uNWRtQmEwUmdXclFVRDJURURUa0R5cDBHWHczSFhlZnVEWGlmdU92SEFqM1BlM1oxcU9sZjJIWGdmNTJLelhuMWdSOHV3ZkRrQU5lY21JTzFEemRvdS9qdE5GTXhVd0RDQkRXSVJLZmhwM290SVoyeExYbmVLdk5PNUtYNGxDeVlncHFLWmx4eWNGeGtBQUFBQUFBQUFBQUFBQUFBQUFBQUEvK09DeEFCZmZHbmtBdVp4NENHMGNNYzNKeGs0V21GeFlEZzhvdUVBV3lzcHZZZWhtZ3hWdWUreXdHVnQyZ2F0SFpOM0tJeDJZaTBxZ2xydGltcG96R2IwYXRhdVA5WG1ia1Jpc1JkMk15MmxsVC9XNmpXbmVhMHNNV3FMZ2dBQm1CQUtCZ0ttQ3UxWXJxeXFDbUpROC96L05hYTgxcFlabkw4ekxXWXJETGtxWXFsYTBwa29NenBkeW1TS1ViVldaYUZnQ1g1Z01BQVZPRnJTMGpBNGNNTkNreFVGUkdEQjBNbUxCZVpTU0pxWW9taTZjZXoyeHVBMm9TalVoTkpVNEh3TXlZUnBvRm1JR2dHTHZGa2tGbDNMR1hjMDZ5eUZUV0hZWmRseGJNUmNtL0dha2FwbzFHcGRXaUxreTJ0ZmxNN1RXNVZHdTY3Vm1IS2ZxNWZwYUJ5cGUxbHJzT3cwNVVXdXkyZ2Y2WFZxV295cHAwQXdLK3pPbXZYS0YrVzdGL2tBVFRzbkNhNjlTZ1RiTkpVMW9tNHBlcW1odHJza2g2Wm5GekwrVFNRQlBtd0ZYTDFOc3dGWXNQWXhLTGFsVEFpMVNBNUxZQkdWOUVrZWk1U2x5aHBaRjczNWdwQk1XaVlNcmNCUkdVRG11VkluQmJnQVJGNm1lb1NXSlJkTDFtc1RURmRoNW5CaTFYaVlncHFLWmx4eWNGeGtBQUFBQUFBQUFBQUFBQUFBQVAvamdzUUFXQ3hsQ0FUYWN6d0hUWjRJenFQQU1RWXE2bWJLeG9wdWFFTkdjZ1lZcUFZeE1GRGlRVkFnWUFnOGFFQjRHUnhXTXdKbnJDR2x0Y2Z1QkpmU1VGRFV0enN1bE1la3Nkb0tHWVhVWFVYVFVtdzBoSWlwUlJ0aHBDUkZUaTY3QjhsRlFoR2hzWUR4Y29qWWJodVpLS3lwWTZjT2xUaGRSdGg4Wk5JVVJDUkRJZUxsQ2hHZ1Brb3FJUThIeGs0WFFHektKQ3NXT2xFYkJwQ3NtbkJ0bEVRbGpwUlNjUDR5VldMSFVCc3lURUkwTWpJMGRPSFRrbGprZmd0L0hYYUNwc2w2a2NrcWdVazhtK3BRc2RpaTltY3VsQnNkbFVPdU1zVkhwRUZENHFBampJTVdNMDBTOE9jUTRvVFR3QkdwTG9LNkFtOHpJRGZIR3pUaEtNNWtHdEVxcFZQRVF4ZWRMeGxiQ2taUkdNRkVRQTJJWUJWOHhrZ05lSmFtdVFDQVF1SUZ5Q0FzVUlMTGlSQTBVV3RCb0FnRENnb2hJR0NTb01LaWx6Qy82S0NkYkYxZXBGSVlvaEl1cGFKanBxTDFWTXBTb3NzdGRqSjJvdE9ZY3ZsWUJUZFFrdmtYQkhRRWIyVHZrbUlLYWltWmNjbkJjWkFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBRC80NExFQUFBQUEwZ0FBQUFBVEVGTlJUTXVPVGd1TWdBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBXCIsXG5cdFwib3BlblwiOiBcImRhdGE6YXVkaW8vbXAzO2Jhc2U2NCxTVVF6QXdBQUFBQWZkbEJTU1ZZQUFBQU9BQUJRWldGclZtRnNkV1VBSVFBQUFGQlNTVllBQUFBUkFBQkJkbVZ5WVdkbFRHVjJaV3dBZXdRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBUC9qZ01RQUFBQUFBQUFBQUFCSmJtWnZBQUFBRHdBQUFBc0FBQk9XQUJjWEZ4Y1hGeGNYRnk0dUxpNHVMaTR1TGtWRlJVVkZSVVZGUlYxZFhWMWRYVjFkWFhSMGRIUjBkSFIwZEl1TGk0dUxpNHVMaTZLaW9xS2lvcUtpb3JxNnVycTZ1cnE2dXRIUjBkSFIwZEhSMGVqbzZPam82T2pvNlAvLy8vLy8vLy8vL3dBQUFEbE1RVTFGTXk0NU9ISUJOd0FBQUFBQUFBQUFGRUFrQm9BaUFBQkFBQUFUbHJzM1JHUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQVAvamdNUUFZbHh1UktsUHdBQWlCYnhDd0hjQmJCdm5HdUZRWDhJNERrQnlCcUJjQzRJWXJIaXZPY2c0bTRtNHVaQ3pyajUzSDBZWXV4ZGpFSGNzVk1aVzdiRDEzc1RjZWYzbnFNT3d6aG5EWEljcDZlVnh1bmxjYmh0LzJjTmNkeVdjenQ1UXd6dG5ibHkvVVloeWlodFlSVWpFSDRxdTJ6dDM3VGhyRHFuY2Q0Qy9oWkJKQkk4M09OaGtjRzdsL3k1YUtiTDVwaDdYNTUyRjJLa1dJeENITzhydzI3Ymx1VzVjWHZhcElZYXd3eGRpN0d1T08vOFB3Mi83bHM3WjJ6dGlEa080L2pzT1F6aGhqRUYzczdjdC8zL2N0aDZ3Nmc2UkNZaWdpeEYyTHNYWW9Ba1FYalFEcEZxRHJIWGV1OVlkWTZSQ1lpUWlLaVJDWWlZaXBHV05mWWVrT1dmTUl6S2N6bEJ3M2VRRHRzRENHcHhzTWdNbE11UVNHdHB0YWExbWs0Q09nRFVIV0hVSFFDRnNEQUl5RU14REVJQkFMd0pnS25TSExQbU01cFNhVW1jb0dHblcvRGdJbUFBUmtRYUZHcEJrQWdvd2RyYVg1Y013ak01elNrempMWG9BRVZFSkJjZ3NvWUJHSWhpRUFpR01KWk1zMlduTExnRUpoR1l3Z1lZQ0FZQkdRaG1NWkNHSUJiUk1DQkppTVdPSmlDbW9wbVhISndYR1FQL2pnc1FBWkh3dStuK1U5QVlzc0NBTEFLRHFBVWJBZHZqY0RzQVhNQVpFSTFvQnA4TUxlQnNxSU93K1lHd0Y1Z1JnckdEcUN0MzkvL2dFQmd3QVFUVEJhQjNBd0JYLy81NDkzRHhnZ2hSR0JzRENDQUdEQThDSC8vLy8vLzh3U1FVakE5QUtNQVVGSXdMZ2pUQjZCTk1Bd0IvLy8vLy8vLzRZSm9kQmlGaHZHQ1NCZVlJUWFKaW1DdG1HY0ZVWVlBR3YvLy8vLy8vLytaUFovQnBKdFdtZ0xIT1prUkd4ajlpZ21RK1ZJWStJYnhnUkF4R0U0TUgrT3YvLy8vL0gvLy84eGZCQnpDTUNUTU4wV2d4eHhWRERsQmFNRkFMRXhTQlZURWNDcE1Fa0s0eEd4SkRGMUNlTUNRR1gvLy8vLy8vLy8vLy9uLy8rWWtndkppd0NUbURhRzBZYUliUmlFaW5HRElFZVlJZ01wZzhDdm1HZUxvWWE0Q2hnY0IxR0pJVWVaUndKNWhQbXpHcHZySi8vLy8vLy8vLy8vLy8vLy8vLy8rY0N6T1pndnJER1QwVDJZOVpoUmlobFhtVG1aZ1lmWTRKanVCdEdRMFgrWStnRWhrR2phR0l5U01aVG9zeGlmRnVtQ3VGaVkvaEdaaFdHdkdLY0orWW40OUJoVGxHOC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vWE5CYStGU29MaGdDaVlncHIvNDRMRUFHSGNhaEZMM01BQUFnNUEvb1p6TGdyTHdsM2xpT00yaXhXNXQzZGhLNk1KMXVNb29IQUtHTERHMDhuWVhleEJKK0JsYllNVG9ZcXM4Vklra3Q1dVNRS21TanJGRmNxdGowTlJOa0xTRldFb1d0dU9YT1dIRW1NT1N3ZEpta0VQSUFpSjV0ODNlTEp3S0xrakVvRXowMElvaVlwWkZoSkNyWGRjeFBrcUpUV0x2TlRYdWhtbWlrcWljcXE4VEpuVGlpOUJ3S3FyaE1PWTJEUkdVU2tnNHpCMVZrdkdudHZJWmFzOWVxNUZrUzRHaFFIUGxIWGNWNmphajBuNmk0dFpTaHJTZ3FWaWRNRm9EbkxoMTNtNnNrZnhkU3BZWWJtc1JjTFBuVVZ5d3lMb1RVTjBla3ZrTG0vWitvMC95WUtiajFxUlR4WFUweC9ta3k5VkppSzduSWg1a0RVRlhxR3FxeGROZHZHM1hvdTVNSmlhR0N1SFRaOUpReDhEUUl1RnU4QUt0VEZkK1JoWVRrdzIvYkEwRUxMbmlTSG5tbE84bCswaFc1L24wVTJMN0xnWEd5dDZTNnIrb1NrcTArcFkzS0JscEplbDBtUnNPZ2x3cFV1UW11b2EwR0JKYXRGcFVXY2xNVituTVhqa2tJNmp2UFZCcy9FM3JhVEJMcHdBNmpYNjdsT3c0aTdYZ2ZaRWVWV1liNG1JS2FpbVpjY25CY1pBQUFBQS8rT0N4QUJpSkdvSUFPdndRQTh4SDVUb1I3YjVyS3gwMVVSUThqcExzdjVscThCZ0FZSnRrQmlZYVY2cEhzWCtOSVRyWVc4Sy9ZTWIxUVZHdG5TcXppcklZa1grVTFTWlZXVlJWaHNJK3JEejVRcEhSRGtsb2lBdWxwTHZzd1hqRGpDcDBTSzBGdWIxUXdtQ0NrbDdsNnlaZ2JPaUJLR3NEcWhaYzJlQWtKai9Ndmh0WHk1RVVGYlViRkZXUnZTbTRrMm02UklXRlVmUlNXVkRnd0ZMS2dHaHBETTlYNnhJTVNUQWZsczZKTEVXQnFMTjRYd2Jxb0VtS0lYdWhLMC9WNngxTkl1dDJlV3NxUUdpa2JDV1dFem05YTR6MUhCNW1XdUVwbkwzZlNIamlSY0FKbmtTMU1WMUZ1bWl3RW5KQzBFQ3AxUm9JbkNTRFpJcHZtbzJzdGN5L1hjVTRYTWhzcTFZSmVNV1pRdjFvU1VieUpEU3hBR20vT0lLdFJaakE1ZTk5b2FmdVZMUFRYZ3BnU0tMdEwxWUppelpPNW1vd1pjNjJFV1VNaElLbEJjNVZrdVcwcGkxQkw0cktzS2tXdU5kTEhrWlhBYzllNWE1T05LMUNhYmlKbXRVYlZiekM0TUlsM1lnajRsbzlMNHAycDN5WnlGY3JQYkdtZzhUdE5lYk1zTXNwNTMvZVJQTmFLYWJkMmp3VklaUDFNUVUxRk15NDVPQzR5QUFBUC9qZ3NRQVlSeHFEQ0RyOEFRUVNIalJtVWtKSVVMSzhNa2ZDQTBXVmVCd0dVcTNGOUdycFJOYVhJenBpeTZVa3dTeDFFSmNNTkRZWXhCQ1lXb1hRcWk2NlJjVFFWUzloY1ByWFp3bEVLSVZFSVFScDFud1hXRmp0Ylgwc1ZoRHlzelFHeHhRQjExWVZ6dGptRUlGMHRyaktZRlE1dDJReWVGaGNmYWlsVWp3T0FlVkRGNm1qckJxQnNVVVZRR1YzdlZoVlFVNmJFeWQrMjZOU1EwWGd4eUt1T2dZaW1KbFpXK2lnOEhMZWNRSUtzaUxJRVYwdE1BQVNaNlpUTkVUM3lseGVCVEprRFdYS2JyQklzUm1xb0hRVUVpNkNSRUZkNkk3Y2xNVUYxa0lydjZ1MkRWS1lHZ1lkVXRTT00yRWd1bER5amlnOEFwcnJwWXMyeWVxWjhtWDZxaXI1YXJjVk1VbGw5Q1Eya3FsUTlWWGFuQ1VuR3NRK1gyUWpZNjJkWGlFcHQzOVlRd05BY211bEE2eXF6TWxwTjBjQko5SkpIcE1sVThsUmxZMnQrZ1NGUzFVRWJtZ3l5UjJIR2xEcm8xc3RwM2JhQzFOczZEa2t1cndWS29XNnpXRzdPZXhoRFpwYmJzRmJsS2xkc3ZVM2dKUzFWMGpkWm5hcHM0ZmdaS21HQnFqR2FKdTdiTnliNW8waW1hTGFZZ3BxS1pseHljRnhrQUFBQUFBQUFELzQ0TEVBR044YWdnQTYvQU1JemRaKzVCZXhXbndPd0R1R3JMYUI4RktEZlFheUlvTHZRNEY5U3pEY1dtb3hxYWhhZEpLeTRiZnZ6SlZLVmNLeU9Td09OTCtkQllWOWs2Smt2YXNrdW85aEtnTGtZSzZ5RFRXWEdMY0lKcE1taXpzS0ZWcVR0VlltMndPSGFCQk8wZ0FBU0RCeUdrQUF5QXhvcnBLck1JUm5MY3V3b0kzRjBYVFZYemFlcE5PeEx4WVNDM0JTaVpvbmVndWhNUjFTUkZpSTRxYlE3QmFpUVhHUGNrN0VYY2J2ZkxWQmowVVUrMjFMeFVSdU1FT1lNenhRZFdDQXdKNHU2cjVYVFlXSkxMU1ZRNFlLZ0VscTlXY1FFYUswdVFGOUd1MFRlSklNZ1oreTFlaGN3UmFiVk14aGJXR2tpTVNqYkx4d01QUmhYTUhyQ08ybmU2Q0c4SWdOZkNDNkpnQUhEcnRKdXFWZzZiRDJjQ0pqVEZ5b2tDMGtrVllTN2FkeUxUTEVwUzF6S0ZEbEl2QXFoQTR5aFNsZXpCMTBTUVFnVm9hc2ppeTVLQkNhMnpLbWpMVGZ4dFphWHNVRWcxRjErbkFRalhlV3dZV3JhWElreklRN2F1eThNTlJWa2pTaVlTaUN1RlVFRndhWlZkSXk3Rm9PYUZNUUdtS255eGhaanZWMUR3MStEeHRiaDFZZHNpdEtHYkI2RGlZZ3BxS0FBQUEvK09DeEFCaFRHb01BTzR3QUI4UUduU1V6SVV4RlJydlJHVVV2RnAyYmx5MGowNFNRdzhBSWxFbkhWMjVTOTFOVWtHY0kwb3l3V3JoU3NhK1hoVnVaNDRDWXFnNVpsWXljNjlFNFh5VzZEU1A2a2tuZ01oWmc3Zzh0dWsyMWxzSzVXT2ptSWdtUTJ5MlkwN1FoMnpGUHE4OVBFeUVpa1JJTHJKdlJobXl1a0hsK01sUjVaT3lVSENlNWdOSW54S0Zqb3V2MG80OENtQ2dUZHloQkVOeFdkZ0lKZTVTS05DbEwvcFdyRHpWRVdVVW04eUErQ0tpeWg0eXFUcnJwV3V1cHNZalNUU1NrYVdYeFdhc2djQ1BIV08zVklYcU5RNm9TRWtCWGo4c2dVUmdYSzNlaGdaUWFHeGx4ZnBickRWQkdncW5sYkowaWNadFo2bFpLWkpsUlJrREIzaFU2QzFrUUdncGR3S2pBekJsYXVvK3RCeTNOY0JlU0dxSFZJTllqVzJwb3JNOFlPeUZSdFNoRGhTUzFsNnluQmVCSWhveUdpUE1EUTJ1UlY3bHQ0aE5UemlDYWFENWROUTE2VjlRYSs3VG10d1c0Uy8ybXF0ellpQ3NNWVdTNUNzRUVsejBjbWVPNHFJdDJ5SitrRThBS3JRTzZ6SHB4SjE0RlZtN3dhM0Y0aytYRXRTYUIxMU1xZ3htOEIzdUppQ21vcG1YSEp3WEdRQUFBQUFBQVAvamdzUUFZWHhtREFGY3dBQS9jR1RDUWtNV0JZaUFwZGxhYVVSYUpyaUl3WUZ5SUJQeWdhb1kvVExYRVdFWFF5eEpGb2F3NUVDMEhaVTBock5BeWxtNkVMU1Y4SjlzRlNvQzVGb3BPcnhiNW1ycUtRUTNNSlljYnVpblNONjV5UmpUM0VnWkJVS2lmcFFaYU0reHRCNEFBSHQzSEJheXZCYUt3c3NXaW5JdmQ1a1FoazZGZHZCc2pHR2ZDVUZYcHpJV1FHLzFSRUVjRXpsSVZPNXJOR3RoUXhTdVZyWGM1aFRzb2l2RXpOdm45UzdTNVNqTHV2b3NLMEJuSTBobjBDejc3TmtKZ2w3UzQwOUQ3Um1hTlVDdzJLUmRhNmdMa3EycVRMaFFFMWw0bTBSNVZHNkN4VzR1RTY3MDJGTkdCUkNINHc0anNxb0tDTmJTRllhNFFOZ3VkS3A3MzFXQVowNHE2MW9MQ3RGWmJFRW5XZHhwUVJ4V0RwcXJyTFlJbU5LZDlXT0NXb3BldUtyYXhOUmwzV1VFU2s5aSs2dUZyTENvNGpBNFpYQS9GMUlSRFZ2bnlZa3Zab0M3d01OUHB1Ynl3KzRycU9ldGFJSUl5OXpaWld2Z3ZpbjJ5bVJLa2RKSHVWU2hYMEpFUXBDc2xLaUIzSFZoZ2hyTGVsNEtkZnppUUFqRlRzZmpUV0V0YkZMQ25CZCtOenlZZ3BxS1pseHljRnhrQUFBQUFBRC80NExFQUdQRVVlUTFuZGdBUUFnaEJBZ0J4dGdwdW9ONWdlRmhNRi8rWmhvSVlXa2dxRjJ2OHk3RW94b01tQzRGL3pBeVUzNW5KRjVhTDhPTi8rQmd3ckx6VkpFd0VOY0tOeFY5Zi8vTllUUlJPSGh3emNnTVNYNVkvejdTOS9mLy84Q2padFRhWk1VR0JDaHM3TVlPMHVERkd0T2xCNjVmLy8vektTUXdBSE1WWEJJWU5QVmpBV2t6Y29aREFqbE9sQzFiV0EvLy8vK1pzdm1QSnhsaEdZK2ZBRlBNYkJqTUUweFpBTWlFVlBJOUxTYk9waXlGelU1bHBmLy8vLy9tYXNBQ21nVVhHZEtKaFM0Wm9ma0kwRlRFT0hqTWtjd3BLTTBRM1BVeGFTM3FOeTBuUFhLNkwycFZMUy8vLy8vLy8vQmdjV0VreTArQ0FzVklCQUFHU2h4aEIrRng4MnB2TWlRaktoOHljOEJLZVBHNzNNQmNHUVA5RXFkL1gxa0M1bVJQT3cxcFAvLy8vLy8vLy81c0RxWlFwR2RGSm5yRVl1MW1ialJyRVdhWW5HcE1ZNGFHTW5KRWJHcE1aQlNHdk9ZNmxHUHFwb0o4WkVybUJSa0lZRTBxRnJsYVM5cXR6U256WlMrc0pVcVpFK2E1WFJlMVNyLy8vLy8vLy8vLy8vL05NUlRQWVExRkZOQk5qTm5NelJ1Ly9hVTl5dHJjWGxVcVRFRk5SUUFBLytPQ3hBQUFBQU5JQWNBQUFFeEJUVVV6TGprNExqSUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFQL2pnc1FBQUFBRFNBQUFBQUJNUVUxRk15NDVPQzR5QUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJVUVVjQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnREE9PVwiXG59O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvYXVkaW8vYXVkaW8uanNvblxuICoqIG1vZHVsZSBpZCA9IDhcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImV4cG9ydCBkZWZhdWx0IFNvY2lhbHM7XG5cbmltcG9ydCB7IGNyZWF0ZURPTUVsZW1lbnQsIGFkZENsYXNzLCBiaW5kQWxsRnVuYyB9IGZyb20gJy4vLi4vY29tbW9uL3V0aWxzJztcbmltcG9ydCB7IGRlZmF1bHRUZXh0IH0gZnJvbSAnLi8uLi9jb21tb24vbWVzc2FnZXMnO1xuXG4vKipcbiAqINCa0L7QvdGB0YLRgNGD0LrRgtC+0YAg0YLQuNC/0LAgJ9Ch0L7RhtC40LDQu9GM0L3Ri9C1INC60L3QvtC/0LrQuCdcbiAqL1xuZnVuY3Rpb24gU29jaWFscygpIHtcbiAgYmluZEFsbEZ1bmModGhpcyk7XG59XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINC60L7QvdGC0LXQudC90LXRgNCwINC00LvRjyDQutC90L7Qv9C+0LpcbiAqL1xuU29jaWFscy5wcm90b3R5cGUucmVuZGVyQ29udGFpbmVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc29jaWFsc0NvbnRhaW5lciA9IGNyZWF0ZURPTUVsZW1lbnQoJ2RpdicsIHsnY2xhc3MnOiAnbnJ4LXNvY2lhbHMnfSk7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hcHBlbmRDaGlsZCh0aGlzLnNvY2lhbHNDb250YWluZXIpO1xufTtcblxuLyoqXG4gKiDQn9C+0LrQsNC3INC60L7QvdGC0LXQudC90LXRgNCwINGBINC60L3QvtC/0LrQsNC80LggKNCw0L3QuNC80LDRhtC40Y8pXG4gKi9cblNvY2lhbHMucHJvdG90eXBlLnNob3dTb2NpYWxzID0gZnVuY3Rpb24oKSB7XG4gIGFkZENsYXNzKHRoaXMuc29jaWFsc0NvbnRhaW5lciwgJ25yeC1mYWRlSW5SaWdodCcpO1xufTtcblxuLyoqXG4gKiDQntGC0YDQuNGB0L7QstC60LAg0LrQvdC+0L/QutC4ICdUZWxlZ3JhbSdcbiAqL1xuU29jaWFscy5wcm90b3R5cGUucmVuZGVyVGwgPSBmdW5jdGlvbihib3ROYW1lKSB7XG4gIHRoaXMudGwgPSBjcmVhdGVET01FbGVtZW50KCdkaXYnLCB7J2NsYXNzJzogJ25yeC1zb2NpYWxzX19pdGVtIG5yeC1zb2NpYWxzX19pdGVtLS10bCd9KTtcbiAgdGhpcy5zb2NpYWxzQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMudGwpO1xuXG4gIHRoaXMudGxJY29uID0gY3JlYXRlRE9NRWxlbWVudCgnYScsIHtcbiAgICAnaHJlZic6ICdodHRwczovL3RlbGVncmFtLm1lLycgKyBib3ROYW1lLFxuICAgICd0YXJnZXQnOiAnX2JsYW5rJ1xuICB9KTtcbiAgdGhpcy50bEljb24uaW5uZXJIVE1MID0gZGVmYXVsdFRleHQuc29jaWFsQnRuO1xuICB0aGlzLnRsLmFwcGVuZENoaWxkKHRoaXMudGxJY29uKTtcbn07XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINC60L3QvtC/0LrQuCAnRmFjZWJvb2sgTWVzc2VuZ2VyJ1xuICovXG5Tb2NpYWxzLnByb3RvdHlwZS5yZW5kZXJGYiA9IGZ1bmN0aW9uKGJvdE5hbWUpIHtcbiAgdGhpcy5mYiA9IGNyZWF0ZURPTUVsZW1lbnQoJ2RpdicsIHsnY2xhc3MnOiAnbnJ4LXNvY2lhbHNfX2l0ZW0gbnJ4LXNvY2lhbHNfX2l0ZW0tLWZiJ30pO1xuICB0aGlzLnNvY2lhbHNDb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5mYik7XG5cbiAgdGhpcy5mYkljb24gPSBjcmVhdGVET01FbGVtZW50KCdhJywge1xuICAgICdocmVmJzogJ2h0dHA6Ly9tLm1lLycgKyBib3ROYW1lICsgJz9yZWY9JyArIHdpbmRvdy5TRVJWRVJfMUNfVVJMLFxuICAgICd0YXJnZXQnOiAnX2JsYW5rJ1xuICB9KTtcbiAgdGhpcy5mYkljb24uaW5uZXJIVE1MID0gZGVmYXVsdFRleHQuc29jaWFsQnRuO1xuICB0aGlzLmZiLmFwcGVuZENoaWxkKHRoaXMuZmJJY29uKTtcbn07XG5cbi8qKlxuICog0J7RgtGA0LjRgdC+0LLQutCwINC60L3QvtC/0LrQuCAn0JLQutC+0L3RgtCw0LrRgtC1J1xuICovXG5Tb2NpYWxzLnByb3RvdHlwZS5yZW5kZXJWayA9IGZ1bmN0aW9uKHZrVXNlcklkKSB7XG4gIHRoaXMudmsgPSBjcmVhdGVET01FbGVtZW50KCdkaXYnLCB7J2NsYXNzJzogJ25yeC1zb2NpYWxzX19pdGVtIG5yeC1zb2NpYWxzX19pdGVtLS12ayd9KTtcbiAgdGhpcy5zb2NpYWxzQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMudmspO1xuXG4gIHRoaXMudmtJY29uID0gY3JlYXRlRE9NRWxlbWVudCgnYScsIHtcbiAgICAnaHJlZic6ICdodHRwczovL3ZrLm1lLycgKyB2a1VzZXJJZCxcbiAgICAndGFyZ2V0JzogJ19ibGFuaydcbiAgfSk7XG4gIHRoaXMudmtJY29uLmlubmVySFRNTCA9IGRlZmF1bHRUZXh0LnNvY2lhbEJ0bjtcbiAgdGhpcy52ay5hcHBlbmRDaGlsZCh0aGlzLnZrSWNvbik7XG59O1xuXG4vKipcbiAqINCe0YLRgNC40YHQvtCy0LrQsCDQutC90L7Qv9C60LggJ1ZpYmVyJ1xuICovXG4vLyBTb2NpYWxzLnByb3RvdHlwZS5yZW5kZXJWYiA9IGZ1bmN0aW9uKHBob25lKSB7XG4vLyAgIHRoaXMudmIgPSBjcmVhdGVET01FbGVtZW50KCdkaXYnLCB7J2NsYXNzJzogJ25yeC1zb2NpYWxzX19pdGVtIG5yeC1zb2NpYWxzX19pdGVtLS12Yid9KTtcbi8vICAgdGhpcy5zb2NpYWxzQ29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMudmIpO1xuXG4vLyAgIHRoaXMudmJJY29uID0gY3JlYXRlRE9NRWxlbWVudCgnYScsIHtcbi8vICAgICAnaHJlZic6ICd2aWJlcjovL2FkZD9udW1iZXI9JTJCJyArIHBob25lLFxuLy8gICAgICd0YXJnZXQnOiAnX2JsYW5rJ1xuLy8gICB9KTtcbi8vICAgdGhpcy52Ykljb24uaW5uZXJIVE1MID0gZGVmYXVsdFRleHQuc29jaWFsQnRuO1xuLy8gICB0aGlzLnZiLmFwcGVuZENoaWxkKHRoaXMudmJJY29uKTtcbi8vIH07XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9qcy9jb21wb25lbnRzL1NvY2lhbHMuanNcbiAqKi8iLCJleHBvcnQgeyBzZXRDaGF0U3R5bGVzLCBzZXRJY29uU3R5bGVzIH07XG5cbi8qKlxuICog0KPRgdGC0LDQvdC+0LLQutCwINGB0YLQuNC70LXQuSDQtNC70Y8g0YfQsNGC0LBcbiAqIEBwYXJhbSBjb2xvcnMge09iamVjdH0g0KbQstC10YLQvtCy0YvQtSDQvdCw0YHRgtGA0L7QudC60LhcbiAqL1xuZnVuY3Rpb24gc2V0Q2hhdFN0eWxlcyhjb2xvcnMpIHtcbiAgbGV0IG1haW5CZzsgICAgICAgICAgICAgICAgLy8g0KbQstC10YIg0YTQvtC90LAg0LrQvdC+0L/QutC4INGA0LDRgdC60YDRi9GC0LjRjyDRh9Cw0YLQsCwg0LfQsNCz0L7Qu9C+0LLQutCwINGH0LDRgtCwINC4INC60L3QvtC/0LrQuCAn0J7RgtC/0YDQsNCy0LjRgtGMJ1xuICBsZXQgbWFpbkNvbG9yOyAgICAgICAgICAgICAvLyDQptCy0LXRgiDRiNGA0LjRhNGC0LAg0LrQvdC+0L/QutC4INGA0LDRgdC60YDRi9GC0LjRjyDRh9Cw0YLQsCwg0LfQsNCz0L7Qu9C+0LLQutCwINGH0LDRgtCwINC4INC60L3QvtC/0LrQuCAn0J7RgtC/0YDQsNCy0LjRgtGMJ1xuICBsZXQgYm9keUJnOyAgICAgICAgICAgICAgICAvLyDQptCy0LXRgiDRhNC+0L3QsCDRh9Cw0YLQsFxuICBsZXQgbWVzc2FnZVRpbWVDb2xvcjsgICAgICAvLyDQptCy0LXRgiDRiNGA0LjRhNGC0LAg0LLRgNC10LzQtdC90Lgg0YHQvtC+0LHRidC10L3QuNGPINC4INC40L3RhNC+0YDQvNCw0YbQuNC4INC+INC60L7QvNC/0LDQvdC40Lgt0YDQsNC30YDQsNCx0L7RgtGH0LjQutC1INGH0LDRgtCwXG4gIGxldCB1c2VyTWVzc2FnZUJnOyAgICAgICAgIC8vINCm0LLQtdGCINGE0L7QvdCwINGB0L7QvtCx0YnQtdC90LjRjyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbiAgbGV0IHVzZXJNZXNzYWdlQ29sb3I7ICAgICAgLy8g0KbQstC10YIg0YLQtdC60YHRgtCwINGB0L7QvtCx0YnQtdC90LjRjyDQv9C+0LvRjNC30L7QstCw0YLQtdC70Y9cbiAgbGV0IG9yZ01lc3NhZ2VCZzsgICAgICAgICAgLy8g0KbQstC10YIg0YTQvtC90LAg0L/RgNC40LLQtdGC0YHRgtCy0LXQvdC90L7Qs9C+INGB0L7QvtCx0YnQtdC90LjRjyDQuCDQstGFLiDRgdC+0L7QsdGJ0LXQvdC40LlcbiAgbGV0IG9yZ01lc3NhZ2VDb2xvcjsgICAgICAgLy8g0KbQstC10YIg0YjRgNC40YTRgtCwINC/0YDQuNCy0LXRgtGB0YLQstC10L3QvdC+0LPQviDRgdC+0L7QsdGJ0LXQvdC40Y8g0Lgg0LLRhS4g0YHQvtC+0LHRidC10L3QuNC5XG5cbiAgaWYoY29sb3JzKSB7XG4gICAgbWFpbkJnID0gY29sb3JzLm1haW5CZztcbiAgICBtYWluQ29sb3IgPSBjb2xvcnMubWFpbkNvbG9yO1xuICAgIGJvZHlCZyA9IGNvbG9ycy5ib2R5Qmc7XG4gICAgbWVzc2FnZVRpbWVDb2xvciA9IGNvbG9ycy5tZXNzYWdlVGltZUNvbG9yO1xuICAgIHVzZXJNZXNzYWdlQmcgPSBjb2xvcnMudXNlck1lc3NhZ2VCZztcbiAgICB1c2VyTWVzc2FnZUNvbG9yID0gY29sb3JzLnVzZXJNZXNzYWdlQ29sb3I7XG4gICAgb3JnTWVzc2FnZUJnID0gY29sb3JzLm9yZ01lc3NhZ2VCZztcbiAgICBvcmdNZXNzYWdlQ29sb3IgPSBjb2xvcnMub3JnTWVzc2FnZUNvbG9yO1xuICB9IGVsc2Uge1xuICAgIG1haW5CZyA9ICcjNjRCNUY2JztcbiAgICBtYWluQ29sb3IgPSAnI2ZmZic7XG4gICAgYm9keUJnID0gJyNmZmYnO1xuICAgIG1lc3NhZ2VUaW1lQ29sb3IgPSAnIzk5OSc7XG4gICAgdXNlck1lc3NhZ2VCZyA9ICcjZWVlJztcbiAgICB1c2VyTWVzc2FnZUNvbG9yID0gJyM2MTYxNjEnO1xuICAgIG9yZ01lc3NhZ2VCZyA9ICcjQkZFOUY5JztcbiAgICBvcmdNZXNzYWdlQ29sb3IgPSAnIzc1NzU3NSc7XG4gIH1cblxuICBsZXQgY3NzID0gJy5ucngtY2hhdCB7cG9zaXRpb246IGZpeGVkOyByaWdodDogMTVweDsgYm90dG9tOiA4cHg7IHotaW5kZXg6IDQwO30nICtcbiAgICAgICAgICAgICcubnJ4LWNoYXQgKjpub3QoLm5yeC1jaGF0X19oZWFkZXItaW1nKSB7Ym94LXNpemluZzogYm9yZGVyLWJveDt9JyArXG4gICAgICAgICAgICAvLyDQmtC+0L3RgtC10LnQvdC10YAg0LTQu9GPINGH0LDRgtCwXG4gICAgICAgICAgICAnLm5yeC1jaGF0X193cmFwcGVyIHtiYWNrZ3JvdW5kLWNvbG9yOicgKyBib2R5QmcgKyAnOyB3aWR0aDogMzI1cHg7IGJvcmRlci1yYWRpdXM6IDJweDsgYm94LXNoYWRvdzogMCA1cHggMjFweCAtNHB4IHJnYmEoMCwgMCwgMCwgMC4zKTt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X193cmFwcGVyLm5yeC1zbGlkZUluVXAsIC5ucngtY2hhdF9fd3JhcHBlci5ucngtc2xpZGVJbkRvd24gey13ZWJraXQtYW5pbWF0aW9uLWR1cmF0aW9uOiAxMDAwbXM7IC1tb3otYW5pbWF0aW9uLWR1cmF0aW9uOiAxMDAwbXM7IGFuaW1hdGlvbi1kdXJhdGlvbjogMTAwMG1zOyAtd2Via2l0LWFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7IC1tb3otYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDsgYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X193cmFwcGVyLm5yeC1zbGlkZUluVXAgey13ZWJraXQtYW5pbWF0aW9uLW5hbWU6IG5yeC1zbGlkZUluVXA7IC1tb3otYW5pbWF0aW9uLW5hbWU6IG5yeC1zbGlkZUluVXA7IGFuaW1hdGlvbi1uYW1lOiBucngtc2xpZGVJblVwO30nICtcbiAgICAgICAgICAgICcubnJ4LWNoYXRfX3dyYXBwZXIubnJ4LXNsaWRlSW5Eb3duIHstd2Via2l0LWFuaW1hdGlvbi1uYW1lOiBucngtc2xpZGVJbkRvd247IC1tb3otYW5pbWF0aW9uLW5hbWU6IG5yeC1zbGlkZUluRG93bjsgYW5pbWF0aW9uLW5hbWU6IG5yeC1zbGlkZUluRG93bjt9JyArXG5cbiAgICAgICAgICAgIC8vINCa0L3QvtC/0LrQsCDRgNCw0YHQutGA0YvRgtC40Y8g0YfQsNGC0LBcbiAgICAgICAgICAgICcubnJ4LWJ0bi1jaGF0IHttYXgtd2lkdGg6IDI1MHB4OyBwb3NpdGlvbjogcmVsYXRpdmU7IHBhZGRpbmc6IDAgMjBweCAwIDU1cHg7IGhlaWdodDogNDBweDsgdGV4dC1hbGlnbjogbGVmdDsgYm9yZGVyOiBub25lOyBib3JkZXItcmFkaXVzOiAycHg7IGN1cnNvcjogcG9pbnRlcjsgd2hpdGUtc3BhY2U6IG5vd3JhcDsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7IG92ZXJmbG93OiBoaWRkZW47fScgK1xuICAgICAgICAgICAgJy5ucngtYnRuLWNoYXQ6aG92ZXIsIC5ucngtYnRuLWNoYXQ6Zm9jdXMge291dGxpbmU6IG5vbmU7IGJveC1zaGFkb3c6IDBweCAwcHggNHB4ICM5OTk7fScgK1xuICAgICAgICAgICAgJy5ucngtYnRuLWNoYXQ6YWN0aXZlIHtib3gtc2hhZG93OiBub25lO30nICtcbiAgICAgICAgICAgICcubnJ4LWJ0bi1jaGF0OjpiZWZvcmUge2NvbnRlbnQ6IFwiXCI7IHdpZHRoOiAyNXB4OyBoZWlnaHQ6IDMycHg7IGJhY2tncm91bmQ6IHVybChkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSGRwWkhSb1BTSXlOaTR3TmpZaUlHaGxhV2RvZEQwaU1qQWlJSFpwWlhkQ2IzZzlJamN1T0RFNUlEWWdNall1TURZMklESXdJajRnSUR4d1lYUm9JR1pwYkd3OUlpTm1abVlpSUdROUlrMHhOaTR3TVNBeE1pNHhNVGRqTFRRdU5EVTBMUzR3T0RndE9DNHhNaUF5TGpZMU9DMDRMakU1SURZdU1UTXlMUzR3TWpNZ01TNHlNRGN1TXpreUlESXVNelEwSURFdU1UTWdNeTR6TVRkRE1UQXVNakUySURJekxqRTVOeUE0TGpneklESTJJRGd1T0RNZ01qWnNOQzR3T1MweExqYzJNbU11T0RndU1qZ2dNUzQ0TXpndU5EUXlJREl1T0RRdU5EWWdOQzQwTlRVdU1Ea2dPQzR4TWpNdE1pNDJOVGdnT0M0eE9TMDJMakV6TXk0d055MHpMalEzTWkwekxqUTROaTAyTGpNMkxUY3VPVFF0Tmk0ME5EaHRNVFl1TnpRMElETXVNek16WXk0M016Z3RMamszTXlBeExqRTFNeTB5TGpFeElERXVNVE10TXk0ek1UZ3RMakEzTFRNdU5EYzBMVE11TnpNNExUWXVNakl0T0M0eE9UUXROaTR4TXkwekxqY3pNeTR3TnkwMkxqZ3pOaUF5TGpFeE5DMDNMamNnTkM0NE1UY2dNUzQzTkRJdU16STRJRE11TXpReUlERXVNRFF5SURRdU5qTXlJREl1TURrZ01TNDROaUF4TGpVeElESXVPRFkwSURNdU5USTBJREl1T0RJNElEVXVOamN1TVRZeUxqQXdOQzR6TWpVdU1EQTFMalE0T0NBd0lERXVNREExTFM0d01UWWdNUzQ1TmkwdU1UYzRJREl1T0RRekxTNDBObXcwTGpBNUlERXVOelkwWXkwdU1EQXlJREF0TVM0ek9EY3RNaTQ0TURRdExqRXhOeTAwTGpRek5DSXZQand2YzNablBnPT0pIG5vLXJlcGVhdCBjZW50ZXI7IGJhY2tncm91bmQtc2l6ZTogY29udGFpbjsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDUwJTsgLW1zLXRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTsgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7IC1tb3otdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7IGxlZnQ6IDE1cHg7fScgK1xuICAgICAgICAgICAgJy5ucngtYnRuLWNoYXQubnJ4LWJ0blNsaWRlVXAsIC5ucngtYnRuLWNoYXQubnJ4LWJ0blNsaWRlRG93biB7LXdlYmtpdC1hbmltYXRpb24tZHVyYXRpb246IDEwMDBtczsgLW1vei1hbmltYXRpb24tZHVyYXRpb246IDEwMDBtczsgYW5pbWF0aW9uLWR1cmF0aW9uOiAxMDAwbXM7IC13ZWJraXQtYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDsgLW1vei1hbmltYXRpb24tZmlsbC1tb2RlOiBib3RoOyBhbmltYXRpb24tZmlsbC1tb2RlOiBib3RoO30nICtcbiAgICAgICAgICAgICcubnJ4LWJ0bi1jaGF0Lm5yeC1idG5TbGlkZVVwIHstd2Via2l0LWFuaW1hdGlvbi1uYW1lOiBucngtYnRuU2xpZGVVcDsgLW1vei1hbmltYXRpb24tbmFtZTogbnJ4LWJ0blNsaWRlVXA7IGFuaW1hdGlvbi1uYW1lOiBucngtYnRuU2xpZGVVcDt9JyArXG4gICAgICAgICAgICAnLm5yeC1idG4tY2hhdC5ucngtYnRuU2xpZGVEb3duIHstd2Via2l0LWFuaW1hdGlvbi1uYW1lOiBucngtYnRuU2xpZGVEb3duOyAtbW96LWFuaW1hdGlvbi1uYW1lOiBucngtYnRuU2xpZGVEb3duOyBhbmltYXRpb24tbmFtZTogbnJ4LWJ0blNsaWRlRG93bjt9JyArXG5cbiAgICAgICAgICAgIC8vINCX0LDQs9C+0LvQvtCy0L7QuiDRh9Cw0YLQsFxuICAgICAgICAgICAgJy5ucngtY2hhdF9faGVhZGVyIHtwb3NpdGlvbjogcmVsYXRpdmU7IHBhZGRpbmc6IDEwcHggMjBweCAxMHB4IDEwcHg7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdF9faGVhZGVyLWltZyB7bWFyZ2luOiAwIDE2cHggMCA4cHg7IHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IGJvcmRlci1yYWRpdXM6IDUwJTt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19oZWFkZXItdGV4dCB7bWFyZ2luOiAwOyBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7IGxpbmUtaGVpZ2h0OiAxLjM7IHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7IHdpZHRoOiAyMTBweDt9JyArXG4gICAgICAgICAgICAnLm5yeC1idG4tY2xvc2Uge3Bvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAxNXB4OyByaWdodDogMTBweDsgd2lkdGg6IDEycHg7IGhlaWdodDogMTJweDsgYmFja2dyb3VuZDogdXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUlHaGxhV2RvZEQwaU1UUXVNREkxSWlCMmFXVjNRbTk0UFNJd0lEQWdNVFF1TURRM01USTFJREUwTGpBeU5USTFJaUIzYVdSMGFEMGlNVFF1TURRM0lqNGdJRHh3WVhSb0lHUTlJazB4TXk0M05USWdNVEl1TWprM2JDMDFMakkzTFRVdU1qY2dOUzR5TkMwMUxqRTVOR011TXprMExTNHpPUzR6T1RRdE1TNHdNalFnTUMweExqUXhOQzB1TXprMUxTNHpPUzB4TGpBek5TMHVNemt0TVM0ME15QXdiQzAxTGpJeklEVXVNVGczTFRVdU16RXROUzR6TVVNeExqTTJMUzR4TGpjeUxTNHhMak15Tmk0eU9UY3RMakEzTGpZNU1pMHVNRGNnTVM0ek16UXVNekkxSURFdU56TnNOUzR6SURVdU15MDFMak16SURVdU1qZzRZeTB1TXprMExqTTVMUzR6T1RRZ01TNHdNalFnTUNBeExqUXhOQzR6T1RRdU16a2dNUzR3TXpRdU16a2dNUzQwTXlBd2JEVXVNekl6TFRVdU1qZ2dOUzR5TnpZZ05TNHlOelpqTGpNNU5DNHpPVFlnTVM0d016UXVNemsySURFdU5ESTRJREFnTGpNNU15MHVNemswTGpNNU15MHhMakF6TlNBd0xURXVORE42SWlCamJHbHdMWEoxYkdVOUltVjJaVzV2WkdRaUlHWnBiR3c5SWlObVptWWlJR1pwYkd3dGNuVnNaVDBpWlhabGJtOWtaQ0l2UGp3dmMzWm5QZz09KSBuby1yZXBlYXQgY2VudGVyOyBiYWNrZ3JvdW5kLXNpemU6IGNvbnRhaW47IGJvcmRlcjogbm9uZTsgY3Vyc29yOiBwb2ludGVyOyBvcGFjaXR5OiAwLjM7fScgK1xuICAgICAgICAgICAgJy5ucngtYnRuLWNsb3NlOmhvdmVyLCAubnJ4LWJ0bi1jbG9zZTpmb2N1cyB7b3BhY2l0eTogMC43O30nICtcbiAgICAgICAgICAgICcubnJ4LWJ0bi1jbG9zZTpmb2N1cyB7b3V0bGluZTogbm9uZTt9JyArXG4gICAgICAgICAgICAnLm5yeC1idG4tY2xvc2U6YWN0aXZlIHtvcGFjaXR5OiAwLjc7fScgK1xuXG4gICAgICAgICAgICAvLyDQotC10LvQviDRh9Cw0YLQsCDQuCDQmNC90YTQvtGA0LzQsNGG0LjRjyDQviDQutC+0LzQv9Cw0L3QuNC4LdGA0LDQt9GA0LDQsdC+0YLRh9C40LrQtVxuICAgICAgICAgICAgJy5ucngtY2hhdF9fYm9keSB7aGVpZ2h0OiA0MjBweDsgcGFkZGluZzogNDBweCAwIDE1cHg7IHBvc2l0aW9uOiByZWxhdGl2ZTt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19jb3B5cmlnaHQge2ZvbnQ6IG5vcm1hbCAxMnB4LzEuNCBBcmlhbCwgc2Fucy1zZXJpZjsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDVweDsgcmlnaHQ6IDIwcHg7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdF9fY29weXJpZ2h0IHAge2NvbG9yOicgKyBtZXNzYWdlVGltZUNvbG9yICsgJzsgZGlzcGxheTogaW5saW5lO30nICtcblxuICAgICAgICAgICAgLy8g0KHQvtC+0LHRidC10L3QuNC1INC+INGA0LXQt9GD0LvRjNGC0LDRgtC1INC+0YLQv9GA0LDQstC60Lgg0LfQsNC/0YDQvtGB0LAg0L3QsCDRgdC10YDQstC10YBcbiAgICAgICAgICAgICcubnJ4LXNlcnZlci1tZXNzYWdlIHtjb2xvcjogIzc3NzsgcGFkZGluZzogMTBweCAxMnB4OyBtYXgtd2lkdGg6IDE5MHB4OyBtYXJnaW46IDJweCAwO30nICtcbiAgICAgICAgICAgICcubnJ4LXNlcnZlci1tZXNzYWdlLm5yeC1mYWRlSW5SaWdodCB7LXdlYmtpdC1hbmltYXRpb24tbmFtZTogbnJ4LWZhZGVJblJpZ2h0OyAtbW96LWFuaW1hdGlvbi1uYW1lOiBucngtZmFkZUluUmlnaHQ7IGFuaW1hdGlvbi1uYW1lOiBucngtZmFkZUluUmlnaHQ7IC13ZWJraXQtYW5pbWF0aW9uLWR1cmF0aW9uOiAxMDAwbXM7IC1tb3otYW5pbWF0aW9uLWR1cmF0aW9uOiAxMDAwbXM7IGFuaW1hdGlvbi1kdXJhdGlvbjogMTAwMG1zOyAtd2Via2l0LWFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7IC1tb3otYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDsgYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDt9JyArXG4gICAgICAgICAgICAnLm5yeC1zZXJ2ZXItbWVzc2FnZS5ucngtZmFkZU91dCB7LXdlYmtpdC1hbmltYXRpb24tbmFtZTogbnJ4LWZhZGVPdXQ7IC1tb3otYW5pbWF0aW9uLW5hbWU6IG5yeC1mYWRlT3V0OyBhbmltYXRpb24tbmFtZTogbnJ4LWZhZGVPdXQ7IC13ZWJraXQtYW5pbWF0aW9uLWR1cmF0aW9uOiAxMDAwbXM7IC1tb3otYW5pbWF0aW9uLWR1cmF0aW9uOiAxMDAwbXM7IGFuaW1hdGlvbi1kdXJhdGlvbjogMTAwMG1zOyAtd2Via2l0LWFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7IC1tb3otYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDsgYW5pbWF0aW9uLWZpbGwtbW9kZTogYm90aDt9JyArXG4gICAgICAgICAgICAnLm5yeC1zZXJ2ZXItbWVzc2FnZS5ucngtb2stbWVzc2FnZSB7YmFja2dyb3VuZC1jb2xvcjogI2M4ZTZjOTt9JyArXG4gICAgICAgICAgICAnLm5yeC1zZXJ2ZXItbWVzc2FnZS5ucngtZXJyb3ItbWVzc2FnZSB7YmFja2dyb3VuZC1jb2xvcjogI2ZmY2RkMjt9JyArXG5cbiAgICAgICAgICAgIC8vINCU0LjQsNC70L7QsyDRh9Cw0YLQsFxuICAgICAgICAgICAgJy5ucngtY2hhdF9fZGlhbG9nIHtkaXNwbGF5OiBibG9jazsgaGVpZ2h0OiAyMjdweDsgbWFyZ2luLWJvdHRvbTogMjBweDsgcGFkZGluZzogMCAyMHB4OyBvdmVyZmxvdy15OiBzY3JvbGw7IHBvc2l0aW9uOiByZWxhdGl2ZTt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLXdyYXBwZXIge3Bvc2l0aW9uOiByZWxhdGl2ZTt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLCAubnJ4LWNoYXRfX3RpcCB7Zm9udDogbm9ybWFsIDEzcHgvMS40IEFyaWFsLCBzYW5zLXNlcmlmOyBtYXgtd2lkdGg6IDg1JTsgbWluLXdpZHRoOiA2MHB4OyBtaW4taGVpZ2h0OiAzNXB4OyBtYXJnaW4tdG9wOiAwOyBwb3NpdGlvbjogcmVsYXRpdmU7IGRpc3BsYXk6IGlubGluZS1ibG9jazsgbWFyZ2luLWJvdHRvbTogMTVweDsgcGFkZGluZzogMTBweCAxNXB4OyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyBib3JkZXItcmFkaXVzOiAxMHB4O30nICtcbiAgICAgICAgICAgICcubnJ4LWNoYXRfX21lc3NhZ2UtLXVzZXIge2NvbG9yOicgKyB1c2VyTWVzc2FnZUNvbG9yICsgJzsgYmFja2dyb3VuZC1jb2xvcjonICsgdXNlck1lc3NhZ2VCZyArICc7IGZsb2F0OiByaWdodDt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLS1vcmcsIC5ucngtY2hhdF9fdGlwIHtjb2xvcjonICsgb3JnTWVzc2FnZUNvbG9yICsgJzsgYmFja2dyb3VuZC1jb2xvcjonICsgb3JnTWVzc2FnZUJnICsgJzt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLS1vcmcge2Zsb2F0OiBsZWZ0O30nICtcbiAgICAgICAgICAgICcubnJ4LWNoYXRfX21lc3NhZ2UtLXVzZXI6OmJlZm9yZSwgLm5yeC1jaGF0X19tZXNzYWdlLS1vcmc6OmJlZm9yZSwgLm5yeC1jaGF0X190aXA6OmJlZm9yZSB7Y29udGVudDogXCJcIjsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDVweDsgei1pbmRleDogMTsgd2lkdGg6IDA7ICBoZWlnaHQ6IDA7IGJvcmRlci13aWR0aDogMTVweDsgYm9yZGVyLXN0eWxlOiBzb2xpZDt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLS11c2VyOjpiZWZvcmUge2JvcmRlci1jb2xvcjonICsgdXNlck1lc3NhZ2VCZyArICcgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQgdHJhbnNwYXJlbnQ7IHJpZ2h0OiAtMTBweDsgLW1zLXRyYW5zZm9ybTogcm90YXRlWCgtMTUwZGVnKTsgLXdlYmtpdC10cmFuc2Zvcm06IHJvdGF0ZVgoLTE1MGRlZyk7IHRyYW5zZm9ybTogcm90YXRlWCgtMTUwZGVnKTt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLS1vcmc6OmJlZm9yZSwgLm5yeC1jaGF0X190aXA6OmJlZm9yZSB7Ym9yZGVyLWNvbG9yOicgKyBvcmdNZXNzYWdlQmcgKyAnIHRyYW5zcGFyZW50IHRyYW5zcGFyZW50IHRyYW5zcGFyZW50OyBsZWZ0OiAtMTBweDt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLXRpbWUge2ZvbnQ6IG5vcm1hbCAxMnB4LzEuNCBBcmlhbCwgc2Fucy1zZXJpZjsgY29sb3I6JyArIG1lc3NhZ2VUaW1lQ29sb3IgKyAnOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogNTAlOyAtbXMtdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpOyAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTsgLW1vei10cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTUwJSk7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLS11c2VyIC5ucngtY2hhdF9fbWVzc2FnZS10aW1lIHtsZWZ0OiAtNDBweDt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLS1vcmcgLm5yeC1jaGF0X19tZXNzYWdlLXRpbWUge3JpZ2h0OiAtNDBweDt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0X19tZXNzYWdlLXdyYXBwZXI6OmJlZm9yZSwgLm5yeC1jaGF0X19tZXNzYWdlLXdyYXBwZXI6OmFmdGVyLCAubnJ4LWNoYXRfX2NvbnRyb2xzOjpiZWZvcmUsIC5ucngtY2hhdF9fY29udHJvbHM6OmFmdGVyIHtjb250ZW50OiBcIiBcIjsgZGlzcGxheTogdGFibGU7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdF9fbWVzc2FnZS13cmFwcGVyOjphZnRlciwgLm5yeC1jaGF0X19jb250cm9sczo6YWZ0ZXIge2NsZWFyOiBib3RoO30nICtcblxuICAgICAgICAgICAgLy8g0JjQvdGE0L7RgNC80LDRhtC40Y8g0L4g0YLQvtC8LCDRh9GC0L4g0L7Qv9C10YDQsNGC0L7RgCDQvdCw0LHQuNGA0LDQtdGCINGC0LXQutGB0YJcbiAgICAgICAgICAgICcubnJ4LWNoYXRfX29wZXItdHlwaW5nIHtmb250OiBib2xkIDEycHgvMS40IEFyaWFsLCBzYW5zLXNlcmlmOyBjb2xvcjonICsgbWVzc2FnZVRpbWVDb2xvciArICc7IGZvbnQtc3R5bGU6IGl0YWxpYzsgcGFkZGluZzogMCAwIDAgMjBweDsgbWFyZ2luOiAwOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogLTIwcHg7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdF9fb3Blci10eXBpbmc6YmVmb3JlIHtjb250ZW50OiBcIlwiOyBwb3NpdGlvbjogYWJzb2x1dGU7IGxlZnQ6IDA7IHdpZHRoOiAxNXB4OyBoZWlnaHQ6IDE1cHg7IGJhY2tncm91bmQ6IHVybChcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBSUFBQUFDQUNBTUFBQUQwNEpINUFBQUFHWFJGV0hSVGIyWjBkMkZ5WlFCQlpHOWlaU0JKYldGblpWSmxZV1I1Y2NsbFBBQUFBRE5RVEZSRkFBQUFQVDA5UFQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5UFQwOVBUMDlQVDA5RXZUVEJBQUFBQkIwVWs1VEFBOGZMejlQWDI5L2o1K3Z2OC9mNy9yZklZNEFBQUllU1VSQlZIamE3WnZSam9NZ0VFVkJFUkVSNXYrL2RnV3JvcTdkck5tZG16UXpMMjE4NkQwZXdRQUZwVDZqR3ROQTh5MFJUVmJqQUJMbFNnTktnNkcxUWdjQkNMUlh0RWdCSUlSQUJFVXdkSzFnQUFMNnFVWVlOTGNBUDM4ZDYrZGdtQVdVZDBEakt3VEhMVUNkRVlMbUZyQWc3TDFpMHV3Q1NuVnBKUmdCQW5McHJUVkNCRlRYSTBiQWZyMERDL0JvQVkwSUVBRWlBQ2tnb0FVWWtJQUdMY0NMQUJFZ0FrU0FDTUFMaUdnQkZpUkFvd1U0dElBa0FrU0FDQkFCSW9BU1dvQURDVkR4SlVDREJGZ1JJQUpFZ0FnUUFYZ0JoQmJnVVFJbXBtWHBPd0VHTFNDSUFCRWdBa1NBQ0NCcXdRSUNTc0RJdEN3OTNBaGdXNWQzTndLNDF1WHZBTmdFbERhWXJrc3ZiQUlLZ1BIbjNzWW5ZQUhJTjN6WWxNWW40QVdRTzEyMUthM2xFN0FDNkxnMnhMWWZ0NDF5aGc5QXRYTnFkTTdIZXR1cVlnVFlaaUJWR1ZhQWpXRHNXOHNub0FKUXpSQkdaellVcDdrQmp0TkJycDNUVndEZS9Dc0FjNzQ2VC8yNTg5VnBXeXg3L2duQXNlY2ZBVHgvL2dFQWtWLytrSS9MT3dlUnZ3NkswNHdBeWQvUGJzUVJrcDhCVExjZm11QS9RbVRMWUxBTmhMbi8wdkhMWjU4YmdsRTRnTmxFYWhVT3dETE1ndDhCdEpqbnZ3SGtBU2tvdndBMGMzNnZjQUI2WXRnai9nNEFtcjhNQUNhRkJmanhySlM1Vk8rY3MrZUxqL3B4WDcyQWRQNFZPLyswRzBJcCttVTltY2swa1h5T20rZ3Y2Z25BczZUcFcrUW5CaTVuT1ZPUjcwcXREL2RmNTJqakt5NEhLYWxQclMrWWdIczVmeWI1cHdBQUFBQkpSVTVFcmtKZ2dnPT1cIikgbm8tcmVwZWF0IGNlbnRlcjsgYmFja2dyb3VuZC1zaXplOiBjb250YWluO30nICtcblxuICAgICAgICAgICAgLy8g0KTQvtGA0LzRi1xuICAgICAgICAgICAgJy5ucngtY2hhdF9fZm9ybSB7cGFkZGluZzogMCAxNXB4OyBwb3NpdGlvbjogcmVsYXRpdmU7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdF9fZm9ybS0tY29udGFjdHMgLm5yeC1jaGF0X190aXAge3dpZHRoOiAxMDAlOyBtYXgtd2lkdGg6IDk4JTsgbWFyZ2luOiAwIDAgMjBweCA1cHg7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdF9fZm9ybS0tY29udGFjdHMgLm5yeC1jaGF0X19maWVsZCB7bWFyZ2luLWJvdHRvbTogNXB4O30nICtcblxuICAgICAgICAgICAgLy8g0J/QvtC70Y8g0LLQstC+0LTQsFxuICAgICAgICAgICAgJy5ucngtY2hhdCB0ZXh0YXJlYSwgLm5yeC1jaGF0IGlucHV0IHtmb250OiBub3JtYWwgMTNweC8xLjQgQXJpYWwsIHNhbnMtc2VyaWY7IHdpZHRoOiAxMDAlOyBwYWRkaW5nOiAwIDEwcHg7IGNvbG9yOiAjNGI0YTRhOyBiYWNrZ3JvdW5kLWNvbG9yOiAjZmZmOyBib3JkZXI6IDFweCBzb2xpZCAjZGNkY2RjOyBib3JkZXItcmFkaXVzOiA0cHg7IHJlc2l6ZTogbm9uZTsgb3ZlcmZsb3c6IGF1dG87fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdCBpbnB1dCB7aGVpZ2h0OiAzMnB4O30nICtcbiAgICAgICAgICAgICcubnJ4LWNoYXQgdGV4dGFyZWEuZXJyb3IsIC5ucngtY2hhdCBpbnB1dC5lcnJvciB7Ym9yZGVyLWNvbG9yOiAjZTU3MzczO30nICtcbiAgICAgICAgICAgICcubnJ4LWNoYXQgdGV4dGFyZWEuZXJyb3I6aW52YWxpZCwgLm5yeC1jaGF0IGlucHV0LmVycm9yOmludmFsaWQge2JveC1zaGFkb3c6IG5vbmU7IG91dGxpbmU6IDA7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdCB0ZXh0YXJlYSB7aGVpZ2h0OiA2MHB4OyBwYWRkaW5nLXRvcDogMTBweDsgcGFkZGluZy1ib3R0b206IDEwcHg7IGxpbmUtaGVpZ2h0OiAxLjQ7IHZlcnRpY2FsLWFsaWduOiB0b3A7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdCB0ZXh0YXJlYTpmb2N1cywgLm5yeC1jaGF0IGlucHV0OmZvY3VzIHtib3JkZXItY29sb3I6JyArIG1haW5CZyArICc7IG91dGxpbmU6IG5vbmU7fScgK1xuICAgICAgICAgICAgJy5ucngtY2hhdCB0ZXh0YXJlYTo6LXdlYmtpdC1pbnB1dC1wbGFjZWhvbGRlciwgLm5yeC1jaGF0IGlucHV0Ojotd2Via2l0LWlucHV0LXBsYWNlaG9sZGVyIHtjb2xvcjogI2JkYmRiZDt9JyArXG4gICAgICAgICAgICAnLm5yeC1jaGF0IHRleHRhcmVhOjotbW96LXBsYWNlaG9sZGVyLCAubnJ4LWNoYXQgaW5wdXQ6Oi1tb3otcGxhY2Vob2xkZXIge2NvbG9yOiAjYmRiZGJkO30nICtcbiAgICAgICAgICAgICcubnJ4LWNoYXQgdGV4dGFyZWE6LW1zLWlucHV0LXBsYWNlaG9sZGVyLCAubnJ4LWNoYXQgaW5wdXQ6LW1zLWlucHV0LXBsYWNlaG9sZGVyIHtjb2xvcjogI2JkYmRiZDt9JyArXG5cbiAgICAgICAgICAgIC8vINCa0L3QvtC/0LrQuCDQuCDRgdGB0YvQu9C60Lgg0YTQvtGA0LxcbiAgICAgICAgICAgICcubnJ4LWNoYXRfX2NvbnRyb2xzIHttYXJnaW4tdG9wOiAxMHB4O30nICtcbiAgICAgICAgICAgICcubnJ4LWJ0bi1zZW5kLW1lc3NhZ2UsIC5ucngtYnRuLXNlbmQtY29udGFjdHMge3BhZGRpbmc6IDAgMjBweDsgaGVpZ2h0OiAzNXB4OyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyB0ZXh0LWFsaWduOiBjZW50ZXI7IGJvcmRlcjogbm9uZTsgYm9yZGVyLXJhZGl1czogNHB4OyBjdXJzb3I6IHBvaW50ZXI7IGZsb2F0OiByaWdodDt9JyArXG4gICAgICAgICAgICAnLm5yeC1idG4tc2VuZC1tZXNzYWdlOmhvdmVyLCAubnJ4LWJ0bi1zZW5kLWNvbnRhY3RzOmhvdmVyLCAubnJ4LWJ0bi1zZW5kLW1lc3NhZ2U6Zm9jdXMsIC5ucngtYnRuLXNlbmQtY29udGFjdHM6Zm9jdXMge291dGxpbmU6IG5vbmU7IG9wYWNpdHk6IDAuNzt9JyArXG4gICAgICAgICAgICAnLm5yeC1idG4tc2VuZC1tZXNzYWdlOmFjdGl2ZSwgLm5yeC1idG4tc2VuZC1jb250YWN0czphY3RpdmUge29wYWNpdHk6IDAuOTt9JyArXG4gICAgICAgICAgICAnLm5yeC1idG4tc2V0LWNvbnRhY3RzLCAubnJ4LWJ0bi1jbG9zZS1jb250YWN0cyB7YmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBwYWRkaW5nOiAwOyBtYXJnaW4tcmlnaHQ6IDIwcHg7IGxpbmUtaGVpZ2h0OiAzNXB4OyBjdXJzb3I6IHBvaW50ZXI7fScgK1xuICAgICAgICAgICAgJy5ucngtYnRuLXNldC1jb250YWN0cywgLm5yeC1jaGF0X19jb3B5cmlnaHQgYSB7Y29sb3I6JyArIG1haW5CZyArICc7IHRleHQtZGVjb3JhdGlvbjogbm9uZTt9JyArXG4gICAgICAgICAgICAnLm5yeC1idG4tc2V0LWNvbnRhY3RzOmhvdmVyLCAubnJ4LWJ0bi1jbG9zZS1jb250YWN0czpob3ZlciwgLm5yeC1jaGF0X19jb3B5cmlnaHQgYTpob3ZlciwgLm5yeC1jaGF0X19jb3B5cmlnaHQgYTpmb2N1cyB7dGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7IG9wYWNpdHk6IDAuODt9JyArXG4gICAgICAgICAgICAnLm5yeC1idG4tc2V0LWNvbnRhY3RzOmFjdGl2ZSwgLm5yeC1idG4tY2xvc2UtY29udGFjdHM6YWN0aXZlLCAubnJ4LWNoYXRfX2NvcHlyaWdodCBhOmFjdGl2ZSB7b3BhY2l0eTogMC42O30nICtcbiAgICAgICAgICAgICcubnJ4LWJ0bi1zZXQtY29udGFjdHM6Zm9jdXMsIC5ucngtYnRuLWNsb3NlLWNvbnRhY3RzOmZvY3VzIHtvdXRsaW5lOiBub25lO30nICtcbiAgICAgICAgICAgICcubnJ4LWJ0bi1jbG9zZS1jb250YWN0cyB7Y29sb3I6JyArIG1lc3NhZ2VUaW1lQ29sb3IgKyAnOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7fScgK1xuXG4gICAgICAgICAgICAvLyDQntGI0LjQsdC60LggKNGB0LXRgNCy0LXRgNC90YvQtSDQuCDQtNC70Y8g0L/QvtC70LXQuSDQstCy0L7QtNCwKVxuICAgICAgICAgICAgJy5ucngtZXJyb3ItbWVzc2FnZSwgLm5yeC1zZXJ2ZXItbWVzc2FnZSB7Zm9udDogbm9ybWFsIDExcHgvMS40IEFyaWFsLCBzYW5zLXNlcmlmOyBvdmVyZmxvdzogaGlkZGVuOyBsaW5lLWhlaWdodDogMTsgdGV4dC1hbGlnbjogbGVmdDsgd2hpdGUtc3BhY2U6IG5vd3JhcDsgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7fScgK1xuICAgICAgICAgICAgJy5ucngtZXJyb3ItbWVzc2FnZSB7Y29sb3I6ICNmNDQzMzY7IHdpZHRoOiAyOTVweDsgaGVpZ2h0OiAxM3B4OyBtYXJnaW46IDAgMCAwIDRweDt9JyArXG5cbiAgICAgICAgICAgIC8vINCe0LHRidC40LUg0L3QsNGB0YLRgNC+0LnQutC4XG4gICAgICAgICAgICAnLm5yeC1jaGF0X19oZWFkZXIsIC5ucngtYnRuLWNoYXQsIC5ucngtYnRuLXNlbmQtbWVzc2FnZSwgLm5yeC1idG4tc2VuZC1jb250YWN0cyB7Zm9udDogbm9ybWFsIDE0cHgvMS40IEFyaWFsLCBzYW5zLXNlcmlmOyBjb2xvcjonICsgbWFpbkNvbG9yICsgJzsgYmFja2dyb3VuZC1jb2xvcjonICsgbWFpbkJnICsgJzsgYm9yZGVyLXRvcC1sZWZ0LXJhZGl1czogMnB4OyBib3JkZXItdG9wLXJpZ2h0LXJhZGl1czogMnB4O30nICtcbiAgICAgICAgICAgICcubnJ4LWNoYXRfX3dyYXBwZXIuaGlkZGVuLCAubnJ4LWNoYXRfX2RpYWxvZy5oaWRkZW4sIC5oaWRkZW4ge2Rpc3BsYXk6IG5vbmU7fScgK1xuXG4gICAgICAgICAgICAvLyDQkNC90LjQvNCw0YbQuNGPINGA0LDRgdC60YDRi9GC0LjRjyDRh9Cw0YLQsFxuICAgICAgICAgICAgJ0Atd2Via2l0LWtleWZyYW1lcyBucngtc2xpZGVJblVwIHtmcm9tIHstd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDUwMHB4KTsgdmlzaWJpbGl0eTogdmlzaWJsZTt9IHRvIHstd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApO319JyArXG4gICAgICAgICAgICAnQC1tb3ota2V5ZnJhbWVzIG5yeC1zbGlkZUluVXAge2Zyb20gey1tb3otdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgNTAwcHgpOyB2aXNpYmlsaXR5OiB2aXNpYmxlO30gdG8gey1tb3otdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMCk7fX0nICtcbiAgICAgICAgICAgICdAa2V5ZnJhbWVzIG5yeC1zbGlkZUluVXAge2Zyb20ge3RyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDUwMHB4KTsgdmlzaWJpbGl0eTogdmlzaWJsZTt9IHRvIHt0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKTt9fScgK1xuXG4gICAgICAgICAgICAvLyDQkNC90LjQvNCw0YbQuNGPINC30LDQutGA0YvRgtC40Y8g0YfQsNGC0LBcbiAgICAgICAgICAgICdALXdlYmtpdC1rZXlmcmFtZXMgbnJ4LXNsaWRlSW5Eb3duIHtmcm9tIHstd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApOyB2aXNpYmlsaXR5OiB2aXNpYmxlO30gdG8gey13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgNTAwcHgpO319JyArXG4gICAgICAgICAgICAnQC1tb3ota2V5ZnJhbWVzIG5yeC1zbGlkZUluRG93biB7ZnJvbSB7LW1vei10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKTsgdmlzaWJpbGl0eTogdmlzaWJsZTt9IHRvIHstbW96LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDUwMHB4KTt9fScgK1xuICAgICAgICAgICAgJ0BrZXlmcmFtZXMgbnJ4LXNsaWRlSW5Eb3duIHtmcm9tIHt0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKTsgdmlzaWJpbGl0eTogdmlzaWJsZTt9IHRvIHt0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCA1MDBweCk7fX0nICtcblxuICAgICAgICAgICAgLy8g0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y8g0YHQvtC+0LHRidC10L3QuNGPINC+INGA0LXQt9GD0LvRjNGC0LDRgtC1INC+0YLQv9GA0LDQstC60Lgg0LfQsNC/0YDQvtGB0LAg0Log0YHQtdGA0LLQtdGA0YNcbiAgICAgICAgICAgICdALXdlYmtpdC1rZXlmcmFtZXMgbnJ4LWZhZGVJblJpZ2h0IHtmcm9tIHsgb3BhY2l0eTogMDsgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgxMDAlLCAwKTsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMTAwJSwgMCk7fSB0byB7b3BhY2l0eTogMTsgLXdlYmtpdC10cmFuc2Zvcm06IG5vbmU7IHRyYW5zZm9ybTogbm9uZTt9fScgK1xuICAgICAgICAgICAgJ0AtbW96LWtleWZyYW1lcyBucngtZmFkZUluUmlnaHQge2Zyb20geyBvcGFjaXR5OiAwOyAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDEwMCUsIDApOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgxMDAlLCAwKTt9IHRvIHtvcGFjaXR5OiAxOyAtd2Via2l0LXRyYW5zZm9ybTogbm9uZTsgdHJhbnNmb3JtOiBub25lO319JyArXG4gICAgICAgICAgICAnQGtleWZyYW1lcyBucngtZmFkZUluUmlnaHQge2Zyb20ge29wYWNpdHk6IDA7IC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoMTAwJSwgMCk7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDEwMCUsIDApO30gdG8ge29wYWNpdHk6IDE7IC13ZWJraXQtdHJhbnNmb3JtOiBub25lOyB0cmFuc2Zvcm06IG5vbmU7fX0nICtcblxuICAgICAgICAgICAgLy8g0JDQvdC40LzQsNGG0LjRjyDRgdC60YDRi9GC0LjRjyDRgdC+0L7QsdGJ0LXQvdC40Y8g0L4g0YDQtdC30YPQu9GM0YLQsNGC0LUg0L7RgtC/0YDQsNCy0LrQuCDQt9Cw0L/RgNC+0YHQsCDQuiDRgdC10YDQstC10YDRg1xuICAgICAgICAgICAgJ0Atd2Via2l0LWtleWZyYW1lcyBucngtZmFkZU91dCB7ZnJvbSB7b3BhY2l0eTogMTt9IHRvIHtvcGFjaXR5OiAwO319JyArXG4gICAgICAgICAgICAnQC1tb3ota2V5ZnJhbWVzIG5yeC1mYWRlT3V0IHtmcm9tIHtvcGFjaXR5OiAxO30gdG8ge29wYWNpdHk6IDA7fX0nICtcbiAgICAgICAgICAgICdAa2V5ZnJhbWVzIG5yeC1mYWRlT3V0IHtmcm9tIHtvcGFjaXR5OiAxO30gdG8ge29wYWNpdHk6IDA7fX0nICtcblxuICAgICAgICAgICAgLy8g0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y8g0LrQvdC+0L/QutC4INGA0LDRgdC60YDRi9GC0LjRjyDRh9Cw0YLQsFxuICAgICAgICAgICAgJ0Atd2Via2l0LWtleWZyYW1lcyBucngtYnRuU2xpZGVVcCB7ZnJvbSB7LXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAxNTBweCk7IHZpc2liaWxpdHk6IHZpc2libGU7fSB0byB7LXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKTt9fScgK1xuICAgICAgICAgICAgJ0AtbW96LWtleWZyYW1lcyBucngtYnRuU2xpZGVVcCB7ZnJvbSB7LW1vei10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAxNTBweCk7IHZpc2liaWxpdHk6IHZpc2libGU7fSB0byB7LW1vei10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKTt9fScgK1xuICAgICAgICAgICAgJ0BrZXlmcmFtZXMgbnJ4LWJ0blNsaWRlVXAge2Zyb20ge3RyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDE1MHB4KTsgdmlzaWJpbGl0eTogdmlzaWJsZTt9IHRvIHt0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKTt9fScgK1xuXG4gICAgICAgICAgICAvLyDQkNC90LjQvNCw0YbQuNGPINGB0LrRgNGL0YLQuNGPINC60L3QvtC/0LrQuCDRgNCw0YHQutGA0YvRgtC40Y8g0YfQsNGC0LBcbiAgICAgICAgICAgICdALXdlYmtpdC1rZXlmcmFtZXMgbnJ4LWJ0blNsaWRlRG93biB7ZnJvbSB7LXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKTsgdmlzaWJpbGl0eTogdmlzaWJsZTt9IHRvIHstd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDE1MHB4KTt9fScgK1xuICAgICAgICAgICAgJ0AtbW96LWtleWZyYW1lcyBucngtYnRuU2xpZGVEb3duIHtmcm9tIHstbW96LXRyYW5zZm9ybTogdHJhbnNsYXRlKDAsIDApOyB2aXNpYmlsaXR5OiB2aXNpYmxlO30gdG8gey1tb3otdHJhbnNmb3JtOiB0cmFuc2xhdGUoMCwgMTUwcHgpO319JyArXG4gICAgICAgICAgICAnQGtleWZyYW1lcyBucngtYnRuU2xpZGVEb3duIHtmcm9tIHt0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAwKTsgdmlzaWJpbGl0eTogdmlzaWJsZTt9IHRvIHt0cmFuc2Zvcm06IHRyYW5zbGF0ZSgwLCAxNTBweCk7fX0nO1xuXG4gIGluc2VydFN0eWxlc1RvRE9NKGNzcyk7XG59XG5cbi8qKlxuICog0KPRgdGC0LDQvdC+0LLQutCwINGB0YLQuNC70LXQuSDQtNC70Y8g0YHQvtGG0LjQsNC70YzQvdGL0YUg0LrQvdC+0L/QvtC6XG4gKiBAcGFyYW0ge09iamVjdH0gY29sb3JzINCm0LLQtdGC0L7QstGL0LUg0L3QsNGB0YLRgNC+0LnQutC4XG4gKi9cbmZ1bmN0aW9uIHNldEljb25TdHlsZXMoY29sb3JzKSB7XG4gIGxldCBjb2xvciwgYmdUbCwgYmdGYiwgYmdWYiwgYmdWaztcbiAgaWYoY29sb3JzKSB7XG4gICAgY29sb3IgPSBjb2xvcnMubWFpbkNvbG9yO1xuICAgIGJnVGwgPSBjb2xvcnMubWFpbkJnO1xuICAgIGJnRmIgPSBjb2xvcnMubWFpbkJnO1xuICAgIGJnVmsgPSBjb2xvcnMubWFpbkJnO1xuICAgIGJnVmIgPSBjb2xvcnMubWFpbkJnO1xuICB9IGVsc2Uge1xuICAgIGNvbG9yID0gJyNmZmYnO1xuICAgIGJnVGwgPSAnIzY0YTlkYyc7XG4gICAgYmdGYiA9ICcjMjlBQUUzJztcbiAgICBiZ1ZrID0gJyM0Yzc1YTMnO1xuICAgIGJnVmIgPSAnIzdkM2RhZic7XG4gIH1cblxuICBsZXQgY3NzID0gJy5ucngtc29jaWFscyB7cG9zaXRpb246IGZpeGVkOyBib3R0b206IDUxMHB4OyByaWdodDogMDsgei1pbmRleDogMzA7fScgK1xuICAgICAgICAgICAgJy5ucngtc29jaWFscy5ucngtZmFkZUluUmlnaHQgey13ZWJraXQtYW5pbWF0aW9uLW5hbWU6IG5yeC1mYWRlSW5SaWdodDsgLW1vei1hbmltYXRpb24tbmFtZTogbnJ4LWZhZGVJblJpZ2h0OyBhbmltYXRpb24tbmFtZTogbnJ4LWZhZGVJblJpZ2h0OyAtd2Via2l0LWFuaW1hdGlvbi1kdXJhdGlvbjogMTAwMG1zOyAtbW96LWFuaW1hdGlvbi1kdXJhdGlvbjogMTAwMG1zOyBhbmltYXRpb24tZHVyYXRpb246IDEwMDBtczsgLXdlYmtpdC1hbmltYXRpb24tZmlsbC1tb2RlOiBib3RoOyAtbW96LWFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7IGFuaW1hdGlvbi1maWxsLW1vZGU6IGJvdGg7fScgK1xuXG4gICAgICAgICAgICAnLm5yeC1zb2NpYWxzX19pdGVtIHtwb3NpdGlvbjogcmVsYXRpdmU7fScgK1xuICAgICAgICAgICAgJy5ucngtc29jaWFsc19faXRlbTpub3QoOmxhc3Qtb2YtdHlwZSkge21hcmdpbi1ib3R0b206IDVweDt9JyArXG5cbiAgICAgICAgICAgICcubnJ4LXNvY2lhbHNfX2l0ZW0gYSB7Zm9udDogbm9ybWFsIDE0cHgvMS40IEFyaWFsLCBzYW5zLXNlcmlmOyBjb2xvcjonICsgY29sb3IgKyAnOyBwb3NpdGlvbjogcmVsYXRpdmU7IGRpc3BsYXk6IGJsb2NrOyBoZWlnaHQ6IDQ1cHg7IHBhZGRpbmc6IDAgMTVweCAwIDUwcHg7IGxpbmUtaGVpZ2h0OiA0NXB4OyB2ZXJ0aWNhbC1hbGlnbjogdG9wOyB0ZXh0LWRlY29yYXRpb246IG5vbmU7IC1tcy10cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTEycHgpOyAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMTJweCk7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMTJweCk7IGJveC1zaGFkb3c6IDAgM3B4IDdweCByZ2JhKDAsIDAsIDAsIDAuMyk7fScgK1xuICAgICAgICAgICAgJy5ucngtc29jaWFsc19faXRlbSBhOmhvdmVyIHstbXMtdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlWCgwKTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDApOyB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4zcyBlYXNlO30nICtcbiAgICAgICAgICAgICcubnJ4LXNvY2lhbHNfX2l0ZW0gYTpmb2N1cyB7b3V0bGluZTogbm9uZTsgLW1zLXRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMTJweCk7IC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDExMnB4KTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDExMnB4KTt9JyArXG4gICAgICAgICAgICAnLm5yeC1zb2NpYWxzX19pdGVtIGE6YWN0aXZlIHtvcGFjaXR5OiAwLjU7IC1tcy10cmFuc2Zvcm06IHRyYW5zbGF0ZVgoMTEycHgpOyAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMTJweCk7IHRyYW5zZm9ybTogdHJhbnNsYXRlWCgxMTJweCk7fScgK1xuICAgICAgICAgICAgJy5ucngtc29jaWFsc19faXRlbSBhOjpiZWZvcmUge2NvbnRlbnQ6IFwiXCI7IGxlZnQ6IDEwcHg7IHdpZHRoOiAyOHB4OyBoZWlnaHQ6IDI4cHg7IGJhY2tncm91bmQtcmVwZWF0OiBuby1yZXBlYXQ7IGJhY2tncm91bmQtcG9zaXRpb246IGNlbnRlcjsgYmFja2dyb3VuZC1zaXplOiBjb250YWluOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogNTAlOyAtbXMtdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpOyAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlWSgtNTAlKTsgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC01MCUpO30nICtcblxuICAgICAgICAgICAgLy8gVGVsZWdyYW1cbiAgICAgICAgICAgICcubnJ4LXNvY2lhbHNfX2l0ZW0tLXRsIGEge2JhY2tncm91bmQtY29sb3I6JyArIGJnVGwgKyAnO30nICtcbiAgICAgICAgICAgICcubnJ4LXNvY2lhbHNfX2l0ZW0tLXRsIGE6OmJlZm9yZSB7YmFja2dyb3VuZC1pbWFnZTogdXJsKGRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjRiV3h1Y3owaWFIUjBjRG92TDNkM2R5NTNNeTV2Y21jdk1qQXdNQzl6ZG1jaUlIWnBaWGRDYjNnOUlqQWdNQ0F4Tmk0ME1EWXlOU0F4TkM0eU9EUXpPVFVpSUhkcFpIUm9QU0l5T0NJZ2FHVnBaMmgwUFNJeU5DNHpOemtpUGlBZ1BIQmhkR2dnWkQwaVRTNHlPU0EyTGpnMWJETXVOemdnTVM0ME1TQXhMalEyTXlBMExqY3dObU11TURrMExqTXVORFl6TGpReE15NDNNRGN1TWpFemJESXVNVEEzTFRFdU56SmpMakl5TFM0eE9DNDFNell0TGpFNE9DNDNOamN0TGpBeWJETXVPQ0F5TGpjMll5NHlOakl1TVRrdU5qTXpMakEwTmk0Mk9UZ3RMakkzVERFMkxqTTVOeTQxTXpaakxqQTNMUzR6TkRVdExqSTJPQzB1TmpNMExTNDFPVGN0TGpVd05rd3VNamcxSURZdU1ERTNZeTB1TXpnekxqRTBOeTB1TXpndU5qa3VNREExTGpnek0zcHROUzR3TURndU5qWnNOeTR6T0RndE5DNDFOV011TVRNeUxTNHdPRE11TWpjdU1EazNMakUxTlM0eU1ETk1OaTQzTkRVZ09DNDRNMk10TGpJeE5TNHlMUzR6TlRNdU5EWTNMUzR6T1RJdU56VTNiQzB1TWpBNElERXVOVFJqTFM0d01qY3VNakEwTFM0ek1UWXVNakkxTFM0ek56TXVNREkyYkMwdU56azNMVEl1T0RBM1l5MHVNRGt5TFM0ek1pNHdOQzB1TmpZeUxqTXlOUzB1T0RNM2VpSWdabWxzYkQwaUkyWm1aaUl2UGp3dmMzWm5QZz09KTt9JyArXG5cbiAgICAgICAgICAgIC8vIEZhY2Vib29rIE1lc3NlbmdlclxuICAgICAgICAgICAgJy5ucngtc29jaWFsc19faXRlbS0tZmIgYSB7YmFja2dyb3VuZC1jb2xvcjonICsgYmdGYiArICc7fScgK1xuICAgICAgICAgICAgJy5ucngtc29jaWFsc19faXRlbS0tZmIgYTo6YmVmb3JlIHtiYWNrZ3JvdW5kLWltYWdlOiB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhkcFpIUm9QU0kwTkM0ME5qY2lJR2hsYVdkb2REMGlNakFpSUhacFpYZENiM2c5SWprMklEa3pJRFEwTGpRMk9EQTNNeUF5TUNJK0lDQThjR0YwYUNCa1BTSk5NVEl4TGpjME5TQXhNVE5zTFRndU56STFMVGt1TXpZeVREazJJREV4TTJ3eE9DNDNNalV0TWpBZ09DNDVNelVnT1M0ek5qTk1NVFF3TGpRMk9DQTVNM29pSUdacGJHdzlJaU5tWm1ZaUx6NDhMM04yWno0PSk7IHdpZHRoOiAzMHB4O30nICtcblxuICAgICAgICAgICAgLy8g0JLQutC+0L3RgtCw0LrRgtC1XG4gICAgICAgICAgICAnLm5yeC1zb2NpYWxzX19pdGVtLS12ayBhIHtiYWNrZ3JvdW5kLWNvbG9yOicgKyBiZ1ZrICsgJzt9JyArXG4gICAgICAgICAgICAnLm5yeC1zb2NpYWxzX19pdGVtLS12ayBhOjpiZWZvcmUge2JhY2tncm91bmQtaW1hZ2U6IHVybChkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUI0Yld4dWN6MGlhSFIwY0RvdkwzZDNkeTUzTXk1dmNtY3ZNakF3TUM5emRtY2lJSFpwWlhkQ2IzZzlJakFnTUNBeE5pNDJORFEyT0RrZ09TNDBNVGt6TnpNeElpQjNhV1IwYUQwaU1qZ2lJR2hsYVdkb2REMGlNVFV1T0RRMUlqNGdJRHh3WVhSb0lHUTlJazB4TkM0ek1qVWdOUzQ1T1dNdU5UVXlMalV6T0NBeExqRXpOU0F4TGpBME5TQXhMall6SURFdU5qUXVNakl1TWpZekxqUXlOaTQxTXpVdU5UZzBMamcwTGpJeU5DNDBNell1TURJdU9URTFMUzR6Tnk0NU5HZ3RNaTQwTWpSakxTNDJNall1TURVdE1TNHhNalV0TGpJdE1TNDFORFF0TGpZeU9DMHVNek0yTFM0ek5ESXRMalkwTnkwdU56QTJMUzQ1TnkweExqQTJMUzR4TXpJdExqRTBOQzB1TWpjdExqSTRMUzQwTXpZdExqTTROeTB1TXpNdExqSXhOUzB1TmpFNExTNHhOUzB1T0RBM0xqRTVOaTB1TVRrMExqTTFNaTB1TWpNNExqYzBMUzR5TlRjZ01TNHhNekl0TGpBeU5pNDFOeTB1TVRrNExqY3lMUzQzTnpJdU56UTNMVEV1TWpJMUxqQTFOeTB5TGpNNE9DMHVNVEk0TFRNdU5EY3RMamMwTnkwdU9UVXRMalUwTlMweExqWTVMVEV1TXpFMExUSXVNek16TFRJdU1UZzJRekV1T1RBMUlEUXVOemd1T1RRM0lESXVPVEUzTGpBNE5DQXhMUzR4TVM0MU55NHdNekl1TXpNNExqVXdPQzR6TXlBeExqSTVPQzR6TVRJZ01pNHdPUzR6TVRRZ01pNDRPREl1TXpJM1l5NHpNakl1TURBMExqVXpOUzR4T1M0Mk5pNDBPVE11TkRJM0lERXVNRFV6TGprMUlESXVNRFUwSURFdU5qQTRJREl1T1RneUxqRTNOUzR5TkRjdU16VXpMalE1TkM0Mk1EZ3VOalk0TGpJNExqRTVNeTQwT1RVdU1UTXVOakkzTFM0eE9EUXVNRGcwTFM0eUxqRXlMUzQwTVRNdU1UUXRMall5Tmk0d05qSXRMamN6TGpBM0xURXVORFl5TFM0d05DMHlMakU1TFM0d05qY3RMalExTnkwdU16SXpMUzQzTlMwdU56YzNMUzQ0TXpkRE5TNDBOell1TlRrZ05TNDFNUzQxTURNZ05TNDJNak11TXpjZ05TNDRNVGd1TVRReUlEWWdNQ0EyTGpNMk5pQXdhREl1TnpSakxqUXpNaTR3T0RVdU5USTRMakk0TGpVNE55NDNNVE5zTGpBd01pQXpMakEwTkdNdExqQXdOQzR4TmpndU1EZzBMalkyTnk0ek9EY3VOemM0TGpJME1pNHdPQzQwTURJdExqRXhOQzQxTkRjdExqSTJPQzQyTlRZdExqWTVOeUF4TGpFeU5DMHhMalV5SURFdU5UUXlMVEl1TXpjeUxqRTROaTB1TXpjMExqTTBOUzB1TnpZMExqVXRNUzR4TlRJdU1URTFMUzR5T1M0eU9UVXRMalF6TGpZeUxTNDBNalZNTVRVdU9UTXVNekpqTGpBM055QXdJQzR4TlRjdU1EQXlMakl6TWk0d01UVXVORFExTGpBM05pNDFOamN1TWpZM0xqUXpMamN0TGpJeE55NDJPREl0TGpZek9DQXhMakkxTFRFdU1EVWdNUzQ0TWkwdU5EUXVOakE0TFM0NU1TQXhMakU1TmkweExqTTBOaUF4TGpnd09DMHVOQzQxTmkwdU16Y3VPRFF1TVRNZ01TNHpNalo2YlRBZ01DSWdZMnhwY0MxeWRXeGxQU0psZG1WdWIyUmtJaUJtYVd4c1BTSWpabVptSWlCbWFXeHNMWEoxYkdVOUltVjJaVzV2WkdRaUx6NDhMM04yWno0PSk7fScgK1xuXG4gICAgICAgICAgICAvLyBWaWJlclxuICAgICAgICAgICAgLy8gJy5ucngtc29jaWFsc19faXRlbS0tdmIgYSB7YmFja2dyb3VuZC1jb2xvcjonICsgYmdWYiArICc7fScgK1xuICAgICAgICAgICAgLy8gJy5ucngtc29jaWFsc19faXRlbS0tdmIgYTo6YmVmb3JlIHtiYWNrZ3JvdW5kLWltYWdlOiB1cmwoZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCNGJXeHVjejBpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNpSUhacFpYZENiM2c5SWpBZ01DQXhOeTQyTURrek56Y2dNVGd1TURneU1qa2lJSGRwWkhSb1BTSXlPQ0lnYUdWcFoyaDBQU0l5T0M0M05USWlQaUFnUEhCaGRHZ2daRDBpVFRFMUxqSXpNaUEzTGpVNE4yTXVNREl5TFRJdU5UVXRNaTR4TlMwMExqZzROeTAwTGpnMExUVXVNakV0TGpBMU5DMHVNREEyTFM0eE1USXRMakF4TmkwdU1UYzBMUzR3TWpZdExqRXpNeTB1TURJdExqSTNMUzR3TkRRdExqUXhMUzR3TkRRdExqVTFNaUF3TFM0M0xqTTRPQzB1TnpNNExqWXlMUzR3TXpndU1qSXpMUzR3TURJdU5ERXlMakV3Tnk0MU5pNHhPREl1TWpRNExqVXdOQzR5T1RJdU56WXlMak15Tnk0d056VXVNREV1TVRRMkxqQXlMakl3Tmk0d016UWdNaTQwTVRjdU5UUWdNeTR5TXlBeExqTTVJRE11TmpNZ015NDNPRFl1TURFdU1EWXVNREV6TGpFekxqQXhPQzR5TURndU1ERTNMakk0Tnk0d05UTXVPRGd6TGpZNU5DNDRPRE11TURVMElEQWdMakV4TFM0d01EVXVNVGN0TGpBeE15NDFPVGd0TGpBNUxqVTRMUzQyTXpZdU5UY3RMamc1T0MwdU1EQXpMUzR3TnpRdExqQXdOUzB1TVRReklEQXRMakU1TGpBd015MHVNREV1TURBMExTNHdNak11TURBMExTNHdNelY2SWlCbWFXeHNQU0lqWm1abUlpOCtJQ0E4Y0dGMGFDQmtQU0pOT1M0Mk5TQXhMalEwWXk0d056TXVNREEyTGpFMExqQXhMakU1Tnk0d01pQXpMamszTGpZeElEVXVOemsySURJdU5Ea3lJRFl1TXpBeUlEWXVORGt5TGpBd055NHdOamd1TURFdU1UVXVNREV1TWpRdU1EQTFMak14TWk0d01UWXVPVFl5TGpjeE5DNDVOelZvTGpBeU1tTXVNaklnTUNBdU16a3pMUzR3TmpVdU5URTNMUzR4T1RZdU1qRTRMUzR5TWpZdU1qQXpMUzQxTmpRdU1Ua3RMamd6TmkwdU1EQXpMUzR3TmpZdExqQXdOUzB1TVRNdExqQXdOUzB1TVRnMExqQTFMVFF1TURrdE15NDBPUzAzTGpnd01pMDNMalU0TFRjdU9UUXRMakF4TmlBd0xTNHdNek1nTUMwdU1EVXVNREF6TFM0d01EY2dNQzB1TURJeUxqQXdNeTB1TURRM0xqQXdNeTB1TURRZ01DMHVNRGt0TGpBd05DMHVNVFF6TFM0d01EZERPUzQzTVRJdU1EQTBJRGt1TmpRZ01DQTVMalUyTlNBd1l5MHVOalVnTUMwdU56YzBMalEyTXkwdU56a3VOelF0TGpBek55NDJNell1TlRndU5qZ3VPRGMyTGpjd00zcHROaTR6TURjZ01URXVOamd6WXkwdU1EZzBMUzR3TmpRdExqRTNNaTB1TVRNdExqSTFNeTB1TVRrM0xTNDBNelF0TGpNME9DMHVPRGsxTFM0Mk55MHhMak0wTFM0NU9Hd3RMakkzT0MwdU1UazFZeTB1TlRjdExqUXRNUzR3T0RVdExqVTVOUzB4TGpVM0xTNDFPVFV0TGpZMU5DQXdMVEV1TWpJekxqTTJMVEV1TmprMElERXVNRGN6TFM0eU1EZ3VNekUyTFM0ME5pNDBOeTB1TnpjeUxqUTNMUzR4T0RVZ01DMHVNemswTFM0d05UTXRMall5TWkwdU1UVTNMVEV1T0RRMExTNDRNelV0TXk0eE5pMHlMakV4Tnkwekxqa3hOQzB6TGpneExTNHpOalF0TGpneE55MHVNalEyTFRFdU16VXlMak01TlMweExqYzROeTR6TmpJdExqSTBOeUF4TGpBMExTNDNNRGN1T1RreUxURXVOVGczTFM0d05UVXRNUzB5TGpJMkxUUXVNREEyTFRNdU1Ua3ROQzR6TkRndExqTTVNeTB1TVRRMUxTNDRNRFl0TGpFME5pMHhMakl6TFM0d01ETXRNUzR3TmpndU16WXRNUzQ0TXpVdU9Ua3RNaTR5TVRjZ01TNDRNalF0TGpNM0xqZ3dOQzB1TXpVeUlERXVOelV1TURVZ01pNDNNelZETVM0ME55QTRMalF4SURNdU1TQXhNQzQ0T1NBMUxqRTFOaUF4TWk0NU16aGpNaTR3TVNBeUxqQXdOQ0EwTGpRNE15QXpMalkwTlNBM0xqTTBPQ0EwTGpnNExqSTFPQzR4TVM0MU15NHhOeTQzTWpZdU1qRTBiQzR4Tnk0d05HTXVNREl6TGpBd05pNHdORGN1TURFdU1EY3VNREZvTGpBeU5HTXhMak0wTnlBd0lESXVPVFkwTFRFdU1qTWdNeTQwTmkweUxqWXpOQzQwTXpZdE1TNHlNeTB1TXpVNExURXVPRE0yTFM0NU9UY3RNaTR6TWpSNmJTMDFMamN4TFRndU5ETmpMUzR5TXk0d01EVXRMamN4TGpBeE5pMHVPRGd1TlRBMUxTNHdOemd1TWpNdExqQTJPQzQwTWpjdU1ETXVOVGt1TVRReUxqSXpPQzQwTVRZdU16RXlMalkyTlM0ek5USXVPVEEwTGpFME5TQXhMak0yT0M0Mk5EVWdNUzQwTmlBeExqVTNNaTR3TkRRdU5ETXpMak16TlM0M016VXVOekV1TnpNMUxqQXlOeUF3SUM0d05UVWdNQ0F1TURnekxTNHdNRFV1TkRVdExqQTFNeTQyTmpndExqTTROQzQyTlMwdU9UZ3lMakF3TmkwdU5qSTFMUzR6TWkweExqTXpNeTB1T0RjM0xURXVPRGs0TFM0MU5UY3RMalUyTmkweExqSXpMUzQ0T0RVdE1TNDROQzB1T0RkNklpQm1hV3hzUFNJalptWm1JaTgrUEM5emRtYyspO30nICtcblxuICAgICAgICAgICAgLy8g0JDQvdC40LzQsNGG0LjRjyDQv9C+0Y/QstC70LXQvdC40Y8g0L/QsNC90LXQu9C4INGBINC60L3QvtC/0LrQsNC80LhcbiAgICAgICAgICAgICdALXdlYmtpdC1rZXlmcmFtZXMgbnJ4LWZhZGVJblJpZ2h0IHtmcm9tIHsgb3BhY2l0eTogMDsgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgxMDAlLCAwKTsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoMTAwJSwgMCk7fSB0byB7b3BhY2l0eTogMTsgLXdlYmtpdC10cmFuc2Zvcm06IG5vbmU7IHRyYW5zZm9ybTogbm9uZTt9fScgK1xuICAgICAgICAgICAgJ0AtbW96LWtleWZyYW1lcyBucngtZmFkZUluUmlnaHQge2Zyb20geyBvcGFjaXR5OiAwOyAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlKDEwMCUsIDApOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgxMDAlLCAwKTt9IHRvIHtvcGFjaXR5OiAxOyAtd2Via2l0LXRyYW5zZm9ybTogbm9uZTsgdHJhbnNmb3JtOiBub25lO319JyArXG4gICAgICAgICAgICAnQGtleWZyYW1lcyBucngtZmFkZUluUmlnaHQge2Zyb20ge29wYWNpdHk6IDA7IC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGUoMTAwJSwgMCk7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDEwMCUsIDApO30gdG8ge29wYWNpdHk6IDE7IC13ZWJraXQtdHJhbnNmb3JtOiBub25lOyB0cmFuc2Zvcm06IG5vbmU7fX0nO1xuXG4gIGluc2VydFN0eWxlc1RvRE9NKGNzcyk7XG59XG5cbi8qKlxuICog0JLRgdGC0LDQstC60LAg0YHRgtC40LvQtdC5INCyIERPTS3QtNC10YDQtdCy0L5cbiAqIEBwYXJhbSAge1N0cmluZ30gY3NzINCh0YLQuNC70LgsINC60L7RgtC+0YDRi9C1INC90YPQttC90L4g0LLRgdGC0LDQstC40YLRjFxuICovXG5mdW5jdGlvbiBpbnNlcnRTdHlsZXNUb0RPTShjc3MpIHtcbiAgbGV0IGhlYWQgPSBkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKVswXTtcbiAgbGV0IHN0eWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XG5cbiAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBjc3M7XG4gIH0gZWxzZSB7XG4gICAgc3R5bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzKSk7XG4gIH1cblxuICBoZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2pzL2NvbW1vbi9zdHlsZXMuanNcbiAqKi8iLCJsZXQgcGFnZVZpc2liaWxpdHkgPSB7XG4gIGI6IG51bGwsXG4gIHE6IGRvY3VtZW50LFxuICBwOiB1bmRlZmluZWQsXG4gIHByZWZpeGVzOiBbJycsICd3ZWJraXQnLCAnbXMnLCAnbW96J10sXG4gIHByb3BzOiBbJ1Zpc2liaWxpdHlTdGF0ZScsICd2aXNpYmlsaXR5Y2hhbmdlJywgJ0hpZGRlbiddLFxuICBtOiBbJ2ZvY3VzJywgJ2JsdXInXSxcbiAgdmlzaWJsZUNhbGxiYWNrczogW10sXG4gIGhpZGRlbkNhbGxiYWNrczogW10sXG4gIF9jYWxsYmFja3M6IFtdLFxuICBvblZpc2libGU6IGZ1bmN0aW9uKF9jYWxsYmFjaykge1xuICAgIHRoaXMudmlzaWJsZUNhbGxiYWNrcy5wdXNoKF9jYWxsYmFjayk7XG4gIH0sXG4gIG9uSGlkZGVuOiBmdW5jdGlvbihfY2FsbGJhY2spIHtcbiAgICB0aGlzLmhpZGRlbkNhbGxiYWNrcy5wdXNoKF9jYWxsYmFjayk7XG4gIH0sXG4gIGlzU3VwcG9ydGVkOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIHRoaXMucHJlZml4ZXMuc29tZShmdW5jdGlvbihwcmVmaXgpIHtcbiAgICAgIHJldHVybiBzZWxmLl9zdXBwb3J0cyhwcmVmaXgpO1xuICAgIH0pO1xuICB9LFxuICBfc3VwcG9ydHM6IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHJldHVybiAobG93ZXJGaXJzdChwcmVmaXggKyB0aGlzLnByb3BzWzJdKSBpbiB0aGlzLnEpO1xuICB9LFxuICBydW5DYWxsYmFja3M6IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgaWYgKCBpbmRleCApIHtcbiAgICAgIHRoaXMuX2NhbGxiYWNrcyA9IChpbmRleCA9PT0gMSkgPyB0aGlzLnZpc2libGVDYWxsYmFja3MgOiB0aGlzLmhpZGRlbkNhbGxiYWNrcztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrc1tpXSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgX3Zpc2libGU6IGZ1bmN0aW9uKCkge1xuICAgIHBhZ2VWaXNpYmlsaXR5LnJ1bkNhbGxiYWNrcygxKTtcbiAgfSxcbiAgX2hpZGRlbjogZnVuY3Rpb24oKSB7XG4gICAgcGFnZVZpc2liaWxpdHkucnVuQ2FsbGJhY2tzKDIpO1xuICB9LFxuICBfbmF0aXZlU3dpdGNoOiBmdW5jdGlvbigpIHtcbiAgICAoICh0aGlzLnFbbG93ZXJGaXJzdCh0aGlzLmIgKyB0aGlzLnByb3BzWzJdKV0pID09PSB0cnVlICkgPyB0aGlzLl9oaWRkZW4oKSA6IHRoaXMuX3Zpc2libGUoKTtcbiAgfSxcbiAgbGlzdGVuOiBmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKCEodGhpcy5pc1N1cHBvcnRlZCgpKSkge1xuICAgICAgICBpZiAoZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKHRoaXMubVswXSwgdGhpcy5fdmlzaWJsZSwgMSk7XG4gICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIodGhpcy5tWzFdLCB0aGlzLl9oaWRkZW4sIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucS5hdHRhY2hFdmVudCgnb25mb2N1c2luJywgdGhpcy5fdmlzaWJsZSk7XG4gICAgICAgICAgdGhpcy5xLmF0dGFjaEV2ZW50KCdvbmZvY3Vzb3V0JywgdGhpcy5faGlkZGVuKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLmIgPSB0aGlzLnByZWZpeGVzLnJlZHVjZShmdW5jdGlvbihtZW1vLCBwcmVmaXgpIHtcbiAgICAgICAgICBpZiAobWVtbyAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2VsZi5fc3VwcG9ydHMocHJlZml4KSkge1xuICAgICAgICAgICAgcmV0dXJuIHByZWZpeDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgdGhpcy5xLmFkZEV2ZW50TGlzdGVuZXIobG93ZXJGaXJzdCh0aGlzLmIgKyB0aGlzLnByb3BzWzFdKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcGFnZVZpc2liaWxpdHkuX25hdGl2ZVN3aXRjaC5hcHBseShwYWdlVmlzaWJpbGl0eSwgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgMSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfSxcbiAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5saXN0ZW4oKTtcbiAgfVxufTtcblxucGFnZVZpc2liaWxpdHkuaW5pdCgpO1xuXG5mdW5jdGlvbiBsb3dlckZpcnN0KHN0cikge1xuICByZXR1cm4gc3RyWzBdLnRvTG93ZXJDYXNlKCkgKyBzdHIuc3Vic3RyKDEpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBwYWdlVmlzaWJpbGl0eTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2pzL2NvbW1vbi9wYWdlVmlzaWJpbGl0eS5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIn0=