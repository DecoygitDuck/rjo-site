// WordBeat (LYRICFIELD) Mini - Generative music visualizer for demo
export function mountWordbeatMini(container) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "width:100%;height:100%;display:flex;flex-direction:column;background:linear-gradient(145deg,#0e1218,#080a0e);color:#f0f4ff;font-family:ui-monospace,monospace;";
  container.appendChild(wrapper);

  const header = document.createElement("div");
  header.style.cssText = "padding:20px 20px 10px;";
  header.innerHTML = `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#00f5d4;letter-spacing:2px;">LYRICFIELD</h2>
    <p style="margin:0;font-size:12px;color:#8892a8;">Type lyrics to generate visual patterns · SPACE to play/pause · Each text creates unique output</p>
  `;
  wrapper.appendChild(header);

  const textarea = document.createElement("textarea");
  textarea.placeholder = "type lyrics here...\n\nTip: the same text always makes the same pattern.";
  textarea.style.cssText = "flex:1;margin:0 20px;padding:16px;background:rgba(15,18,28,.85);border:1px solid rgba(255,255,255,.06);border-radius:12px;color:#f0f4ff;font:14px/1.6 ui-monospace,monospace;resize:none;outline:none;";
  wrapper.appendChild(textarea);

  const statusBar = document.createElement("div");
  statusBar.style.cssText = "display:flex;gap:12px;padding:16px 20px;flex-wrap:wrap;";
  wrapper.appendChild(statusBar);

  const statusPill = document.createElement("span");
  statusPill.style.cssText = "padding:6px 12px;background:rgba(255,255,255,.06);border-radius:999px;font-size:11px;color:#8892a8;";
  statusPill.textContent = "⏸ paused";
  statusBar.appendChild(statusPill);

  const bpmPill = document.createElement("span");
  bpmPill.style.cssText = "padding:6px 12px;background:rgba(255,255,255,.06);border-radius:999px;font-size:11px;color:#8892a8;";
  bpmPill.innerHTML = "bpm: <span style='color:#00f5d4'>92</span>";
  statusBar.appendChild(bpmPill);

  const seedPill = document.createElement("span");
  seedPill.style.cssText = "padding:6px 12px;background:rgba(255,255,255,.06);border-radius:999px;font-size:11px;color:#8892a8;";
  seedPill.innerHTML = "seed: <span style='color:#7b61ff'>—</span>";
  statusBar.appendChild(seedPill);

  // Visualization canvas
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 120;
  canvas.style.cssText = "margin:0 20px 20px;border-radius:8px;background:rgba(0,0,0,.3);";
  wrapper.insertBefore(canvas, statusBar);

  const ctx = canvas.getContext("2d");
  let isPlaying = false;
  let currentSeed = 0;
  let animFrame = 0;

  function hashSeed(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function makeRng(seed) {
    let s = seed >>> 0;
    return function() {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function drawVisualization() {
    const text = textarea.value.trim();
    if (!text) {
      currentSeed = 0;
      seedPill.innerHTML = "seed: <span style='color:#7b61ff'>—</span>";
      ctx.fillStyle = "rgba(0,0,0,.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#5a6478";
      ctx.font = "14px ui-monospace";
      ctx.textAlign = "center";
      ctx.fillText("Type something to see the pattern...", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "left";
      return;
    }

    currentSeed = hashSeed(text);
    seedPill.innerHTML = `seed: <span style='color:#7b61ff'>${currentSeed.toString(16).slice(0, 6)}</span>`;

    const rng = makeRng(currentSeed);

    // Clear
    ctx.fillStyle = "rgba(5,6,10,.15)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPlaying) {
      animFrame++;
    }

    // Draw pattern based on seed
    const barCount = 32;
    const barWidth = canvas.width / barCount;

    for (let i = 0; i < barCount; i++) {
      const val = rng();
      const time = isPlaying ? (animFrame * 0.05) : 0;
      const height = (Math.sin(val * 10 + time + i * 0.2) * 0.5 + 0.5) * canvas.height * 0.6;

      const hue = (val * 180 + 160) % 360;
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.7)`;

      ctx.fillRect(
        i * barWidth + barWidth * 0.1,
        canvas.height - height,
        barWidth * 0.8,
        height
      );
    }

    // Waveform overlay
    ctx.strokeStyle = "#00f5d4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < canvas.width; x += 4) {
      const rngVal = makeRng(currentSeed + x)();
      const time = isPlaying ? (animFrame * 0.05) : 0;
      const y = canvas.height / 2 + Math.sin(rngVal * 10 + time + x * 0.05) * 20;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function handleKey(e) {
    if (e.key === " ") {
      e.preventDefault();
      isPlaying = !isPlaying;
      statusPill.textContent = isPlaying ? "▶ playing" : "⏸ paused";
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      isPlaying = !isPlaying;
      statusPill.textContent = isPlaying ? "▶ playing" : "⏸ paused";
    }
  }

  textarea.addEventListener("input", () => {
    if (!isPlaying) {
      drawVisualization();
    }
  });
  textarea.addEventListener("keydown", handleKey);

  let animId;
  function animate() {
    drawVisualization();
    animId = requestAnimationFrame(animate);
  }
  animate();

  textarea.focus();

  return {
    destroy: () => {
      cancelAnimationFrame(animId);
      textarea.removeEventListener("input", drawVisualization);
      textarea.removeEventListener("keydown", handleKey);
      container.removeChild(wrapper);
    },
    setMuted: () => {},
    needsGesture: () => false
  };
}
