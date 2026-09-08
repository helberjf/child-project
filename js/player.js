import { loadProgress, saveProgress } from "./storage.js";

export const PLAYER_OPTIONS = ["🤖", "🐱", "🐲", "🦄", "🐸"];
export const CHARACTER_OPTIONS = PLAYER_OPTIONS;

export const CURSOR_OPTIONS = [
  { emoji: "🚀", name: "Nave" },
  { emoji: "⭐", name: "Estrela" },
  { emoji: "🪄", name: "Varinha" },
  { emoji: "🐱", name: "Gatinho" }
];

export const MEDALS = [
  { id: "apprentice", emoji: "🥉", name: "Aprendiz", points: 100 },
  { id: "hunter", emoji: "🥈", name: "Cacador", points: 500 },
  { id: "master", emoji: "🥇", name: "Mestre", points: 1000 },
  { id: "legend", emoji: "👑", name: "Lenda dos Monstrinhos", points: 2500 },
  { id: "best-friend", emoji: "❤️", name: "Melhor Amigo", special: "cleanLevel" },
  { id: "combo-master", emoji: "🔥", name: "Combo Master", special: "combo10" },
  { id: "fast-reflex", emoji: "⚡", name: "Reflexos Rapidos", special: "capturedSpecial" },
  { id: "english-hero", emoji: "🇺🇸", name: "English Hero", special: "englishHero" },
  { id: "first-word", emoji: "🇺🇸", name: "Primeira Palavra", special: "firstEnglishCorrect" },
  { id: "little-polyglot", emoji: "📚", name: "Pequeno Poliglota", special: "uniqueEnglish10" }
];

// O jogador sempre comeca com pontos zerados e tres vidas.
export function createInitialPlayer(choices = {}) {
  const avatar = choices.avatar || choices.character || PLAYER_OPTIONS[0];

  return {
    score: 0,
    lives: 3,
    avatar,
    character: avatar,
    cursor: choices.cursor || CURSOR_OPTIONS[0],
    combo: 0,
    bestCombo: 0,
    capturedCount: 0,
    capturedSpecial: false,
    cleanLevel: true,
    medals: []
  };
}

export function findUnlockedMedals(stats) {
  const safeStats = typeof stats === "number" ? { score: stats } : stats;
  const score = Number(safeStats.score) || 0;
  const bestCombo = Number(safeStats.bestCombo) || 0;

  return MEDALS.filter((medal) => {
    if (medal.points) {
      return score >= medal.points;
    }

    if (medal.special === "cleanLevel") {
      return Boolean(safeStats.cleanLevel);
    }

    if (medal.special === "combo10") {
      return bestCombo >= 10;
    }

    if (medal.special === "capturedSpecial") {
      return Boolean(safeStats.capturedSpecial);
    }

    if (medal.special === "englishHero") {
      return Boolean(safeStats.recoveredWithEnglish) || Number(safeStats.uniqueEnglishCorrect) >= 50;
    }

    if (medal.special === "firstEnglishCorrect") {
      return Number(safeStats.englishCorrect) >= 1;
    }

    if (medal.special === "uniqueEnglish10") {
      return Number(safeStats.uniqueEnglishCorrect) >= 10;
    }

    return false;
  });
}

// Junta medalhas novas com as antigas sem repetir conquistas.
export function mergeMedals(currentMedals, stats) {
  const medalIds = new Set(currentMedals.map((medal) => medal.id));
  const unlockedMedals = findUnlockedMedals(stats);

  return [
    ...currentMedals,
    ...unlockedMedals.filter((medal) => !medalIds.has(medal.id))
  ];
}

export { loadProgress, saveProgress };
