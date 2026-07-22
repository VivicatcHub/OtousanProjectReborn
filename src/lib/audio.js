import { speak } from "@/lib/speech";

let voiceEnabled = true; // gated by the "robot voice" setting (see SettingsContext)

export function setVoiceEnabled(on) {
  voiceEnabled = on;
}

export async function playWord(word, langCode, speechCode) {
  if (!voiceEnabled) return; // robot voice turned off in Settings
  if (!word) return;
  const tr = word.translations?.[langCode];
  const text = tr?.speech ?? tr?.text ?? "";
  if (!text) return;
  speak(text, speechCode);
}
