// Egg Mini - Arena survival game for demo
export function mountEggMini(container) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  canvas.style.cssText = "width:100%;height:100%;object-fit:contain;background:#000;";
  canvas.tabIndex = 0;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    angle: 0,
    boost: 0,
    alive: true,
    size: 12
  };

  let enemies = [];
  let score = 0;
  let keys = {};
  let gameTime = 0;

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    if (side === 0) { x = Math.random() * canvas.width; y = -20; }
    else if (side === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 20; }
    else { x = -20; y = Math.random() * canvas.height; }

    enemies.push({ x, y, vx: 0, vy: 0, size: 10, speed: 1 + gameTime / 1000 });
  }

  function handleKeyDown(e) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;
  }

  function handleKeyUp(e) {
    keys[e.key] = false;
  }

  canvas.addEventListener("keydown", handleKeyDown);
  canvas.addEventListener("keyup", handleKeyUp);

  let spawnTimer = 0;
  let animationId;

  function gameLoop() {
    if (!player.alive) {
      ctx.fillStyle = "#00000088";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#7cffe6";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.font = "18px Arial";
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText("Refresh to play again", canvas.width / 2, canvas.height / 2 + 70);
      ctx.textAlign = "left";
      return;
    }

    gameTime++;
    spawnTimer++;

    // Spawn enemies
    if (spawnTimer > 60 - Math.min(gameTime / 100, 40)) {
      spawnEnemy();
      spawnTimer = 0;
    }

    // Player input
    if (keys["ArrowLeft"]) player.angle -= 0.08;
    if (keys["ArrowRight"]) player.angle += 0.08;

    if (keys["ArrowUp"] || keys[" "]) {
      player.boost = Math.min(player.boost + 0.3, 8);
      const boostForce = 0.3;
      player.vx += Math.cos(player.angle) * boostForce;
      player.vy += Math.sin(player.angle) * boostForce;
    } else {
      player.boost *= 0.95;
    }

    // Apply friction
    player.vx *= 0.98;
    player.vy *= 0.98;

    // Speed limit
    const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    if (speed > 10) {
      player.vx = (player.vx / speed) * 10;
      player.vy = (player.vy / speed) * 10;
    }

    player.x += player.vx;
    player.y += player.vy;

    // Arena boundaries (bounce)
    const margin = 30;
    if (player.x < margin) { player.x = margin; player.vx *= -0.5; }
    if (player.x > canvas.width - margin) { player.x = canvas.width - margin; player.vx *= -0.5; }
    if (player.y < margin) { player.y = margin; player.vy *= -0.5; }
    if (player.y > canvas.height - margin) { player.y = canvas.height - margin; player.vy *= -0.5; }

    // Update enemies
    enemies.forEach(e => {
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        e.vx = (dx / dist) * e.speed;
        e.vy = (dy / dist) * e.speed;
      }

      e.x += e.vx;
      e.y += e.vy;

      // Check collision with player
      if (dist < player.size + e.size) {
        player.alive = false;
      }
    });

    // Remove off-screen enemies (shouldn't happen but just in case)
    enemies = enemies.filter(e =>
      e.x > -50 && e.x < canvas.width + 50 &&
      e.y > -50 && e.y < canvas.height + 50
    );

    score = Math.floor(gameTime / 10);

    // Draw
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arena boundary
    ctx.strokeStyle = "#7cffe633";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Enemies
    enemies.forEach(e => {
      ctx.fillStyle = "#ff3344";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#ff3344";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, e.size, e.size * 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    ctx.fillStyle = "#7cffe6";
    ctx.shadowBlur = 20 + player.boost * 2;
    ctx.shadowColor = "#7cffe6";
    ctx.beginPath();
    ctx.ellipse(0, 0, player.size, player.size * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Boost trail
    if (player.boost > 2) {
      ctx.fillStyle = `rgba(124, 255, 230, ${player.boost / 20})`;
      ctx.beginPath();
      ctx.ellipse(-player.size, 0, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // UI
    ctx.fillStyle = "#7cffe6";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`⭐ ${score}`, 10, 30);
    ctx.fillText(`👾 ${enemies.length}`, 10, 55);

    ctx.fillStyle = "#7cffe699";
    ctx.font = "12px monospace";
    ctx.fillText("← → to rotate, ↑ / SPACE to boost", 10, canvas.height - 10);

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
