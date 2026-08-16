import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { syncUiLanguage } from "@/i18n";
import { setVoiceEnabled } from "@/lib/audio";
import { setArticlesEnabled, setHiddenCategories } from "@/hooks/useData";

const STORAGE_KEY = "otousan.settings";
const DEFAULTS = {
  known: "fr",
  learn: "ja",
  configured: false,
  sound: true,
  voice: true,
  articles: false,
  hiddenCategories: [], // category ids hidden from the games (never from the dictionary)
};

const SettingsContext = createContext(null);

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const s = { ...DEFAULTS, ...saved };
    if (s.known === "ja-kana") s.known = "ja";
    if (s.learn === "ja-kana") s.learn = "ja";
    if (!Array.isArray(s.hiddenCategories)) s.hiddenCategories = [];
    return s;
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  setArticlesEnabled(settings.articles);
  setHiddenCategories(settings.hiddenCategories);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    syncUiLanguage(settings.known);
  }, [settings.known]);

  useEffect(() => {
    setVoiceEnabled(settings.voice);
  }, [settings.voice]);

  const value = useMemo(
    () => ({
      known: settings.known,
      learn: settings.learn,
      configured: settings.configured,
      sound: settings.sound,
      voice: settings.voice,
      articles: settings.articles,
      hiddenCategories: settings.hiddenCategories,
      setKnown: (code) => setSettings((s) => ({ ...s, known: code })),
      setLearn: (code) => setSettings((s) => ({ ...s, learn: code })),
      setSound: (on) => setSettings((s) => ({ ...s, sound: on })),
      setVoice: (on) => setSettings((s) => ({ ...s, voice: on })),
      setArticles: (on) => setSettings((s) => ({ ...s, articles: on })),
      toggleCategory: (id) =>
        setSettings((s) => ({
          ...s,
          hiddenCategories: s.hiddenCategories.includes(id)
            ? s.hiddenCategories.filter((c) => c !== id)
            : [...s.hiddenCategories, id],
        })),
      confirmSettings: () => setSettings((s) => ({ ...s, configured: true })),
    }),
    [settings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
