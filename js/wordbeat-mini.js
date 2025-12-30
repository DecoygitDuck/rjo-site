// WordBeat Mini - Typing rhythm game for demo
export function mountWordbeatMini(container) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(180deg,#0a0d10,#050607);color:#d7ffe9;font-family:monospace;padding:20px;";
  container.appendChild(wrapper);

  const words = ["CODE", "TYPE", "FAST", "BEAT", "FLOW", "SYNC", "RUSH", "ZONE", "PEAK", "WAVE"];
  let currentWord = "";
  let typed = "";
  let score = 0;
  let combo = 0;
  let timeLeft = 30;
  let gameActive = false;

  const title = document.createElement("div");
  title.style.cssText = "font-size:24px;font-weight:900;color:#5cffc6;margin-bottom:20px;";
  title.textContent = "WORDBEAT";
  wrapper.appendChild(title);

  const wordDisplay = document.createElement("div");
  wordDisplay.style.cssText = "font-size:48px;font-weight:900;letter-spacing:4px;margin:20px 0;min-height:60px;";
  wrapper.appendChild(wordDisplay);

  const typedDisplay = document.createElement("div");
  typedDisplay.style.cssText = "font-size:32px;color:#86d8ff;min-height:40px;letter-spacing:2px;";
  wrapper.appendChild(typedDisplay);

  const stats = document.createElement("div");
  stats.style.cssText = "display:flex;gap:30px;margin:30px 0;font-size:18px;";
  wrapper.appendChild(stats);

  const scoreEl = document.createElement("div");
  scoreEl.innerHTML = "⭐ <span id='score'>0</span>";
  stats.appendChild(scoreEl);

  const comboEl = document.createElement("div");
  comboEl.innerHTML = "🔥 <span id='combo'>0</span>x";
  stats.appendChild(comboEl);

  const timerEl = document.createElement("div");
  timerEl.innerHTML = "⏱️ <span id='timer'>30</span>s";
  stats.appendChild(timerEl);

  const startBtn = document.createElement("button");
  startBtn.textContent = "START";
  startBtn.style.cssText = "padding:14px 32px;font-size:18px;font-weight:900;background:#5cffc6;color:#050607;border:none;border-radius:12px;cursor:pointer;margin-top:20px;font-family:monospace;";
  startBtn.onmouseover = () => startBtn.style.transform = "translateY(-2px)";
  startBtn.onmouseout = () => startBtn.style.transform = "translateY(0)";
  wrapper.appendChild(startBtn);

  function newWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    typed = "";
    updateDisplay();
  }

  function updateDisplay() {
    wordDisplay.innerHTML = currentWord.split("").map((char, i) => {
      if (i < typed.length) {
        return typed[i] === char
          ? `<span style="color:#00ff8a">${char}</span>`
          : `<span style="color:#ff0050">${char}</span>`;
      }
      return `<span style="color:#d7ffe9">${char}</span>`;
    }).join("");

    typedDisplay.textContent = typed;
    document.getElementById("score").textContent = score;
    document.getElementById("combo").textContent = combo;
    document.getElementById("timer").textContent = timeLeft;

    comboEl.style.color = combo > 5 ? "#ffaa00" : "#d7ffe9";
  }

  function handleKey(e) {
    if (!gameActive) return;

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      typed += e.key.toUpperCase();

      if (typed.length <= currentWord.length) {
        const correct = typed === currentWord.substring(0, typed.length);

        if (correct && typed === currentWord) {
          // Word completed!
          score += 10 + combo * 2;
          combo++;
          newWord();
        } else if (!correct) {
          // Wrong letter
          combo = 0;
          typed = typed.slice(0, -1);
        }

        updateDisplay();
      }
    } else if (e.key === "Backspace") {
      e.preventDefault();
      typed = typed.slice(0, -1);
      updateDisplay();
    }
  }

  function startGame() {
    gameActive = true;
    score = 0;
    combo = 0;
    timeLeft = 30;
    startBtn.style.display = "none";
    newWord();

    const timer = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft <= 0) {
        clearInterval(timer);
        endGame();
      }
    }, 1000);

    wrapper.dataset.timerId = timer;
  }

  function endGame() {
    gameActive = false;
    wordDisplay.innerHTML = `<span style="color:#5cffc6">GAME OVER!</span>`;
    typedDisplay.textContent = `Final Score: ${score}`;
    startBtn.style.display = "block";
    startBtn.textContent = "PLAY AGAIN";
  }

  startBtn.addEventListener("click", startGame);
  document.addEventListener("keydown", handleKey);

  updateDisplay();

  return {
    destroy: () => {
      document.removeEventListener("keydown", handleKey);
      if (wrapper.dataset.timerId) {
        clearInterval(parseInt(wrapper.dataset.timerId));
      }
      container.removeChild(wrapper);
    },
    setMuted: () => {},
    needsGesture: () => false
  };
}
