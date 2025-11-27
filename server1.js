(function () {
    const TIMEOUT_MS = 8000;
    const CHECK_INTERVAL_MS = 60 * 60 * 1000;

    const hostnameParts = window.location.hostname.split(".");
    const mainDomain = hostnameParts.slice(-3).join("."); // видеокурсный домен без поддомена
    const userSubdomain = hostnameParts.length > 3 ? hostnameParts[0] : "";

    // Формируем URL немецкого и русского сервера
    const GERMAN_SERVER = userSubdomain
        ? `https://${userSubdomain}.support1c.videocourses.xyz`
        : `https://support1c.videocourses.xyz`;

    const RU_PROXY = userSubdomain
        ? `https://${userSubdomain}.support1c-ru.videocourses.xyz`
        : `https://support1c-ru.videocourses.xyz`;

    // Если уже на русском сервере — ничего не делаем
    if (window.location.hostname.includes("support1c-ru.videocourses.xyz")) return;

    const lastCheck = localStorage.getItem("german_last_check");
    const lastOk = localStorage.getItem("german_last_ok");

    // Если меньше часа назад сервер был мёртвый → редирект сразу
    if (lastCheck && (Date.now() - parseInt(lastCheck, 10) < CHECK_INTERVAL_MS) && lastOk === "0") {
        window.location.href = RU_PROXY + window.location.pathname + window.location.search;
        return;
    }

    // Если меньше часа назад сервер был живой → ничего не делаем
    if (lastCheck && (Date.now() - parseInt(lastCheck, 10) < CHECK_INTERVAL_MS) && lastOk === "1") {
        return;
    }

    // Сразу помечаем сервер как "мертвый"
    localStorage.setItem("german_last_ok", "0");
    localStorage.setItem("german_last_check", Date.now().toString());

    function checkServerViaImage(url, timeout = TIMEOUT_MS) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timer = setTimeout(() => {
                img.src = "";
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

            img.src = url + "/static/conf/img/test.png?ts=" + Date.now();
        });
    }

    checkServerViaImage(GERMAN_SERVER)
        .then(() => {
            localStorage.setItem("german_last_ok", "1");
        })
        .catch(() => {
            window.location.href = RU_PROXY + window.location.pathname + window.location.search;
        });
})();
