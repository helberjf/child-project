import test from "node:test";
import assert from "node:assert/strict";

import { FINAL_LEVEL, getLevel, isBossLevel } from "../js/levels.js";
import {
  createMonstersForLevel,
  damageMonster,
  moveMonster,
  pickFriendEmoji
} from "../js/monster.js";
import { getNextLevelAction, getTimerEndAction, resolveMonsterTouch } from "../js/game-flow.js";
import { createInitialPlayer, findUnlockedMedals } from "../js/player.js";
import { loadProgress, saveProgress } from "../js/storage.js";

test("jogo tem cinco fases comuns e chefao final", () => {
  assert.equal(FINAL_LEVEL, 6);
  assert.equal(getLevel(1).name, "Floresta Encantada");
  assert.equal(isBossLevel(6), true);
});

test("amigo da fase nunca usa o avatar do jogador", () => {
  const friend = pickFriendEmoji({
    playerAvatar: "🤖",
    random: () => 0
  });

  assert.notEqual(friend, "🤖");
});

test("cada fase cria monstros misturando amigos e capturaveis", () => {
  const levelThree = createMonstersForLevel(3, {
    playerAvatar: "🤖",
    friendEmoji: "🐸"
  });

  assert.equal(levelThree.length, getLevel(3).monsterCount);
  assert.equal(levelThree.filter((monster) => monster.isFriend).length, 2);
  assert.ok(levelThree.some((monster) => !monster.isFriend));
  assert.ok(levelThree.every((monster) => monster.isFriend || monster.emoji !== "🤖"));
});

test("fase cinco inclui monstros especiais dourado e rapido", () => {
  const levelFive = createMonstersForLevel(5, {
    playerAvatar: "🐱",
    friendEmoji: "🐸"
  });

  assert.ok(levelFive.some((monster) => monster.kind === "golden" && monster.points === 50));
  assert.ok(levelFive.some((monster) => monster.kind === "fast" && monster.points === 30));
});

test("chefao e grande e precisa de varios toques", () => {
  const bossMonsters = createMonstersForLevel(FINAL_LEVEL, {
    playerAvatar: "🤖",
    friendEmoji: "🐸"
  });

  assert.equal(bossMonsters.length, 1);
  assert.equal(bossMonsters[0].isBoss, true);
  assert.ok(bossMonsters[0].health > 3);
  assert.ok(bossMonsters[0].size >= 120);
});

test("monstro rebate nas bordas da area do jogo", () => {
  const monster = {
    x: 190,
    y: 50,
    speedX: 12,
    speedY: 3,
    size: 40
  };

  const movedMonster = moveMonster(monster, { width: 220, height: 180 });

  assert.equal(movedMonster.x, 180);
  assert.equal(movedMonster.speedX, -12);
  assert.equal(movedMonster.y, 53);
});

test("toque em monstro capturavel aumenta combo e pontuacao", () => {
  const result = resolveMonsterTouch({
    monster: { isFriend: false, points: 10, kind: "normal" },
    combo: 1,
    lastCaptureTime: 1000,
    currentTime: 1800
  });

  assert.equal(result.scoreDelta, 20);
  assert.equal(result.combo, 2);
  assert.equal(result.lifeDelta, 0);
  assert.equal(result.effect, "capture");
});

test("toque no amigo perde vida e zera combo sem captura", () => {
  const result = resolveMonsterTouch({
    monster: { isFriend: true, emoji: "🐸", points: 0 },
    combo: 5,
    lastCaptureTime: 1000,
    currentTime: 1200
  });

  assert.equal(result.scoreDelta, 0);
  assert.equal(result.lifeDelta, -1);
  assert.equal(result.combo, 0);
  assert.equal(result.effect, "friend");
});

test("acertar o chefao diminui sua energia ate ele ser capturado", () => {
  const monster = {
    health: 2,
    maxHealth: 2
  };

  const firstHit = damageMonster(monster);
  const secondHit = damageMonster(firstHit);

  assert.equal(firstHit.health, 1);
  assert.equal(firstHit.defeated, false);
  assert.equal(secondHit.health, 0);
  assert.equal(secondHit.defeated, true);
});

test("cronometro passa fase comum e derrota se o chefao escapar", () => {
  assert.deepEqual(getTimerEndAction({ levelNumber: 2, finalLevel: FINAL_LEVEL }), {
    type: "next-level",
    levelNumber: 3
  });

  assert.deepEqual(getTimerEndAction({ levelNumber: FINAL_LEVEL, finalLevel: FINAL_LEVEL }), {
    type: "defeat"
  });
});

test("proxima fase aparece imediatamente depois de uma transicao manual", () => {
  const action = getNextLevelAction({ levelNumber: 1, finalLevel: FINAL_LEVEL });

  assert.deepEqual(action, {
    type: "next-level",
    levelNumber: 2,
    delayMs: 0
  });
});

test("jogador inicial pode manter avatar escolhido", () => {
  const player = createInitialPlayer({
    avatar: "🐱"
  });

  assert.equal(player.avatar, "🐱");
  assert.equal(player.lives, 3);
});

test("medalhas combinam pontuacao, combo e acoes especiais", () => {
  const medals = findUnlockedMedals({
    score: 1000,
    bestCombo: 10,
    capturedSpecial: true,
    cleanLevel: true
  });

  assert.deepEqual(
    medals.map((medal) => medal.name),
    ["Aprendiz", "Cacador", "Mestre", "Melhor Amigo", "Combo Master", "Reflexos Rapidos"]
  );
});

test("progresso salvo guarda recorde, combo, nivel e medalhas", () => {
  const storage = createFakeStorage();
  const progress = {
    bestScore: 500,
    bestCombo: 6,
    bestLevel: 4,
    medals: [{ id: "apprentice", emoji: "🥉", name: "Aprendiz", points: 100 }]
  };

  saveProgress(storage, progress);

  assert.deepEqual(loadProgress(storage), progress);
});

test("progresso quebrado volta para valores iniciais seguros", () => {
  const storage = createFakeStorage();
  storage.setItem("caca-aos-monstrinhos-progress", "{quebrado");

  assert.deepEqual(loadProgress(storage), {
    bestScore: 0,
    bestCombo: 0,
    bestLevel: 1,
    medals: []
  });
});

function createFakeStorage() {
  const data = new Map();

  return {
    getItem(key) {
      return data.get(key) || null;
    },
    setItem(key, value) {
      data.set(key, value);
    }
  };
}
