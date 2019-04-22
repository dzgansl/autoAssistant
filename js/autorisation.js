/**
 * Created by НСЛ on 15.02.2018.
 */
document.querySelector('form').onsubmit = function (e) {
    var login = document.getElementById('login').value;
    var password = document.getElementById('password').value;
    var savepass = document.getElementById('savepass').checked;;
    if (login && password) {
        var query = 'action=sessionOpen&login=' + encodeURIComponent(login) +
            '&password=' + encodeURIComponent(password) + '&keySoftware=cross';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', window.parent.document.apiurl + 'index.php?' + query, true);
        xhr.onerror = xhr.ontimeout = xhr.onload = function(e) {
            var xhr = e.currentTarget;
            if (xhr.status != 200) {
                showMessage('Статус ответа сервера: ' + xhr.status + ": " + xhr.statusText);
            } else {
                try {
                    var res = JSON.parse(xhr.responseText);
                    if (!res.result) {
                        showMessage(res.comment);
                    } else {
                        var maindocument = window.parent.document;
                        maindocument.idSession = res.idSession;
                        if (maindocument.eventSession) maindocument.dispatchEvent(maindocument.eventSession);
                        if (savepass) {
                            var options = {expire: 36000000, path: '/'};
                            setPropertyToCookie('login', login, options);
                            setPropertyToCookie('password', password, options)
                        }
                        var el = window.parent.document.getElementById('iframe-modal');
                        el.parentNode.removeChild(el);
                    }
                } catch (err) {
                    showMessage('Ошибка JSON-декодирования ответа сервера: ' + xhr.responseText);
                }
            }
        }
        xhr.timeout = 1000;
        xhr.send();
        return false;
    }
}
document.getElementById('identExit').onclick = function () {
    window.parent.document.location.href='about:blank';
}
//dragManager('main');
dragAnObject();



