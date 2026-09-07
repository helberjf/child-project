const laserUrl = new URL("../assets/sounds/laserLarge_000.ogg", import.meta.url);
const laserAudio = new Audio(laserUrl);

let audioContext;

const SOUND_RECIPES = {
  click: { frequency: 420, duration: 0.05, type: "triangle" },
  explosion: { frequency: 110, duration: 0.18, type: "sawtooth" },
  victory: { frequency: 660, duration: 0.22, type: "sine" },
  defeat: { frequency: 150, duration: 0.25, type: "square" },
  level: { frequency: 520, duration: 0.16, type: "triangle" }
};

export function playSound(name) {
  if (name === "laser") {
    laserAudio.currentTime = 0;
    laserAudio.play().catch(() => playTone(SOUND_RECIPES.click));
    return;
  }

  playTone(SOUND_RECIPES[name]);
}

function playTone(recipe) {
  if (!recipe) {
    return;
  }

  audioContext = audioContext || new AudioContext();

  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = recipe.type;
  oscillator.frequency.setValueAtTime(recipe.frequency, now);
  volume.gain.setValueAtTime(0.09, now);
  volume.gain.exponentialRampToValueAtTime(0.001, now + recipe.duration);

  oscillator.connect(volume);
  volume.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + recipe.duration);
}
