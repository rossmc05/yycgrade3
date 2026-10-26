/** Read text aloud with the browser's built-in voice. */
export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(
    text
      .replace(/×/g, ' times ')
      .replace(/÷/g, ' divided by ')
      .replace(/ - /g, ' minus ')
      .replace(/¢/g, ' cents')
      .replace(/▢/g, ' blank ')
      .replace(/(\d) (\d{3})/g, '$1$2'),
  );
  u.lang = 'en-CA';
  u.rate = 0.95;
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang === 'en-CA') ??
    window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'));
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}
