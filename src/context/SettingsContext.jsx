import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { syncUiLanguage } from "@/i18n";
import { setVoiceEnabled } from "@/lib/audio";
import { setArticlesEnabled } from "@/hooks/useData";

const STORAGE_KEY = "otousan.settings";
const DEFAULTS = {
  known: "fr",
  learn: "ja",
  configured: false,
  sound: true,
  voice: true, // robot voice (text-to-speech); off blocks voice-only games
  articles: false, // show/say/type words with their article ("un chat")
};

const SettingsContext = createContext(null);

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const s = { ...DEFAULTS, ...saved };
    if (s.known === "ja-kana") s.known = "ja";
    if (s.learn === "ja-kana") s.learn = "ja";
    return s;
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  setArticlesEnabled(settings.articles);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    syncUiLanguage(settings.known);
  }, [settings.known]);

  useEffect(() => {
    setVoiceEnabled(settings.voice); // keep the audio module in sync with the setting
  }, [settings.voice]);

  const value = useMemo(
    () => ({
      known: settings.known,
      learn: settings.learn,
      configured: settings.configured,
      sound: settings.sound,
      voice: settings.voice,
      articles: settings.articles,
      setKnown: (code) => setSettings((s) => ({ ...s, known: code })),
      setLearn: (code) => setSettings((s) => ({ ...s, learn: code })),
      setSound: (on) => setSettings((s) => ({ ...s, sound: on })),
      setVoice: (on) => setSettings((s) => ({ ...s, voice: on })),
      setArticles: (on) => setSettings((s) => ({ ...s, articles: on })),
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
