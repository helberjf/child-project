import { CHARACTER_OPTIONS, CURSOR_OPTIONS, MEDALS } from "./player.js";

const LESSON_HINTS = [
  "Olhe bem antes de tocar.",
  "Proteja o amigo da fase.",
  "Capture os especiais rapidinho.",
  "Respire e mire com calma.",
  "O castelo esta cheio de surpresas.",
  "O chefao precisa de varios toques."
];

const MEDAL_DESCRIPTIONS = {
  apprentice: "100 pontos",
  hunter: "500 pontos",
  master: "1000 pontos",
  legend: "2500 pontos",
  "best-friend": "Complete uma fase sem tocar no amigo",
  "combo-master": "Faca combo x10",
  "fast-reflex": "Capture um monstro especial",
  "english-hero": "Recupere uma vida com ingles",
  "first-word": "Acerte sua primeira palavra",
  "little-polyglot": "Acerte 10 palavras diferentes"
};

// Guardamos todos os elementos em um objeto para evitar buscas repetidas.
export function getElements() {
  return {
    customCursor: document.getElementById("custom-cursor"),
    playButton: document.getElementById("play-button"),
    playAgainButton: document.getElementById("play-again-button"),
    readyButton: document.getElementById("ready-button"),
    soundToggle: document.getElementById("sound-toggle"),
    gameArea: document.getElementById("game-area"),
    monsterLayer: document.getElementById("monster-layer"),
    characterOptions: document.getElementById("character-options"),
    cursorOptions: document.getElementById("cursor-options"),
    introWorld: document.getElementById("intro-world"),
    introLevel: document.getElementById("intro-level"),
    introFriendLine: document.getElementById("intro-friend-line"),
    introFriendEmoji: document.getElementById("intro-friend-emoji"),
    countdownText: document.getElementById("countdown-text"),
    levelText: document.getElementById("level-text"),
    levelName: document.getElementById("level-name"),
    lessonHint: document.getElementById("lesson-hint"),
    scoreText: document.getElementById("score-text"),
    comboText: document.getElementById("combo-text"),
    timeText: document.getElementById("time-text"),
    livesText: document.getElementById("lives-text"),
    friendPill: document.getElementById("friend-pill"),
    friendLabel: document.getElementById("friend-label"),
    friendText: document.getElementById("friend-text"),
    bossPanel: document.getElementById("boss-panel"),
    bossHealth: document.getElementById("boss-health"),
    bestScoreMenu: document.getElementById("best-score-menu"),
    bestComboMenu: document.getElementById("best-combo-menu"),
    bestLevelMenu: document.getElementById("best-level-menu"),
    medalsMenu: document.getElementById("medals-menu"),
    medalsEnd: document.getElementById("medals-end"),
    wordsLearnedList: document.getElementById("words-learned-list"),
    englishProgress: document.getElementById("english-progress"),
    englishPromptTitle: document.getElementById("english-prompt-title"),
    englishWord: document.getElementById("english-word"),
    englishOptions: document.getElementById("english-options"),
    englishFeedback: document.getElementById("english-feedback"),
    endEmoji: document.getElementById("end-emoji"),
    endTitle: document.getElementById("end-title"),
    endMessage: document.getElementById("end-message"),
    finalScore: document.getElementById("final-score"),
    finalCaptured: document.getElementById("final-captured"),
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
    const button = createOptionButton(character, player.avatar === character);
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

export function renderRecords(elements, progress) {
  elements.bestScoreMenu.textContent = progress.bestScore;
  elements.bestComboMenu.textContent = progress.bestCombo;
  elements.bestLevelMenu.textContent = progress.bestLevel;
}

export function renderLevelIntro(elements, level, friendEmoji) {
  elements.introWorld.textContent = `${level.worldEmoji} ${level.name}`;
  elements.introLevel.textContent = level.isBoss ? "Chefao final" : `Nivel ${level.number}`;

  if (level.isBoss) {
    elements.introFriendLine.textContent = "👑 Prepare-se para o chefao!";
    elements.introFriendEmoji.textContent = "👹";
    return;
  }

  elements.introFriendLine.textContent = "❤️ Seu amigo nesta fase:";
  elements.introFriendEmoji.textContent = friendEmoji;
}

export function renderCountdown(elements, text) {
  elements.countdownText.textContent = text;
}

export function renderHud(elements, player, level, secondsLeft, friendEmoji) {
  elements.levelText.textContent = level.number;
  elements.levelName.textContent = `${level.worldEmoji} ${level.name}`;
  elements.lessonHint.textContent = LESSON_HINTS[level.number - 1] || "A aventura continua!";
  elements.scoreText.textContent = player.score;
  elements.comboText.textContent = player.combo > 1 ? `x${player.combo}` : "x0";
  elements.comboText.classList.toggle("combo-hot", player.combo >= 5);
  elements.timeText.textContent = Math.max(0, secondsLeft);
  elements.livesText.textContent = "❤️".repeat(player.lives) + "🤍".repeat(Math.max(0, 3 - player.lives));
  elements.friendLabel.textContent = level.isBoss ? "Chefao" : "Proteja";
  elements.friendText.textContent = level.isBoss ? "👹" : friendEmoji;
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

export function renderBossHealth(elements, boss) {
  if (!boss || !boss.isBoss) {
    elements.bossPanel.classList.add("hidden");
    return;
  }

  const healthPercent = (boss.health / boss.maxHealth) * 100;
  elements.bossPanel.classList.remove("hidden");
  elements.bossHealth.style.width = `${healthPercent}%`;
}

export function renderMedals(container, unlockedMedals) {
  const unlockedIds = new Set(unlockedMedals.map((medal) => medal.id));
  container.innerHTML = "";

  MEDALS.forEach((medal) => {
    const badge = document.createElement("article");
    const unlocked = unlockedIds.has(medal.id);
    badge.className = unlocked ? "medal" : "medal locked";
    badge.innerHTML = `
      <strong>${unlocked ? medal.emoji : "🔒"} ${medal.name}</strong>
      <span>${MEDAL_DESCRIPTIONS[medal.id] || "Conquista especial"}</span>
    `;
    container.append(badge);
  });
}

export function renderWordsLearned(elements, progress) {
  const words = Object.values(progress.words || {})
    .filter((word) => word.acertos > 0 || word.erros > 0)
    .sort((first, second) => second.acertos - first.acertos || first.palavra.localeCompare(second.palavra))
    .slice(0, 30);

  elements.wordsLearnedList.innerHTML = "";

  if (words.length === 0) {
    elements.wordsLearnedList.textContent = "Nenhuma palavra ainda. Quando o desafio aparecer, elas ficam aqui.";
    return;
  }

  words.forEach((word) => {
    const card = document.createElement("article");
    const title = document.createElement("strong");
    const translation = document.createElement("span");
    const stats = document.createElement("span");

    card.className = "word-card";
    title.textContent = `🇺🇸 ${word.palavra.toUpperCase()}`;
    translation.textContent = word.portugues || "palavra aprendida";
    stats.textContent = `✅ ${word.acertos} acertos · 💡 ${word.erros} revisoes`;
    card.append(title, translation, stats);
    elements.wordsLearnedList.append(card);
  });
}

export function renderEnglishQuestion(elements, question, recoveriesUsed, maxRecoveries, onAnswer) {
  elements.englishProgress.textContent = `Chance ${recoveriesUsed + 1} de ${maxRecoveries}`;
  elements.englishPromptTitle.textContent = question.direction === "pt-en"
    ? "Qual palavra em ingles significa:"
    : "O que significa em portugues:";
  elements.englishWord.textContent = question.prompt;
  elements.englishFeedback.textContent = "";
  elements.englishOptions.innerHTML = "";

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => onAnswer(option));
    elements.englishOptions.append(button);
  });
}

export function renderEnglishResult(elements, question, selectedAnswer, correct) {
  Array.from(elements.englishOptions.children).forEach((button) => {
    const isSelected = button.textContent === selectedAnswer;
    const isCorrect = button.textContent === question.correctAnswer;
    button.disabled = true;

    if (isCorrect) {
      button.className = "answer-button correct";
    } else if (isSelected) {
      button.className = "answer-button wrong";
    }
  });

  elements.englishFeedback.textContent = correct
    ? `🎉 Muito bem! ${question.word.ingles.toUpperCase()} = ${question.word.portugues.toUpperCase()}. ❤️ +1 vida`
    : `💡 Quase! ${question.word.ingles.toUpperCase()} significa ${question.word.portugues.toUpperCase()}.`;
}

export function renderEnd(elements, player, progress, won, message) {
  elements.endEmoji.textContent = won ? "🎉" : "😢";
  elements.endTitle.textContent = won ? "Voce capturou o chefao!" : "Fim de jogo";
  elements.endMessage.textContent = message;
  elements.finalScore.textContent = player.score;
  elements.finalCaptured.textContent = player.capturedCount;
  elements.bestScoreEnd.textContent = progress.bestScore;
  renderMedals(elements.medalsEnd, progress.medals);
}

export function setSoundButton(elements, enabled) {
  elements.soundToggle.textContent = enabled ? "🔊 Som ligado" : "🔇 Som desligado";
}

export function showFloatingText(text, x, y) {
  const feedback = document.createElement("span");
  feedback.className = "floating-text";
  feedback.textContent = text;
  feedback.style.left = `${x}px`;
  feedback.style.top = `${y}px`;
  document.body.append(feedback);

  window.setTimeout(() => feedback.remove(), 780);
}

// As particulas sao emojis animados por CSS, sem usar Canvas.
export function createMagicParticles(x, y, friendly = false) {
  const emojis = friendly ? ["💔", "❤️", "💫"] : ["✨", "⭐", "💫"];

  emojis.forEach((emoji, index) => {
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

export const createExplosion = createMagicParticles;

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

function getMonsterClassName(monster) {
  const classes = new Set(["monster", monster.kind || "normal"]);

  if (monster.isFriend) {
    classes.add("friend");
  }

  if (monster.isBoss) {
    classes.add("boss");
  }

  return Array.from(classes).join(" ");
}

function getMonsterLabel(monster) {
  if (monster.isBoss) {
    return "Chefao dos monstrinhos";
  }

  if (monster.isFriend) {
    return "Monstro amigo, nao toque";
  }

  return "Monstrinho para capturar";
}
