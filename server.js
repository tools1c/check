(function () {
    const GERMAN_SERVER = "https://support1c.videocourses.xyz";  
    const RU_PROXY = "https://support1c-ru.videocourses.xyz";   
    const TIMEOUT_MS = 5000;                              
    const CHECK_INTERVAL_MS = 60 * 60 * 1000;             

    if (window.location.hostname === "support1c-ru.videocourses.xyz") return;

    const lastCheck = localStorage.getItem("german_last_check");
    const lastOk = localStorage.getItem("german_last_ok");

    if (lastCheck &&
        (Date.now() - parseInt(lastCheck, 10) < CHECK_INTERVAL_MS) &&
        lastOk === "1") {
        return;
    }

    // ===== Функция проверки через изображение =====
    function checkServerViaImage(url, timeout = TIMEOUT_MS) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const timer = setTimeout(() => {
                img.src = "";     // Прерываем загрузку
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

    // ——— Запускаем проверку ———
    checkServerViaImage(GERMAN_SERVER)
        .then(() => {
            localStorage.setItem("german_last_ok", "1");
            localStorage.setItem("german_last_check", Date.now().toString());
        })
        .catch(() => {
            window.location.href =
                RU_PROXY + window.location.pathname + window.location.search;
        });
})();
