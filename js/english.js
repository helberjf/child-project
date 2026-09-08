import { PALAVRAS } from "../data/palavras.js";

export const MAX_RECOVERIES = 5;

export function getAllowedWordLevels(gameLevel) {
  if (gameLevel >= 5) {
    return [1, 2, 3];
  }

  if (gameLevel >= 3) {
    return [1, 2];
  }

  return [1];
}

export function canOfferRecovery(recoveriesUsed) {
  return recoveriesUsed < MAX_RECOVERIES;
}

export function createEnglishQuestion(options = {}) {
  const words = options.words || PALAVRAS;
  const word = chooseWord({
    words,
    gameLevel: options.gameLevel || 1,
    usedWords: options.usedWords || [],
    learningStats: options.learningStats || {},
    random: options.random || Math.random
  });
  const random = options.random || Math.random;
  const direction = random() < 0.5 ? "pt-en" : "en-pt";
  const answerKey = direction === "pt-en" ? "ingles" : "portugues";
  const promptKey = direction === "pt-en" ? "portugues" : "ingles";
  const optionsList = createOptions({
    words,
    word,
    answerKey,
    random
  });

  return {
    word,
    usedWord: word.ingles,
    direction,
    prompt: word[promptKey],
    correctAnswer: word[answerKey],
    options: optionsList
  };
}

export function checkEnglishAnswer(question, answer) {
  return normalizeText(answer) === normalizeText(question.correctAnswer);
}

export function updateLearningStats(progress, question, correct) {
  const key = question.word.ingles;
  const currentWord = progress.words?.[key] || {
    palavra: question.word.ingles,
    portugues: question.word.portugues,
    categoria: question.word.categoria,
    acertos: 0,
    erros: 0
  };
  const nextWord = {
    ...currentWord,
    acertos: currentWord.acertos + (correct ? 1 : 0),
    erros: currentWord.erros + (correct ? 0 : 1)
  };

  return {
    ...progress,
    words: {
      ...(progress.words || {}),
      [key]: nextWord
    },
    englishQuestions: (progress.englishQuestions || 0) + 1,
    englishCorrect: (progress.englishCorrect || 0) + (correct ? 1 : 0),
    englishStreak: correct ? (progress.englishStreak || 0) + 1 : 0
  };
}

function chooseWord({ words, gameLevel, usedWords, learningStats, random }) {
  const allowedLevels = getAllowedWordLevels(gameLevel);
  const availableWords = words.filter((word) => {
    return allowedLevels.includes(word.nivel) && !usedWords.includes(word.ingles);
  });
  const candidates = availableWords.length > 0
    ? availableWords
    : words.filter((word) => allowedLevels.includes(word.nivel));
  const weightedWords = createWeightedWords(candidates, learningStats);
  const index = Math.floor(random() * weightedWords.length);

  return weightedWords[index];
}

function createWeightedWords(words, learningStats) {
  return words.flatMap((word) => {
    const stats = learningStats[word.ingles];
    const needsReview = stats && stats.erros > stats.acertos;

    return needsReview ? [word, word, word] : [word];
  });
}

function createOptions({ words, word, answerKey, random }) {
  const sameCategory = words.filter((item) => {
    return item.categoria === word.categoria && item.ingles !== word.ingles;
  });
  const backupWords = words.filter((item) => item.ingles !== word.ingles);
  const distractorPool = sameCategory.length >= 3 ? sameCategory : backupWords;
  const distractors = [];

  for (const item of shuffle(distractorPool, random)) {
    const option = item[answerKey];

    if (!distractors.includes(option) && option !== word[answerKey]) {
      distractors.push(option);
    }

    if (distractors.length === 3) {
      break;
    }
  }

  return shuffle([word[answerKey], ...distractors], random);
}

export function shuffle(items, random = Math.random) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const nextIndex = Math.floor(random() * (index + 1));
    const currentItem = result[index];
    result[index] = result[nextIndex];
    result[nextIndex] = currentItem;
  }

  return result;
}

function normalizeText(text) {
  return String(text).trim().toLowerCase();
}
