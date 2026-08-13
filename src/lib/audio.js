import { speak } from "@/lib/speech";
import { getSpeech } from "@/hooks/useData";

let voiceEnabled = true;

export function setVoiceEnabled(on) {
  voiceEnabled = on;
}

export async function playWord(word, langCode, speechCode) {
  if (!voiceEnabled) return;
  if (!word) return;
  const text = getSpeech(word, langCode);
  if (!text) return;
  speak(text, speechCode);
}
