import { useCallback, useEffect, useMemo, useState } from "react";
import { useData, wordsFor } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { useWordStats } from "@/context/WordStatsContext";
import { sample, shuffle, weightedSample } from "@/lib/utils";
import { playWord } from "@/lib/audio";

const DEFAULT_GRID = 12; // how many picture tiles the grid starts with

export function useImagier({
  gridSize = DEFAULT_GRID,
  category = "all",
  pictures = "both", // "both" | "emoji" (only picture words) | "text" (only word-only entries)
  infinite = false,
  prompt = "voice", // "voice" = hear the word · "text" = read it in the learned language
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

  const [phase, setPhase] = useState("intro"); // "intro" | "playing" | "won" | "over"
  const [slots, setSlots] = useState([]); // [{ word: Word | null }]
  const [targetId, setTargetId] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0); // infinite mode: tiles cleared in a row
  const [shakeIndex, setShakeIndex] = useState(-1); // slot currently shaking
  const [poppedIndex, setPoppedIndex] = useState(-1); // slot that just reappeared

  useEffect(() => {
    setPhase("intro");
  }, [known, learn, gridSize, category, pictures, infinite, prompt]);

  const say = useCallback(
    (word) => {
      if (word && prompt === "voice")
        playWord(word, learn, learnLang?.speechCode);
    },
    [prompt, learn, learnLang],
  );

  const targetWord = useMemo(
    () => slots.find((s) => s.word && s.word.id === targetId)?.word ?? null,
    [slots, targetId],
  );

  const start = useCallback(() => {
    let gridWords = weightedSample(pool, gridSize, weightOf);
    while (gridWords.length < gridSize) {
      gridWords = [
        ...gridWords,
        ...weightedSample(pool, gridSize - gridWords.length, weightOf),
      ];
    }
    setSlots(gridWords.map((word) => ({ word })));
    setMistakes(0);
    setScore(0);
    setShakeIndex(-1);
    setPoppedIndex(-1);
    setPhase("playing");
    const target = gridWords[Math.floor(Math.random() * gridWords.length)];
    setTargetId(target.id);
    say(target);
  }, [pool, gridSize, say, weightOf]);

  const repeat = useCallback(() => say(targetWord), [say, targetWord]);

  const clickSlot = useCallback(
    (index) => {
      const slot = slots[index];
      if (!slot?.word || phase !== "playing") return;

      recordWord(learn, targetId, slot.word.id === targetId);

      if (slot.word.id === targetId) {
        if (infinite) {
          clearTileInfinite(index);
          return;
        }
        setScore((s) => s + 1); // count cleared tiles (for records/achievements)
        const next = slots.map((s, i) => (i === index ? { word: null } : s));
        setSlots(next);
        const remaining = next.filter((s) => s.word);
        if (remaining.length === 0) {
          setPhase("won");
        } else {
          const nextTarget =
            remaining[Math.floor(Math.random() * remaining.length)].word;
          setTargetId(nextTarget.id);
          say(nextTarget);
        }
      } else {
        if (infinite) {
          setMistakes((m) => m + 1);
          setShakeIndex(index);
          setPhase("over");
          return;
        }
        setMistakes((m) => m + 1);
        setShakeIndex(index);
        setTimeout(() => setShakeIndex(-1), 400);

        const visibleIds = new Set(
          slots.filter((s) => s.word).map((s) => s.word.id),
        );
        const candidates = pool.filter((w) => !visibleIds.has(w.id));
        const emptyIndex = slots.findIndex((s) => !s.word);
        if (emptyIndex !== -1 && candidates.length > 0) {
          const newWord =
            candidates[Math.floor(Math.random() * candidates.length)];
          setSlots((prev) =>
            prev.map((s, i) => (i === emptyIndex ? { word: newWord } : s)),
          );
          setPoppedIndex(emptyIndex);
          setTimeout(() => setPoppedIndex(-1), 350);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slots, phase, targetId, pool, say, infinite, recordWord, learn],
  );

  const clearTileInfinite = useCallback(
    (index) => {
      setScore((s) => s + 1);

      const keptIds = new Set(
        slots.filter((s, i) => s.word && i !== index).map((s) => s.word.id),
      );
      const refills = shuffle(pool.filter((w) => !keptIds.has(w.id)));

      let r = 0;
      const next = slots.map((s, i) => {
        if (i === index) return { word: null }; // just cleared → stays empty
        if (!s.word) {
          const w = refills[r++]; // older empty slot → a picture reappears
          return w ? { word: w } : { word: null };
        }
        return s;
      });
      setSlots(next);

      const remaining = next.filter((s) => s.word);
      if (remaining.length === 0) {
        setPhase("won");
        return;
      }
      const nextTarget =
        remaining[Math.floor(Math.random() * remaining.length)].word;
      setTargetId(nextTarget.id);
      say(nextTarget);
    },
    [slots, pool, say],
  );

  return {
    loading,
    phase,
    infinite,
    prompt,
    slots,
    targetWord,
    mistakes,
    score,
    shakeIndex,
    poppedIndex,
    remaining: slots.filter((s) => s.word).length,
    canPlay: pool.length >= 2,
    start,
    repeat,
    clickSlot,
  };
}
