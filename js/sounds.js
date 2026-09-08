const hitUrl = new URL("../assets/sounds/laserLarge_000.ogg", import.meta.url);
const hitAudio = new Audio(hitUrl);

let audioContext;
let soundEnabled = true;

const SOUND_RECIPES = {
  click: [{ frequency: 420, duration: 0.05, type: "triangle" }],
  start: [
    { frequency: 440, duration: 0.08, type: "triangle" },
    { frequency: 660, duration: 0.08, type: "triangle", delay: 0.08 }
  ],
  friend: [{ frequency: 180, duration: 0.18, type: "sine" }],
  combo: [
    { frequency: 620, duration: 0.06, type: "square" },
    { frequency: 820, duration: 0.08, type: "square", delay: 0.06 }
  ],
  victory: [
    { frequency: 520, duration: 0.12, type: "sine" },
    { frequency: 660, duration: 0.12, type: "sine", delay: 0.1 },
    { frequency: 880, duration: 0.18, type: "sine", delay: 0.2 }
  ],
  defeat: [{ frequency: 150, duration: 0.25, type: "triangle" }],
  record: [
    { frequency: 720, duration: 0.08, type: "triangle" },
    { frequency: 960, duration: 0.14, type: "triangle", delay: 0.08 }
  ],
  englishCorrect: [
    { frequency: 540, duration: 0.08, type: "sine" },
    { frequency: 760, duration: 0.12, type: "sine", delay: 0.08 }
  ],
  englishWrong: [{ frequency: 220, duration: 0.18, type: "sine" }],
  recover: [
    { frequency: 600, duration: 0.1, type: "triangle" },
    { frequency: 900, duration: 0.16, type: "triangle", delay: 0.1 }
  ],
  level: [{ frequency: 520, duration: 0.16, type: "triangle" }]
};

// Todos os sons passam por esta funcao para o resto do jogo ficar simples.
export function playSound(name) {
  if (!soundEnabled) {
    return;
  }

  if (name === "hit" || name === "laser") {
    hitAudio.currentTime = 0;
    hitAudio.play().catch(() => playTone(SOUND_RECIPES.click[0]));
    return;
  }

  (SOUND_RECIPES[name] || []).forEach((recipe) => playTone(recipe));
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

function playTone(recipe) {
  if (!recipe) {
    return;
  }

  const Context = window.AudioContext || window.webkitAudioContext;
  audioContext = audioContext || new Context();

  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  const now = audioContext.currentTime + (recipe.delay || 0);

  oscillator.type = recipe.type;
  oscillator.frequency.setValueAtTime(recipe.frequency, now);
  volume.gain.setValueAtTime(0.09, now);
  volume.gain.exponentialRampToValueAtTime(0.001, now + recipe.duration);

  oscillator.connect(volume);
  volume.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + recipe.duration);
}
