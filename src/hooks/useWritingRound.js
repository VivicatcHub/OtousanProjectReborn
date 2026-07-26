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
import { sample, weightedSample } from "@/lib/utils";

const ROUND_SIZE = 8; // words per game (classic mode)

export function normalizeAnswer(s) {
  return (s ?? "").normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

export function useWritingRound({
  category = "all",
  direction = "known-learn",
  pictures = "both", // "both" | "emoji" | "text" — which words to include
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
  const [checkedValue, setCheckedValue] = useState(""); // the exact text last verified
  const [attempts, setAttempts] = useState(0); // wrong tries on the current word
  const [status, setStatus] = useState("typing");
  const [gameOver, setGameOver] = useState(false); // infinite: a counted mistake

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
  }

  useEffect(() => {
    if (loading) return;
    build(wordsFor(words, known, learn, category, pictures));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, words, known, learn, category, pictures, direction, infinite]);

  const word = questions[index] ?? null;
  const target = word ? typingTarget(word, answerLang) : ""; // typeable form (kana, not kanji)
  const finished = infinite
    ? gameOver
    : questions.length > 0 && index >= questions.length;
  const revealed = status === "wrong"; // only wrong answers pause to reveal

  function check() {
    if (!word || revealed) return;
    const guess = normalizeAnswer(typed);
    const correct = acceptedAnswers(word, answerLang).some(
      (a) => normalizeAnswer(a) === guess,
    );
    if (correct) {
      setScore((s) => s + 1);
      recordWord(learn, word.id, true); // update this word's error rate
      next(); // correct: no feedback, straight to the next word
      return;
    }
    if (forgiving && attempts === 0) {
      setAttempts(1);
      setCheckedValue(typed); // colour this attempt until the input is edited
      setStatus("retry");
      return;
    }
    recordWord(learn, word.id, false); // update this word's error rate
    setStatus("wrong");
    if (infinite) setGameOver(true);
  }

  function next() {
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
    known,
    learn,
    questionLang, // language shown in the prompt
    answerLang, // language the child types (read aloud once revealed)
    questionLangObj,
    answerLangObj,
    getText,
    check,
    next,
    restart,
  };
}
