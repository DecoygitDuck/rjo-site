// Greeting Display Component
import { getGreeting } from "./arcade-features.js";

export function initGreeting() {
  // Add greeting to hero section
  const hero = document.querySelector('.hero .cmd');
  if (!hero) return;
  
  const greetingDiv = document.createElement('div');
  greetingDiv.className = 'greeting-section';
  greetingDiv.style.cssText = `
    margin-top: 16px;
    padding: 12px;
    background: rgba(92, 255, 198, 0.05);
    border: 1px solid rgba(92, 255, 198, 0.2);
    border-radius: 8px;
    font-size: 13px;
    color: var(--neon-cyan);
  `;
  
  greetingDiv.innerHTML = `
    <div style="font-weight: 600;">${getGreeting()}</div>
    <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">
      Visit #${localStorage.getItem('visits') || '1'} • 
      ${getTimeEmoji()} ${getCurrentTime()}
    </div>
  `;
  
  // Insert after the description paragraph
  const actions = hero.querySelector('.actions');
  if (actions) {
    hero.insertBefore(greetingDiv, actions);
  }
}

function getTimeEmoji() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '🌅';
  if (hour >= 12 && hour < 17) return '☀️';
  if (hour >= 17 && hour < 21) return '🌆';
  return '🌙';
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}
