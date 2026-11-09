import { describe, expect, it } from 'vitest';
import { newBall, type BallData } from '../src/ballpark/data';
import { bat, newGame, pitch } from '../src/ballpark/game';
import { playerById } from '../src/ballpark/players';
import { bestCard, bestSquad, boostOf, cardOvr, roster, squadOf, teamOvr } from '../src/ballpark/squad';

const withCards = (...keys: string[]): BallData => ({ ...newBall(), cards: Object.fromEntries(keys.map((k) => [k, { count: 1, at: 1 }])) });

describe('your team', () => {
  it('rates better versions higher, and boosts grow with the rating', () => {
    const judge = playerById('judge')!;
    expect(cardOvr(judge, 'auto')).toBeGreaterThan(cardOvr(judge, 'base'));
    expect(boostOf(60)).toBe(0.02);
    expect(boostOf(99)).toBe(0.16);
    expect(boostOf(85)).toBeGreaterThan(boostOf(75));
  });

  it('always plays your best version of a player', () => {
    const b = withCards('judge:base', 'judge:diamond', 'skenes:rare');
    expect(bestCard(b, 'judge')?.parallel).toBe('diamond');
    expect(bestCard(b, 'soto')).toBeUndefined();
  });

  it('picks the best hitters and ace, and keeps a saved lineup in order', () => {
    const b = withCards('judge:base', 'soto:auto', 'witt:base', 'skenes:base', 'cole:auto', 'ohtani-rc:milestone');
    const auto = bestSquad(b);
    expect(auto.lineup).toHaveLength(3);
    expect(auto.lineup).not.toContain('ohtani-rc');
    expect(roster(b, 'pitcher').map((c) => c.player.id)).toContain(auto.ace);
    const saved = squadOf({ ...b, squad: { lineup: ['witt', 'judge', 'skenes', 'soto'], ace: 'judge' } });
    expect(saved.lineup.map((c) => c.player.id)).toEqual(['witt', 'judge', 'soto']);
    expect(saved.ace).toBeUndefined();
    expect(teamOvr(withCards())).toBe(50);
  });

  it('lets the card at bat stretch a hit, and the ace save a wrong pitch', () => {
    const g = { ...newGame(3), half: 'bottom' as const };
    const r = bat(g, 'contact', true, () => 0, { star: { name: 'Aaron Judge', boost: 0.1 } });
    expect(r.play.kind).toBe('double');
    expect(r.play.text).toContain('Aaron Judge');
    const miss = bat(g, 'contact', false, () => 0, { star: { name: 'Aaron Judge', boost: 1 } });
    expect(miss.play.side).toBe('you');
    expect(miss.game.outs).toBe(1);
    const saved = pitch(newGame(3), 'fastball', false, () => 0, { ace: { name: 'Paul Skenes', boost: 0.1 } });
    expect(saved.play.kind).toBe('strikeout');
    expect(saved.game.outs).toBe(1);
    expect(pitch(newGame(3), 'fastball', false, () => 0.5, { ace: { name: 'Paul Skenes', boost: 0.1 } }).game.outs).toBe(0);
  });
});
