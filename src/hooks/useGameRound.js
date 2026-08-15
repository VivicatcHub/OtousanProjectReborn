import { useEffect, useMemo, useState } from "react";
import { useData, wordsFor, getText } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { sample, shuffle, weightedSample } from "@/lib/utils";

const ROUND_SIZE = 8;
const CHOICES = 4;

export function useGameRound({
  category = "all",
  direction = "known-learn",
  pictures = "both",
  infinite = false,
} = {}) {
  const { words, languages, loading } = useData();
  const { known, learn } = useSettings();
  const { recordWord, wordWeight } = useWordStats();

  const questionLang = direction === "learn-known" ? learn : known;
  const answerLang = direction === "learn-known" ? known : learn;

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
    const distractors = sample(
      p.filter((w) => w.id !== word.id),
      CHOICES - 1,
    );
    return { word, options: shuffle([word, ...distractors]) };
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
      round = chosen.map((word) => {
        const distractors = sample(
          p.filter((w) => w.id !== word.id),
          CHOICES - 1,
        );
        return { word, options: shuffle([word, ...distractors]) };
      });
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
    build(wordsFor(words, known, learn, category, pictures));
  }, [loading, words, known, learn, category, pictures, direction, infinite]);

  const question = questions[index] ?? null;
  const finished = infinite
    ? gameOver
    : questions.length > 0 && index >= questions.length;

  const isCorrectOption = (option) => option?.id === question?.word.id;

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
    build(wordsFor(words, known, learn, category, pictures));
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
    optionKey: (option) => option.id,
    optionLabel: (option) => getText(option, answerLang),
    speakOnPick: (option) => option,
    answer,
    next,
    restart,
  };
}
