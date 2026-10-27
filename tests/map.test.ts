import { describe, expect, it } from 'vitest';
import { newSkillState } from '../src/engine/adaptive';
import { newProfile } from '../src/engine/storage';
import { guideLine, isOpen, neighbour, placeOf, PLACES, quests, recommended, route } from '../src/map/world';
import { MATH_SKILLS } from '../src/subjects/math/skills';

const T0 = new Date(2026, 9, 1, 16).getTime();

describe('world map', () => {
  it('opens math and spelling first, then the rest as he answers', () => {
    const p = newProfile('Test', '🦊');
    expect(PLACES.filter((x) => isOpen(x, p)).map((x) => x.id)).toEqual(['village', 'math', 'spelling']);
    p.totalCorrect = 30;
    expect(isOpen(placeOf('science')!, p)).toBe(true);
    expect(isOpen(placeOf('typing')!, p)).toBe(false);
  });

  it('routes through the village', () => {
    expect(route('math', 'science')).toEqual(['math', 'village', 'science']);
    expect(route('village', 'math')).toEqual(['village', 'math']);
  });

  it('finds the place in an arrow direction', () => {
    expect(neighbour('village', -1, -1)).toBe('math');
    expect(neighbour('village', 1, 0.2)).toBe('science');
    expect(neighbour('village', 0, 1)).toBe('grammar');
  });

  it('opens three quests, then one more for each skill that levels up', () => {
    const p = newProfile('Test', '🦊');
    let list = quests(MATH_SKILLS, p, T0);
    expect(list.filter((q) => q.state !== 'locked')).toHaveLength(3);
    expect(recommended(list)?.skill.id).toBe(MATH_SKILLS[0].id);
    p.skills[MATH_SKILLS[0].id] = { ...newSkillState(), level: 1, history: [{ t: T0, correct: true, level: 0, key: 'k' }] };
    list = quests(MATH_SKILLS, p, T0);
    expect(list.filter((q) => q.state !== 'locked')).toHaveLength(4);
    expect(list[0].stars).toBe(1);
    expect(recommended(list)?.skill.id).toBe(MATH_SKILLS[0].id);
    expect(guideLine(placeOf('math')!, list)).toContain(MATH_SKILLS[0].name);
  });
});
