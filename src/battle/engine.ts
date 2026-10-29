// Battle mode: each session is a fight against a few monsters. Damage is paced so the
// last monster falls on the last question when he keeps answering, and a miss never
// ends the game: a monster only heals a little, or runs away at the end of its turn.

import type { Perks } from '../collect/gear';

export type Outcome = 'first' | 'block' | 'miss';
export type HitKind = 'hit' | 'crit' | 'special' | 'block' | 'miss' | 'flee';

export interface Foe {
  /** Index into the zone's monster list; the last one is the boss. */
  kind: number;
  name: string;
  maxHp: number;
  hp: number;
  boss: boolean;
  /** 'fled' when it ran off with health left. */
  end?: 'defeated' | 'fled';
}

export interface Battle {
  foes: Foe[];
  current: number;
  /** First-try answers in a row; three triggers a special move. */
  combo: number;
  coins: number;
  crits: number;
  specials: number;
  /** Story bosses: right answers needed to win (no automatic last-question finish). */
  hitsToWin?: number;
}

export interface TurnEvent {
  kind: HitKind;
  damage: number;
  heal: number;
  /** The current foe is finished (defeated or fled) after this turn. */
  finished: boolean;
  coins: number;
}

/** A first-try answer faster than this counts as a critical hit. */
export const CRIT_SECONDS = 8;
export const COMBO_FOR_SPECIAL = 3;

/** Plan a fight for a session of `questions` questions: 3 foes (fewer for short sessions), the last a boss. */
export function startBattle(questions: number, names: string[], rng: () => number, boss?: { hitsToWin: number }): Battle {
  const count = boss ? 1 : Math.max(1, Math.min(3, Math.floor(questions / 3)));
  const regular = names.slice(0, -1);
  const picks: number[] = [];
  for (let i = 0; i < count - 1; i++) {
    let k = Math.floor(rng() * regular.length);
    if (picks.includes(k) && regular.length > 1) k = (k + 1) % regular.length;
    picks.push(k);
  }
  picks.push(names.length - 1);
  const per = questions / count;
  const foes = picks.map((kind, i) => {
    const boss = i === count - 1;
    const maxHp = Math.round(per * (boss ? 14 : 10));
    return { kind, name: names[kind], maxHp, hp: maxHp, boss };
  });
  return { foes, current: 0, combo: 0, coins: 0, crits: 0, specials: 0, ...boss };
}

/** Questions this foe should take, out of those left in the session (including this one). */
function share(b: Battle, questionsLeft: number): number {
  const foesLeft = b.foes.length - b.current;
  return Math.max(1, Math.round(questionsLeft / foesLeft));
}

export function applyTurn(b: Battle, outcome: Outcome, seconds: number, questionsLeft: number, perks: Perks = {}): { battle: Battle; event: TurnEvent } {
  const boost = perks.damage ?? 1;
  const foes = b.foes.map((f) => ({ ...f }));
  const foe = foes[b.current];
  const turns = share(b, questionsLeft);
  const last = turns === 1;
  const base = b.hitsToWin ? Math.ceil(foe.maxHp / b.hitsToWin) : Math.ceil(foe.hp / turns);
  let kind: HitKind;
  let damage = 0;
  let heal = 0;
  let combo = b.combo;
  let crits = b.crits;
  let specials = b.specials;

  if (outcome === 'first') {
    combo += 1;
    if (combo >= COMBO_FOR_SPECIAL) {
      kind = 'special';
      damage = Math.ceil(base * 2 * boost);
      combo = 0;
      specials += 1;
    } else if (seconds < (perks.critSeconds ?? CRIT_SECONDS)) {
      kind = 'crit';
      damage = Math.ceil(base * 1.5 * boost);
      crits += 1;
    } else {
      kind = 'hit';
      damage = Math.ceil(base * boost);
    }
  } else if (outcome === 'block') {
    combo = 0;
    kind = 'block';
    damage = last && !b.hitsToWin ? foe.hp : Math.max(1, Math.ceil(base * 0.6));
  } else {
    combo = 0;
    kind = last ? 'flee' : 'miss';
    heal = last || perks.noHeal ? 0 : Math.min(foe.maxHp - foe.hp, Math.ceil(foe.maxHp * 0.08));
  }

  // The boss must last until the final question, so the session never runs out of monster.
  // (Story bosses are different: beat them early and the battle ends early.)
  if (b.current === foes.length - 1 && !last && !b.hitsToWin) damage = Math.min(damage, foe.hp - (turns - 1));
  foe.hp = Math.max(0, Math.min(foe.maxHp, foe.hp - damage + heal));
  let finished = false;
  let coins = 0;
  if (foe.hp === 0) {
    foe.end = 'defeated';
    finished = true;
    coins = (foe.boss ? 15 : 8) + (perks.coins ?? 0);
  } else if (kind === 'flee' || (last && b.hitsToWin)) {
    foe.end = 'fled';
    finished = true;
    coins = 2;
  }
  const current = finished ? Math.min(b.current + 1, foes.length - 1) : b.current;
  return {
    battle: { ...b, foes, current: finished && b.current === foes.length - 1 ? b.current : current, combo, coins: b.coins + coins, crits, specials },
    event: { kind, damage, heal, finished, coins },
  };
}

export function battleOver(b: Battle): boolean {
  return b.foes.every((f) => f.end);
}
