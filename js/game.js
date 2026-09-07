import {
  LEVELS,
  createMonstersForLevel,
  damageMonster,
  getLevel,
  moveMonster
} from "./monster.js";
import {
  createInitialPlayer,
  loadProgress,
  mergeMedals,
  saveProgress
} from "./player.js";
import { playSound } from "./sounds.js";
import {
  applyBackground,
  createExplosion,
  getElements,
  renderBossHealth,
  renderChoices,
  renderHud,
  renderMedals,
  renderMonsters,
  showScreen
} from "./ui.js";

const SECONDS_PER_LEVEL = 30;
const FINAL_LEVEL = LEVELS.length;

let elements;
let player;
let progress;
let monsters = [];
let levelNumber = 1;
let secondsLeft = SECONDS_PER_LEVEL;
let timerId = 0;
let animationId = 0;
let gameIsRunning = false;

// Comeca uma partida nova, mas respeita as escolhas feitas no menu.
function startGame() {
  stopGameLoops();

  const selectedCharacter = player.character;
  const selectedCursor = player.cursor;

  player = createInitialPlayer({
    character: selectedCharacter,
    cursor: selectedCursor
  });
  progress = loadProgress(localStorage);
  player.medals = progress.medals;
  levelNumber = 1;
  secondsLeft = SECONDS_PER_LEVEL;
  gameIsRunning = true;

  showScreen(elements, "game-screen");
  setupLevel();
  timerId = window.setInterval(countOneSecond, 1000);
  animationId = window.requestAnimationFrame(updateGame);
  playSound("click");
}

// Cada fase recria a lista de monstros usando as regras de monster.js.
function setupLevel() {
  const level = getLevel(levelNumber);
  secondsLeft = SECONDS_PER_LEVEL;
  monsters = createMonstersForLevel(levelNumber).map(placeMonsterInsideGameArea);

  applyBackground(level.background);
  renderHud(elements, player, progress, levelNumber, secondsLeft, level.name);
  renderBossHealth(elements, monsters[0]);
  renderMonsters(elements, monsters, player.character, hitMonster);
}

function placeMonsterInsideGameArea(monster, index) {
  const area = getGameAreaSize();
  const safeWidth = Math.max(1, area.width - monster.size);
  const safeHeight = Math.max(1, area.height - monster.size);

  return {
    ...monster,
    x: (80 + index * 120) % safeWidth,
    y: (90 + index * 80) % safeHeight
  };
}

// requestAnimationFrame chama esta funcao muitas vezes por segundo.
function updateGame() {
  if (!gameIsRunning) {
    return;
  }

  const area = getGameAreaSize();
  monsters = monsters.map((monster) => moveMonster(monster, area));
  renderMonsters(elements, monsters, player.character, hitMonster);
  renderBossHealth(elements, monsters[0]);
  animationId = window.requestAnimationFrame(updateGame);
}

function countOneSecond() {
  secondsLeft--;
  renderHud(elements, player, progress, levelNumber, secondsLeft, getLevel(levelNumber).name);

  if (secondsLeft <= 0) {
    finishGame(false, "O tempo acabou. Tente de novo com calma!");
  }
}

// Um clique certo toca som, cria explosao e tira vida do monstro.
function hitMonster(monsterId, event) {
  event.stopPropagation();
  playSound("laser");
  createExplosion(event.clientX, event.clientY);

  const monster = monsters.find((item) => item.id === monsterId);
  const damagedMonster = damageMonster(monster);

  if (damagedMonster.defeated) {
    player.score += damagedMonster.isBoss ? 20 : 5;
    playSound("explosion");
    monsters = monsters.filter((item) => item.id !== monsterId);
    saveCurrentProgress();
  } else {
    monsters = monsters.map((item) => (item.id === monsterId ? damagedMonster : item));
  }

  renderHud(elements, player, progress, levelNumber, secondsLeft, getLevel(levelNumber).name);
  renderMonsters(elements, monsters, player.character, hitMonster);
  renderBossHealth(elements, monsters[0]);

  if (monsters.length === 0) {
    advanceLevel();
  }
}

function advanceLevel() {
  if (levelNumber === FINAL_LEVEL) {
    finishGame(true, "Voce venceu o chefao e completou o curso-jogo!");
    return;
  }

  levelNumber++;
  playSound("level");
  window.setTimeout(setupLevel, 600);
}

// Clicar no fundo ensina uma regra clara: mirar importa.
function missMonster(event) {
  if (!gameIsRunning || event.target.closest(".monster")) {
    return;
  }

  player.lives--;
  playSound("click");
  renderHud(elements, player, progress, levelNumber, secondsLeft, getLevel(levelNumber).name);

  if (player.lives <= 0) {
    finishGame(false, "Voce ficou sem vidas. Clique nos monstrinhos, nao no fundo!");
  }
}

function finishGame(won, message) {
  stopGameLoops();
  gameIsRunning = false;
  saveCurrentProgress();
  playSound(won ? "victory" : "defeat");

  elements.endEmoji.textContent = won ? "🏆" : "💫";
  elements.endTitle.textContent = won ? "Vitoria!" : "Game Over";
  elements.endMessage.textContent = message;
  elements.finalScore.textContent = player.score;
  elements.bestScoreEnd.textContent = progress.bestScore;
  renderMedals(elements.medalsEnd, progress.medals);
  showScreen(elements, "end-screen");
}

// Recorde e medalhas ficam guardados no localStorage.
function saveCurrentProgress() {
  const bestScore = Math.max(progress.bestScore, player.score);
  const medals = mergeMedals(progress.medals, player.score);

  progress = { bestScore, medals };
  saveProgress(localStorage, progress);
  renderMedals(elements.medalsMenu, progress.medals);
  elements.bestScoreMenu.textContent = progress.bestScore;
  elements.bestScoreGame.textContent = progress.bestScore;
}

function stopGameLoops() {
  window.clearInterval(timerId);
  window.cancelAnimationFrame(animationId);
}

function getGameAreaSize() {
  return {
    width: elements.gameArea.clientWidth,
    height: elements.gameArea.clientHeight
  };
}

function chooseCharacter(character) {
  player.character = character;
  renderChoices(elements, player, chooseCharacter, chooseCursor);
  playSound("click");
}

function chooseCursor(cursor) {
  player.cursor = cursor;
  elements.customCursor.textContent = cursor.emoji;
  renderChoices(elements, player, chooseCharacter, chooseCursor);
  playSound("click");
}

function openScreen(screenId) {
  progress = loadProgress(localStorage);
  elements.bestScoreMenu.textContent = progress.bestScore;
  renderMedals(elements.medalsMenu, progress.medals);
  showScreen(elements, screenId);
  playSound("click");
}

function moveCustomCursor(event) {
  elements.customCursor.style.left = `${event.clientX}px`;
  elements.customCursor.style.top = `${event.clientY}px`;
}

function prepareGame() {
  elements = getElements();
  player = createInitialPlayer();
  progress = loadProgress(localStorage);

  renderChoices(elements, player, chooseCharacter, chooseCursor);
  renderMedals(elements.medalsMenu, progress.medals);
  elements.bestScoreMenu.textContent = progress.bestScore;
  elements.bestScoreGame.textContent = progress.bestScore;
  elements.playButton.addEventListener("click", startGame);
  elements.playAgainButton.addEventListener("click", startGame);
  elements.gameArea.addEventListener("click", missMonster);
  document.addEventListener("mousemove", moveCustomCursor);

  document.querySelectorAll("[data-open-screen]").forEach((button) => {
    button.addEventListener("click", () => openScreen(button.dataset.openScreen));
  });
}

prepareGame();
