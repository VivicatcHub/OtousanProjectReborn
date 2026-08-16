import { useEffect, useState } from "react";
import { dataProvider } from "@/services/dataProvider";
import { emojiSupported } from "@/lib/emoji";

let articlesEnabled = false;

export function setArticlesEnabled(on) {
  articlesEnabled = on;
}

let hiddenCategories = new Set();

export function setHiddenCategories(ids) {
  hiddenCategories = new Set(ids ?? []);
}

export function isHidden(word) {
  if (hiddenCategories.size === 0) return false;
  return (word.categories ?? []).some((c) => hiddenCategories.has(c));
}

export function articlesOf(tr) {
  if (!tr?.article) return [];
  return Array.isArray(tr.article) ? tr.article.filter(Boolean) : [tr.article];
}

export function wordArticles(word, langCode) {
  return articlesOf(getTranslation(word, langCode));
}

function withArticle(tr, base, articleGame = false) {
  const [article] = articlesOf(tr);
  return articlesEnabled && article && !articleGame
    ? `${article} ${base}`
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
    let active = true;
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
    return { text: ja.text, speech: ja.text, romaji: ja.romaji, kana: ja.kana };
  }
  if (!ja.romaji) return null;
  return { text: ja.romaji, speech: ja.text ?? ja.romaji, kana: ja.kana };
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
  const forms = [tr.text, tr.romaji].filter(Boolean);
  const articles = articlesEnabled ? articlesOf(tr) : [];
  if (articles.length === 0) return forms;
  return forms.flatMap((f) => articles.map((a) => `${a} ${f}`));
}

export function hasCategory(word, categoryId) {
  if (categoryId === "all") return true;
  return (word.categories ?? []).includes(categoryId);
}

export function displayEmoji(word) {
  const emoji = word?.emoji;
  return emoji && emojiSupported(emoji) ? emoji : null;
}

export function hasEmoji(word) {
  return Boolean(displayEmoji(word));
}

function matchesPictures(word, pictures) {
  if (pictures === "emoji") return hasEmoji(word);
  if (pictures === "text") return !hasEmoji(word);
  return true;
}

export const ARTICLE_LANG = "fr";

const GAME_RULES = {
  article: (w) => wordArticles(w, ARTICLE_LANG).length > 0,
};

export function matchesGame(word, game) {
  const rule = GAME_RULES[game];
  return rule ? rule(word) : true;
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
      !isHidden(w) && // categories switched off in the settings (dictionary keeps them)
      hasCategory(w, categoryId) &&
      matchesPictures(w, pictures) &&
      matchesGame(w, game),
  );
}
