import test from "node:test";
import assert from "node:assert/strict";

import {
  damageMonster,
  moveMonster,
  createMonstersForLevel,
  isBossLevel
} from "../js/monster.js";
import { createInitialPlayer, findUnlockedMedals } from "../js/player.js";
import { loadProgress, saveProgress } from "../js/player.js";

test("cada fase comum cria a quantidade certa de monstros", () => {
  const levelOne = createMonstersForLevel(1);
  const levelThree = createMonstersForLevel(3);

  assert.equal(levelOne.length, 1);
  assert.equal(levelThree.length, 3);
});

test("a fase do chefao cria um monstro grande com mais vida", () => {
  const bossMonsters = createMonstersForLevel(7);

  assert.equal(isBossLevel(7), true);
  assert.equal(bossMonsters.length, 1);
  assert.equal(bossMonsters[0].isBoss, true);
  assert.ok(bossMonsters[0].health > 1);
  assert.ok(bossMonsters[0].size > 90);
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

test("acertar um monstro diminui sua vida ate ele ser derrotado", () => {
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

test("medalhas sao liberadas conforme a pontuacao aumenta", () => {
  assert.deepEqual(findUnlockedMedals(9), []);
  assert.deepEqual(findUnlockedMedals(10).map((medal) => medal.emoji), ["🥉"]);
  assert.deepEqual(findUnlockedMedals(51).map((medal) => medal.emoji), ["🥉", "🥈", "🥇"]);
});

test("jogador inicial pode manter personagem e cursor escolhidos", () => {
  const player = createInitialPlayer({
    character: "🐱",
    cursor: { emoji: "⭐", name: "Estrela" }
  });

  assert.equal(player.character, "🐱");
  assert.deepEqual(player.cursor, { emoji: "⭐", name: "Estrela" });
});

test("progresso salvo guarda recorde e medalhas no navegador", () => {
  const storage = createFakeStorage();
  const progress = {
    bestScore: 30,
    medals: [{ emoji: "🥉", name: "Bronze", points: 10 }]
  };

  saveProgress(storage, progress);

  assert.deepEqual(loadProgress(storage), progress);
});

test("progresso quebrado volta para valores iniciais seguros", () => {
  const storage = createFakeStorage();
  storage.setItem("pegue-o-monstrinho-progress", "{quebrado");

  assert.deepEqual(loadProgress(storage), { bestScore: 0, medals: [] });
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
