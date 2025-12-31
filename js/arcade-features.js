// ===== ARCADE FEATURES - Easter Eggs, Achievements, Fun Stuff =====

// Achievement System
const achievements = {
  'first_visit': { title: 'First Steps', desc: 'Visited the portfolio', icon: '👋' },
  'terminal_user': { title: 'Command Master', desc: 'Used 5 terminal commands', icon: '💻' },
  'theme_switcher': { title: 'Fashionista', desc: 'Tried all color themes', icon: '🎨' },
  'night_owl': { title: 'Night Owl', desc: 'Visited between 11pm-5am', icon: '🦉' },
  'explorer': { title: 'Explorer', desc: 'Viewed all projects', icon: '🗺️' },
  'speedrun': { title: 'Speedrunner', desc: 'Completed tour in under 2 minutes', icon: '⚡' },
  'konami': { title: 'Konami Master', desc: 'Entered the legendary code', icon: '🎮' },
  'coffee_break': { title: 'Coffee Addict', desc: 'Took a coffee break', icon: '☕' },
  'disco_fever': { title: 'Disco Fever', desc: 'Activated disco mode', icon: '🕺' },
  'matrix_fan': { title: 'Matrix Fan', desc: 'Entered the Matrix', icon: '🔋' },
  'zen_master': { title: 'Zen Master', desc: 'Found inner peace', icon: '🧘' },
  'dev_mode': { title: 'Developer', desc: 'Unlocked dev mode', icon: '🔧' },
  'joke_lover': { title: 'Joke Lover', desc: 'Asked for 5 dad jokes', icon: '😄' },
  'arcade_mode': { title: 'Arcade Legend', desc: 'Activated arcade mode', icon: '🎰' }
};

// Initialize achievement tracking
function initAchievements() {
  if (!localStorage.getItem('achievements')) {
    localStorage.setItem('achievements', JSON.stringify([]));
  }
  if (!localStorage.getItem('visits')) {
    localStorage.setItem('visits', '0');
  }
  if (!localStorage.getItem('commandCount')) {
    localStorage.setItem('commandCount', '0');
  }
  if (!localStorage.getItem('jokeCount')) {
    localStorage.setItem('jokeCount', '0');
  }
  
  // Track visit
  const visits = parseInt(localStorage.getItem('visits')) + 1;
  localStorage.setItem('visits', visits.toString());
  
  if (visits === 1) {
    unlockAchievement('first_visit');
  }
  
  // Check for night owl
  const hour = new Date().getHours();
  if (hour >= 23 || hour <= 5) {
    unlockAchievement('night_owl');
  }
}

// Unlock achievement
function unlockAchievement(key) {
  const unlocked = JSON.parse(localStorage.getItem('achievements') || '[]');
  if (!unlocked.includes(key)) {
    unlocked.push(key);
    localStorage.setItem('achievements', JSON.stringify(unlocked));
    showAchievementToast(achievements[key]);
    return true;
  }
  return false;
}

// Show achievement toast
function showAchievementToast(achievement) {
  const existing = document.querySelector('.achievement-popup');
  if (existing) {
    existing.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'achievement-popup';
  toast.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-text">
      <div class="achievement-title">Achievement Unlocked!</div>
      <div class="achievement-desc">${achievement.desc}</div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('hidden');
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

// Konami Code Easter Egg
const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;

function initKonamiCode() {
  document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        unlockSecretTheme();
        unlockAchievement('konami');
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

// Unlock secret disco theme
function unlockSecretTheme() {
  document.body.classList.add('disco-mode');
  showMessage('🎉 DISCO MODE ACTIVATED! 🎉', 'Party time!');
  unlockAchievement('disco_fever');
  
  setTimeout(() => {
    document.body.classList.remove('disco-mode');
  }, 10000);
}

// Logo click counter for dev mode
let logoClickCount = 0;
let logoClickTimer = null;

function initLogoClicks() {
  const logo = document.querySelector('.brand .title');
  if (!logo) return;
  
  logo.style.cursor = 'pointer';
  logo.addEventListener('click', () => {
    logoClickCount++;
    
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => {
      logoClickCount = 0;
    }, 2000);
    
    if (logoClickCount === 7) {
      enableDevMode();
      unlockAchievement('dev_mode');
      logoClickCount = 0;
    }
  });
}

// Enable developer mode
function enableDevMode() {
  showMessage('🔧 DEVELOPER MODE ACTIVATED', 'Debug tools enabled');
  
  // Add dev indicator
  const indicator = document.createElement('div');
  indicator.className = 'arcade-indicator';
  indicator.textContent = 'DEV MODE';
  document.body.appendChild(indicator);
  
  // Add FPS counter
  let fps = 0;
  let lastTime = performance.now();
  
  const fpsCounter = document.createElement('div');
  fpsCounter.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: rgba(0, 240, 255, 0.2);
    border: 2px solid var(--neon-cyan);
    border-radius: 8px;
    padding: 8px 12px;
    font-family: 'Press Start 2P', cursive;
    font-size: 8px;
    color: var(--neon-cyan);
    z-index: 9999;
  `;
  document.body.appendChild(fpsCounter);
  
  function updateFPS() {
    const now = performance.now();
    fps = Math.round(1000 / (now - lastTime));
    lastTime = now;
    fpsCounter.textContent = `FPS: ${fps}`;
    requestAnimationFrame(updateFPS);
  }
  updateFPS();
}

// Show temporary message
function showMessage(title, message) {
  const msg = document.createElement('div');
  msg.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(255, 16, 240, 0.95), rgba(0, 240, 255, 0.95));
    border: 4px solid var(--neon-yellow);
    border-radius: 16px;
    padding: 30px 40px;
    font-family: 'Press Start 2P', cursive;
    font-size: 14px;
    color: #000;
    text-align: center;
    z-index: 10001;
    box-shadow: 0 0 50px rgba(255, 247, 0, 0.8);
    animation: insertCoin 0.6s ease-out;
  `;
  msg.innerHTML = `
    <div style="font-size: 18px; margin-bottom: 12px;">${title}</div>
    <div style="font-size: 10px; opacity: 0.9;">${message}</div>
  `;
  
  document.body.appendChild(msg);
  
  setTimeout(() => {
    msg.style.transition = 'opacity 0.5s';
    msg.style.opacity = '0';
    setTimeout(() => msg.remove(), 500);
  }, 3000);
}

// Track command usage
export function trackCommand() {
  const count = parseInt(localStorage.getItem('commandCount')) + 1;
  localStorage.setItem('commandCount', count.toString());
  
  if (count === 5) {
    unlockAchievement('terminal_user');
  }
}

// Track joke requests
export function trackJoke() {
  const count = parseInt(localStorage.getItem('jokeCount')) + 1;
  localStorage.setItem('jokeCount', count.toString());
  
  if (count === 5) {
    unlockAchievement('joke_lover');
  }
}

// Arcade mode functions
export function enableArcadeMode() {
  document.body.classList.add('arcade-mode');
  unlockAchievement('arcade_mode');
  
  // Add grid floor
  const grid = document.createElement('div');
  grid.className = 'grid-floor';
  document.body.appendChild(grid);
  
  // Add arcade indicator
  const indicator = document.createElement('div');
  indicator.className = 'arcade-indicator';
  indicator.textContent = '🎮 ARCADE MODE';
  document.body.appendChild(indicator);
  
  showMessage('🎮 ARCADE MODE ACTIVATED', 'Insert coin to continue.dev');
}

export function disableArcadeMode() {
  document.body.classList.remove('arcade-mode');
  const grid = document.querySelector('.grid-floor');
  const indicator = document.querySelector('.arcade-indicator');
  if (grid) grid.remove();
  if (indicator) indicator.remove();
}

export function enableDiscoMode() {
  document.body.classList.add('disco-mode');
  unlockAchievement('disco_fever');
  showMessage('🕺 DISCO MODE!', 'Party time!');
  
  setTimeout(() => {
    document.body.classList.remove('disco-mode');
  }, 15000);
}

export function enableMatrixMode() {
  document.body.classList.add('matrix-mode');
  unlockAchievement('matrix_fan');
  showMessage('⚡ ENTERING THE MATRIX', 'Follow the white rabbit...');
  
  setTimeout(() => {
    document.body.classList.remove('matrix-mode');
  }, 15000);
}

export function enableZenMode() {
  document.body.classList.add('zen-mode');
  unlockAchievement('zen_master');
  showMessage('🧘 ZEN MODE', 'Breathe in... breathe out...');
  
  setTimeout(() => {
    document.body.classList.remove('zen-mode');
  }, 30000);
}

export function showCoffeeBreak() {
  unlockAchievement('coffee_break');
  showMessage('☕ COFFEE BREAK', 'Developer productivity +50%');
  
  // Animate coffee cup
  const coffee = document.createElement('div');
  coffee.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-size: 64px;
    animation: pixelPulse 1s ease-in-out infinite;
    z-index: 10000;
  `;
  coffee.textContent = '☕';
  document.body.appendChild(coffee);
  
  setTimeout(() => {
    coffee.style.transition = 'opacity 0.5s';
    coffee.style.opacity = '0';
    setTimeout(() => coffee.remove(), 500);
  }, 5000);
}

// Get personalized greeting
export function getGreeting() {
  const hour = new Date().getHours();
  const visits = parseInt(localStorage.getItem('visits') || '0');
  
  let timeGreeting;
  if (hour < 12) timeGreeting = 'Good morning';
  else if (hour < 18) timeGreeting = 'Good afternoon';
  else if (hour < 22) timeGreeting = 'Good evening';
  else timeGreeting = 'Burning the midnight oil';
  
  let personalGreeting;
  if (visits === 1) personalGreeting = 'Welcome, new friend!';
  else if (visits < 5) personalGreeting = 'Welcome back!';
  else if (visits < 10) personalGreeting = 'Hey, regular visitor!';
  else personalGreeting = 'Hey, VIP! You\'re practically family now.';
  
  return `${timeGreeting}! ${personalGreeting}`;
}

// Get random dad joke
export function getDadJoke() {
  trackJoke();
  
  const jokes = [
    'Why do programmers prefer dark mode? Because light attracts bugs!',
    'How many programmers does it take to change a light bulb? None, it\'s a hardware problem.',
    'Why do Java developers wear glasses? Because they don\'t C#.',
    'What\'s a programmer\'s favorite hangout place? Foo Bar.',
    'Why did the programmer quit his job? Because he didn\'t get arrays.',
    'How do you comfort a JavaScript bug? You console it.',
    'Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25.',
    'What do you call a programmer from Finland? Nerdic.',
    'Why did the developer go broke? Because he used up all his cache.',
    'What\'s the object-oriented way to become wealthy? Inheritance.'
  ];
  
  return jokes[Math.floor(Math.random() * jokes.length)];
}

// Initialize all arcade features
export function initArcadeFeatures() {
  initAchievements();
  initKonamiCode();
  initLogoClicks();
  
  console.log('%c🎮 ARCADE FEATURES LOADED', 'color: #5CFFC6; font-size: 16px; font-weight: bold;');
  console.log('%cTry the Konami Code: ↑↑↓↓←→←→BA', 'color: #FF10F0; font-size: 12px;');
  console.log('%cClick the logo 7 times for dev mode!', 'color: #FFF700; font-size: 12px;');
}
