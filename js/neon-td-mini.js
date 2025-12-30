// Neon TD Mini - Simplified tower defense for demo
export function mountNeonTdMini(container) {
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 400;
  canvas.style.cssText = "width:100%;height:100%;object-fit:contain;background:#070012;";
  canvas.tabIndex = 0;
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const GRID_SIZE = 20;
  const COLS = Math.floor(canvas.width / GRID_SIZE);
  const ROWS = Math.floor(canvas.height / GRID_SIZE);

  let money = 100;
  let lives = 10;
  let wave = 1;
  let gameOver = false;
  let selectedTower = null;
  let selectedTowerType = "laser"; // Currently selected tower type to build
  let towers = [];
  let enemies = [];
  let projectiles = [];
  let waveInProgress = false;

  // Path definition (simple horizontal path)
  const path = [];
  const pathY = Math.floor(ROWS / 2);
  for (let x = 0; x < COLS; x++) {
    path.push({ x, y: pathY });
  }

  // Tower types (matching actual game)
  const TOWER_TYPES = {
    laser: { cost: 20, damage: 10, range: 2.6, fireRate: 30, color: "#00ffff", name: "Laser" },
    cannon: { cost: 30, damage: 25, range: 3.0, fireRate: 60, color: "#ff00ff", name: "Cannon" },
    frost: { cost: 25, damage: 5, range: 2.4, fireRate: 40, color: "#86d8ff", name: "Frost", slow: 0.5 },
  };

  class Tower {
    constructor(x, y, type) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.spec = TOWER_TYPES[type];
      this.cooldown = 0;
    }

    update() {
      if (this.cooldown > 0) this.cooldown--;

      if (this.cooldown === 0) {
        const target = enemies.find(e => {
          const dx = e.x - this.x * GRID_SIZE;
          const dy = e.y - this.y * GRID_SIZE;
          return Math.sqrt(dx * dx + dy * dy) < this.spec.range * GRID_SIZE;
        });

        if (target) {
          projectiles.push({
            x: this.x * GRID_SIZE + GRID_SIZE / 2,
            y: this.y * GRID_SIZE + GRID_SIZE / 2,
            targetX: target.x,
            targetY: target.y,
            damage: this.spec.damage,
            color: this.spec.color,
            slow: this.spec.slow || 0
          });
          this.cooldown = this.spec.fireRate;
        }
      }
    }

    draw() {
      ctx.fillStyle = this.spec.color + "33";
      ctx.fillRect(this.x * GRID_SIZE, this.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      ctx.strokeStyle = this.spec.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x * GRID_SIZE, this.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

      // Core
      ctx.fillStyle = this.spec.color;
      ctx.beginPath();
      ctx.arc(this.x * GRID_SIZE + GRID_SIZE / 2, this.y * GRID_SIZE + GRID_SIZE / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Enemy {
    constructor(pathIndex) {
      this.pathIndex = pathIndex;
      const pos = path[this.pathIndex];
      this.x = pos.x * GRID_SIZE + GRID_SIZE / 2;
      this.y = pos.y * GRID_SIZE + GRID_SIZE / 2;
      this.hp = 50 + wave * 10;
      this.maxHp = this.hp;
      this.baseSpeed = 1;
      this.slowFactor = 1; // 1 = normal, 0.5 = half speed
    }

    update() {
      this.slowFactor = 1; // Reset slow each frame
      this.pathIndex += (this.baseSpeed * this.slowFactor) / GRID_SIZE;

      if (this.pathIndex >= path.length) {
        lives--;
        return true; // Remove enemy
      }

      const targetPos = path[Math.floor(this.pathIndex)];
      if (targetPos) {
        this.x = targetPos.x * GRID_SIZE + GRID_SIZE / 2;
        this.y = targetPos.y * GRID_SIZE + GRID_SIZE / 2;
      }

      return false;
    }

    draw() {
      ctx.fillStyle = "#ff00ff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ff00ff";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // HP bar
      const barWidth = 16;
      const barHeight = 3;
      ctx.fillStyle = "#200020";
      ctx.fillRect(this.x - barWidth / 2, this.y - 12, barWidth, barHeight);
      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(this.x - barWidth / 2, this.y - 12, barWidth * (this.hp / this.maxHp), barHeight);
    }
  }

  function spawnWave() {
    if (waveInProgress) return;
    waveInProgress = true;

    const enemyCount = 5 + wave * 2;
    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        enemies.push(new Enemy(0));
      }, i * 1000);
    }

    setTimeout(() => {
      waveInProgress = false;
    }, enemyCount * 1000 + 5000);
  }

  function handleClick(e) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const gridX = Math.floor(clickX / GRID_SIZE);
    const gridY = Math.floor(clickY / GRID_SIZE);

    // Check if clicking on path
    const onPath = path.some(p => p.x === gridX && p.y === gridY);
    if (onPath) return;

    // Check if tower already exists
    const existingTower = towers.find(t => t.x === gridX && t.y === gridY);
    if (existingTower) {
      selectedTower = existingTower;
      return;
    }

    // Place selected tower type if enough money
    const towerSpec = TOWER_TYPES[selectedTowerType];
    if (towerSpec && money >= towerSpec.cost) {
      towers.push(new Tower(gridX, gridY, selectedTowerType));
      money -= towerSpec.cost;
    }
  }

  function handleKey(e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!waveInProgress && enemies.length === 0) {
        spawnWave();
      }
    } else if (e.key === "1") {
      selectedTowerType = "laser";
    } else if (e.key === "2") {
      selectedTowerType = "cannon";
    } else if (e.key === "3") {
      selectedTowerType = "frost";
    }
  }

  canvas.addEventListener("click", handleClick);
  canvas.addEventListener("keydown", handleKey);

  // Game loop
  let animationId;
  function gameLoop() {
    if (lives <= 0) {
      gameOver = true;
    }

    // Clear
    ctx.fillStyle = "#070012";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#00ffff11";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(canvas.width, y * GRID_SIZE);
      ctx.stroke();
    }

    // Draw path
    ctx.fillStyle = "#20003088";
    path.forEach(p => {
      ctx.fillRect(p.x * GRID_SIZE, p.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    });

    // Update and draw towers
    towers.forEach(t => {
      t.update();
      t.draw();
    });

    // Update and draw enemies
    enemies = enemies.filter(e => {
      const shouldRemove = e.update();
      if (!shouldRemove && e.hp > 0) {
        e.draw();
        return true;
      }
      return false;
    });

    // Update and draw projectiles
    projectiles = projectiles.filter(p => {
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        // Hit - find closest enemy
        const hitEnemy = enemies.find(e => {
          const edx = e.x - p.x;
          const edy = e.y - p.y;
          return Math.sqrt(edx * edx + edy * edy) < 10;
        });
        if (hitEnemy) {
          hitEnemy.hp -= p.damage;
          if (p.slow) {
            hitEnemy.slowFactor = p.slow;
          }
          if (hitEnemy.hp <= 0) {
            money += 10;
          }
        }
        return false;
      }

      p.x += (dx / dist) * 5;
      p.y += (dy / dist) * 5;

      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - (dx / dist) * 8, p.y - (dy / dist) * 8);
      ctx.stroke();

      return true;
    });

    // Draw UI
    ctx.fillStyle = "#00ffff";
    ctx.font = "14px monospace";
    ctx.fillText(`💰 ${money}`, 10, 20);
    ctx.fillText(`❤️ ${lives}`, 10, 40);
    ctx.fillText(`🌊 ${wave}`, 10, 60);

    // Tower selection UI
    ctx.font = "12px monospace";
    const towerY = 90;
    ["laser", "cannon", "frost"].forEach((type, i) => {
      const spec = TOWER_TYPES[type];
      const isSelected = type === selectedTowerType;
      ctx.fillStyle = isSelected ? spec.color : "#ffffff66";
      const canAfford = money >= spec.cost;
      if (!canAfford) ctx.fillStyle = "#ff005033";

      const text = `[${i+1}] ${spec.name} $${spec.cost}`;
      ctx.fillText(text, 10, towerY + i * 18);

      if (isSelected) {
        ctx.fillStyle = spec.color;
        ctx.fillRect(5, towerY + i * 18 - 10, 2, 12);
      }
    });

    if (!waveInProgress && enemies.length === 0) {
      ctx.fillStyle = "#00ff8a";
      ctx.font = "16px monospace";
      ctx.fillText("Press SPACE for next wave", canvas.width / 2 - 120, 30);
    }

    if (gameOver) {
      ctx.fillStyle = "#00000088";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ff0050";
      ctx.font = "bold 32px monospace";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      ctx.font = "16px monospace";
      ctx.fillStyle = "#00ffff";
      ctx.fillText(`Wave ${wave} reached`, canvas.width / 2, canvas.height / 2 + 40);
      ctx.textAlign = "left";
    }

    animationId = requestAnimationFrame(gameLoop);
  }

  gameLoop();

  return {
    destroy: () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener("click", handleClick);
      canvas.removeEventListener("keydown", handleKey);
      container.removeChild(canvas);
    },
    setMuted: () => {}, // No audio in mini version
    needsGesture: () => false
  };
}
