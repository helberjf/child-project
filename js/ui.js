import { CHARACTER_OPTIONS, CURSOR_OPTIONS } from "./player.js";

const LESSON_HINTS = [
  "Eventos percebem o clique.",
  "Arrays guardam varios monstros.",
  "Loops atualizam todos eles.",
  "Variaveis mudam a velocidade.",
  "Numeros controlam o tamanho.",
  "Objetos juntam dados do monstro.",
  "If decide vitoria ou derrota."
];

// Guardamos todos os elementos em um objeto para evitar buscas repetidas.
export function getElements() {
  return {
    customCursor: document.getElementById("custom-cursor"),
    playButton: document.getElementById("play-button"),
    playAgainButton: document.getElementById("play-again-button"),
    gameArea: document.getElementById("game-area"),
    monsterLayer: document.getElementById("monster-layer"),
    characterOptions: document.getElementById("character-options"),
    cursorOptions: document.getElementById("cursor-options"),
    levelText: document.getElementById("level-text"),
    levelName: document.getElementById("level-name"),
    lessonHint: document.getElementById("lesson-hint"),
    scoreText: document.getElementById("score-text"),
    bestScoreGame: document.getElementById("best-score-game"),
    bestScoreMenu: document.getElementById("best-score-menu"),
    timeText: document.getElementById("time-text"),
    livesText: document.getElementById("lives-text"),
    bossPanel: document.getElementById("boss-panel"),
    bossHealth: document.getElementById("boss-health"),
    medalsMenu: document.getElementById("medals-menu"),
    medalsEnd: document.getElementById("medals-end"),
    endEmoji: document.getElementById("end-emoji"),
    endTitle: document.getElementById("end-title"),
    endMessage: document.getElementById("end-message"),
    finalScore: document.getElementById("final-score"),
    bestScoreEnd: document.getElementById("best-score-end")
  };
}

export function showScreen(elements, screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("screen-active", screen.id === screenId);
  });

  elements.customCursor.classList.toggle("hidden", screenId !== "game-screen");
}

export function renderChoices(elements, player, onCharacterClick, onCursorClick) {
  elements.characterOptions.innerHTML = "";
  elements.cursorOptions.innerHTML = "";

  CHARACTER_OPTIONS.forEach((character) => {
    const button = createOptionButton(character, player.character === character);
    button.addEventListener("click", () => onCharacterClick(character));
    elements.characterOptions.append(button);
  });

  CURSOR_OPTIONS.forEach((cursor) => {
    const button = createOptionButton(cursor.emoji, player.cursor.name === cursor.name);
    button.title = cursor.name;
    button.addEventListener("click", () => onCursorClick(cursor));
    elements.cursorOptions.append(button);
  });
}

export function renderHud(elements, player, progress, levelNumber, secondsLeft, levelName) {
  elements.levelText.textContent = levelNumber;
  elements.levelName.textContent = levelName;
  elements.lessonHint.textContent = LESSON_HINTS[levelNumber - 1];
  elements.scoreText.textContent = player.score;
  elements.bestScoreGame.textContent = progress.bestScore;
  elements.timeText.textContent = secondsLeft;
  elements.livesText.textContent = "❤️".repeat(player.lives) || "💔";
}

// Reaproveitar botoes deixa o alvo estavel enquanto o monstro se move.
export function renderMonsters(elements, monsters, onHit) {
  const currentButtons = Array.from(elements.monsterLayer.children);
  const buttonsByMonster = new Map(
    currentButtons.map((button) => [button.dataset.monsterId, button])
  );
  const nextButtons = [];

  monsters.forEach((monster) => {
    let button = buttonsByMonster.get(monster.id);

    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.monsterId = monster.id;
      button.addEventListener("click", (event) => onHit(monster.id, event));
    }

    button.className = getMonsterClassName(monster);
    button.style.left = `${monster.x}px`;
    button.style.top = `${monster.y}px`;
    button.style.setProperty("--monster-size", `${monster.size}px`);
    button.textContent = monster.emoji;
    button.setAttribute("aria-label", getMonsterLabel(monster));
    nextButtons.push(button);
  });

  elements.monsterLayer.replaceChildren(...nextButtons);
}

function getMonsterClassName(monster) {
  const classes = ["monster", monster.kind || "normal"];

  if (monster.isFriend) {
    classes.push("friend");
  }

  if (monster.isBoss) {
    classes.push("boss");
  }

  return classes.join(" ");
}

function getMonsterLabel(monster) {
  if (monster.isBoss) {
    return "Chefao";
  }

  if (monster.isFriend) {
    return "Monstro amigo, nao toque";
  }

  return "Monstrinho para capturar";
}

export function renderBossHealth(elements, boss) {
  if (!boss || !boss.isBoss) {
    elements.bossPanel.classList.add("hidden");
    return;
  }

  const healthPercent = (boss.health / boss.maxHealth) * 100;
  elements.bossPanel.classList.remove("hidden");
  elements.bossHealth.style.width = `${healthPercent}%`;
}

export function renderMedals(container, medals) {
  container.innerHTML = "";

  if (medals.length === 0) {
    container.textContent = "Nenhuma medalha ainda.";
    return;
  }

  medals.forEach((medal) => {
    const badge = document.createElement("span");
    badge.className = "medal";
    badge.title = `${medal.name}: ${medal.points} pontos`;
    badge.textContent = medal.emoji;
    container.append(badge);
  });
}

// As particulas sao emojis animados por CSS, sem usar Canvas.
export function createExplosion(x, y) {
  ["💥", "✨", "⭐"].forEach((emoji, index) => {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.textContent = emoji;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--particle-x", `${(index - 1) * 42}px`);
    particle.style.setProperty("--particle-y", `${index % 2 === 0 ? -48 : 38}px`);
    document.body.append(particle);

    window.setTimeout(() => particle.remove(), 650);
  });
}

export function applyBackground(backgroundName) {
  document.body.className = `background-${backgroundName}`;
}

function createOptionButton(text, selected) {
  const button = document.createElement("button");
  button.className = selected ? "option-button selected" : "option-button";
  button.type = "button";
  button.textContent = text;
  return button;
}
