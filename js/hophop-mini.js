// HopHop Mini - Infinite climber with wall kicks for demo
export function mountHopHopMini(container) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  canvas.style.cssText = "width:100%;height:100%;object-fit:contain;background:linear-gradient(180deg,#0a0c12,#05 0608);";
  canvas.tabIndex = 0;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  const GRAVITY = 0.46;
  const RUN_ACCEL = 0.58;
  const MAX_SPEED = 7.4;
  const FRICTION_GROUND = 0.90;
  const FRICTION_AIR = 0.975;
  const BASE_JUMP = 12.6;
  const MOMENTUM_BONUS = 0.78; // Speed gives you more jump height

  const WALL_KICK_X = 6.9;
  const WALL_KICK_BASE_Y = 11.6;

  const PLATFORM_H = 12;
  const PLATFORM_MIN_W = 84;
  const PLATFORM_MAX_W = 140;
  const GAP_Y = 86;

  const PLAYER_W = 20;
  const PLAYER_H = 20;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function irand(a, b) { return Math.floor(rand(a, b + 1)); }

  let player = {
    x: canvas.width / 2 - PLAYER_W / 2,
    y: 320,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
    touchingWall: 0
  };

  let platforms = [];
  let height = 0; // Current height score
  let cameraY = 0;
  let topSpawnY = 360;
  let keys = {};

  function spawnPlatform() {
    const w = irand(PLATFORM_MIN_W, PLATFORM_MAX_W);
    const x = irand(10, Math.max(10, canvas.width - w - 10));
    const y = topSpawnY - GAP_Y;
    platforms.push({ x, y, w, h: PLATFORM_H });
    topSpawnY = y;
  }

  // Create initial platforms
  const floorW = Math.max(240, canvas.width * 0.64);
  platforms.push({
    x: canvas.width / 2 - floorW / 2,
    y: 360,
    w: floorW,
    h: PLATFORM_H
  });

  for (let i = 0; i < 12; i++) {
    spawnPlatform();
  }

  function ensurePlatformsAhead() {
    const aheadY = cameraY - 400;
    while (topSpawnY > aheadY) {
      spawnPlatform();
    }

    // Prune platforms that are off-screen below
    const pruneY = cameraY + canvas.height + 200;
    platforms = platforms.filter(p => p.y < pruneY);
  }

  function handleKeyDown(e) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;

    // Jump from ground
    if ((e.key === "ArrowUp" || e.key === " ") && player.onGround) {
      const bonus = Math.abs(player.vx) * MOMENTUM_BONUS;
      player.vy = -(BASE_JUMP + bonus);
      player.onGround = false;
    }

    // Wall kick
    if ((e.key === "ArrowUp" || e.key === " ") && !player.onGround && player.touchingWall !== 0) {
      const dir = player.touchingWall;
      player.vx = -dir * WALL_KICK_X;
      player.vy = -WALL_KICK_BASE_Y;
      player.touchingWall = 0;
    }
  }

  function handleKeyUp(e) {
    keys[e.key] = false;
  }

  canvas.addEventListener("keydown", handleKeyDown);
  canvas.addEventListener("keyup", handleKeyUp);

  let animationId;
  function gameLoop() {
    // Input
    if (keys["ArrowLeft"]) { player.vx -= RUN_ACCEL; player.facing = -1; }
    if (keys["ArrowRight"]) { player.vx += RUN_ACCEL; player.facing = 1; }

    // Clamp speed
    player.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, player.vx));

    // Friction
    player.vx *= (player.onGround ? FRICTION_GROUND : FRICTION_AIR);

    // Gravity (with jump hold for floaty feeling)
    const hang = (!player.onGround && (keys["ArrowUp"] || keys[" "]) && player.vy < 0) ? 0.82 : 1.0;
    player.vy += GRAVITY * hang;

    // Move
    player.x += player.vx;
    player.y += player.vy;

    // Wall collision
    player.touchingWall = 0;
    if (player.x < 0) {
      player.x = 0;
      player.touchingWall = -1;
    } else if (player.x + PLAYER_W > canvas.width) {
      player.x = canvas.width - PLAYER_W;
      player.touchingWall = 1;
    }

    // Platform collision
    player.onGround = false;
    if (player.vy >= 0) {
      for (let i = 0; i < platforms.length; i++) {
        const p = platforms[i];
        const px1 = player.x, px2 = player.x + PLAYER_W;
        const py2 = player.y + PLAYER_H;

        const ox = (px2 > p.x) && (px1 < p.x + p.w);
        if (!ox) continue;

        const wasAbove = (py2 - player.vy) <= p.y;
        const nowBelow = py2 >= p.y;
        if (wasAbove && nowBelow && py2 <= p.y + p.h + player.vy + 2) {
          player.y = p.y - PLAYER_H;
          player.vy = 0;
          player.onGround = true;
          break;
        }
      }
    }

    // Update camera (only move up, smooth)
    const targetCam = player.y - (canvas.height / 2);
    const desiredCam = Math.min(targetCam, player.y - 200);
    if (desiredCam < cameraY) {
      cameraY += (desiredCam - cameraY) * 0.08;
    }

    // Update height score
    const currentHeight = Math.max(0, Math.floor((360 - player.y)));
    if (currentHeight > height) height = currentHeight;

    ensurePlatformsAhead();

    // Draw
    ctx.fillStyle = "#0a0c12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const camY = cameraY;

    // Platforms
    for (const p of platforms) {
      const sy = p.y - camY;
      if (sy < -60 || sy > canvas.height + 80) continue;

      // Platform body
      ctx.fillStyle = "rgba(0,245,212,.15)";
      ctx.fillRect(p.x, sy, p.w, p.h);

      // Top highlight
      ctx.fillStyle = "rgba(0,245,212,.25)";
      ctx.fillRect(p.x + 2, sy, p.w - 4, 2);
    }

    // Player
    const py = player.y - camY;
    ctx.fillStyle = player.onGround ? "#86d8ff" : "#ff6b88";
    ctx.shadowBlur = 12;
    ctx.shadowColor = player.onGround ? "#86d8ff" : "#ff6b88";
    ctx.fillRect(player.x, py, PLAYER_W, PLAYER_H);
    ctx.shadowBlur = 0;

    // Eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(player.x + 5, py + 6, 4, 4);
    ctx.fillRect(player.x + 11, py + 6, 4, 4);

    // UI
    ctx.fillStyle = "#00f5d4";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`Height: ${height}`, 10, 30);

    ctx.fillStyle = "#8892a899";
    ctx.font = "11px monospace";
    ctx.fillText("← → move · Space jump · Wall-kick off sides!", 10, canvas.height - 10);

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
