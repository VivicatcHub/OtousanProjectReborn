import { speak } from "@/lib/speech";

export async function playWord(word, langCode, speechCode) {
  if (!word) return;
  const tr = word.translations?.[langCode];
  const text = tr?.speech ?? tr?.text ?? "";
  if (!text) return;
  speak(text, speechCode);
}
