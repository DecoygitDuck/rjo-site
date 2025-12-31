import { initTerminal, termRun } from "./terminal.js";
import { setTheme } from "./themes.js";
import { autoInit as initHeroAnimation } from "./hero-animation.js";
import { initDevConsole } from "./dev-console.js";
import { initArcadeFeatures, getGreeting } from "./arcade-features.js";
import { initGreeting } from "./greeting.js";

window.termRun = termRun;
window.setTheme = setTheme;

initTerminal();
initDevConsole();
initArcadeFeatures();
initGreeting();

// Show personalized greeting in console
console.log('%c' + getGreeting(), 'color: #5CFFC6; font-size: 14px; font-weight: bold;');
console.log('%cType "help" in the terminal for arcade commands!', 'color: #FF10F0; font-size: 12px;');
console.log('%cTry the Konami Code: ↑↑↓↓←→←→BA', 'color: #FFF700; font-size: 11px;');
console.log('%cClick the logo 7 times for a surprise!', 'color: #39FF14; font-size: 11px;');

// Default: terminal vibes. If user previously chose a theme, restore it.
const saved = (localStorage.getItem("theme") || "").trim();
setTheme(saved || "green");

// Initialize hero animation (auto-detects boring mode)
initHeroAnimation();
