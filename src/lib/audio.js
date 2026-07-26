import { speak } from "@/lib/speech";
import { getSpeech } from "@/hooks/useData";

let voiceEnabled = true; // gated by the "robot voice" setting (see SettingsContext)

export function setVoiceEnabled(on) {
  voiceEnabled = on;
}

export async function playWord(word, langCode, speechCode) {
  if (!voiceEnabled) return; // robot voice turned off in Settings
  if (!word) return;
  const text = getSpeech(word, langCode); // resolves ja views + article when on
  if (!text) return;
  speak(text, speechCode);
}
