import test from "node:test";
import assert from "node:assert/strict";

import { PALAVRAS } from "../data/palavras.js";
import {
  MAX_RECOVERIES,
  canOfferRecovery,
  checkEnglishAnswer,
  createEnglishQuestion,
  getAllowedWordLevels,
  updateLearningStats
} from "../js/english.js";

test("banco inicial tem aproximadamente 200 palavras infantis", () => {
  assert.ok(PALAVRAS.length >= 190);
  assert.ok(PALAVRAS.every((word) => word.ingles && word.portugues && word.categoria && word.nivel));
});

test("niveis do jogo liberam palavras gradualmente", () => {
  assert.deepEqual(getAllowedWordLevels(1), [1]);
  assert.deepEqual(getAllowedWordLevels(3), [1, 2]);
  assert.deepEqual(getAllowedWordLevels(5), [1, 2, 3]);
});

test("pergunta de ingles cria quatro alternativas unicas com a resposta correta", () => {
  const question = createEnglishQuestion({
    gameLevel: 1,
    random: () => 0
  });

  assert.equal(question.options.length, 4);
  assert.equal(new Set(question.options).size, 4);
  assert.ok(question.options.includes(question.correctAnswer));
  assert.equal(question.usedWord, question.word.ingles);
});

test("pergunta alterna entre portugues para ingles e ingles para portugues", () => {
  const portugueseToEnglish = createEnglishQuestion({
    gameLevel: 1,
    random: () => 0
  });
  const englishToPortuguese = createEnglishQuestion({
    gameLevel: 1,
    random: () => 0.9
  });

  assert.equal(portugueseToEnglish.direction, "pt-en");
  assert.equal(englishToPortuguese.direction, "en-pt");
});

test("palavras usadas nao repetem enquanto existem opcoes disponiveis", () => {
  const question = createEnglishQuestion({
    gameLevel: 1,
    usedWords: ["dog"],
    random: () => 0
  });

  assert.notEqual(question.word.ingles, "dog");
});

test("verificacao de resposta ignora maiusculas e espacos", () => {
  const question = {
    correctAnswer: "house"
  };

  assert.equal(checkEnglishAnswer(question, " HOUSE "), true);
  assert.equal(checkEnglishAnswer(question, "dog"), false);
});

test("recuperacao de vida tem limite por partida", () => {
  assert.equal(canOfferRecovery(0), true);
  assert.equal(canOfferRecovery(MAX_RECOVERIES), false);
});

test("estatisticas de ingles guardam acertos, erros e sequencia", () => {
  const progress = {
    words: {},
    englishQuestions: 0,
    englishCorrect: 0,
    englishStreak: 0
  };
  const question = {
    word: {
      ingles: "dog",
      portugues: "cachorro",
      categoria: "animais"
    }
  };

  const afterCorrect = updateLearningStats(progress, question, true);
  const afterWrong = updateLearningStats(afterCorrect, question, false);

  assert.equal(afterCorrect.words.dog.acertos, 1);
  assert.equal(afterCorrect.englishCorrect, 1);
  assert.equal(afterCorrect.englishStreak, 1);
  assert.equal(afterWrong.words.dog.erros, 1);
  assert.equal(afterWrong.englishStreak, 0);
});
