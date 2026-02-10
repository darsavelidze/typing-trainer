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
    let html = '<table><tr><th>Word</th><th>Avg Time (sec)</th><th>Count</th><th>Change</th><th>Weighted Speed</th></tr>';
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

  // Track recently typed words in order
  recentWords: [],

  // Add word to recent list (call from typing-trainer on word complete)
  addRecentWord(word) {
    this.recentWords.push(word);
    // Keep only last 50 to avoid memory buildup
    if (this.recentWords.length > 50) this.recentWords.shift();
  },

  // Render stats table showing only last N typed words
  renderRecentStatsTable(count) {
    count = count || 8;
    if (this.recentWords.length === 0) return '<div>No data</div>';
    // Get last N unique words in reverse order (most recent first)
    const seen = new Set();
    const recent = [];
    for (let i = this.recentWords.length - 1; i >= 0 && recent.length < count; i--) {
      const w = this.recentWords[i];
      if (!seen.has(w)) {
        seen.add(w);
        recent.push(w);
      }
    }
    let html = '<table><tr><th>Word</th><th>Avg Time (sec)</th><th>Count</th><th>Change</th><th>Weighted Speed</th></tr>';
    for (const word of recent) {
      const data = this.wordStats[word];
      if (!data) continue;
      const times = data.times;
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
      const lastTime = times[times.length-1];
      const weighted = lastTime ? (word.length / lastTime).toFixed(2) : '';
      html += `<tr><td>${word}</td><td>${data.avg.toFixed(2)}</td><td>${times.length}</td><td style="text-align:center">${change}</td><td>${weighted}</td></tr>`;
    }
    html += '</table>';
    return html;
  },

  // Call to update stats in DOM
  updateStatsDOM() {
    const el = document.getElementById('stats-table');
    if (el) {
      el.innerHTML = this.renderStatsTable();
    }
  },

  // Adaptive word selection: returns words sorted by weakness (slowest/untested first)
  getWeakWords(allWords, count) {
    count = count || 200;
    if (Object.keys(this.wordStats).length === 0) return [...allWords];

    const scored = allWords.map(w => {
      const data = this.wordStats[w];
      if (!data) return { word: w, score: 0 }; // untested = weakest priority
      const lastTime = data.times[data.times.length - 1];
      const speed = lastTime ? (w.length / lastTime) : 0;
      return { word: w, score: speed };
    });

    // Sort ascending: weakest (lowest speed) first
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, count).map(s => s.word);
  }
};