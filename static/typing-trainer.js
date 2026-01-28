// Fast Typing Trainer Module
// Minimal JS typing test logic, no styling

const words = `about|above|add|after|again|air|all|almost|along|also|always|America|an|and|animal|another|answer|any|are|around|as|ask|at|away|back|be|because|been|before|began|begin|being|below|between|big|book|both|boy|but|by|call|came|can|car|carry|change|children|city|close|come|could|country|cut|day|did|different|do|does|don't|down|each|earth|eat|end|enough|even|every|example|eye|face|family|far|father|feet|few|find|first|follow|food|for|form|found|four|from|get|girl|give|go|good|got|great|group|grow|had|hand|hard|has|have|he|head|hear|help|her|here|high|him|his|home|house|how|idea|if|important|in|Indian|into|is|it|its|it's|just|keep|kind|know|land|large|last|later|learn|leave|left|let|letter|life|light|like|line|list|little|live|long|look|made|make|man|many|may|me|mean|men|might|mile|miss|more|most|mother|mountain|move|much|must|my|name|near|need|never|new|next|night|no|not|now|number|of|off|often|oil|old|on|once|one|only|open|or|other|our|out|over|own|page|paper|part|people|picture|place|plant|play|point|put|question|quick|quickly|quite|read|really|right|river|run|said|same|saw|say|school|sea|second|see|seem|sentence|set|she|should|show|side|small|so|some|something|sometimes|song|soon|sound|spell|start|state|still|stop|story|study|such|take|talk|tell|than|that|the|their|them|then|there|these|they|thing|think|this|those|thought|three|through|time|to|together|too|took|tree|try|turn|two|under|until|up|us|use|very|walk|want|was|watch|water|way|we|well|went|were|what|when|where|which|while|white|who|why|will|with|without|word|work|world|would|write|year|you|young|your`.split('|');



let current = 0;
let correct = 0;
let wrong = 0;
let startTime = null;
let finished = false;

// Для отображения двух строк
const wordsPerLine = 5;
let lineOffset = 0; // сколько слов уже "ушло"

// Для измерения времени печати слова
let wordStartTime = null;
let firstKeyPressed = false;

let timerId = null;



function showWord() {
  renderColoredWord('');
  document.getElementById('input').value = '';
  document.getElementById('input').focus();
  wordStartTime = null;
  firstKeyPressed = false;
}




function renderColoredWord(inputVal) {
  // Показываем две строки: первая строка — wordsPerLine, вторая — ещё wordsPerLine
  let html = '';
  let firstLine = [];
  let secondLine = [];
    // Add border and rounded corners to the #word div
    document.addEventListener('DOMContentLoaded', function() {
        var wordDiv = document.getElementById('word');
        if (wordDiv) {
            wordDiv.style.border = '1px solid #000';
            wordDiv.style.borderRadius = '8px';
            wordDiv.style.padding = '4px 8px';
        }
    });
  for (let w = 0; w < wordsPerLine && (lineOffset + w) < words.length; w++) {
    firstLine.push(words[lineOffset + w]);
  }
  for (let w = 0; w < wordsPerLine && (lineOffset + wordsPerLine + w) < words.length; w++) {
    secondLine.push(words[lineOffset + wordsPerLine + w]);
  }
  // Первая строка
  for (let w = 0; w < firstLine.length; w++) {
    const word = firstLine[w];
    if (w < (current - lineOffset)) {
      // Уже введённые слова — зелёные
      html += `<span style=\"color:green\">${word}</span> `;
    } else if (w === (current - lineOffset)) {
      // Подсветка для текущего слова
      let error = false;
      for (let i = 0; i < word.length; i++) {
        if (i < inputVal.length) {
          if (!error && inputVal[i] === word[i]) {
            html += `<span style=\"color:green\">${word[i]}</span>`;
          } else {
            error = true;
            html += `<span style=\"color:red\">${word[i]}</span>`;
          }
        } else {
          html += `<span>${word[i]}</span>`;
        }
      }
      html += ' ';
    } else {
      html += word + ' ';
    }
  }
  html += '<br>';
  // Вторая строка
  for (let w = 0; w < secondLine.length; w++) {
    html += secondLine[w] + ' ';
  }
  document.getElementById('word').innerHTML = html.trim();
}

function updateStats() {
  const elapsed = (startTime ? ((Date.now() - startTime) / 1000) : 0) || 0;
  const wpm = Math.round((correct / elapsed) * 60) || 0;
  document.getElementById('stats').textContent = `Word: ${current+1}/200 | Correct: ${correct} | Mistakes: ${wrong} | WPM: ${wpm}`;
  // Таймер справа
  let left;
  if (!startTime && !finished) {
    left = 60;
  } else if (typeof startTime === 'number' && !finished) {
    left = Math.max(0, 60 - Math.floor(elapsed));
  }
  if (!finished) {
    document.getElementById('timer').textContent = `⏱ ${left}s`;
  } else {
    document.getElementById('timer').textContent = '';
  }
}




function checkInput(e) {
  if (finished) return;
  const inputEl = document.getElementById('input');
  // Засекаем время первой буквы
  if (!firstKeyPressed && e.key.length === 1) {
    wordStartTime = Date.now();
    firstKeyPressed = true;
    // Стартуем глобальный таймер только при первом вводе
    if (!startTime) {
      startTime = Date.now();
      if (window.timerInterval) clearInterval(window.timerInterval);
      window.timerInterval = setInterval(() => {
        if (!finished) updateStats();
        else clearInterval(window.timerInterval);
      }, 1000);
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(stopTest, 60000); // 1 минута
    }
  }
  // Подсветка при любом вводе
  setTimeout(() => {
    const val = inputEl.value;
    renderColoredWord(val);
  }, 0);
}

function nextWordIfCorrect() {
  if (finished) return;
  const inputEl = document.getElementById('input');
  const val = inputEl.value;
  if (val !== words[current]) {
    return;
  }
  let wordTime = null;
  if (firstKeyPressed && wordStartTime) {
    wordTime = (Date.now() - wordStartTime) / 1000;
  }
  correct++;
  if (wordTime !== null) {
    statsModule.addWordTime(words[current], wordTime);
  }
  current++;
  // Если дошли до конца первой строки — сдвигаем lineOffset
  if ((current - lineOffset) >= wordsPerLine) {
    lineOffset += wordsPerLine;
  }
  if (current >= words.length) {
    finished = true;
    updateStats();
    document.getElementById('word').textContent = 'Test finished!';
    document.getElementById('input').disabled = true;
    statsModule.updateStatsDOM();
    return;
  }
  showWord();
  updateStats();
  statsModule.updateStatsDOM();
}



function stopTest() {
  finished = true;
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
  updateStats();
  const elapsed = (startTime ? ((Date.now() - startTime) / 1000) : 0) || 0;
  const wpm = Math.round((correct / elapsed) * 60) || 0;
  document.getElementById('word').textContent = `Time is up!\nYour result: ${wpm} WPM`;
  document.getElementById('input').disabled = true;
  statsModule.updateStatsDOM();
  if (window.timerInterval) clearInterval(window.timerInterval);
}

function startTest() {
  current = 0;
  correct = 0;
  wrong = 0;
  finished = false;
  lineOffset = 0;
  startTime = null; // теперь стартуем только после первой буквы
  document.getElementById('input').disabled = false;
  // Перемешать слова
  shuffle(words);
  showWord();
  updateStats();
  statsModule.updateStatsDOM();
  // НЕ запускаем таймеры здесь!
  if (window.timerInterval) clearInterval(window.timerInterval);
  if (timerId) {
    clearTimeout(timerId);
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
