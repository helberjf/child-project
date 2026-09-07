export const LEVELS = [
  {
    number: 1,
    name: "Floresta",
    background: "forest",
    monsterCount: 1,
    speed: 2,
    size: 78,
    health: 1
  },
  {
    number: 2,
    name: "Espaco",
    background: "space",
    monsterCount: 2,
    speed: 2.4,
    size: 76,
    health: 1
  },
  {
    number: 3,
    name: "Castelo",
    background: "castle",
    monsterCount: 3,
    speed: 2.6,
    size: 74,
    health: 1
  },
  {
    number: 4,
    name: "Vulcao",
    background: "volcano",
    monsterCount: 3,
    speed: 3.8,
    size: 74,
    health: 1
  },
  {
    number: 5,
    name: "Gelo",
    background: "ice",
    monsterCount: 3,
    speed: 3,
    size: 58,
    health: 1
  },
  {
    number: 6,
    name: "Desafio Relampago",
    background: "rainbow",
    monsterCount: 4,
    speed: 4,
    size: 56,
    health: 1
  },
  {
    number: 7,
    name: "Chefao",
    background: "boss",
    monsterCount: 1,
    speed: 4.4,
    size: 124,
    health: 6,
    isBoss: true
  }
];

const MONSTER_EMOJIS = ["👾", "🐲", "🐸", "👻", "🤖", "🐱"];

export function isBossLevel(levelNumber) {
  return levelNumber === 7;
}

export function getLevel(levelNumber) {
  return LEVELS.find((level) => level.number === levelNumber) || LEVELS[0];
}

export function createMonstersForLevel(levelNumber) {
  const level = getLevel(levelNumber);
  const totalMonsters = level.monsterCount;

  return Array.from({ length: totalMonsters }, (_, index) => ({
    id: `${level.number}-${index}`,
    x: 80 + index * 70,
    y: 120 + index * 45,
    speedX: level.speed + index * 0.35,
    speedY: level.speed + index * 0.25,
    emoji: level.isBoss ? "👑" : MONSTER_EMOJIS[index % MONSTER_EMOJIS.length],
    health: level.health,
    maxHealth: level.health,
    direction: index % 2 === 0 ? 1 : -1,
    size: level.size,
    isBoss: Boolean(level.isBoss)
  }));
}

export function moveMonster(monster, gameArea) {
  let nextX = monster.x + monster.speedX;
  let nextY = monster.y + monster.speedY;
  let nextSpeedX = monster.speedX;
  let nextSpeedY = monster.speedY;
  const maxX = Math.max(0, gameArea.width - monster.size);
  const maxY = Math.max(0, gameArea.height - monster.size);

  // Quando encosta na parede, o monstro troca de direcao.
  if (nextX <= 0 || nextX >= maxX) {
    nextSpeedX = -nextSpeedX;
    nextX = Math.min(Math.max(nextX, 0), maxX);
  }

  if (nextY <= 0 || nextY >= maxY) {
    nextSpeedY = -nextSpeedY;
    nextY = Math.min(Math.max(nextY, 0), maxY);
  }

  return {
    ...monster,
    x: nextX,
    y: nextY,
    speedX: nextSpeedX,
    speedY: nextSpeedY,
    direction: nextSpeedX >= 0 ? 1 : -1
  };
}

export function damageMonster(monster) {
  const nextHealth = Math.max(0, monster.health - 1);

  return {
    ...monster,
    health: nextHealth,
    defeated: nextHealth === 0
  };
}
