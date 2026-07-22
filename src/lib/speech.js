export function speak(text, speechCode = "en-GB") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // stop anything currently playing
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechCode;

  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) =>
    v.lang?.toLowerCase().startsWith(speechCode.slice(0, 2).toLowerCase()),
  );
  if (match) utterance.voice = match;

  utterance.rate = 0.9; // a touch slower, easier for kids to follow
  window.speechSynthesis.speak(utterance);
}
