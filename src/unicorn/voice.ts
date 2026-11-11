// The meadow's voice. She can't read yet, so everything is spoken: questions, choices,
// praise and help. Uses the browser's built-in voice, like the rest of the studio.

let voice: SpeechSynthesisVoice | undefined;

function pickVoice(): SpeechSynthesisVoice | undefined {
  if (voice) return voice;
  const all = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
  const en = all.filter((v) => v.lang.startsWith('en'));
  // A friendly female voice reads best for young children; prefer Canadian English.
  const pref = [/en-CA/, /Samantha|Karen|Moira|Tessa|Victoria|Google US English|Female|Zira|Aria|Jenny/i, /en-US/, /en-GB/];
  for (const re of pref) {
    const v = en.find((x) => re.test(x.lang) || re.test(x.name));
    if (v) return (voice = v);
  }
  return (voice = en[0]);
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { voice = undefined; pickVoice(); };
}

/** Make text sound right when read aloud. */
export function clean(text: string): string {
  return text.replace(/"/g, '').replace(/❓/g, '').replace(/\s+/g, ' ').trim();
}

/** Speak one or more lines, one after another. Stops anything already speaking. Resolves when done. */
export function say(...lines: string[]): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve();
  const synth = window.speechSynthesis;
  synth.cancel();
  const parts = lines.map(clean).filter(Boolean);
  if (!parts.length) return Promise.resolve();
  return new Promise((resolve) => {
    let left = parts.length;
    // Some browsers never fire onend; don't wait forever.
    const timer = window.setTimeout(resolve, 4000 + parts.join(' ').length * 90);
    for (const text of parts) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-CA';
      u.rate = 0.9;
      u.pitch = 1.1;
      const v = pickVoice();
      if (v) u.voice = v;
      u.onend = u.onerror = () => { if (--left === 0) { window.clearTimeout(timer); resolve(); } };
      synth.speak(u);
    }
  });
}

export function hush(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

/** "hat, dog, or fish" */
export function orList(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')}, or ${words.at(-1)}`;
}

const PRAISE = ['Yay! You got it!', 'Super job!', 'Wonderful!', 'You did it!', 'Magical!', 'Hooray!', 'Great thinking!', 'Sparkly smart!', 'Way to go!', 'Amazing!'];
const TRY = ['Good try! Let’s look again.', 'Ooh, almost! Try again.', 'Nice try! You can do it.', 'Let’s try one more time.'];

export const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];
export const tryAgain = () => TRY[Math.floor(Math.random() * TRY.length)];
