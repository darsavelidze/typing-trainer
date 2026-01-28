// main.js — логика тренажёра и отправки статистики

// Переопределяем updateStatsDOM для отправки статистики, если авторизован
(function() {
    // userIsAuth определяется в index.html
    if (window.isUserAuth) {
        statsModule.updateStatsDOM = function() {
            const el = document.getElementById('stats-table');
            if (el) el.innerHTML = statsModule.renderStatsTable();
            // Отправить статистику на сервер при каждом обновлении
            fetch('/save_stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stats: JSON.stringify(statsModule.wordStats) })
            });
        };
    } else {
        statsModule.updateStatsDOM = function() {
            const el = document.getElementById('stats-table');
            if (el) el.innerHTML = statsModule.renderStatsTable();
        };
    }

    // Вставить тренажёр внутрь trainer-app
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('trainer-app').innerHTML = `
            <div id="stats"></div>
            <div style="display:flex;align-items:center;justify-content:center;margin:20px 0;width:100%;position:relative;">
                <div id="word" style="font-size:2em; text-align:center; display:inline-block;"></div>
                <div id="timer" style="font-size:2em;width:80px;text-align:right;position:absolute;right:10px;"></div>
            </div>
            <input id="input" type="text" autocomplete="off" style="font-size:2em;" />
            <button onclick="startTest()">Restart</button>
            <hr style="margin:24px auto; width:80%;">
        `;
        const input = document.getElementById('input');
        input.addEventListener('keydown', function(e) {
            // Запретить ввод пробела, но использовать его для перехода
            if (e.key === ' ' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                nextWordIfCorrect();
                return;
            }
            checkInput(e);
        });
        startTest();
    });
})();
