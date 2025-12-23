# rjo-dev://lab

Interactive portfolio site featuring games, apps, and demos with dual-mode UI (terminal + modern).

## 🚀 Quick Start

1. Open `index.html` in a browser
2. Type `help` in terminal or click theme buttons
3. Try `theme boring` for modern professional mode

## 📁 Structure

```
/
├── index.html              # Main landing page
├── styles.css              # Single stylesheet (terminal + modern modes)
├── js/
│   ├── main.js            # Entry point
│   ├── apps.js            # App registry
│   ├── terminal.js        # Command system
│   ├── themes.js          # Theme engine (green/blue/amber/boring)
│   ├── demo.js            # Demo overlay system
│   ├── modern.js          # Modern mode project cards
│   ├── utils.js           # Shared utilities
│   └── *-mini.js          # Individual demo engines
└── *.html                 # Individual app pages
```

## 🎮 Available Apps

### **🌌 ORBY — Field HUD (Pulse Edition)** [LIVE]
An interactive audio-visual instrument where a glowing orb becomes your controller for generative music and motion. Move Orby to create melodies, tap for drums, use numbers to reshape harmony and texture, and guide a living "field" of sound and light. A creative music toy and signature tech demo for exploring flow and immersion.

### **📝 NOTECENTER** [LIVE]
Sticky notes + real terminal sidebar. Create, organize, and manage notes with a command-line interface. Features categories, pinning, search, and export functionality.

### **🐮 CAL — Habit-Aware Calorie Tracker** [LIVE]
A gentle meal logger that tracks what you eat and when, then reflects habits instead of enforcing strict dieting. Quickly log meals, estimate calories, assign "junk" levels, and surface insights about patterns like late-night eating. Personal wellness companion focused on awareness, not pressure.

### **📅 YESNO — Decision Calendar** [LIVE]
A minimalist calendar that turns each day into a conscious YES or NO choice. Click any date and mark it as YES (do/engage), NO (rest/refuse), or clear it. Add notes and build visible patterns over a month. Habit and boundary-setting tool for practicing intentional living.

### **🐸 HOPHOP — Vertical Jumper Game** [PROTO]
A fast arcade platformer where momentum, wall-kicks, and flips drive you upward endlessly. Control a character jumping between platforms, chaining movement for height while chasing high scores. Skill-based reflex game delivering quick, replayable fun with satisfying movement mechanics.

**Beta/Coming Soon:**
- CUBE - Memory + geometry game (placeholder)
- WORDBEAT - Text becomes rhythm (placeholder)

**Secret (terminal only):**
- `open notes` - Terminal notes app
- `open egg` - Easter egg
- `open boom`, `open beausphere` - Coming soon

## 🎨 Terminal Commands

```bash
help                          # Show all commands
list                          # List all apps
open <app>                    # Launch app
demo <app>                    # Preview demo
theme <green|blue|amber|boring>  # Switch theme
ping                          # Pulse hero sphere
clear                         # Clear terminal
```

## 🛠️ Tech Stack

- Pure HTML/CSS/JS (ES6 modules)
- No frameworks, no build tools
- ~1500 lines CSS with CRT effects
- Modular JS architecture

## 🎯 Features

- Dual-mode UI (terminal ↔ modern)
- Interactive demos with audio
- Full keyboard navigation
- Responsive + mobile-friendly
- Accessibility (ARIA, reduced motion)
- Theme persistence (localStorage)

## 🔧 Development

No build process required. Edit files directly:

1. **Add new app:** Update `js/apps.js` + create HTML file
2. **Add theme:** Update `js/themes.js`
3. **Modify styles:** Edit `styles.css` (use section comments)

## 📝 Known Issues

- Some apps are placeholders (cube, wordbeat, boom, beausphere)
- Demo mode is preview-only (launch disabled)
- Large CSS file (1478 lines) - consider splitting in future

## 🚦 Browser Support

Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

---

Built with vanilla web tech. No npm install. Just open and run.
