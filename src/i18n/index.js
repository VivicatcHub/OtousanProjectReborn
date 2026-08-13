import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";

const resources = {
  fr: { translation: fr },
  en: { translation: en },
  ja: { translation: ja },
};

export function uiLanguage(code) {
  if (code?.startsWith("ja")) return "ja";
  if (code === "en") return "en";
  return "fr";
}

i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export function syncUiLanguage(knownCode) {
  const lng = uiLanguage(knownCode);
  if (i18n.language !== lng) i18n.changeLanguage(lng);
}

export default i18n;
