export const CHARACTER_OPTIONS = ["👾", "🐲", "🐸", "👻", "🤖", "🐱"];

export const CURSOR_OPTIONS = [
  { emoji: "🚀", name: "Nave" },
  { emoji: "⭐", name: "Estrela" },
  { emoji: "🪄", name: "Varinha" },
  { emoji: "🐱", name: "Gatinho" }
];

export const MEDALS = [
  { emoji: "🥉", name: "Bronze", points: 10 },
  { emoji: "🥈", name: "Prata", points: 25 },
  { emoji: "🥇", name: "Ouro", points: 50 },
  { emoji: "👑", name: "Coroa", points: 100 }
];

const PROGRESS_KEY = "pegue-o-monstrinho-progress";

export function createInitialPlayer(choices = {}) {
  return {
    score: 0,
    lives: 3,
    character: choices.character || CHARACTER_OPTIONS[0],
    cursor: choices.cursor || CURSOR_OPTIONS[0],
    medals: []
  };
}

export function findUnlockedMedals(score) {
  return MEDALS.filter((medal) => score >= medal.points);
}

export function mergeMedals(currentMedals, score) {
  const medalNames = new Set(currentMedals.map((medal) => medal.name));
  const unlockedMedals = findUnlockedMedals(score);

  return [
    ...currentMedals,
    ...unlockedMedals.filter((medal) => !medalNames.has(medal.name))
  ];
}

export function loadProgress(storage) {
  try {
    const savedText = storage.getItem(PROGRESS_KEY);

    if (!savedText) {
      return createEmptyProgress();
    }

    const savedProgress = JSON.parse(savedText);

    return {
      bestScore: Number(savedProgress.bestScore) || 0,
      medals: Array.isArray(savedProgress.medals) ? savedProgress.medals : []
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(storage, progress) {
  storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function createEmptyProgress() {
  return {
    bestScore: 0,
    medals: []
  };
}
