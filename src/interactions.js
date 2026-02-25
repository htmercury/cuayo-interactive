import { getSpikiElement, getSpikiCenter, setExpression, startMopping, stopMopping, setMopTarget, isMopping } from './spiki.js';
import { spawnHearts, spawnSparkles, spawnConfetti, spawnMopSparkles, spawnFallingPumpkin } from './particles.js';
import { playSqueak, playCuayo, playPumpkinCatch, playPumpkinToss, playCelebration, playMopSound } from './audio.js';
import { addHappiness, getMoodExpression } from './mood.js';

let patCount = 0;
let rapidClicks = 0;
let rapidClickTimer = null;
let mopMode = false;
let mopSpeechInterval = null;

const patCountEl = document.getElementById('pat-count');
const speechBubble = document.getElementById('speech-bubble');
const btnCuayo = document.getElementById('btn-cuayo');
const btnPumpkin = document.getElementById('btn-pumpkin');
const btnMop = document.getElementById('btn-mop');
const pumpkinList = document.getElementById('pumpkin-list');
let pumpkinFriendCount = 0;
let expressionRevertTimer = null;

function setTemporaryExpression(expression, duration = 1500) {
  clearTimeout(expressionRevertTimer);
  setExpression(expression);
  expressionRevertTimer = setTimeout(() => {
    expressionRevertTimer = null;
    setExpression(getMoodExpression());
  }, duration);
}

const speechLines = [
  'Cuayo~!',
  '좋아요~!',
  'Hehe~!',
  'Cuayo Cuayo!',
  'Pat pat~!',
  '물걸레질 좋아요~!',
  'Kyaa~!',
  'More pats~!',
];

const mopSpeechLines = [
  '좋아요~!',
  '물걸레질 좋아요~!',
  'Mopping is fun~!',
  'Cuayo~!',
  'So clean~!',
  'Sparkle sparkle~!',
];

function showSpeechBubble(text) {
  speechBubble.textContent = text;
  speechBubble.classList.remove('hidden');
  speechBubble.style.animation = 'none';
  // Force reflow
  speechBubble.offsetHeight;
  speechBubble.style.animation = 'bubblePop 0.3s ease-out';

  clearTimeout(speechBubble._hideTimer);
  speechBubble._hideTimer = setTimeout(() => {
    speechBubble.classList.add('hidden');
  }, 1500);
}

function randomSpeech() {
  return speechLines[Math.floor(Math.random() * speechLines.length)];
}

function randomMopSpeech() {
  return mopSpeechLines[Math.floor(Math.random() * mopSpeechLines.length)];
}

function handlePat() {
  patCount++;
  patCountEl.textContent = patCount;

  const center = getSpikiCenter();

  // Track rapid clicks
  rapidClicks++;
  clearTimeout(rapidClickTimer);
  rapidClickTimer = setTimeout(() => { rapidClicks = 0; }, 600);

  if (rapidClicks > 5) {
    // Overwhelmed — too many pats!
    addHappiness(5);
    setTemporaryExpression('crying', 2000);
    spawnSparkles(center.x, center.y, 15);
    spawnHearts(center.x, center.y, 8);
    showSpeechBubble('Too many pats~!!');
  } else {
    addHappiness(3);
    setTemporaryExpression('sad');
    spawnHearts(center.x, center.y - 20, 3 + Math.min(rapidClicks, 5));
    showSpeechBubble(randomSpeech());
  }

  playSqueak();
}

function handleCuayo() {
  playCelebration();
  spawnConfetti(150);
  addHappiness(20);
  setTemporaryExpression('excited', 3000);
  showSpeechBubble('CUAYO~!!!!!');

  // Flash the button
  btnCuayo.style.transform = 'scale(1.1)';
  setTimeout(() => { btnCuayo.style.transform = ''; }, 200);
}

function handlePumpkinToss() {
  playPumpkinToss();
  addHappiness(2);

  spawnFallingPumpkin((x, y) => {
    // Pumpkin caught!
    playPumpkinCatch();
    addHappiness(8);
    setTemporaryExpression('excited', 2000);
    spawnSparkles(x, y, 6);
    showSpeechBubble('Pumpkin friend~!');

    // Add to collection
    pumpkinFriendCount++;
    const pumpkin = document.createElement('span');
    pumpkin.className = 'pumpkin-friend';
    pumpkin.textContent = '🎃';
    pumpkin.title = `Pumpkin #${pumpkinFriendCount}`;
    pumpkinList.appendChild(pumpkin);
  });
}

function toggleMopMode() {
  mopMode = !mopMode;

  if (mopMode) {
    btnMop.classList.add('active');
    btnMop.textContent = 'Stop Mopping';
    document.body.classList.add('mopping-mode');
    startMopping();
    addHappiness(5);
    clearTimeout(expressionRevertTimer);
    expressionRevertTimer = null;
    setExpression('excited');
    showSpeechBubble('물걸레질 좋아요~!');

    // Periodic speech bubbles while mopping
    mopSpeechInterval = setInterval(() => {
      showSpeechBubble(randomMopSpeech());
      playMopSound();
    }, 2500);
  } else {
    btnMop.classList.remove('active');
    btnMop.textContent = 'Mopping Mode';
    document.body.classList.remove('mopping-mode');
    stopMopping();
    clearInterval(mopSpeechInterval);
    mopSpeechInterval = null;
    setExpression(getMoodExpression());
  }
}

function handleMouseMove(e) {
  if (mopMode) {
    setMopTarget(e.clientX, e.clientY);

    // Spawn sparkle trail occasionally
    if (Math.random() < 0.3) {
      spawnMopSparkles(e.clientX, e.clientY);
    }
  }
}

export function initInteractions() {
  const spikiEl = getSpikiElement();

  spikiEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!mopMode) {
      handlePat();
    }
  });

  btnCuayo.addEventListener('click', handleCuayo);
  btnPumpkin.addEventListener('click', handlePumpkinToss);
  btnMop.addEventListener('click', toggleMopMode);

  document.addEventListener('mousemove', handleMouseMove);

  // Touch support for mopping
  document.addEventListener('touchmove', (e) => {
    if (mopMode && e.touches.length > 0) {
      const touch = e.touches[0];
      setMopTarget(touch.clientX, touch.clientY);
      if (Math.random() < 0.3) {
        spawnMopSparkles(touch.clientX, touch.clientY);
      }
    }
  }, { passive: true });
}
