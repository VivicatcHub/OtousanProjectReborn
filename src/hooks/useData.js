import { useEffect, useState } from "react";
import { dataProvider } from "@/services/dataProvider";

export function useData() {
  const [state, setState] = useState({
    words: [],
    languages: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true; // avoid setting state after unmount
    Promise.all([dataProvider.getWords(), dataProvider.getLanguages()])
      .then(([words, languages]) => {
        if (active) setState({ words, languages, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState((s) => ({ ...s, loading: false, error }));
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

export function getTranslation(word, langCode) {
  return word.translations[langCode] ?? null;
}

export function getText(word, langCode) {
  return getTranslation(word, langCode)?.text ?? "?";
}

export function hasCategory(word, langCode, categoryId) {
  if (categoryId === "all") return true;
  return (word.categories[langCode] ?? []).includes(categoryId);
}

export function wordsFor(words, known, learn, categoryId = "all") {
  return words.filter(
    (w) =>
      getTranslation(w, known) &&
      getTranslation(w, learn) &&
      hasCategory(w, learn, categoryId),
  );
}
