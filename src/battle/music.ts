// Background music, composed here and played with Web Audio: a short loop for the map and each zone.

import { useEffect } from 'react';
import { useStore } from '../engine/store';
import { ac } from './sfx';

export type Theme = 'map' | 'math' | 'spelling' | 'grammar' | 'science' | 'boss' | 'ballpark';

interface Song {
  bpm: number;
  lead: OscillatorType;
  /** Eighth notes as MIDI numbers (0 is a rest), 4 bars. */
  melody: number[];
  /** Quarter notes, 4 bars. */
  bass: number[];
}

const SONGS: Record<Theme, Song> = {
  map: {
    bpm: 112, lead: 'triangle',
    melody: [65, 69, 72, 69, 70, 74, 72, 69, 67, 70, 69, 65, 67, 64, 65, 0, 69, 72, 77, 72, 74, 70, 72, 69, 67, 69, 70, 67, 65, 0, 65, 0],
    bass: [41, 41, 46, 46, 48, 48, 41, 41, 41, 41, 46, 46, 48, 48, 41, 41],
  },
  math: {
    bpm: 128, lead: 'square',
    melody: [67, 71, 74, 71, 76, 74, 71, 74, 72, 76, 79, 76, 74, 72, 71, 0, 67, 71, 74, 79, 78, 76, 74, 71, 72, 71, 69, 66, 67, 0, 67, 0],
    bass: [43, 43, 48, 48, 50, 50, 43, 43, 43, 43, 48, 48, 50, 50, 43, 43],
  },
  spelling: {
    bpm: 104, lead: 'triangle',
    melody: [69, 0, 72, 69, 76, 74, 72, 71, 69, 0, 67, 69, 71, 72, 71, 0, 69, 72, 76, 79, 77, 76, 74, 72, 71, 72, 74, 71, 69, 0, 69, 0],
    bass: [45, 45, 41, 41, 43, 43, 40, 40, 45, 45, 41, 41, 43, 43, 45, 45],
  },
  grammar: {
    bpm: 120, lead: 'square',
    melody: [62, 62, 69, 62, 67, 62, 65, 67, 62, 62, 69, 62, 72, 69, 67, 65, 62, 62, 69, 62, 67, 62, 65, 67, 69, 72, 74, 72, 69, 67, 65, 0],
    bass: [38, 38, 38, 38, 36, 36, 36, 36, 38, 38, 38, 38, 41, 41, 43, 43],
  },
  science: {
    bpm: 136, lead: 'square',
    melody: [64, 67, 71, 67, 74, 71, 69, 67, 64, 67, 71, 76, 74, 71, 69, 71, 72, 71, 69, 67, 69, 67, 66, 64, 66, 67, 69, 71, 64, 0, 64, 0],
    bass: [40, 40, 36, 36, 38, 38, 35, 35, 40, 40, 36, 36, 38, 38, 40, 40],
  },
  ballpark: {
    bpm: 132, lead: 'triangle',
    melody: [72, 0, 76, 79, 84, 0, 79, 0, 81, 79, 76, 72, 74, 0, 0, 0, 72, 0, 76, 79, 84, 0, 79, 0, 81, 83, 84, 79, 76, 74, 72, 0],
    bass: [48, 48, 52, 52, 53, 53, 55, 55, 48, 48, 52, 52, 53, 55, 48, 48],
  },
  boss: {
    bpm: 150, lead: 'sawtooth',
    melody: [57, 60, 64, 60, 65, 64, 60, 57, 56, 59, 64, 59, 65, 64, 59, 56, 57, 60, 64, 69, 68, 64, 65, 64, 62, 60, 59, 56, 57, 0, 57, 0],
    bass: [33, 33, 33, 33, 32, 32, 32, 32, 33, 33, 29, 29, 28, 28, 33, 33],
  },
};

const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

let playing: Theme | null = null;
let timer = 0;
let master: GainNode | null = null;
let step = 0;
let nextAt = 0;

function note(a: AudioContext, out: AudioNode, freq: number, at: number, dur: number, type: OscillatorType, vol: number) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(out);
  o.start(at);
  o.stop(at + dur + 0.02);
}

function tick() {
  const a = ac();
  if (!a || !master || !playing) return;
  const song = SONGS[playing];
  const eighth = 60 / song.bpm / 2;
  if (nextAt < a.currentTime) nextAt = a.currentTime + 0.05;
  while (nextAt < a.currentTime + 0.15) {
    const i = step % song.melody.length;
    const m = song.melody[i];
    if (m) note(a, master, hz(m), nextAt, eighth * 0.9, song.lead, song.lead === 'triangle' ? 0.32 : song.lead === 'sawtooth' ? 0.12 : 0.18);
    if (i % 2 === 0) {
      const b = song.bass[(i / 2) % song.bass.length];
      note(a, master, hz(b), nextAt, eighth * 1.8, 'triangle', 0.4);
    }
    step += 1;
    nextAt += eighth;
  }
}

export const music = {
  play(theme: Theme) {
    if (playing === theme) return;
    music.stop();
    const a = ac();
    if (!a) return;
    master = a.createGain();
    master.gain.value = 0.12;
    master.connect(a.destination);
    playing = theme;
    step = 0;
    nextAt = 0;
    timer = window.setInterval(tick, 40);
    tick();
  },
  stop() {
    window.clearInterval(timer);
    if (master) {
      const m = master;
      const a = ac();
      if (a) m.gain.setTargetAtTime(0, a.currentTime, 0.1);
      setTimeout(() => m.disconnect(), 400);
    }
    master = null;
    playing = null;
  },
};

/** Plays a theme while the screen is shown, if music and sound are on. */
export function useMusic(theme: Theme | undefined) {
  const { data } = useStore();
  const on = !!theme && data.settings.music !== false && data.settings.sound !== false;
  useEffect(() => {
    if (!on || !theme) return;
    music.play(theme);
    return () => music.stop();
  }, [on, theme]);
}
