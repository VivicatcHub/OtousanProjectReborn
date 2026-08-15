import { useEffect, useMemo, useState } from "react";
import {
  useData,
  wordsFor,
  getText,
  wordArticles,
  ARTICLE_LANG,
} from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { shuffle, weightedSample } from "@/lib/utils";

const ROUND_SIZE = 8;
const OPTIONS = ["un", "une", "du", "des"];

export function useGameArticle({
  category = "all",
  direction = "known-learn",
  pictures = "both",
  infinite = false,
} = {}) {
  const { words, languages, loading } = useData();
  const { known, learn } = useSettings();
  const { recordWord, wordWeight } = useWordStats();

  const questionLang = ARTICLE_LANG;
  const answerLang = ARTICLE_LANG;

  const weightOf = (w) => wordWeight(learn, w.id);

  const [pool, setPool] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [pendingOver, setPendingOver] = useState(false); // wrong in endless: show the answer first

  const answerLangObj = useMemo(
    () => languages.find((l) => l.code === answerLang),
    [languages, answerLang],
  );

  function makeQuestion(p) {
    const [word] = weightedSample(p, 1, weightOf);
    return { word, options: shuffle(OPTIONS) };
  }

  function build(p) {
    setPool(p);
    let round;
    if (infinite) {
      round = p.length > 0 ? [makeQuestion(p)] : [];
    } else {
      const chosen = weightedSample(
        p,
        Math.min(ROUND_SIZE, p.length),
        weightOf,
      );
      round = chosen.map((word) => ({ word, options: shuffle(OPTIONS) }));
    }
    setQuestions(round);
    setIndex(0);
    setScore(0);
    setPicked(null);
    setGameOver(false);
    setPendingOver(false);
  }

  useEffect(() => {
    if (loading) return;
    build(wordsFor(words, known, learn, category, pictures, "article"));
  }, [loading, words, known, learn, category, pictures, direction, infinite]);

  const question = questions[index] ?? null;
  const finished = infinite
    ? gameOver
    : questions.length > 0 && index >= questions.length;

  const isCorrectOption = (option) =>
    question
      ? wordArticles(question.word, ARTICLE_LANG).includes(option)
      : false;

  function answer(option) {
    if (picked) return;
    setPicked(option);
    const correct = isCorrectOption(option);
    recordWord(learn, question.word.id, correct);
    if (correct) setScore((s) => s + 1);
    else if (infinite) setPendingOver(true);
  }

  function next() {
    if (pendingOver) {
      setGameOver(true); // the answer has been shown, end the endless run now
      return;
    }
    setPicked(null);
    if (infinite) setQuestions((qs) => [...qs, makeQuestion(pool)]);
    setIndex((i) => i + 1);
  }

  function restart() {
    build(wordsFor(words, known, learn, category, pictures, "article"));
  }

  return {
    loading,
    ready: questions.length > 0,
    question,
    finished,
    infinite,
    index,
    total: questions.length,
    score,
    picked,
    known,
    learn,
    questionLang,
    answerLang,
    answerLangObj,
    getText,
    isCorrectOption,
    optionKey: (option) => option,
    optionLabel: (option) => option,
    speakOnPick: () => question?.word,
    answer,
    next,
    restart,
  };
}
