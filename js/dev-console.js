/* Development console utilities */

export function initDevConsole(){
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Always show minimal console hints
  console.log('%c🚀 rjo-dev://lab', 'color:#5cffc6;font-size:16px;font-weight:900;');

  // Show feature warnings
  const warnings = [];
  if(!window.AudioContext && !window.webkitAudioContext){
    warnings.push('⚠️ Web Audio API not available - audio demos may not work');
  }
  if(!window.requestAnimationFrame){
    warnings.push('⚠️ requestAnimationFrame not available - animations may be choppy');
  }
  if(!document.body.animate){
    warnings.push('⚠️ Web Animations API not available - some effects disabled');
  }

  if(warnings.length > 0){
    console.log('%cCompatibility Warnings:', 'color:#ff8c5c;font-weight:700;');
    warnings.forEach(w => console.log(w));
  }

  if(!isDev) return;

  console.log('%c🚀 rjo-dev://lab', 'color:#5cffc6;font-size:18px;font-weight:900;');
  console.log('%cDevelopment mode active', 'color:#86d8ff;font-weight:700;');
  console.log('\n%cAvailable commands:', 'color:#d7ffe9;font-weight:700;');
  console.log('  termRun("help")     - Show terminal commands');
  console.log('  setTheme("boring")  - Switch to modern mode');
  console.log('  setTheme("green")   - Back to terminal mode');
  console.log('\n%cQuick tips:', 'color:#d7ffe9;font-weight:700;');
  console.log('  • Type "theme boring" for modern professional mode');
  console.log('  • Secret apps: "open notes", "open egg"');
  console.log('  • All demos are preview-only (launch disabled)');
  console.log('  • Ctrl/Cmd+T focuses terminal input');
  console.log('\n%cFile structure:', 'color:#d7ffe9;font-weight:700;');
  console.log('  index.html     - Main landing (dual-mode)');
  console.log('  styles.css     - 1478 lines (consider splitting)');
  console.log('  js/apps.js     - App registry');
  console.log('  js/terminal.js - Command system');
  console.log('  js/themes.js   - Theme engine');
  console.log('\n');

  // Expose useful functions globally for debugging
  if(typeof window !== 'undefined'){
    window.__rjo_dev__ = {
      version: '0.3',
      mode: document.body.dataset.mode || 'terminal',
      availableApps: () => import('./apps.js').then(m => Object.keys(m.APPS)),
      currentTheme: () => localStorage.getItem('theme') || 'green',
    };
  }
}
