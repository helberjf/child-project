const COMBO_WINDOW_MS = 1700;

export function resolveMonsterTouch({ monster, combo, lastCaptureTime, currentTime }) {
  if (monster.isFriend) {
    return {
      scoreDelta: 0,
      lifeDelta: -1,
      combo: 0,
      effect: "friend",
      feedback: `NAO PEGUE O ${monster.emoji}!`
    };
  }

  const nextCombo = isFastCombo(lastCaptureTime, currentTime) ? combo + 1 : 1;
  const scoreDelta = monster.points * nextCombo;

  return {
    scoreDelta,
    lifeDelta: 0,
    combo: nextCombo,
    effect: "capture",
    feedback: `+${scoreDelta} ⭐`
  };
}

export function getTimerEndAction({ levelNumber, finalLevel }) {
  if (levelNumber >= finalLevel) {
    return { type: "defeat" };
  }

  return {
    type: "next-level",
    levelNumber: levelNumber + 1
  };
}

export function getNextLevelAction({ levelNumber, finalLevel }) {
  if (levelNumber >= finalLevel) {
    return {
      type: "victory"
    };
  }

  return {
    type: "next-level",
    levelNumber: levelNumber + 1,
    delayMs: 0
  };
}

function isFastCombo(lastCaptureTime, currentTime) {
  if (!lastCaptureTime) {
    return false;
  }

  return currentTime - lastCaptureTime <= COMBO_WINDOW_MS;
}
