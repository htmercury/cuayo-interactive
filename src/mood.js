const MOOD_MAX = 100;
const MOOD_DECAY_RATE = 0.15; // per second
const MOOD_DECAY_INTERVAL = 1000; // ms

let happiness = 70;
let lastInteraction = Date.now();
let onMoodChange = null;

const moodFill = document.getElementById('mood-fill');
const moodLabel = document.getElementById('mood-label');

function getMoodState() {
  if (happiness >= 80) return { label: 'Ecstatic!', expression: 'happy' };
  if (happiness >= 40) return { label: 'Happy', expression: 'happy' };
  return { label: 'Sleepy...', expression: 'neutral' };
}

function updateUI() {
  const pct = Math.max(0, Math.min(100, happiness));
  moodFill.style.width = pct + '%';

  // Color gradient based on mood
  if (happiness >= 60) {
    moodFill.style.background = 'linear-gradient(90deg, #ff6b9d, #f39c12, #f1c40f)';
  } else if (happiness >= 30) {
    moodFill.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
  } else {
    moodFill.style.background = 'linear-gradient(90deg, #9b59b6, #8e44ad)';
  }

  const state = getMoodState();
  moodLabel.textContent = state.label;

  if (onMoodChange) {
    onMoodChange(state.expression, happiness);
  }
}

function decay() {
  const now = Date.now();
  const idleSeconds = (now - lastInteraction) / 1000;

  // Decay faster the longer idle
  if (idleSeconds > 5) {
    const decayMultiplier = Math.min(3, 1 + (idleSeconds - 5) / 20);
    happiness = Math.max(0, happiness - MOOD_DECAY_RATE * decayMultiplier);
    updateUI();
  }
}

export function initMood(callback) {
  onMoodChange = callback;
  updateUI();
  setInterval(decay, MOOD_DECAY_INTERVAL);
}

export function addHappiness(amount) {
  lastInteraction = Date.now();
  happiness = Math.min(MOOD_MAX, happiness + amount);
  updateUI();
}

export function getHappiness() {
  return happiness;
}

export function getMoodExpression() {
  return getMoodState().expression;
}
