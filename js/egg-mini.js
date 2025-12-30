// Egg Mini - Tron-style trail duel for demo
export function mountEggMini(container) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  canvas.style.cssText = "width:100%;height:100%;object-fit:contain;background:#070812;";
  canvas.tabIndex = 0;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const CELL = 8;
  const COLS = Math.floor(canvas.width / CELL);
  const ROWS = Math.floor(canvas.height / CELL);

  const PLAYER_COLOR = "#7cffe6";
  const BOT_COLOR = "#ff4d6d";

  const DIRS = [
    { x: 1, y: 0 },   // RIGHT
    { x: -1, y: 0 },  // LEFT
    { x: 0, y: 1 },   // DOWN
    { x: 0, y: -1 }   // UP
  ];

  function isOpposite(a, b) {
    return a.x === -b.x && a.y === -b.y;
  }

  let occ = new Uint8Array(COLS * ROWS); // 0=empty, 1=player, 2=bot
  let player = { x: Math.floor(COLS * 0.25), y: Math.floor(ROWS / 2), dir: DIRS[0], pending: null, boost: 1.0, boosting: false };
  let bot = { x: Math.floor(COLS * 0.75), y: Math.floor(ROWS / 2), dir: DIRS[1], boost: 1.0, boosting: false };

  let score = 0;
  let dead = false;
  let keys = {};
  let lastFrame = performance.now();
  let accPlayer = 0;
  let accBot = 0;

  const BASE_SPEED = 8; // cells per second
  const BOOST_MULT = 1.8;

  function idx(x, y) { return y * COLS + x; }
  function inBounds(x, y) { return x >= 0 && y >= 0 && x < COLS && y < ROWS; }
  function getOcc(x, y) { return occ[idx(x, y)]; }
  function setOcc(x, y, v) { occ[idx(x, y)] = v; }

  // Initialize starting positions
  setOcc(player.x, player.y, 1);
  setOcc(bot.x, bot.y, 2);

  // Simple AI - chase player with lookahead
  function chooseBotDir() {
    const options = DIRS.filter(d => !isOpposite(bot.dir, d));
    let best = bot.dir;
    let bestScore = -Infinity;

    for (const d of options) {
      const nx = bot.x + d.x;
      const ny = bot.y + d.y;

      if (!inBounds(nx, ny) || getOcc(nx, ny) !== 0) continue;

      // Distance to player
      const dist = Math.abs(nx - player.x) + Math.abs(ny - player.y);

      // Lookahead danger
      let danger = 0;
      for (let i = 1; i <= 3; i++) {
        const lx = nx + d.x * i;
        const ly = ny + d.y * i;
        if (!inBounds(lx, ly)) { danger += 3; break; }
        if (getOcc(lx, ly) !== 0) danger += 2;
      }

      const sc = -dist - danger * 4;
      if (sc > bestScore) {
        bestScore = sc;
        best = d;
      }
    }

    return best;
  }

  function handleKeyDown(e) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;

    if (dead) return;

    if (e.key === "ArrowUp") player.pending = DIRS[3];
    else if (e.key === "ArrowDown") player.pending = DIRS[2];
    else if (e.key === "ArrowLeft") player.pending = DIRS[1];
    else if (e.key === "ArrowRight") player.pending = DIRS[0];
  }

  function handleKeyUp(e) {
    keys[e.key] = false;
  }

  canvas.addEventListener("keydown", handleKeyDown);
  canvas.addEventListener("keyup", handleKeyUp);

  function step() {
    const pReady = accPlayer >= 1;
    const bReady = accBot >= 1;

    if (!pReady && !bReady) return false;

    let pDir = player.dir;
    if (pReady && player.pending) {
      if (!isOpposite(player.dir, player.pending)) {
        pDir = player.pending;
        player.dir = pDir;
      }
      player.pending = null;
    }

    let bDir = bot.dir;
    if (bReady) {
      bDir = chooseBotDir();
      bot.dir = bDir;
    }

    if (pReady && bReady) {
      accPlayer -= 1;
      accBot -= 1;

      const nxP = player.x + pDir.x, nyP = player.y + pDir.y;
      const nxB = bot.x + bDir.x, nyB = bot.y + bDir.y;

      // Head-on collision
      if (nxP === nxB && nyP === nyB) { dead = true; return true; }

      // Wall collision
      if (!inBounds(nxP, nyP)) { dead = true; return true; }
      if (!inBounds(nxB, nyB)) { /* bot hit wall - player wins but still end */ dead = true; return true; }

      // Trail collision
      if (getOcc(nxP, nyP) !== 0) { dead = true; return true; }
      if (getOcc(nxB, nyB) !== 0) { /* bot hit trail - player wins */ dead = true; return true; }

      player.x = nxP; player.y = nyP;
      bot.x = nxB; bot.y = nyB;
      setOcc(nxP, nyP, 1);
      setOcc(nxB, nyB, 2);
      score++;
      return true;
    }

    if (pReady) {
      accPlayer -= 1;
      const nx = player.x + pDir.x, ny = player.y + pDir.y;
      if (!inBounds(nx, ny) || getOcc(nx, ny) !== 0) { dead = true; return true; }
      player.x = nx; player.y = ny;
      setOcc(nx, ny, 1);
      score++;
      return true;
    }

    accBot -= 1;
    const nx = bot.x + bDir.x, ny = bot.y + bDir.y;
    if (!inBounds(nx, ny) || getOcc(nx, ny) !== 0) { dead = true; return true; }
    bot.x = nx; bot.y = ny;
    setOcc(nx, ny, 2);
    return true;
  }

  let animationId;
  function gameLoop(t) {
    const dt = Math.min(0.05, (t - lastFrame) / 1000);
    lastFrame = t;

    // Boost logic
    player.boosting = keys[" "] && player.boost > 0 && !dead;
    if (player.boosting) {
      player.boost = Math.max(0, player.boost - 0.5 * dt);
    } else {
      player.boost = Math.min(1.0, player.boost + 0.3 * dt);
    }

    if (!dead) {
      const playerSpeed = BASE_SPEED * (player.boosting ? BOOST_MULT : 1);
      const botSpeed = BASE_SPEED;

      accPlayer += dt * playerSpeed;
      accBot += dt * botSpeed;

      let steps = 0;
      while (!dead && steps < 20) {
        const did = step();
        if (!did) break;
        steps++;
      }
    }

    // Draw
    ctx.fillStyle = "#070812";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#00ffff11";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(canvas.width, y * CELL);
      ctx.stroke();
    }

    // Draw trails
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const v = getOcc(x, y);
        if (v === 1) {
          ctx.fillStyle = PLAYER_COLOR;
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        } else if (v === 2) {
          ctx.fillStyle = BOT_COLOR;
          ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }
    }

    // Draw player head
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = player.boosting ? 16 : 10;
    ctx.shadowColor = PLAYER_COLOR;
    ctx.beginPath();
    ctx.ellipse(player.x * CELL + CELL / 2, player.y * CELL + CELL / 2, CELL * 0.5, CELL * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw bot head
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 10;
    ctx.shadowColor = BOT_COLOR;
    ctx.beginPath();
    ctx.ellipse(bot.x * CELL + CELL / 2, bot.y * CELL + CELL / 2, CELL * 0.5, CELL * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // UI
    ctx.fillStyle = "#00ffff";
    ctx.font = "14px monospace";
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Boost: ${Math.round(player.boost * 100)}%`, 10, 40);

    if (dead) {
      ctx.fillStyle = "#00000088";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#7cffe6";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
      ctx.font = "16px monospace";
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.textAlign = "left";
      return;
    }

    ctx.fillStyle = "#7cffe699";
    ctx.font = "11px monospace";
    ctx.fillText("Arrows to move · Space to boost", 10, canvas.height - 10);

    animationId = requestAnimationFrame(gameLoop);
  }

  canvas.focus();
  lastFrame = performance.now();
  gameLoop(lastFrame);

  return {
    destroy: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("keyup", handleKeyUp);
      container.removeChild(canvas);
    },
    setMuted: () => {},
    needsGesture: () => false
  };
}
