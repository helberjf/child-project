import test from "node:test";
import assert from "node:assert/strict";

import {
  damageMonster,
  moveMonster,
  createMonstersForLevel,
  isBossLevel
} from "../js/monster.js";
import { findUnlockedMedals } from "../js/player.js";

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
