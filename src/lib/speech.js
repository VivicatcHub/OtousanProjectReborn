export function speak(text, speechCode = "en-GB") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechCode;

  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) =>
    v.lang?.toLowerCase().startsWith(speechCode.slice(0, 2).toLowerCase()),
  );
  if (match) utterance.voice = match;

  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
