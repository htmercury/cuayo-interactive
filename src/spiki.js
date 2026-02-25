const spikiEl = document.getElementById('spiki');

// Sprite frame sets per expression
const SPRITES = {
  // Watery worried eyes, flustered — default idle
  happy:   { frames: ['speaki10', 'speaki12'], blinks: ['speaki10b', 'speaki12b'] },
  // Joyful closed/squinting eyes, big smiles — energetic delight
  excited: { frames: ['speaki4', 'speaki7'], blinks: [] },
  // Peaceful closed eyes, soft expressions — content but winding down
  neutral: { frames: ['speaki5', 'speaki6', 'speaki9', 'speaki8'], blinks: [] },
  // Sparkly open eyes, gentle mouth variations — happy when patted
  sad:     { frames: ['speaki1', 'speaki11', 'speaki13', 'speaki2'], blinks: ['speaki1b', 'speaki11b', 'speaki13b'] },
  // Teary eyes, downturned frown — very sad
  crying:  { frames: ['speaki14'], blinks: ['speaki14b'] },
};

const FRAME_INTERVAL = 2500;   // ms between frame changes
const BLINK_INTERVAL = 3500;   // ms between blinks
const BLINK_DURATION = 150;    // ms blink stays closed

let spriteImg = null;
let currentExpression = 'happy';
let frameIndex = 0;
let frameTimer = null;
let blinkTimer = null;

function createSpikiDOM() {
  spikiEl.innerHTML = `<img class="spiki-sprite" src="/assets/img/speaki1.png" alt="Spiki" draggable="false" />`;
  spriteImg = spikiEl.querySelector('.spiki-sprite');
}

function setFrame(spriteName) {
  if (spriteImg) {
    spriteImg.src = `/assets/img/${spriteName}.png`;
  }
}

function startAnimation() {
  stopAnimation();

  const set = SPRITES[currentExpression] || SPRITES.happy;
  frameIndex = 0;
  setFrame(set.frames[0]);

  // Frame cycling
  if (set.frames.length > 1) {
    frameTimer = setInterval(() => {
      frameIndex = (frameIndex + 1) % set.frames.length;
      setFrame(set.frames[frameIndex]);
    }, FRAME_INTERVAL);
  }

  // Blinking
  if (set.blinks.length > 0) {
    const doBlink = () => {
      const blinkFrame = set.blinks[frameIndex % set.blinks.length] || set.blinks[0];
      setFrame(blinkFrame);
      setTimeout(() => {
        setFrame(set.frames[frameIndex % set.frames.length]);
        blinkTimer = setTimeout(doBlink, BLINK_INTERVAL + Math.random() * 2000);
      }, BLINK_DURATION);
    };
    blinkTimer = setTimeout(doBlink, BLINK_INTERVAL + Math.random() * 1500);
  }
}

function stopAnimation() {
  clearInterval(frameTimer);
  clearTimeout(blinkTimer);
  frameTimer = null;
  blinkTimer = null;
}

// Preload all sprites
function preloadSprites() {
  const allSprites = new Set();
  for (const set of Object.values(SPRITES)) {
    set.frames.forEach(s => allSprites.add(s));
    set.blinks.forEach(s => allSprites.add(s));
  }
  for (const name of allSprites) {
    const img = new Image();
    img.src = `/assets/img/${name}.png`;
  }
}

export function initSpiki() {
  createSpikiDOM();
  preloadSprites();
  startAnimation();
}

export function setExpression(expression) {
  const prev = currentExpression;
  currentExpression = expression;

  spikiEl.classList.remove('excited', 'sad');
  if (expression === 'excited') {
    spikiEl.classList.add('excited');
  } else if (expression === 'sad' || expression === 'crying') {
    spikiEl.classList.add('sad');
  }

  if (expression !== prev) {
    startAnimation();
  }
}

export function getSpikiElement() {
  return spikiEl;
}

export function getSpikiCenter() {
  const rect = spikiEl.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

// Move Spiki to follow cursor (mopping mode)
let moppingActive = false;
let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

export function startMopping() {
  if (moppingActive) return;
  moppingActive = true;

  const rect = spikiEl.getBoundingClientRect();
  currentX = rect.left;
  currentY = rect.top;

  spikiEl.classList.add('mopping');
  spikiEl.style.left = currentX + 'px';
  spikiEl.style.top = currentY + 'px';

  followLoop();
}

export function stopMopping() {
  moppingActive = false;
  spikiEl.classList.remove('mopping');
  spikiEl.style.left = '';
  spikiEl.style.top = '';
  spikiEl.style.position = '';
}

export function setMopTarget(x, y) {
  targetX = x - 80;
  targetY = y - 100;
}

function followLoop() {
  if (!moppingActive) return;

  const dx = targetX - currentX;
  const dy = targetY - currentY;
  currentX += dx * 0.08;
  currentY += dy * 0.08;

  spikiEl.style.left = currentX + 'px';
  spikiEl.style.top = currentY + 'px';

  requestAnimationFrame(followLoop);
}

export function isMopping() {
  return moppingActive;
}
