// Preloaded audio elements for voice clips from speaki-box
const sounds = {};

const ALL_SOUNDS = [
  'dontpress', 'tryhard', 'speakif', 'speakifull',
  'g1', 'g2', 'g3',
  'gs1', 'gs2', 'gs3', 'gs4',
  'sc1', 'sc1e', 'sc2', 'sc2e', 'sc2s',
  'speaki',
];

// Preload all voice clips
ALL_SOUNDS.forEach(name => {
  const audio = new Audio(`/assets/voice/${name}.mp3`);
  audio.preload = 'auto';
  sounds[name] = audio;
});

function play(name, volume = 0.4) {
  const src = sounds[name];
  if (!src) return;
  const a = src.cloneNode();
  a.volume = volume;
  a.play().catch(() => {});
}

function playRandom(names, volume = 0.4) {
  play(names[Math.floor(Math.random() * names.length)], volume);
}

// Pat/click — vocal reactions to being touched
export function playSqueak() {
  playRandom(['dontpress', 'speakif', 'speakifull'], 0.4);
}

// CUAYO button — idle vocal chatter
export function playCuayo() {
  playRandom(['g1', 'g2', 'g3'], 0.5);
}

// CUAYO celebration — idle vocal chatter
export function playCelebration() {
  playRandom(['g1', 'g2', 'g3'], 0.5);
}

// Pumpkin toss — bouncy impact sounds
export function playPumpkinToss() {
  playRandom(['gs1', 'gs2', 'gs3', 'gs4'], 0.4);
}

// Pumpkin catch — speaki exclamation
export function playPumpkinCatch() {
  play('speaki', 0.4);
}

// Mopping — idle vocal chatter
export function playMopSound() {
  playRandom(['g1', 'g2', 'g3'], 0.3);
}

// Sad — minor sounds
export function playSadSound() {
  playRandom(['sc2', 'sc2e'], 0.3);
}
