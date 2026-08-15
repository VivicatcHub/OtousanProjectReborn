import { useCallback, useEffect, useMemo, useState } from "react";
import { useData, wordsFor } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { shuffle } from "@/lib/utils";
import { playWord } from "@/lib/audio";

const DEFAULT_COUNT = 10;

export function useFlashcards({
  count = DEFAULT_COUNT,
  front = "known",
  category = "all",
  pictures = "both",
  autoVoice = true,
} = {}) {
  const { words, languages, loading } = useData();
  const { known, learn, voice } = useSettings();

  const pool = useMemo(
    () => wordsFor(words, known, learn, category, pictures),
    [words, known, learn, category, pictures],
  );

  const [deck, setDeck] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);

  const speak = useCallback(
    (word, langCode) => {
      if (!voice || !word) return;
      const lang = languages.find((l) => l.code === langCode);
      playWord(word, langCode, lang?.speechCode);
    },
    [voice, languages],
  );

  const build = useCallback(() => {
    const size = count > 0 ? Math.min(count, pool.length) : pool.length;
    const picked = shuffle(pool).slice(0, size);

    setDeck(
      picked.map((word) => {
        const frontLang =
          front === "random"
            ? Math.random() < 0.5
              ? known
              : learn
            : front === "learn"
              ? learn
              : known; // known side first by default
        return {
          word,
          frontLang,
          backLang: frontLang === known ? learn : known,
        };
      }),
    );
    setIndex(0);
    setFlipped(false);
    setDone(false);
  }, [pool, count, front, known, learn]);

  useEffect(() => {
    if (!loading) build();
  }, [loading, build]);

  const card = deck[index] ?? null;

  const flip = useCallback(() => {
    if (!card) return;
    if (!flipped && autoVoice) speak(card.word, card.backLang); // reveal reads the hidden side
    setFlipped(!flipped);
  }, [card, flipped, autoVoice, speak]);

  const next = useCallback(() => {
    if (!deck.length) return;
    setFlipped(false);
    if (index + 1 >= deck.length) setDone(true);
    else setIndex(index + 1);
  }, [deck.length, index]);

  const previous = useCallback(() => {
    if (index === 0) return;
    setFlipped(false);
    setIndex(index - 1);
  }, [index]);

  return {
    loading,
    card,
    index,
    total: deck.length,
    flipped,
    done,
    canPlay: pool.length >= 1,
    flip,
    next,
    previous,
    speak,
    restart: build,
  };
}
