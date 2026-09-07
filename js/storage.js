const PROGRESS_KEY = "caca-aos-monstrinhos-progress";

export function createEmptyProgress() {
  return {
    bestScore: 0,
    bestCombo: 0,
    bestLevel: 1,
    medals: []
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
      medals: Array.isArray(savedProgress.medals) ? savedProgress.medals : []
    };
  } catch {
    return createEmptyProgress();
  }
}

// O navegador salva texto, por isso transformamos o progresso em JSON.
export function saveProgress(storage, progress) {
  storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}
