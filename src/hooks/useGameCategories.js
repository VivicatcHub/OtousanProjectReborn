import { useEffect, useMemo, useState } from "react";
import { useData, wordsFor } from "@/hooks/useData";
import { useSettings } from "@/context/SettingsContext";
import { dataProvider } from "@/services/dataProvider";

const MIN_WORDS = { quiz: 4, imagier: 4, memory: 3, writing: 1, article: 1 };

export function useGameCategories(game, { pictures = "both", min } = {}) {
  const { words, loading } = useData();
  const { known, learn } = useSettings();
  const [all, setAll] = useState([]);

  useEffect(() => {
    dataProvider.getCategories(learn).then(setAll);
  }, [learn]);

  const minWords = min ?? MIN_WORDS[game] ?? 1;

  const categories = useMemo(
    () =>
      all.filter(
        (c) =>
          wordsFor(words, known, learn, c.id, pictures, game).length >=
          minWords,
      ),
    [all, words, known, learn, pictures, game, minWords],
  );

  const allCount = useMemo(
    () => wordsFor(words, known, learn, "all", pictures, game).length,
    [words, known, learn, pictures, game],
  );

  return {
    categories, // only the categories that can actually be played
    allCount, // words available when no category is selected
    canPlay: allCount >= minWords,
    ready: !loading && all.length > 0, // categories + words are loaded
  };
}
