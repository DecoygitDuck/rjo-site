# App Specifications

Complete feature specs for rjo-dev://lab apps.

---

## 🐮 Cal — Habit-Aware Calorie Tracker

**Status:** LIVE
**Domain:** Wellness / Self-Care
**File:** `cal.html`

### Definition
A gentle meal logger that tracks what you eat and when, then reflects habits instead of enforcing strict dieting.

### Core Features
- **Quick meal logging** - Fast entry with auto-complete
- **Calorie estimation** - Smart suggestions, not strict counting
- **"Junk" level rating** - 1-5 scale for food quality awareness
- **Pattern insights** - Surface trends like late-night eating, heavy weekends
- **No judgment** - Awareness-focused, not prescriptive

### Purpose
Help users notice eating habits over time and make small, sustainable improvements through light feedback rather than rigid tracking.

### UX Principles
- Fast input (< 10 seconds per meal)
- Visual patterns over numbers
- Gentle reminders, not guilt
- Weekly reflection summaries

---

## 📅 YesNo — Decision Calendar

**Status:** LIVE
**Domain:** Productivity / Intentional Living
**File:** `yesno.html`

### Definition
A minimalist calendar that turns each day into a conscious YES or NO choice.

### Core Features
- **Simple binary marking** - Click date → YES (green) / NO (red) / Clear
- **Optional notes** - Add context to decisions
- **Monthly view** - See patterns at a glance
- **Streaks** - Track consecutive YES or NO days
- **Presets** - "Did I exercise?", "Did I ship code?", etc.

### Purpose
Practice intentional living, discipline, rest, or focus by making daily choices visible and trackable.

### UX Principles
- One-tap interaction
- Visual pattern recognition
- No analytics overload
- Personal, not shared

---

## 🐸 HopHop — Vertical Jumper Game

**Status:** PROTO
**Domain:** Games / Arcade
**File:** `hophop.html`

### Definition
A fast arcade platformer where momentum, wall-kicks, and flips drive you upward endlessly.

### Core Mechanics
- **Base jump** - Spacebar / tap for standard hop
- **Wall kicks** - Bounce off sides for height + speed
- **Double jump** - Mid-air boost (limited charges)
- **Flip tricks** - Arrow keys for rotations (score multiplier)
- **Momentum system** - Chain moves for faster ascent

### Gameplay Loop
1. Jump between platforms moving upward
2. Avoid falling off screen bottom
3. Collect coins / power-ups
4. Chain tricks for score multiplier
5. Reach checkpoints for respawn points
6. Chase high score leaderboard

### Purpose
Deliver quick, replayable fun with satisfying movement mechanics and score-chasing challenge.

### Tech Notes
- Canvas-based rendering
- 60fps physics simulation
- Procedural platform generation
- Local high score persistence

---

## 🌌 Orby — Field HUD (Pulse Edition)

**Status:** LIVE
**Domain:** Creative / Audio-Visual Art
**File:** `orby.html`

### Definition
An interactive audio-visual instrument where a glowing orb becomes your controller for generative music and motion.

### Core Features
- **Movement → Melody** - Arrow keys move Orby, position = pitch/timbre
- **Tap → Drums** - Spacebar triggers percussive hits
- **Number keys (0-9)** - Reshape harmony, texture, effects
- **Visual field** - Particles, trails, and glow respond to audio
- **Gesture memory** - Orb "remembers" recent paths for echoes

### Purpose
Let users play with sound and motion — exploring flow, creativity, and immersion rather than winning or completing objectives.

### UX Principles
- No instructions needed (discovery-based)
- Immediate feedback (< 20ms latency)
- Never wrong (all input = valid expression)
- Endless exploration (no win/lose state)

### Tech Notes
- Web Audio API (tone synthesis)
- Canvas 2D rendering
- Gesture smoothing + interpolation
- Audio context auto-resume on interaction

---

## 🧭 Ecosystem Overview

| App | Domain | Role | Key Metric |
|-----|--------|------|------------|
| **Cal** 🐮 | Wellness | Habit awareness & self-care | Logging consistency |
| **YesNo** 📅 | Productivity | Intentional daily decisions | Streak length |
| **HopHop** 🐸 | Games | Pure fun & skill challenge | High score |
| **Orby** 🌌 | Creative | Flagship audio-visual experience | Session duration |

### Design Philosophy
- **Cal & YesNo** - Tools for self-awareness and intentionality
- **HopHop** - Pure skill-based entertainment
- **Orby** - Creative expression and flow state

All apps share:
- Minimal UI
- Fast load times (< 1s)
- No login required
- LocalStorage persistence
- Keyboard-first interaction
