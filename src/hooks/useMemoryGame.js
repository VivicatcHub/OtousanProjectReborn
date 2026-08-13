import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useData, wordsFor } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { shuffle, weightedSample } from "@/lib/utils";
import { playWord } from "@/lib/audio";

const DEFAULT_PAIRS = 6;
const FLIP_BACK_MS = 900;

export function useMemoryGame({
  pairs = DEFAULT_PAIRS,
  mode = "image",
  category = "all",
  pictures = "both",
} = {}) {
  const { words, languages, loading } = useData();
  const { known, learn } = useSettings();
  const { recordWord, wordWeight } = useWordStats();

  const weightOf = useCallback(
    (w) => wordWeight(learn, w.id),
    [wordWeight, learn],
  );

  const learnLang = useMemo(
    () => languages.find((l) => l.code === learn),
    [languages, learn],
  );

  const pool = useMemo(
    () => wordsFor(words, known, learn, category, pictures),
    [words, known, learn, category, pictures],
  );

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [lock, setLock] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [matches, setMatches] = useState(0);
  const [penalty, setPenalty] = useState(false);
  const [phase, setPhase] = useState("playing");

  const seenRef = useRef(new Set());

  const say = useCallback(
    (word) => {
      if (word) playWord(word, learn, learnLang?.speechCode);
    },
    [learn, learnLang],
  );

  const build = useCallback(() => {
    const count = Math.min(pairs, pool.length);
    const chosen = weightedSample(pool, count, weightOf);

    const deck = chosen.flatMap((word, i) => {
      const faces =
        mode === "translation"
          ? [
              { type: "text", lang: known },
              { type: "text", lang: learn },
            ]
          : [
              { type: "image", lang: known },
              { type: "text", lang: learn },
            ];
      return faces.map((face, f) => ({
        id: `${i}-${f}`,
        wordId: word.id,
        word,
        matched: false,
        ...face,
      }));
    });

    seenRef.current = new Set();
    setCards(shuffle(deck));
    setFlipped([]);
    setLock(false);
    setMistakes(0);
    setMatches(0);
    setPenalty(false);
    setPhase("playing");
  }, [pool, pairs, mode, known, learn, weightOf]);

  useEffect(() => {
    if (!loading) build();
  }, [loading, build]);

  const totalPairs = cards.length / 2;

  const clickCard = useCallback(
    (index) => {
      if (lock || phase !== "playing") return;
      const card = cards[index];
      if (!card || card.matched || flipped.includes(index)) return;
      if (flipped.length >= 2) return;

      const next = [...flipped, index];
      setFlipped(next);
      if (next.length < 2) return;

      const [i, j] = next;
      const a = cards[i];
      const b = cards[j];

      const wasSeen = seenRef.current.has(i) || seenRef.current.has(j);
      seenRef.current.add(i);
      seenRef.current.add(j);

      if (a.wordId === b.wordId) {
        recordWord(learn, a.wordId, true);
        say(a.word);
        setCards((prev) =>
          prev.map((c, k) =>
            k === i || k === j ? { ...c, matched: true } : c,
          ),
        );
        setMatches((m) => m + 1);
        setFlipped([]);
        if (matches + 1 === totalPairs) setPhase("won");
      } else {
        if (wasSeen) {
          setMistakes((m) => m + 1);
          recordWord(learn, a.wordId, false);
          recordWord(learn, b.wordId, false);
        }
        setPenalty(wasSeen);
        setLock(true);
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
          setPenalty(false);
        }, FLIP_BACK_MS);
      }
    },

    [lock, phase, cards, flipped, matches, totalPairs, learn, say, recordWord],
  );

  return {
    loading,
    phase,
    mode,
    cards,
    flipped,
    lock,
    penalty,
    mistakes,
    matches,
    totalPairs,
    remaining: totalPairs - matches,
    canPlay: pool.length >= 1,
    start: build,
    clickCard,
  };
}
