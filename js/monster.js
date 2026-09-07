import { getLevel, isBossLevel } from "./levels.js";

export { FINAL_LEVEL, LEVELS, getLevel, isBossLevel } from "./levels.js";

export const MONSTER_CHARACTERS = ["👾", "👻", "🐲", "🐸", "🤖", "🐱", "🦄", "🐵"];

const SPECIAL_MONSTERS = {
  golden: { emoji: "🌟", points: 50, sizeBonus: 6, speedBonus: 0.25 },
  fast: { emoji: "⚡", points: 30, sizeBonus: -8, speedBonus: 1.6, visibleForMs: 5200 }
};

export function pickFriendEmoji({ playerAvatar, random = Math.random }) {
  const possibleFriends = MONSTER_CHARACTERS.filter((emoji) => emoji !== playerAvatar);
  const index = Math.floor(random() * possibleFriends.length);

  // Aqui escolhemos um personagem aleatorio para ser protegido na fase.
  return possibleFriends[index];
}

export function createMonstersForLevel(levelNumber, options = {}) {
  const level = getLevel(levelNumber);

  if (isBossLevel(levelNumber)) {
    return [createBossMonster(level)];
  }

  const friendEmoji = options.friendEmoji || pickFriendEmoji(options);
  const monsters = [];

  for (let index = 0; index < level.monsterCount; index++) {
    const isFriend = index < level.friendCount;

    monsters.push(createMonster({
      id: `${level.number}-${index}`,
      index,
      level,
      isFriend,
      friendEmoji,
      playerAvatar: options.playerAvatar || "",
      now: options.now
    }));
  }

  return mixMonsters(monsters);
}

export function createReplacementMonster(levelNumber, options = {}) {
  const level = getLevel(levelNumber);
  const id = `${level.number}-novo-${options.id || Date.now()}`;

  return createMonster({
    id,
    index: options.index || 0,
    level,
    isFriend: Boolean(options.isFriend),
    friendEmoji: options.friendEmoji,
    playerAvatar: options.playerAvatar || "",
    now: options.now
  });
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

// Criamos um novo objeto em vez de alterar o antigo. Isso deixa a regra mais previsivel.
export function damageMonster(monster) {
  const nextHealth = Math.max(0, monster.health - 1);

  return {
    ...monster,
    health: nextHealth,
    defeated: nextHealth === 0
  };
}

function createMonster({ id, index, level, isFriend, friendEmoji, playerAvatar, now = Date.now() }) {
  const kind = isFriend ? "friend" : chooseMonsterKind(level, index);
  const special = SPECIAL_MONSTERS[kind];
  const emoji = isFriend ? friendEmoji : chooseCaptureEmoji(index, friendEmoji, playerAvatar, kind);
  const size = Math.max(54, level.size + (special?.sizeBonus || 0));
  const speed = level.speed + index * 0.18 + (special?.speedBonus || 0);

  return {
    id,
    emoji,
    x: 80 + index * 48,
    y: 96 + index * 36,
    speedX: index % 2 === 0 ? speed : -speed,
    speedY: index % 3 === 0 ? speed : -speed,
    direction: index % 2 === 0 ? 1 : -1,
    size,
    health: 1,
    maxHealth: 1,
    isFriend,
    isBoss: false,
    kind,
    points: isFriend ? 0 : special?.points || 10,
    expiresAt: special?.visibleForMs ? now + special.visibleForMs : null
  };
}

function createBossMonster(level) {
  return {
    id: "boss",
    emoji: "👹",
    x: 140,
    y: 120,
    speedX: level.speed,
    speedY: level.speed,
    direction: 1,
    size: level.size,
    health: 6,
    maxHealth: 6,
    isFriend: false,
    isBoss: true,
    kind: "boss",
    points: 250,
    expiresAt: null
  };
}

function chooseMonsterKind(level, index) {
  if (level.specialTypes.includes("golden") && index === level.friendCount) {
    return "golden";
  }

  if (level.specialTypes.includes("fast") && index === level.friendCount + 1) {
    return "fast";
  }

  return "normal";
}

function chooseCaptureEmoji(index, friendEmoji, playerAvatar, kind) {
  if (kind === "golden") {
    return SPECIAL_MONSTERS.golden.emoji;
  }

  if (kind === "fast") {
    return SPECIAL_MONSTERS.fast.emoji;
  }

  const choices = MONSTER_CHARACTERS.filter((emoji) => {
    return emoji !== friendEmoji && emoji !== playerAvatar;
  });

  return choices[index % choices.length];
}

function mixMonsters(monsters) {
  return monsters.sort((first, second) => {
    if (first.isFriend === second.isFriend) {
      return first.id.localeCompare(second.id);
    }

    return first.isFriend ? 1 : -1;
  });
}
