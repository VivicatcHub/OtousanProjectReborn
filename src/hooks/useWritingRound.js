import { useEffect, useMemo, useState } from "react";
import {
  useData,
  wordsFor,
  getText,
  typingTarget,
  acceptedAnswers,
} from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { weightedSample } from "@/lib/utils";

const ROUND_SIZE = 8;

const BASIC_LETTERS = [..."abcdefghijklmnopqrstuvwxyz"];

export function normalizeAnswer(s) {
  return (s ?? "").normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

function alphabetOf(pool, langCode) {
  const extras = new Set();
  let space = false;
  for (const word of pool) {
    for (const char of typingTarget(word, langCode).toLowerCase()) {
      if (char === " ") space = true;
      else if (!BASIC_LETTERS.includes(char)) extras.add(char);
    }
  }
  return {
    letters: BASIC_LETTERS,
    extras: [...extras].sort((a, b) => a.localeCompare(b)),
    space,
  };
}

export function useWritingRound({
  category = "all",
  direction = "known-learn",
  pictures = "both",
  hint = "underscores",
  forgiving = true,
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
  const [typed, setTyped] = useState("");
  const [checkedValue, setCheckedValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState("typing");
  const [gameOver, setGameOver] = useState(false);
  const [pendingOver, setPendingOver] = useState(false); // wrong in endless: show the answer first

  const answerLangObj = useMemo(
    () => languages.find((l) => l.code === answerLang),
    [languages, answerLang],
  );
  const questionLangObj = useMemo(
    () => languages.find((l) => l.code === questionLang),
    [languages, questionLang],
  );

  function build(p) {
    setPool(p);
    const round = infinite
      ? weightedSample(p, Math.min(1, p.length), weightOf)
      : weightedSample(p, Math.min(ROUND_SIZE, p.length), weightOf);
    setQuestions(round);
    setIndex(0);
    setScore(0);
    setTyped("");
    setAttempts(0);
    setStatus("typing");
    setGameOver(false);
    setPendingOver(false);
  }

  useEffect(() => {
    if (loading) return;
    build(wordsFor(words, known, learn, category, pictures));
  }, [loading, words, known, learn, category, pictures, direction, infinite]);

  const alphabet = useMemo(
    () => alphabetOf(pool, answerLang),
    [pool, answerLang],
  );

  const word = questions[index] ?? null;
  const target = word ? typingTarget(word, answerLang) : "";
  const finished = infinite
    ? gameOver
    : questions.length > 0 && index >= questions.length;
  const revealed = status === "wrong";

  function check() {
    if (!word || revealed) return;
    const guess = normalizeAnswer(typed);
    const correct = acceptedAnswers(word, answerLang).some(
      (a) => normalizeAnswer(a) === guess,
    );
    if (correct) {
      setScore((s) => s + 1);
      recordWord(learn, word.id, true);
      next();
      return;
    }
    if (forgiving && attempts === 0) {
      setAttempts(1);
      setCheckedValue(typed);
      setStatus("retry");
      return;
    }
    recordWord(learn, word.id, false);
    setStatus("wrong");
    if (infinite) setPendingOver(true);
  }

  function next() {
    if (pendingOver) {
      setGameOver(true); // the answer has been shown, end the endless run now
      return;
    }
    setTyped("");
    setCheckedValue("");
    setAttempts(0);
    setStatus("typing");
    if (infinite)
      setQuestions((qs) => [...qs, ...weightedSample(pool, 1, weightOf)]);
    setIndex((i) => i + 1);
  }

  function restart() {
    build(wordsFor(words, known, learn, category, pictures));
  }

  return {
    loading,
    ready: questions.length > 0,
    word,
    target,
    finished,
    infinite,
    index,
    total: questions.length,
    score,
    typed,
    setTyped,
    checkedValue,
    attempts,
    status,
    revealed,
    hint,
    forgiving,
    alphabet,
    known,
    learn,
    questionLang,
    answerLang,
    questionLangObj,
    answerLangObj,
    getText,
    check,
    next,
    restart,
  };
}
