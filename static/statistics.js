// Minimalist statistics module for Fast Typing Trainer
// Usage: statsModule.addResult({ correct, wrong, wpm })
//        statsModule.showStats()

const statsModule = {
  // wordStats: { word: string, times: [float], avg: float }
  wordStats: {},

  // Call when a word is completed: statsModule.addWordTime(word, time)
  addWordTime(word, time) {
    if (!this.wordStats[word]) {
      this.wordStats[word] = { times: [] };
    }
    this.wordStats[word].times.push(time);
    // recalculate average
    const arr = this.wordStats[word].times;
    this.wordStats[word].avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  },

  // Get sorted array of { word, avg, weighted } from fastest to slowest
  getSortedStats() {
    return Object.entries(this.wordStats)
      .map(([word, data]) => {
        const times = data.times;
        const lastTime = times[times.length-1];
        const weighted = lastTime ? (word.length / lastTime) : 0;
        return { word, avg: data.avg, count: times.length, weighted };
      })
      .sort((a, b) => b.weighted - a.weighted);
  },

  // Render stats as HTML table
  renderStatsTable() {
    const stats = this.getSortedStats();
    if (stats.length === 0) return '<div>No data</div>';
    let html = '<table border="1" style="font-size:1em;"><tr><th>Word</th><th>Avg time (sec)</th><th>Count</th><th>Change</th><th>Weighted speed</th></tr>';
    for (const s of stats) {
      // Определяем изменение: сравниваем последние два значения
      const times = this.wordStats[s.word].times;
      let change = '';
      if (times.length > 1) {
        const prev = times[times.length-2];
        const curr = times[times.length-1];
        if (curr < prev) {
          change = '<span style="color:green">&#8593;</span>';
        } else if (curr > prev) {
          change = '<span style="color:red">&#8595;</span>';
        } else {
          change = '<span style="color:gray">&#8596;</span>';
        }
      }
      // Взвешенная скорость: символов в секунду
      const lastTime = times[times.length-1];
      const weighted = lastTime ? (s.word.length / lastTime).toFixed(2) : '';
      html += `<tr><td>${s.word}</td><td>${s.avg.toFixed(2)}</td><td>${s.count}</td><td style="text-align:center">${change}</td><td>${weighted}</td></tr>`;
    }
    html += '</table>';
    return html;
  },

  // Call to update stats in DOM
  updateStatsDOM() {
    const el = document.getElementById('stats-table');
    if (el) {
      el.innerHTML = this.renderStatsTable();
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
    }
  }
};