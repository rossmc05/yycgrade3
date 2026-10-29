// Bronze, silver and gold goals for the arcade games.

export type Medal = 'gold' | 'silver' | 'bronze' | null;
export const MEDAL_ICON = { gold: '🥇', silver: '🥈', bronze: '🥉' } as const;

export function medalFor(score: number, medals: [number, number, number]): Medal {
  return score >= medals[2] ? 'gold' : score >= medals[1] ? 'silver' : score >= medals[0] ? 'bronze' : null;
}

/** The next medal to aim for, or null when gold is won. */
export function nextGoal(score: number, medals: [number, number, number]): { medal: Exclude<Medal, null>; score: number } | null {
  if (score < medals[0]) return { medal: 'bronze', score: medals[0] };
  if (score < medals[1]) return { medal: 'silver', score: medals[1] };
  if (score < medals[2]) return { medal: 'gold', score: medals[2] };
  return null;
}
