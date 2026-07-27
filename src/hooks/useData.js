import { useEffect, useState } from "react";
import { dataProvider } from "@/services/dataProvider";

let articlesEnabled = false; // gated by the "articles" setting (see SettingsContext)

export function setArticlesEnabled(on) {
  articlesEnabled = on;
}

function withArticle(tr, base, articleGame = false) {
  return articlesEnabled && tr?.article && !articleGame
    ? `${tr.article} ${base}`
    : base;
}

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

function japaneseView(word, langCode) {
  const ja = word.translations.ja;
  if (!ja) return null;
  if (langCode === "ja") {
    if (!ja.text) return null;
    return { text: ja.text, speech: ja.text, romaji: ja.romaji };
  }
  if (!ja.romaji) return null;
  return { text: ja.romaji, speech: ja.text ?? ja.romaji };
}

export function getTranslation(word, langCode) {
  if (langCode === "ja" || langCode === "ja-romaji") {
    return japaneseView(word, langCode);
  }
  return word.translations[langCode] ?? null;
}

export function getText(word, langCode, articleGame = false) {
  const tr = getTranslation(word, langCode);
  if (!tr) return "?";
  return withArticle(tr, tr.text, articleGame);
}

export function getSpeech(word, langCode) {
  const tr = getTranslation(word, langCode);
  if (!tr) return "";
  return withArticle(tr, tr.speech ?? tr.text ?? "");
}

export function typingTarget(word, langCode) {
  const tr = getTranslation(word, langCode);
  return withArticle(tr, tr?.romaji ?? tr?.text ?? "");
}

export function acceptedAnswers(word, langCode) {
  const tr = getTranslation(word, langCode);
  if (!tr) return [];
  const forms = [tr.text, tr.romaji].filter(Boolean); // e.g. accept 猫 or neko
  return forms.map((f) => withArticle(tr, f));
}

export function hasCategory(word, categoryId) {
  if (categoryId === "all") return true;
  return (word.categories ?? []).includes(categoryId); // membership is global (a flat list)
}

export function hasEmoji(word) {
  return Boolean(word.emoji); // words may exist without a picture
}

function matchesPictures(word, pictures) {
  if (pictures === "emoji") return hasEmoji(word); // only words that have a picture
  if (pictures === "text") return !hasEmoji(word); // only words without a picture
  return true; // "both"
}

export const ARTICLE_LANG = "fr"; // the article game always asks for French articles

const GAME_RULES = {
  article: (w) => Boolean(getTranslation(w, ARTICLE_LANG)?.article), // no article → nothing to guess
};

export function matchesGame(word, game) {
  const rule = GAME_RULES[game];
  return rule ? rule(word) : true; // games without a rule take every word
}

export function wordsFor(
  words,
  known,
  learn,
  categoryId = "all",
  pictures = "both",
  game = "",
) {
  return words.filter(
    (w) =>
      getTranslation(w, known) &&
      getTranslation(w, learn) &&
      hasCategory(w, categoryId) &&
      matchesPictures(w, pictures) &&
      matchesGame(w, game),
  );
}
