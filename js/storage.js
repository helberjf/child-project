const PROGRESS_KEY = "caca-aos-monstrinhos-progress";

export function createEmptyProgress() {
  return {
    bestScore: 0,
    bestCombo: 0,
    bestLevel: 1,
    medals: [],
    words: {},
    englishQuestions: 0,
    englishCorrect: 0,
    englishStreak: 0
  };
}

export function loadProgress(storage) {
  try {
    const savedText = storage.getItem(PROGRESS_KEY);

    if (!savedText) {
      return createEmptyProgress();
    }

    const savedProgress = JSON.parse(savedText);

    return {
      bestScore: Number(savedProgress.bestScore) || 0,
      bestCombo: Number(savedProgress.bestCombo) || 0,
      bestLevel: Number(savedProgress.bestLevel) || 1,
      medals: Array.isArray(savedProgress.medals) ? savedProgress.medals : [],
      words: sanitizeWords(savedProgress.words),
      englishQuestions: Number(savedProgress.englishQuestions) || 0,
      englishCorrect: Number(savedProgress.englishCorrect) || 0,
      englishStreak: Number(savedProgress.englishStreak) || 0
    };
  } catch {
    return createEmptyProgress();
  }
}

// O navegador salva texto, por isso transformamos o progresso em JSON.
export function saveProgress(storage, progress) {
  storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function sanitizeWords(words) {
  if (!words || typeof words !== "object" || Array.isArray(words)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(words).map(([key, value]) => [
      key,
      {
        palavra: String(value?.palavra || key),
        acertos: Number(value?.acertos) || 0,
        erros: Number(value?.erros) || 0
      }
    ])
  );
}
