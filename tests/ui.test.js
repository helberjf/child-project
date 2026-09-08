import test from "node:test";
import assert from "node:assert/strict";

import { renderMonsters } from "../js/ui.js";

test("renderMonsters reaproveita botoes existentes para alvos animados", () => {
  const fakeDocument = createFakeDocument();
  globalThis.document = fakeDocument;

  const elements = {
    monsterLayer: fakeDocument.createElement("div")
  };

  const monster = createMonster("fase-1");

  renderMonsters(elements, [monster], () => {});
  const firstButton = elements.monsterLayer.children[0];

  renderMonsters(elements, [{ ...monster, x: 120, y: 90 }], () => {});
  const secondButton = elements.monsterLayer.children[0];

  assert.equal(firstButton, secondButton);
  assert.equal(secondButton.style.left, "120px");
  assert.equal(secondButton.style.top, "90px");
});

test("renderMonsters mantem os alvos conectados enquanto eles se movem", () => {
  const fakeDocument = createFakeDocument();
  globalThis.document = fakeDocument;

  const elements = {
    monsterLayer: fakeDocument.createElement("div")
  };
  const monster = createMonster("alvo-estavel");

  renderMonsters(elements, [monster], () => {});
  renderMonsters(elements, [{ ...monster, x: 95, y: 110 }], () => {});

  assert.equal(elements.monsterLayer.replaceChildrenCalls, 1);
});

test("renderMonsters mostra emoji real e classes de amigo e especial", () => {
  const fakeDocument = createFakeDocument();
  globalThis.document = fakeDocument;

  const elements = {
    monsterLayer: fakeDocument.createElement("div")
  };

  renderMonsters(elements, [
    { ...createMonster("amigo"), emoji: "🐸", isFriend: true, kind: "friend" },
    { ...createMonster("dourado"), emoji: "🌟", kind: "golden" }
  ], () => {});

  const [friendButton, goldenButton] = elements.monsterLayer.children;

  assert.equal(friendButton.textContent, "🐸");
  assert.match(friendButton.className, /friend/);
  assert.equal(goldenButton.textContent, "🌟");
  assert.match(goldenButton.className, /golden/);
});

test("renderMonsters liga o clique ao id correto do monstro", () => {
  const fakeDocument = createFakeDocument();
  globalThis.document = fakeDocument;

  const elements = {
    monsterLayer: fakeDocument.createElement("div")
  };
  let clickedMonsterId = "";

  renderMonsters(elements, [createMonster("alvo-clicavel")], (monsterId) => {
    clickedMonsterId = monsterId;
  });

  elements.monsterLayer.children[0].click();

  assert.equal(clickedMonsterId, "alvo-clicavel");
});

function createMonster(id) {
  return {
    id,
    x: 40,
    y: 30,
    size: 70,
    emoji: "👾",
    isBoss: false,
    isFriend: false,
    kind: "normal"
  };
}

function createFakeDocument() {
  return {
    createElement(tagName) {
      return {
        tagName,
        children: [],
        className: "",
        dataset: {},
        style: createFakeStyle(),
        textContent: "",
        type: "",
        listeners: {},
        replaceChildrenCalls: 0,
        append(child) {
          this.children.push(child);
        },
        replaceChildren(...nextChildren) {
          this.replaceChildrenCalls++;
          this.children = nextChildren;
        },
        addEventListener(type, listener) {
          this.listeners[type] = listener;
        },
        click() {
          this.listeners.click?.({
            stopPropagation() {},
            preventDefault() {}
          });
        },
        remove() {
          this.wasRemoved = true;
        },
        setAttribute(name, value) {
          this[name] = value;
        },
        set innerHTML(value) {
          this.children = [];
          this.textContent = value;
        },
        get innerHTML() {
          return this.textContent;
        }
      };
    }
  };
}

function createFakeStyle() {
  const style = {};

  style.setProperty = (name, value) => {
    style[name] = value;
  };

  return style;
}
