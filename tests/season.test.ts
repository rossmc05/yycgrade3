import { describe, expect, it } from 'vitest';
import { seeded } from '../src/engine/random';
import { newBall, payout } from '../src/ballpark/data';
import { newSeason, nextOpponent, played, recordSeasonGame, SEASON_GAMES, standings, winChance, type Season } from '../src/ballpark/season';
import { OPPONENTS } from '../src/ballpark/teams';

const playSeason = (win: boolean, rng = seeded(5)) => {
  let s: Season = newSeason(1);
  for (let i = 0; i < SEASON_GAMES; i++) s = recordSeasonGame(s, win ? 5 : 1, win ? 1 : 5, rng);
  return s;
};

describe('season mode', () => {
  it('plays 10 games, keeps the standings, and seeds the playoffs', () => {
    const s = playSeason(true);
    expect(played(s)).toBe(SEASON_GAMES);
    expect(s.you).toEqual({ w: 10, l: 0, t: 0 });
    expect(s.stage).toBe('semi');
    expect(s.seed).toBe(1);
    const table = standings(s, 'Sam');
    expect(table[0].you).toBe(true);
    // 1st plays 4th.
    expect(s.opp).toBe(table[3].index);
    // Every other team played a game each round.
    for (const r of s.others) expect(r.w + r.l + r.t).toBe(SEASON_GAMES);
  });

  it('misses the playoffs after a losing season', () => {
    const s = playSeason(false);
    expect(s.stage).toBe('out');
    expect(s.seed).toBeGreaterThan(4);
    expect(nextOpponent(s)).toBeUndefined();
  });

  it('wins the title by winning the semifinal and the final, and replays a tied playoff game', () => {
    let s = playSeason(true);
    s = recordSeasonGame(s, 3, 3, seeded(1));
    expect(s.stage).toBe('semi');
    s = recordSeasonGame(s, 4, 2, seeded(1));
    expect(s.stage).toBe('final');
    expect(OPPONENTS[s.opp!]).toBeDefined();
    s = recordSeasonGame(s, 6, 0, seeded(1));
    expect(s.stage).toBe('champion');
    expect(recordSeasonGame(s, 1, 0, seeded(1))).toBe(s);
  });

  it('knocks you out with a playoff loss', () => {
    expect(recordSeasonGame(playSeason(true), 0, 2, seeded(1)).stage).toBe('out');
  });

  it('gives stronger teams a better chance, within limits', () => {
    expect(winChance(86, 71)).toBeGreaterThan(0.5);
    expect(winChance(99, 40)).toBe(0.85);
    expect(winChance(40, 99)).toBe(0.15);
  });

  it('unlocks the Championship Ring once', () => {
    const first = payout(newBall(), 0, 0, null, 0, seeded(2), 1, 1, { champion: true });
    expect(first.payout.pulls.map((p) => p.player.id)).toContain('ring');
    const again = payout(first.ball, 0, 0, null, 0, seeded(2), 1, 1, { champion: true });
    expect(again.payout.pulls.map((p) => p.player.id)).not.toContain('ring');
  });
});
