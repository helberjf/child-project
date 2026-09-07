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
