import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../css/style.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const uiJs = readFileSync(new URL("../js/ui.js", import.meta.url), "utf8");
const previewSvg = readFileSync(new URL("../assets/images/game-preview.svg", import.meta.url), "utf8");

test("cards do menu tem limite flexivel para desktop e painel estreito", () => {
  assert.match(css, /width:\s*min\(680px,\s*calc\(100%\s*-\s*24px\)\)/);
});

test("telas de menu podem rolar quando a altura fica pequena", () => {
  assert.match(css, /\.screen\s*\{[\s\S]*overflow-y:\s*auto;/);
  assert.match(css, /body\s*\{[\s\S]*overflow-x:\s*hidden;/);
});

test("larguras do jogo evitam 100vw para nao criar barra horizontal", () => {
  assert.doesNotMatch(css, /width:\s*min\((1020|1050)px,\s*calc\(100vw\s*-\s*16px\)\)/);
  assert.match(css, /width:\s*min\(1050px,\s*calc\(100%\s*-\s*16px\)\)/);
});

test("placas do jogo nao bloqueiam clique nos monstrinhos", () => {
  assert.match(css, /\.level-ribbon,\s*\.boss-panel\s*\{[\s\S]*pointer-events:\s*none;/);
  assert.match(indexHtml, /<header class="hud"[\s\S]*id="friend-pill"/);
});

test("arena contem somente a camada clicavel dos monstrinhos", () => {
  const gameArea = indexHtml.match(/<div id="game-area"[\s\S]*?<\/div>\s*<\/section>/)?.[0] || "";

  assert.doesNotMatch(gameArea, /level-ribbon|friend-pill|boss-panel/);
  assert.match(gameArea, /id="monster-layer"/);
});

test("textos visiveis evitam termos tecnicos", () => {
  const visibleCopy = `${indexHtml}\n${uiJs}\n${previewSvg}`;

  ["arrays", "objetos", "funcoes", "loops", "programar tambem"].forEach((term) => {
    assert.doesNotMatch(visibleCopy, new RegExp(term, "i"));
  });
});
