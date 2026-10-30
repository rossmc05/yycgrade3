import type { Game } from '../game';

const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;
export const inningName = (g: Game) => `${g.half === 'top' ? 'Top' : 'Bottom'} of the ${ord(g.inning)}`;

/** Line score, inning, outs and bases. */
export function Scoreboard({ g, you, them }: { g: Game; you: string; them: string }) {
  const cols = Math.max(g.innings, g.line.them.length, g.line.you.length);
  const cell = (side: 'you' | 'them', i: number) => {
    const v = g.line[side][i];
    return v === undefined ? (side === 'you' && g.over && i === g.inning - 1 && g.result && !g.walkoff ? 'X' : '') : v;
  };
  return (
    <section className="scoreboard" aria-label={`${them} ${g.them}, ${you} ${g.you}. ${inningName(g)}, ${g.outs} out`}>
      <table>
        <thead>
          <tr>
            <th />
            {Array.from({ length: cols }, (_, i) => <th key={i} className={i === g.inning - 1 && !g.over ? 'now' : ''}>{i + 1}</th>)}
            <th className="r">R</th>
          </tr>
        </thead>
        <tbody>
          <tr className={g.half === 'top' && !g.over ? 'up' : ''}>
            <td className="team">{them}</td>
            {Array.from({ length: cols }, (_, i) => <td key={i}>{cell('them', i)}</td>)}
            <td className="r">{g.them}</td>
          </tr>
          <tr className={g.half === 'bottom' && !g.over ? 'up' : ''}>
            <td className="team">{you}</td>
            {Array.from({ length: cols }, (_, i) => <td key={i}>{cell('you', i)}</td>)}
            <td className="r">{g.you}</td>
          </tr>
        </tbody>
      </table>
      {!g.over && (
        <div className="sb-state">
          <span className="sb-inning">{g.half === 'top' ? '▲' : '▼'} {g.inning}</span>
          <span className="sb-outs" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={i < g.outs ? 'on' : ''} />)}</span>
          <span className="sb-label">{g.outs} out</span>
          <span className="mini-diamond" aria-hidden="true">{[1, 0, 2].map((b) => <i key={b} className={`b${b} ${g.bases[b] ? 'on' : ''}`} />)}</span>
        </div>
      )}
    </section>
  );
}
