export const LEVELS = [
  {
    number: 1,
    name: "Floresta Encantada",
    worldEmoji: "🌳",
    background: "forest",
    monsterCount: 4,
    friendCount: 1,
    speed: 1.8,
    size: 78,
    time: 30,
    specialTypes: []
  },
  {
    number: 2,
    name: "Reino de Gelo",
    worldEmoji: "❄️",
    background: "ice",
    monsterCount: 5,
    friendCount: 1,
    speed: 2.2,
    size: 74,
    time: 30,
    specialTypes: ["golden"]
  },
  {
    number: 3,
    name: "Vulcao Brincalhao",
    worldEmoji: "🌋",
    background: "volcano",
    monsterCount: 6,
    friendCount: 2,
    speed: 2.7,
    size: 66,
    time: 30,
    specialTypes: ["golden"]
  },
  {
    number: 4,
    name: "Espaco Colorido",
    worldEmoji: "🚀",
    background: "space",
    monsterCount: 7,
    friendCount: 2,
    speed: 3.2,
    size: 64,
    time: 30,
    specialTypes: ["golden", "fast"]
  },
  {
    number: 5,
    name: "Castelo Arcade",
    worldEmoji: "🏰",
    background: "castle",
    monsterCount: 8,
    friendCount: 2,
    speed: 3.6,
    size: 60,
    time: 30,
    specialTypes: ["golden", "fast"]
  },
  {
    number: 6,
    name: "Chefao dos Monstrinhos",
    worldEmoji: "👑",
    background: "boss",
    monsterCount: 1,
    friendCount: 0,
    speed: 3.8,
    size: 128,
    time: 40,
    specialTypes: [],
    isBoss: true
  }
];

export const FINAL_LEVEL = LEVELS.length;

export function getLevel(levelNumber) {
  return LEVELS.find((level) => level.number === levelNumber) || LEVELS[0];
}

export function isBossLevel(levelNumber) {
  return Boolean(getLevel(levelNumber).isBoss);
}
