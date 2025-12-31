// Arena Mini - Fast-paced combat demo
export function mountArenaMini(container) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  canvas.style.cssText = "width:100%;height:100%;object-fit:contain;background:#0a0511;";
  canvas.tabIndex = 0;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const PLAYER_COLOR = "#3cff6b";
  const ENEMY_COLOR = "#ff4444";
  const SHOT_COLOR = "#44d9ff";

  let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    speed: 4.5,
    size: 16,
    hp: 100,
    maxHp: 100,
    shotCooldown: 0,
    facing: 1
  };

  let enemies = [];
  let shots = [];
  let particles = [];
  let keys = {};
  let score = 0;
  let kills = 0;
  let wave = 1;
  let spawnTimer = 0;
  let gameOver = false;

  function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    if (side === 0) { // Top
      x = Math.random() * canvas.width;
      y = -20;
    } else if (side === 1) { // Right
      x = canvas.width + 20;
      y = Math.random() * canvas.height;
    } else if (side === 2) { // Bottom
      x = Math.random() * canvas.width;
      y = canvas.height + 20;
    } else { // Left
      x = -20;
      y = Math.random() * canvas.height;
    }

    enemies.push({
      x,
      y,
      vx: 0,
      vy: 0,
      speed: 1.2 + wave * 0.1,
      size: 12,
      hp: 2 + Math.floor(wave / 3),
      maxHp: 2 + Math.floor(wave / 3)
    });
  }

  function shootBullet() {
    if (player.shotCooldown > 0) return;

    const dx = keys["d"] || keys["ArrowRight"] ? 1 : (keys["a"] || keys["ArrowLeft"] ? -1 : player.facing);
    const dy = keys["s"] || keys["ArrowDown"] ? 1 : (keys["w"] || keys["ArrowUp"] ? -1 : 0);
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;

    shots.push({
      x: player.x,
      y: player.y,
      vx: (dx / mag) * 8,
      vy: (dy / mag) * 8,
      size: 6,
      damage: 1
    });

    player.shotCooldown = 15;
  }

  function addParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        life: 20 + Math.random() * 15,
        maxLife: 35,
        color
      });
    }
  }

  function handleKeyDown(e) {
    if (["w", "a", "s", "d", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;

    if (e.key === " " && !gameOver) {
      shootBullet();
    }
  }

  function handleKeyUp(e) {
    keys[e.key] = false;
  }

  canvas.addEventListener("keydown", handleKeyDown);
  canvas.addEventListener("keyup", handleKeyUp);

  let animationId;
  function gameLoop() {
    if (!gameOver) {
      // Player movement
      let dx = 0, dy = 0;
      if (keys["a"] || keys["ArrowLeft"]) { dx -= 1; player.facing = -1; }
      if (keys["d"] || keys["ArrowRight"]) { dx += 1; player.facing = 1; }
      if (keys["w"] || keys["ArrowUp"]) dy -= 1;
      if (keys["s"] || keys["ArrowDown"]) dy += 1;

      const mag = Math.sqrt(dx * dx + dy * dy);
      if (mag > 0) {
        player.vx = (dx / mag) * player.speed;
        player.vy = (dy / mag) * player.speed;
      } else {
        player.vx *= 0.85;
        player.vy *= 0.85;
      }

      player.x += player.vx;
      player.y += player.vy;

      // Boundaries
      player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
      player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

      if (player.shotCooldown > 0) player.shotCooldown--;

      // Update shots
      for (let i = shots.length - 1; i >= 0; i--) {
        const shot = shots[i];
        shot.x += shot.vx;
        shot.y += shot.vy;

        // Remove off-screen shots
        if (shot.x < 0 || shot.x > canvas.width || shot.y < 0 || shot.y > canvas.height) {
          shots.splice(i, 1);
          continue;
        }

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          const dist = Math.sqrt((shot.x - enemy.x) ** 2 + (shot.y - enemy.y) ** 2);
          if (dist < shot.size + enemy.size) {
            enemy.hp -= shot.damage;
            addParticles(shot.x, shot.y, SHOT_COLOR, 4);
            shots.splice(i, 1);

            if (enemy.hp <= 0) {
              addParticles(enemy.x, enemy.y, ENEMY_COLOR, 12);
              enemies.splice(j, 1);
              kills++;
              score += 10;
            }
            break;
          }
        }
      }

      // Update enemies
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
          enemy.vx = (dx / dist) * enemy.speed;
          enemy.vy = (dy / dist) * enemy.speed;
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Check collision with player
        const playerDist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
        if (playerDist < enemy.size + player.size) {
          player.hp -= 5;
          addParticles(player.x, player.y, "#ff3333", 6);
          enemies.splice(i, 1);

          if (player.hp <= 0) {
            gameOver = true;
          }
        }
      }

      // Spawn enemies
      spawnTimer++;
      const spawnRate = Math.max(40, 120 - wave * 8);
      if (spawnTimer >= spawnRate) {
        spawnEnemy();
        spawnTimer = 0;
      }

      // Check wave progression
      if (kills >= wave * 10) {
        wave++;
        player.hp = Math.min(player.maxHp, player.hp + 20);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    // Draw
    ctx.fillStyle = "#0a0511";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid effect
    ctx.strokeStyle = "#ffffff08";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw particles
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Draw shots
    for (const shot of shots) {
      ctx.fillStyle = SHOT_COLOR;
      ctx.shadowBlur = 8;
      ctx.shadowColor = SHOT_COLOR;
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw enemies
    for (const enemy of enemies) {
      ctx.fillStyle = ENEMY_COLOR;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ENEMY_COLOR;
      ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size, enemy.size * 2, enemy.size * 2);
      ctx.shadowBlur = 0;

      // HP bar
      const hpRatio = enemy.hp / enemy.maxHp;
      ctx.fillStyle = "#ffffff33";
      ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 8, enemy.size * 2, 3);
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 8, enemy.size * 2 * hpRatio, 3);
    }

    // Draw player
    ctx.fillStyle = PLAYER_COLOR;
    ctx.shadowBlur = 12;
    ctx.shadowColor = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Player direction indicator
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x + player.facing * 8, player.y - 2, 4, 4);

    // UI
    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`Wave: ${wave}`, 10, 20);
    ctx.fillText(`Kills: ${kills}`, 10, 40);
    ctx.fillText(`Score: ${score}`, 10, 60);

    // HP bar
    const hpRatio = player.hp / player.maxHp;
    ctx.fillStyle = "#222244";
    ctx.fillRect(10, canvas.height - 30, 200, 20);
    ctx.fillStyle = hpRatio > 0.3 ? "#00ff44" : "#ff3333";
    ctx.fillRect(10, canvas.height - 30, 200 * hpRatio, 20);
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, canvas.height - 30, 200, 20);
    ctx.fillStyle = "#ffffff";
    ctx.font = "12px monospace";
    ctx.fillText(`HP: ${Math.max(0, player.hp)}/${player.maxHp}`, 15, canvas.height - 15);

    if (gameOver) {
      ctx.fillStyle = "#00000088";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#3cff6b";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("DEFEATED", canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = "18px monospace";
      ctx.fillText(`Wave ${wave} · ${kills} Kills · Score ${score}`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.textAlign = "left";
    } else {
      ctx.fillStyle = "#3cff6b99";
      ctx.font = "11px monospace";
      ctx.fillText("WASD or Arrows to move · Space to shoot", 10, canvas.height - 40);
    }

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
