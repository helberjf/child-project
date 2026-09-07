import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../css/style.css", import.meta.url), "utf8");

test("cards do menu tem limite flexivel para desktop e painel estreito", () => {
  assert.match(css, /width:\s*min\(680px,\s*calc\(100%\s*-\s*24px\)\)/);
});

test("telas de menu podem rolar quando a altura fica pequena", () => {
  assert.match(css, /\.screen\s*\{[\s\S]*overflow-y:\s*auto;/);
  assert.match(css, /body\s*\{[\s\S]*overflow-x:\s*hidden;/);
});
