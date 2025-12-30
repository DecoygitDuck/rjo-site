// HopHop Mini - Simple platformer for demo
export function mountHopHopMini(container) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  canvas.style.cssText = "width:100%;height:100%;object-fit:contain;background:linear-gradient(180deg,#0a0d10,#161b22);";
  canvas.tabIndex = 0;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let player = { x: 100, y: 300, vx: 0, vy: 0, w: 20, h: 20, grounded: false };
  let platforms = [
    { x: 0, y: 360, w: 600, h: 40 },
    { x: 150, y: 280, w: 100, h: 20 },
    { x: 350, y: 220, w: 100, h: 20 },
    { x: 200, y: 160, w: 80, h: 20 },
    { x: 450, y: 140, w: 120, h: 20 }
  ];
  let keys = {};
  let score = 0;
  let coins = [
    { x: 200, y: 240, collected: false },
    { x: 400, y: 180, collected: false },
    { x: 240, y: 120, collected: false },
    { x: 500, y: 100, collected: false }
  ];

  function handleKeyDown(e) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;

    if ((e.key === "ArrowUp" || e.key === " ") && player.grounded) {
      player.vy = -12;
      player.grounded = false;
    }
  }

  function handleKeyUp(e) {
    keys[e.key] = false;
  }

  canvas.addEventListener("keydown", handleKeyDown);
  canvas.addEventListener("keyup", handleKeyUp);

  let animationId;
  function gameLoop() {
    // Physics
    if (keys["ArrowLeft"]) player.vx = -4;
    else if (keys["ArrowRight"]) player.vx = 4;
    else player.vx *= 0.8;

    player.vy += 0.6; // Gravity
    player.x += player.vx;
    player.y += player.vy;

    // Boundary
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

    // Platform collision
    player.grounded = false;
    platforms.forEach(p => {
      if (player.x + player.w > p.x && player.x < p.x + p.w &&
          player.y + player.h > p.y && player.y + player.h < p.y + 15 &&
          player.vy > 0) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    });

    // Coin collection
    coins.forEach(coin => {
      if (!coin.collected) {
        const dx = (player.x + player.w / 2) - coin.x;
        const dy = (player.y + player.h / 2) - coin.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          coin.collected = true;
          score += 10;
        }
      }
    });

    // Reset if fall
    if (player.y > canvas.height) {
      player.x = 100;
      player.y = 300;
      player.vx = 0;
      player.vy = 0;
    }

    // Draw
    ctx.fillStyle = "#161b22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Platforms
    ctx.fillStyle = "#5cffc6";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#5cffc6";
    platforms.forEach(p => {
      ctx.fillRect(p.x, p.y, p.w, p.h);
    });
    ctx.shadowBlur = 0;

    // Coins
    coins.forEach(coin => {
      if (!coin.collected) {
        ctx.fillStyle = "#ffaa00";
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#ffaa00";
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Player
    ctx.fillStyle = player.grounded ? "#86d8ff" : "#ff6b88";
    ctx.shadowBlur = 12;
    ctx.shadowColor = player.grounded ? "#86d8ff" : "#ff6b88";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;

    // Eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x + 5, player.y + 6, 4, 4);
    ctx.fillRect(player.x + 11, player.y + 6, 4, 4);

    // Score
    ctx.fillStyle = "#5cffc6";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`⭐ ${score}`, 10, 30);

    // Instructions
    ctx.fillStyle = "#d7ffe999";
    ctx.font = "14px monospace";
    ctx.fillText("← → to move, SPACE to jump", 10, canvas.height - 15);

    animationId = requestAnimationFrame(gameLoop);
  }

  canvas.focus();
  gameLoop();

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
