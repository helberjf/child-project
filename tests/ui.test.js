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

  renderMonsters(elements, [monster], "👾", () => {});
  const firstButton = elements.monsterLayer.children[0];

  renderMonsters(elements, [{ ...monster, x: 120, y: 90 }], "👾", () => {});
  const secondButton = elements.monsterLayer.children[0];

  assert.equal(firstButton, secondButton);
  assert.equal(secondButton.style.left, "120px");
  assert.equal(secondButton.style.top, "90px");
});

function createMonster(id) {
  return {
    id,
    x: 40,
    y: 30,
    size: 70,
    emoji: "👾",
    isBoss: false
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
        append(child) {
          this.children.push(child);
        },
        replaceChildren(...nextChildren) {
          this.children = nextChildren;
        },
        addEventListener() {},
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
