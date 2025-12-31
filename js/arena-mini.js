// Arena Mini - Roguelike combat demo matching the actual game
export function mountArenaMini(container) {
  const canvas = document.createElement("canvas");
  canvas.width = 700;
  canvas.height = 450;
  canvas.style.cssText = "width:100%;height:100%;object-fit:contain;background:#0a0511;";
  canvas.tabIndex = 0;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  // Colors matching actual game
  const COLORS = {
    warrior: { primary: "#3cff6b", secondary: "#2acc50", glow: "#1a9939" },
    grunt: { body: "#ff4444", glow: "#ff8888" },
    runner: { body: "#ffaa33", glow: "#ffcc77" },
    shooter: { body: "#ff44d9", glow: "#ff88ee" },
    tank: { body: "#991111", glow: "#dd4444" },
    shot: "#44d9ff",
    ui: { text: "#e0e0ff", health: "#00ff44", healthLow: "#ff3333" }
  };

  let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    speed: 3.2,
    accel: 0.35,
    drag: 0.86,
    size: 18,
    hp: 160,
    maxHp: 160,
    shotCooldown: 0,
    attackWindup: 0,
    facing: 1
  };

  const ENEMY_TYPES = {
    grunt: { hp: 3, speed: 1.5, size: 14, color: COLORS.grunt, score: 18 },
    runner: { hp: 2, speed: 2.2, size: 12, color: COLORS.runner, score: 28 },
    shooter: { hp: 3, speed: 1.0, size: 14, color: COLORS.shooter, score: 40 },
    tank: { hp: 8, speed: 0.8, size: 20, color: COLORS.tank, score: 55 }
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
  let shake = 0;

  function spawnEnemy() {
    const types = Object.keys(ENEMY_TYPES);
    let typeKey = types[Math.floor(Math.random() * Math.min(types.length, 1 + Math.floor(wave / 3)))];

    // More variety as waves progress
    if (wave > 5 && Math.random() < 0.3) typeKey = 'shooter';
    if (wave > 8 && Math.random() < 0.2) typeKey = 'tank';

    const type = ENEMY_TYPES[typeKey];
    const side = Math.floor(Math.random() * 4);
    let x, y;

    if (side === 0) { x = Math.random() * canvas.width; y = -20; }
    else if (side === 1) { x = canvas.width + 20; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 20; }
    else { x = -20; y = Math.random() * canvas.height; }

    enemies.push({
      x, y,
      vx: 0, vy: 0,
      type: typeKey,
      speed: type.speed * (0.8 + wave * 0.02),
      size: type.size,
      hp: type.hp + Math.floor(wave / 4),
      maxHp: type.hp + Math.floor(wave / 4),
      color: type.color,
      score: type.score
    });
  }

  function shootArrow() {
    if (player.shotCooldown > 0) return;

    const dx = keys["d"] || keys["ArrowRight"] ? 1 : (keys["a"] || keys["ArrowLeft"] ? -1 : player.facing);
    const dy = keys["s"] || keys["ArrowDown"] ? 1 : (keys["w"] || keys["ArrowUp"] ? -1 : 0);
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;

    shots.push({
      x: player.x,
      y: player.y,
      vx: (dx / mag) * 10,
      vy: (dy / mag) * 10,
      size: 7,
      damage: 1,
      life: 60
    });

    player.shotCooldown = 12;
    player.attackWindup = 8;
  }

  function addParticles(x, y, color, count = 8, speed = 3) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.5 + Math.random() * speed;
      particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2 + Math.random() * 5,
        life: 15 + Math.random() * 20,
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
      shootArrow();
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
      // Player movement with acceleration
      let ax = 0, ay = 0;
      if (keys["a"] || keys["ArrowLeft"]) { ax -= 1; player.facing = -1; }
      if (keys["d"] || keys["ArrowRight"]) { ax += 1; player.facing = 1; }
      if (keys["w"] || keys["ArrowUp"]) ay -= 1;
      if (keys["s"] || keys["ArrowDown"]) ay += 1;

      const mag = Math.sqrt(ax * ax + ay * ay);
      if (mag > 0) {
        player.vx += (ax / mag) * player.accel;
        player.vy += (ay / mag) * player.accel;
      }

      // Apply drag
      player.vx *= player.drag;
      player.vy *= player.drag;

      // Clamp speed
      const currentSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
      if (currentSpeed > player.speed) {
        player.vx = (player.vx / currentSpeed) * player.speed;
        player.vy = (player.vy / currentSpeed) * player.speed;
      }

      player.x += player.vx;
      player.y += player.vy;

      // Boundaries
      player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
      player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));

      if (player.shotCooldown > 0) player.shotCooldown--;
      if (player.attackWindup > 0) player.attackWindup--;

      // Update shots
      for (let i = shots.length - 1; i >= 0; i--) {
        const shot = shots[i];
        shot.x += shot.vx;
        shot.y += shot.vy;
        shot.life--;

        if (shot.life <= 0 || shot.x < 0 || shot.x > canvas.width || shot.y < 0 || shot.y > canvas.height) {
          shots.splice(i, 1);
          continue;
        }

        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          const dist = Math.sqrt((shot.x - enemy.x) ** 2 + (shot.y - enemy.y) ** 2);
          if (dist < shot.size + enemy.size) {
            enemy.hp -= shot.damage;
            addParticles(shot.x, shot.y, COLORS.shot, 5, 2);
            shake = 3;
            shots.splice(i, 1);

            if (enemy.hp <= 0) {
              addParticles(enemy.x, enemy.y, enemy.color.body, 16, 4);
              enemies.splice(j, 1);
              kills++;
              score += enemy.score;
              shake = 5;
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
          player.hp -= 8;
          addParticles(player.x, player.y, "#ff3333", 8, 3);
          shake = 8;
          enemies.splice(i, 1);

          if (player.hp <= 0) {
            gameOver = true;
          }
        }
      }

      // Spawn enemies
      spawnTimer++;
      const spawnRate = Math.max(35, 100 - wave * 6);
      if (spawnTimer >= spawnRate) {
        spawnEnemy();
        spawnTimer = 0;
      }

      // Wave progression
      if (kills >= wave * 8) {
        wave++;
        player.hp = Math.min(player.maxHp, player.hp + 25);
        addParticles(player.x, player.y, COLORS.warrior.primary, 20, 5);
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      if (shake > 0) shake--;
    }

    // Draw
    ctx.save();

    // Screen shake
    if (shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * shake * 2,
        (Math.random() - 0.5) * shake * 2
      );
    }

    ctx.fillStyle = "#0a0511";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid effect
    ctx.strokeStyle = "#ffffff06";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Particles
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha * 0.9;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    // Shots
    for (const shot of shots) {
      ctx.fillStyle = COLORS.shot;
      ctx.shadowBlur = 12;
      ctx.shadowColor = COLORS.shot;
      ctx.beginPath();
      ctx.arc(shot.x, shot.y, shot.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Enemies
    for (const enemy of enemies) {
      ctx.fillStyle = enemy.color.body;
      ctx.shadowBlur = 14;
      ctx.shadowColor = enemy.color.glow;

      // Different shapes for different types
      if (enemy.type === 'tank') {
        ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size, enemy.size * 2, enemy.size * 2);
      } else if (enemy.type === 'runner') {
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y - enemy.size);
        ctx.lineTo(enemy.x + enemy.size, enemy.y + enemy.size);
        ctx.lineTo(enemy.x - enemy.size, enemy.y + enemy.size);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size, enemy.size * 2, enemy.size * 2);
      }
      ctx.shadowBlur = 0;

      // HP bar
      if (enemy.hp < enemy.maxHp) {
        const hpRatio = enemy.hp / enemy.maxHp;
        ctx.fillStyle = "#22224488";
        ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 10, enemy.size * 2, 4);
        ctx.fillStyle = enemy.color.glow;
        ctx.fillRect(enemy.x - enemy.size, enemy.y - enemy.size - 10, enemy.size * 2 * hpRatio, 4);
      }
    }

    // Player (Warrior)
    const pulse = player.attackWindup > 0 ? 1.2 : 1.0;
    ctx.fillStyle = COLORS.warrior.primary;
    ctx.shadowBlur = 16 * pulse;
    ctx.shadowColor = COLORS.warrior.primary;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Direction indicator
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x + player.facing * 12, player.y - 3, 6, 6);

    ctx.restore();

    // UI
    ctx.fillStyle = COLORS.warrior.primary;
    ctx.font = "bold 16px monospace";
    ctx.fillText(`Wave ${wave}`, 12, 24);
    ctx.fillText(`Kills ${kills}`, 12, 48);
    ctx.fillText(`Score ${score}`, 12, 72);

    // HP bar
    const hpRatio = player.hp / player.maxHp;
    ctx.fillStyle = "#222244";
    ctx.fillRect(12, canvas.height - 40, 240, 24);
    ctx.fillStyle = hpRatio > 0.3 ? COLORS.ui.health : COLORS.ui.healthLow;
    ctx.fillRect(12, canvas.height - 40, 240 * hpRatio, 24);
    ctx.strokeStyle = COLORS.warrior.primary;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, canvas.height - 40, 240, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`${Math.max(0, Math.floor(player.hp))}/${player.maxHp}`, 18, canvas.height - 20);

    if (gameOver) {
      ctx.fillStyle = "#00000099";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = COLORS.warrior.primary;
      ctx.shadowBlur = 20;
      ctx.shadowColor = COLORS.warrior.primary;
      ctx.font = "bold 36px monospace";
      ctx.textAlign = "center";
      ctx.fillText("DEFEATED", canvas.width / 2, canvas.height / 2 - 30);
      ctx.shadowBlur = 0;
      ctx.font = "20px monospace";
      ctx.fillText(`Wave ${wave} · ${kills} Kills · ${score} Score`, canvas.width / 2, canvas.height / 2 + 20);
      ctx.textAlign = "left";
    } else {
      ctx.fillStyle = COLORS.warrior.secondary + "aa";
      ctx.font = "12px monospace";
      ctx.fillText("WASD/Arrows move · Space shoot", 12, canvas.height - 50);
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
