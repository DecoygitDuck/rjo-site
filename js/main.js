import { initTerminal, termRun } from "./terminal.js";
import { setTheme } from "./themes.js";
import { autoInit as initHeroAnimation } from "./hero-animation.js";
import { initDevConsole } from "./dev-console.js";

window.termRun = termRun;
window.setTheme = setTheme;

initTerminal();
initDevConsole();

// Default: terminal vibes. If user previously chose a theme, restore it.
const saved = (localStorage.getItem("theme") || "").trim();
setTheme(saved || "green");

// Initialize hero animation (auto-detects boring mode)
initHeroAnimation();
