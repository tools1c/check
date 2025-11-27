(function () {
    const GERMAN_SERVER = "https://support1c.videocourses.xyz";  
    const RU_PROXY = "https://support1c-ru.videocourses.xyz";   
    const TIMEOUT_MS = 8000;                               // увеличен таймаут для медленного сервера
    const CHECK_INTERVAL_MS = 60 * 60 * 1000;              // 1 час

    // Если уже на русском сервере (любой поддомен) — ничего не делаем
    if (window.location.hostname.includes("support1c-ru.videocourses.xyz")) return;

    const lastCheck = localStorage.getItem("german_last_check");
    const lastOk = localStorage.getItem("german_last_ok");

    // Если меньше часа назад сервер уже был помечен как мёртвый → редирект сразу
    if (lastCheck && (Date.now() - parseInt(lastCheck, 10) < CHECK_INTERVAL_MS) && lastOk === "0") {
        window.location.href = RU_PROXY + window.location.pathname + window.location.search;
        return;
    }

    // Если меньше часа назад сервер был живой → ничего не делаем
    if (lastCheck && (Date.now() - parseInt(lastCheck, 10) < CHECK_INTERVAL_MS) && lastOk === "1") {
        return;
    }

    // Сразу помечаем сервер как "мертвый", чтобы защититься от обрыва браузера
    localStorage.setItem("german_last_ok", "0");
    localStorage.setItem("german_last_check", Date.now().toString());

    function checkServerViaImage(url, timeout = TIMEOUT_MS) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timer = setTimeout(() => {
                img.src = ""; // Прерываем загрузку
                reject(new Error("timeout"));
            }, timeout);

            img.onload = () => {
                clearTimeout(timer);
                resolve();
            };

            img.onerror = () => {
                clearTimeout(timer);
                reject(new Error("error"));
            };

            // Кэш отключаем
            img.src = url + "/static/conf/img/test.png?ts=" + Date.now();
        });
    }

    // Запускаем проверку немецкого сервера
    checkServerViaImage(GERMAN_SERVER)
        .then(() => {
            // Немецкий сервер живой → обновляем статус
            localStorage.setItem("german_last_ok", "1");
        })
        .catch(() => {
            // Сервер не ответил — редирект на RU
            window.location.href = RU_PROXY + window.location.pathname + window.location.search;
        });
})();
