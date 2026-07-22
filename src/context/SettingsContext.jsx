import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { syncUiLanguage } from "@/i18n";

const STORAGE_KEY = "otousan.settings";
const DEFAULTS = { known: "fr", learn: "ja", configured: false, sound: true };

const SettingsContext = createContext(null);

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...DEFAULTS, ...saved };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    syncUiLanguage(settings.known);
  }, [settings.known]);

  const value = useMemo(
    () => ({
      known: settings.known,
      learn: settings.learn,
      configured: settings.configured,
      sound: settings.sound,
      setKnown: (code) => setSettings((s) => ({ ...s, known: code })),
      setLearn: (code) => setSettings((s) => ({ ...s, learn: code })),
      setSound: (on) => setSettings((s) => ({ ...s, sound: on })),
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
