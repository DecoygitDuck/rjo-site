// Arena Mini - Roguelike combat demo with pixel-art style matching actual game
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
    grunt: { body: "#ff4444", dark: "#cc2222", glow: "#ff8888" },
    runner: { body: "#ffaa33", dark: "#cc8822", glow: "#ffcc77" },
    shooter: { body: "#ff44d9", dark: "#cc22aa", glow: "#ff88ee" },
    tank: { body: "#991111", dark: "#660000", glow: "#dd4444" }
  };

  // Helper functions matching actual game
  function px(x, y, w, h, c, a = 1) {
    ctx.globalAlpha = a;
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }

  function drawShadow(x, y, w) {
    ctx.globalAlpha = 0.30;
    px(x - w / 2, y + 20, w, 6, "#000");
    ctx.globalAlpha = 1;
  }

  let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 0,
    vy: 0,
    speed: 3.2,
    accel: 0.35,
    drag: 0.86,
    hp: 160,
    maxHp: 160,
    shotCooldown: 0,
    attackWindup: 0,
    facing: 1,
    step: 0,
    aimX: 1,
    aimY: 0
  };

  const ENEMY_TYPES = {
    grunt: { hp: 3, speed: 1.5, size: 1.0, color: COLORS.grunt, score: 18 },
    runner: { hp: 2, speed: 2.2, size: 0.9, color: COLORS.runner, score: 28 },
    shooter: { hp: 3, speed: 1.0, size: 1.0, color: COLORS.shooter, score: 40 },
    tank: { hp: 8, speed: 0.8, size: 1.3, color: COLORS.tank, score: 55 }
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
  let tick = 0;

  // Draw player in pixel-art style like actual game
  function drawHero(p) {
    const S = 3; // Scale factor
    drawShadow(p.x, p.y, 32);

    const bob = Math.sin(p.step / 5) * 2;
    const x = p.x, y = p.y + bob;
    const atk = p.attackWindup > 0;

    // Body - warrior with green cape
    px(x - 3 * S, y - 5 * S, 6 * S, 10 * S, "#8a6a4a", 0.9); // Body
    px(x - 4 * S, y - 6 * S, 8 * S, 2 * S, COLORS.warrior.primary, 0.9); // Shoulders/cape

    // Head
    px(x - 2.5 * S, y - 9 * S, 5 * S, 5 * S, "#d4a574", 0.9);

    // Legs (animated with step)
    const legOffset = Math.sin(p.step / 3) > 0 ? 1 : -1;
    px(x - 2 * S, y + 5 * S, 2 * S, 4 * S, "#6a5a4a", 0.9); // Left leg
    px(x + legOffset * S, y + 5 * S, 2 * S, 4 * S, "#6a5a4a", 0.9); // Right leg

    // Weapon indicator when facing
    if (p.facing > 0) {
      px(x + 3 * S, y - S, 4 * S, 2 * S, "#aaa", 0.8);
    } else {
      px(x - 7 * S, y - S, 4 * S, 2 * S, "#aaa", 0.8);
    }

    // Attack arc
    if (atk) {
      const a = p.attackWindup / 8;
      const center = Math.atan2(p.aimY, p.aimX);
      const arc = 0.8;
      ctx.globalAlpha = 0.30 * a;
      ctx.strokeStyle = COLORS.warrior.primary;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 60, center - arc, center + arc);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // Draw enemy in pixel-art style like actual game
  function drawEnemy(e) {
    const S = 3;
    const bob = Math.sin((tick + e.seed) / 7) * 2;
    const x = e.x, y = e.y + bob;
    const sizeM = e.size;

    drawShadow(x, y, 24 * sizeM);

    const colorScheme = e.color;

    // Different shapes for different enemy types
    if (e.type === 'tank') {
      // Large bulky enemy
      px(x - 5 * S * sizeM, y - 6 * S * sizeM, 10 * S * sizeM, 12 * S * sizeM, colorScheme.body, 0.9);
      px(x - 4 * S * sizeM, y - 7 * S * sizeM, 8 * S * sizeM, 4 * S * sizeM, colorScheme.dark, 0.9);
      // Eyes
      px(x - 2 * S * sizeM, y - 5 * S * sizeM, 1.5 * S * sizeM, 1.5 * S * sizeM, "#ff8888", 1);
      px(x + 1 * S * sizeM, y - 5 * S * sizeM, 1.5 * S * sizeM, 1.5 * S * sizeM, "#ff8888", 1);
    } else if (e.type === 'runner') {
      // Lean forward, triangle-ish
      px(x - 3 * S * sizeM, y - 4 * S * sizeM, 6 * S * sizeM, 8 * S * sizeM, colorScheme.body, 0.9);
      px(x - 2 * S * sizeM, y - 6 * S * sizeM, 4 * S * sizeM, 3 * S * sizeM, colorScheme.dark, 0.9);
      px(x - S * sizeM, y - 3 * S * sizeM, 2 * S * sizeM, 1.5 * S * sizeM, "#ffee88", 1);
    } else if (e.type === 'shooter') {
      // Ranged enemy with gem
      px(x - 3 * S * sizeM, y - 5 * S * sizeM, 6 * S * sizeM, 10 * S * sizeM, colorScheme.body, 0.9);
      px(x - 2 * S * sizeM, y - 7 * S * sizeM, 4 * S * sizeM, 3 * S * sizeM, colorScheme.dark, 0.9);
      // Glowing gem
      ctx.shadowBlur = 6;
      ctx.shadowColor = colorScheme.glow;
      px(x - 1.5 * S * sizeM, y - 6 * S * sizeM, 3 * S * sizeM, 3 * S * sizeM, colorScheme.glow, 1);
      ctx.shadowBlur = 0;
    } else {
      // Basic grunt
      px(x - 3 * S * sizeM, y - 5 * S * sizeM, 6 * S * sizeM, 10 * S * sizeM, colorScheme.body, 0.9);
      px(x - 2 * S * sizeM, y - 7 * S * sizeM, 4 * S * sizeM, 3 * S * sizeM, colorScheme.dark, 0.9);
      // Eyes
      px(x - S * sizeM, y - 5 * S * sizeM, 1 * S * sizeM, 1 * S * sizeM, "#fff", 1);
      px(x + 0.5 * S * sizeM, y - 5 * S * sizeM, 1 * S * sizeM, 1 * S * sizeM, "#fff", 1);
    }

    // HP bar when damaged
    if (e.hp < e.maxHp) {
      const hpRatio = e.hp / e.maxHp;
      const barW = 20 * sizeM;
      px(x - barW / 2, y - 12 * sizeM, barW, 3, "#22224488");
      px(x - barW / 2, y - 12 * sizeM, barW * hpRatio, 3, colorScheme.glow);
    }
  }

  function spawnEnemy() {
    const types = Object.keys(ENEMY_TYPES);
    let typeKey = types[Math.floor(Math.random() * Math.min(types.length, 1 + Math.floor(wave / 3)))];

    if (wave > 5 && Math.random() < 0.3) typeKey = 'shooter';
    if (wave > 8 && Math.random() < 0.2) typeKey = 'tank';

    const type = ENEMY_TYPES[typeKey];
    const side = Math.floor(Math.random() * 4);
    let x, y;

    if (side === 0) { x = Math.random() * canvas.width; y = -30; }
    else if (side === 1) { x = canvas.width + 30; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height + 30; }
    else { x = -30; y = Math.random() * canvas.height; }

    enemies.push({
      x, y,
      vx: 0, vy: 0,
      type: typeKey,
      speed: type.speed * (0.8 + wave * 0.02),
      size: type.size,
      hp: type.hp + Math.floor(wave / 4),
      maxHp: type.hp + Math.floor(wave / 4),
      color: type.color,
      score: type.score,
      seed: Math.random() * 100
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
      vx: (dx / mag) * 12,
      vy: (dy / mag) * 12,
      damage: 1,
      life: 50
    });

    player.shotCooldown = 12;
    player.attackWindup = 8;
    player.aimX = dx / mag;
    player.aimY = dy / mag;
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
    tick++;

    if (!gameOver) {
      // Player movement
      let ax = 0, ay = 0;
      if (keys["a"] || keys["ArrowLeft"]) { ax -= 1; player.facing = -1; }
      if (keys["d"] || keys["ArrowRight"]) { ax += 1; player.facing = 1; }
      if (keys["w"] || keys["ArrowUp"]) ay -= 1;
      if (keys["s"] || keys["ArrowDown"]) ay += 1;

      const mag = Math.sqrt(ax * ax + ay * ay);
      if (mag > 0) {
        player.vx += (ax / mag) * player.accel;
        player.vy += (ay / mag) * player.accel;
        player.step++;
      }

      player.vx *= player.drag;
      player.vy *= player.drag;

      const currentSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
      if (currentSpeed > player.speed) {
        player.vx = (player.vx / currentSpeed) * player.speed;
        player.vy = (player.vy / currentSpeed) * player.speed;
      }

      player.x += player.vx;
      player.y += player.vy;
      player.x = Math.max(40, Math.min(canvas.width - 40, player.x));
      player.y = Math.max(40, Math.min(canvas.height - 40, player.y));

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

        for (let j = enemies.length - 1; j >= 0; j--) {
          const enemy = enemies[j];
          const dist = Math.hypot(shot.x - enemy.x, shot.y - enemy.y);
          if (dist < 20 * enemy.size) {
            enemy.hp -= shot.damage;
            addParticles(shot.x, shot.y, "#44d9ff", 4, 2);
            shake = 3;
            shots.splice(i, 1);

            if (enemy.hp <= 0) {
              addParticles(enemy.x, enemy.y, enemy.color.body, 12, 4);
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

        const playerDist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (playerDist < 30) {
          player.hp -= 8;
          addParticles(player.x, player.y, "#ff3333", 8, 3);
          shake = 8;
          enemies.splice(i, 1);

          if (player.hp <= 0) {
            gameOver = true;
          }
        }
      }

      spawnTimer++;
      const spawnRate = Math.max(35, 100 - wave * 6);
      if (spawnTimer >= spawnRate) {
        spawnEnemy();
        spawnTimer = 0;
      }

      if (kills >= wave * 8) {
        wave++;
        player.hp = Math.min(player.maxHp, player.hp + 25);
        addParticles(player.x, player.y, COLORS.warrior.primary, 20, 5);
      }

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

    if (shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * shake * 2,
        (Math.random() - 0.5) * shake * 2
      );
    }

    // Radial gradient background like actual game
    const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 400);
    grad.addColorStop(0, "#1a1528");
    grad.addColorStop(1, "#0a0511");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arena circle with glow
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#4a3a5a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 180, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Particles
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      px(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size, p.color, alpha * 0.9);
    }

    // Shots - arrow style like actual game
    for (const shot of shots) {
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#44d9ff";
      px(shot.x - 11, shot.y - 2.5, 22, 5, "#e6edf3", 0.95);
      px(shot.x + (shot.vx > 0 ? 7 : -9), shot.y - 6, 5, 12, "#e6edf3", 0.8);
      ctx.shadowBlur = 0;
    }

    // Enemies
    for (const enemy of enemies) {
      drawEnemy(enemy);
    }

    // Player
    drawHero(player);

    ctx.restore();

    // UI
    ctx.fillStyle = COLORS.warrior.primary;
    ctx.font = "bold 16px monospace";
    ctx.fillText(`Wave ${wave}`, 12, 24);
    ctx.fillText(`Kills ${kills}`, 12, 48);
    ctx.fillText(`Score ${score}`, 12, 72);

    // HP bar
    const hpRatio = player.hp / player.maxHp;
    px(12, canvas.height - 40, 240, 24, "#1a1a2e", 0.85);
    px(12, canvas.height - 40, 240 * hpRatio, 24, hpRatio > 0.3 ? "#00ff44" : "#ff3333");
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
