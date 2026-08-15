import { getTranslation, hasCategory } from "@/hooks/useData";

// Shared by the dictionary list and the word page, so both walk the same order.
export function dictionaryWords(words, { known, learn, category, query }) {
  const q = (query ?? "").trim().toLowerCase();
  return words
    .filter((w) => {
      const knownTr = getTranslation(w, known);
      const learnTr = getTranslation(w, learn);
      if (!knownTr || !learnTr) return false;
      if (!hasCategory(w, category)) return false;
      if (!q) return true;
      return [knownTr.text, knownTr.romaji, learnTr.text, learnTr.romaji].some(
        (s) => s && s.toLowerCase().includes(q),
      );
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
