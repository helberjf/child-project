import { FINAL_LEVEL, getLevel } from "./levels.js";
import {
  createMonstersForLevel,
  createReplacementMonster,
  damageMonster,
  moveMonster,
  placeMonsterInArea,
  placeMonstersInArea,
  pickFriendEmoji,
  separateMonstersInArea
} from "./monster.js";
import { getTimerEndAction, resolveMonsterTouch } from "./game-flow.js";
import {
  createInitialPlayer,
  loadProgress,
  mergeMedals,
  saveProgress
} from "./player.js";
import {
  MAX_RECOVERIES,
  canOfferRecovery,
  checkEnglishAnswer,
  createEnglishQuestion,
  updateLearningStats
} from "./english.js";
import { isSoundEnabled, playSound, toggleSound } from "./sounds.js";
import {
  applyBackground,
  createMagicParticles,
  getElements,
  renderBossHealth,
  renderChoices,
  renderCountdown,
  renderEnd,
  renderEnglishQuestion,
  renderEnglishResult,
  renderHud,
  renderLevelIntro,
  renderMedals,
  renderMonsters,
  renderRecords,
  renderWordsLearned,
  setSoundButton,
  showFloatingText,
  showScreen
} from "./ui.js";

const COUNTDOWN_STEPS = ["3", "2", "1", "VAI!"];

let elements;
let player;
let progress;
let monsters = [];
let levelNumber = 1;
let secondsLeft = 30;
let friendEmoji = "";
let recoveriesUsed = 0;
let usedEnglishWords = [];
let currentQuestion = null;
let gameIsRunning = false;
let animationId = 0;
let countdownTimeoutId = 0;
let lastFrameTime = 0;
let timerAccumulator = 0;
let lastCaptureTime = 0;
let replacementCounter = 0;

// Comeca uma partida nova, mas respeita as escolhas feitas no menu.
function startGame() {
  stopGameLoops();

  const selectedAvatar = player.avatar;
  const selectedCursor = player.cursor;

  progress = loadProgress(localStorage);
  player = createInitialPlayer({
    avatar: selectedAvatar,
    cursor: selectedCursor
  });
  player.medals = progress.medals;

  monsters = [];
  levelNumber = 1;
  recoveriesUsed = 0;
  usedEnglishWords = [];
  currentQuestion = null;
  lastCaptureTime = 0;
  replacementCounter = 0;

  showLevelIntro();
  playSound("click");
}

function showLevelIntro() {
  stopGameLoops();
  gameIsRunning = false;

  const level = getLevel(levelNumber);
  secondsLeft = level.time;
  friendEmoji = level.isBoss
    ? ""
    : pickFriendEmoji({ playerAvatar: player.avatar });

  player.cleanLevel = true;
  applyBackground(level.background);
  renderLevelIntro(elements, level, friendEmoji);
  showScreen(elements, "level-intro-screen");
}

function startCountdown(afterCountdown = beginLevel) {
  stopGameLoops();
  showScreen(elements, "countdown-screen");
  playSound("start");

  let stepIndex = 0;

  function showNextStep() {
    renderCountdown(elements, COUNTDOWN_STEPS[stepIndex]);
    stepIndex++;

    if (stepIndex < COUNTDOWN_STEPS.length) {
      countdownTimeoutId = window.setTimeout(showNextStep, 650);
      return;
    }

    countdownTimeoutId = window.setTimeout(afterCountdown, 520);
  }

  showNextStep();
}

// Cada fase recria a lista de monstros usando as regras de monster.js.
function beginLevel() {
  const level = getLevel(levelNumber);

  showScreen(elements, "game-screen");
  secondsLeft = level.time;
  timerAccumulator = 0;
  lastCaptureTime = 0;
  monsters = createMonstersForLevel(levelNumber, {
    playerAvatar: player.avatar,
    friendEmoji,
    now: Date.now()
  });
  monsters = placeMonstersInArea(monsters, getGameAreaSize());

  renderGame();
  gameIsRunning = true;
  lastFrameTime = performance.now();
  animationId = window.requestAnimationFrame(updateGame);
}

function resumeLevel() {
  showScreen(elements, "game-screen");
  renderGame();
  gameIsRunning = true;
  timerAccumulator = 0;
  lastFrameTime = performance.now();
  animationId = window.requestAnimationFrame(updateGame);
}

// requestAnimationFrame move os monstros e tambem conta o tempo.
function updateGame(timestamp) {
  if (!gameIsRunning) {
    return;
  }

  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  timerAccumulator += delta;

  if (timerAccumulator >= 1000) {
    const elapsedSeconds = Math.floor(timerAccumulator / 1000);
    timerAccumulator -= elapsedSeconds * 1000;
    secondsLeft -= elapsedSeconds;

    if (secondsLeft <= 0) {
      finishLevelByTimer();
      return;
    }
  }

  const area = getGameAreaSize();
  const now = Date.now();
  const movedMonsters = monsters.map((monster) => moveMonster(monster, area));
  const separatedMonsters = separateMonstersInArea(movedMonsters, area);

  monsters = separatedMonsters.map((monster, index) => {
    return replaceExpiredMonster(monster, index, now, separatedMonsters);
  });

  renderGame();
  animationId = window.requestAnimationFrame(updateGame);
}

function finishLevelByTimer() {
  const action = getTimerEndAction({
    levelNumber,
    finalLevel: FINAL_LEVEL
  });

  stopGameLoops();
  gameIsRunning = false;

  if (action.type === "defeat") {
    finishGame(false, "O chefao escapou. Respire fundo e tente outra vez!");
    return;
  }

  if (player.cleanLevel) {
    saveCurrentProgress();
  }

  levelNumber = action.levelNumber;
  saveCurrentProgress();
  playSound("level");
  showLevelIntro();
}

// Aqui decidimos se o toque foi em amigo, monstro comum ou chefao.
function hitMonster(monsterId, event) {
  if (!gameIsRunning) {
    return;
  }

  event.stopPropagation();
  event.preventDefault();

  const monster = monsters.find((item) => item.id === monsterId);
  const x = event.clientX || window.innerWidth / 2;
  const y = event.clientY || window.innerHeight / 2;

  if (!monster) {
    return;
  }

  if (monster.isFriend) {
    touchFriend(monster, x, y);
    return;
  }

  if (monster.isBoss) {
    touchBoss(monster, x, y);
    return;
  }

  captureMonster(monster, x, y);
}

function touchFriend(monster, x, y) {
  const result = resolveMonsterTouch({
    monster,
    combo: player.combo,
    lastCaptureTime,
    currentTime: performance.now()
  });

  player.lives += result.lifeDelta;
  player.combo = result.combo;
  player.cleanLevel = false;
  lastCaptureTime = 0;

  playSound("friend");
  vibrate(40);
  createMagicParticles(x, y, true);
  showFloatingText("OPS! -1 ❤️", x, y);
  renderGame();

  if (player.lives <= 0) {
    offerEnglishRecovery();
  }
}

function captureMonster(monster, x, y) {
  const currentTime = performance.now();
  const result = resolveMonsterTouch({
    monster,
    combo: player.combo,
    lastCaptureTime,
    currentTime
  });

  player.score += result.scoreDelta;
  player.combo = result.combo;
  player.bestCombo = Math.max(player.bestCombo, player.combo);
  player.capturedCount++;
  player.capturedSpecial = player.capturedSpecial || monster.kind === "golden" || monster.kind === "fast";
  lastCaptureTime = currentTime;

  playSound(player.combo >= 2 ? "combo" : "hit");
  vibrate(20);
  createMagicParticles(x, y);
  showFloatingText(result.feedback, x, y);

  const keptMonsters = monsters.filter((item) => item.id !== monster.id);
  const replacementMonster = placeMonsterInArea(createReplacementMonster(levelNumber, {
    id: ++replacementCounter,
    index: monsters.indexOf(monster) + replacementCounter,
    isFriend: false,
    friendEmoji,
    playerAvatar: player.avatar,
    now: Date.now()
  }), getGameAreaSize(), keptMonsters);

  monsters = [...keptMonsters, replacementMonster];

  saveCurrentProgress();
  renderGame();
}

function touchBoss(monster, x, y) {
  const damagedBoss = damageMonster(monster);

  playSound("hit");
  vibrate(25);
  createMagicParticles(x, y);
  showFloatingText("✨ Chefao!", x, y);

  if (damagedBoss.defeated) {
    player.score += monster.points;
    player.capturedCount++;
    monsters = [];
    saveCurrentProgress();
    finishGame(true, "🎉 Voce capturou o chefao e salvou todos os amigos!");
    return;
  }

  monsters = monsters.map((item) => (item.id === monster.id ? damagedBoss : item));
  saveCurrentProgress();
  renderGame();
}

// Tocar fora nao tira vida: apenas quebra o combo.
function missMonster(event) {
  if (!gameIsRunning || event.target.closest(".monster")) {
    return;
  }

  if (player.combo > 0) {
    showFloatingText("Combo zerou", event.clientX, event.clientY);
  }

  player.combo = 0;
  lastCaptureTime = 0;
  renderGame();
}

function offerEnglishRecovery() {
  stopGameLoops();
  gameIsRunning = false;

  if (!canOfferRecovery(recoveriesUsed)) {
    finishGame(false, `Voce capturou ${player.capturedCount} monstrinhos. Vamos tentar de novo!`);
    return;
  }

  currentQuestion = createEnglishQuestion({
    gameLevel: levelNumber,
    usedWords: usedEnglishWords,
    learningStats: progress.words
  });
  usedEnglishWords.push(currentQuestion.usedWord);

  renderEnglishQuestion(elements, currentQuestion, recoveriesUsed, MAX_RECOVERIES, answerEnglishQuestion);
  showScreen(elements, "english-screen");
  playSound("start");
}

function answerEnglishQuestion(answer) {
  if (!currentQuestion) {
    return;
  }

  const correct = checkEnglishAnswer(currentQuestion, answer);
  recoveriesUsed++;
  progress = updateLearningStats(progress, currentQuestion, correct);

  renderEnglishResult(elements, currentQuestion, answer, correct);

  if (correct) {
    player.lives = 1;
    player.cleanLevel = false;
    player.recoveredWithEnglish = true;
    saveCurrentProgress();
    playSound("englishCorrect");
    playSound("recover");
    vibrate(50);
    window.setTimeout(() => startCountdown(resumeLevel), 1400);
    return;
  }

  saveCurrentProgress();
  playSound("englishWrong");

  if (canOfferRecovery(recoveriesUsed)) {
    window.setTimeout(offerEnglishRecovery, 1500);
    return;
  }

  window.setTimeout(() => {
    finishGame(false, "Quase! As palavras aprendidas vao ajudar na proxima partida.");
  }, 1500);
}

function finishGame(won, message) {
  stopGameLoops();
  gameIsRunning = false;
  saveCurrentProgress();
  playSound(won ? "victory" : "defeat");

  renderEnd(elements, player, progress, won, message);
  showScreen(elements, "end-screen");
}

// Recorde, medalhas e palavras ficam guardados no localStorage.
function saveCurrentProgress() {
  const bestScore = Math.max(progress.bestScore, player.score);
  const bestCombo = Math.max(progress.bestCombo, player.bestCombo);
  const bestLevel = Math.max(progress.bestLevel, levelNumber);
  const uniqueEnglishCorrect = countCorrectEnglishWords(progress.words);
  const medals = mergeMedals(progress.medals, {
    score: bestScore,
    bestCombo,
    cleanLevel: player.cleanLevel,
    capturedSpecial: player.capturedSpecial,
    recoveredWithEnglish: player.recoveredWithEnglish,
    englishCorrect: progress.englishCorrect,
    uniqueEnglishCorrect
  });

  progress = {
    ...progress,
    bestScore,
    bestCombo,
    bestLevel,
    medals
  };

  saveProgress(localStorage, progress);
  renderMenuProgress();
}

function renderGame() {
  const level = getLevel(levelNumber);

  renderHud(elements, player, level, secondsLeft, friendEmoji);
  renderBossHealth(elements, monsters[0]);
  renderMonsters(elements, monsters, hitMonster);
}

function renderMenuProgress() {
  renderRecords(elements, progress);
  renderMedals(elements.medalsMenu, progress.medals);
  renderWordsLearned(elements, progress);
}

function replaceExpiredMonster(monster, index, now, currentMonsters) {
  if (!monster.expiresAt || now < monster.expiresAt) {
    return monster;
  }

  const otherMonsters = currentMonsters.filter((item) => item.id !== monster.id);

  return placeMonsterInArea(createReplacementMonster(levelNumber, {
    id: ++replacementCounter,
    index: index + replacementCounter,
    isFriend: false,
    friendEmoji,
    playerAvatar: player.avatar,
    now
  }), getGameAreaSize(), otherMonsters);
}

function stopGameLoops() {
  window.clearTimeout(countdownTimeoutId);
  window.cancelAnimationFrame(animationId);
}

function getGameAreaSize() {
  return {
    width: elements.gameArea.clientWidth,
    height: elements.gameArea.clientHeight
  };
}

function chooseCharacter(avatar) {
  player.avatar = avatar;
  player.character = avatar;
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
  renderMenuProgress();
  showScreen(elements, screenId);
  playSound("click");
}

function moveCustomCursor(event) {
  elements.customCursor.style.left = `${event.clientX}px`;
  elements.customCursor.style.top = `${event.clientY}px`;
}

function countCorrectEnglishWords(words) {
  return Object.values(words || {}).filter((word) => word.acertos > 0).length;
}

function vibrate(duration) {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

function prepareGame() {
  elements = getElements();
  player = createInitialPlayer();
  progress = loadProgress(localStorage);

  renderChoices(elements, player, chooseCharacter, chooseCursor);
  renderMenuProgress();
  setSoundButton(elements, isSoundEnabled());

  elements.playButton.addEventListener("click", startGame);
  elements.playAgainButton.addEventListener("click", startGame);
  elements.readyButton.addEventListener("click", () => startCountdown(beginLevel));
  elements.soundToggle.addEventListener("click", () => {
    const enabled = toggleSound();
    setSoundButton(elements, enabled);
  });
  elements.gameArea.addEventListener("click", missMonster);
  document.addEventListener("mousemove", moveCustomCursor);

  document.querySelectorAll("[data-open-screen]").forEach((button) => {
    button.addEventListener("click", () => openScreen(button.dataset.openScreen));
  });
}

prepareGame();
