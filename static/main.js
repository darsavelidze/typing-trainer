// main.js — логика тренажёра и отправки статистики

(function() {
    // updateStatsDOM: render table + send to server if auth
    function makeUpdateStatsDOM(sendToServer) {
        return function() {
            const el = document.getElementById('stats-table');
            if (el) {
                const tableHTML = statsModule.renderRecentStatsTable(8);
                if (tableHTML && tableHTML !== '<div>No data</div>') {
                    el.innerHTML = '<div class="stats-table-header">Word Statistics (recent)</div>' + tableHTML;
                } else {
                    el.innerHTML = '';
                }
            }
            if (sendToServer) {
                fetch('/save_stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ stats: JSON.stringify(statsModule.wordStats) })
                });
            }
        };
    }
    statsModule.updateStatsDOM = makeUpdateStatsDOM(!!window.isUserAuth);

    // Вставить тренажёр внутрь trainer-app
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('trainer-app').innerHTML = `
            <div id="word-box">
                <div id="word"></div>
            </div>
            <input id="input" type="text" autocomplete="off" placeholder="Start typing here..." />
            <div class="btn-row">
                <button class="btn-restart" onclick="startTest()">↻ Restart</button>
                <button class="btn-weak" onclick="startWeakTest()">◎ Practice Weak Words</button>
            </div>
        `;
        const input = document.getElementById('input');
        input.addEventListener('keydown', function(e) {
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
