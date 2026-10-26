import { useRef, useState } from 'react';
import { dayKey, status, topLevelAccuracy } from '../engine/adaptive';
import { liveStreak } from '../engine/rewards';
import { parse } from '../engine/storage';
import { useStore } from '../engine/store';
import type { Profile } from '../engine/types';
import { go } from '../router';
import { SUBJECTS, findSkill } from '../subjects';

export function Parent() {
  const { data, setData } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const hasPin = !!data.settings.pin;

  if (!unlocked) {
    const submit = () => {
      if (!hasPin) {
        if (!/^\d{4}$/.test(pin)) return setError('Choose a 4-digit PIN.');
        setData((d) => ({ ...d, settings: { ...d.settings, pin } }));
        setUnlocked(true);
      } else if (pin === data.settings.pin) setUnlocked(true);
      else setError('That PIN is not right.');
      setPin('');
    };
    return (
      <main className="page center">
        <div className="card narrow">
          <h1>Grown-ups</h1>
          <p className="muted">{hasPin ? 'Enter your parent PIN.' : 'Set a 4-digit parent PIN to protect this page.'}</p>
          <input className="pin" type="password" inputMode="numeric" maxLength={4} value={pin} autoFocus
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()} />
          {error && <p className="bad">{error}</p>}
          <div className="row">
            <button className="btn ghost" onClick={() => go('')}>Back</button>
            <button className="btn primary" onClick={submit}>{hasPin ? 'Open' : 'Set PIN'}</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <button className="icon-btn" onClick={() => go('')} aria-label="Back">←</button>
        <h1 className="grow">Parent dashboard</h1>
      </header>
      {data.profiles.length === 0 && <p className="card">No players yet.</p>}
      {data.profiles.map((p) => <ProfileReport key={p.id} p={p} />)}
      <Settings />
    </main>
  );
}

function last7(p: Profile) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const t = Date.now() - i * 86400000;
    const k = dayKey(t);
    out.push({ label: new Date(t).toLocaleDateString('en-CA', { weekday: 'short' }), log: p.days[k] });
  }
  return out;
}

function ProfileReport({ p }: { p: Profile }) {
  const days = last7(p);
  const maxQ = Math.max(10, ...days.map((d) => d.log?.questions ?? 0));
  const weekQ = days.reduce((s, d) => s + (d.log?.questions ?? 0), 0);
  const weekC = days.reduce((s, d) => s + (d.log?.correct ?? 0), 0);
  const weekMin = Math.round(days.reduce((s, d) => s + (d.log?.seconds ?? 0), 0) / 60);
  const trouble = Object.entries(p.skills)
    .flatMap(([id, st]) => st.missed.map((q) => ({ skill: findSkill(id), q })))
    .filter((x) => x.skill)
    .slice(-8)
    .reverse();

  return (
    <section className="card report">
      <h2>{p.avatar} {p.name}</h2>
      <div className="stat-row">
        <div><strong>{weekQ}</strong><span>questions this week</span></div>
        <div><strong>{weekQ ? Math.round((weekC / weekQ) * 100) : 0}%</strong><span>right first try</span></div>
        <div><strong>{weekMin}</strong><span>minutes this week</span></div>
        <div><strong>{liveStreak(p, Date.now())}</strong><span>day streak</span></div>
      </div>

      <h3>Minutes this week by subject</h3>
      <div className="subject-minutes">
        {SUBJECTS.map((s) => {
          const sec = days.reduce((n, d) => n + (d.log?.secondsBySubject?.[s.id] ?? 0), 0);
          const max = Math.max(60, ...SUBJECTS.map((x) => days.reduce((n, d) => n + (d.log?.secondsBySubject?.[x.id] ?? 0), 0)));
          return (
            <div key={s.id} className="minutes-row">
              <span>{s.icon} {s.name}</span>
              <span className="minutes-bar"><span style={{ width: `${(sec / max) * 100}%`, background: s.color }} /></span>
              <strong>{Math.round(sec / 60)} min</strong>
            </div>
          );
        })}
      </div>

      <h3>Last 7 days (questions)</h3>
      <div className="week-chart">
        {days.map((d, i) => (
          <div key={i} className="week-col">
            <span className="week-bar" style={{ height: `${((d.log?.questions ?? 0) / maxQ) * 100}%` }} title={`${d.log?.questions ?? 0} questions`} />
            <span className="small">{d.label}</span>
            <span className="small muted">{d.log?.questions ?? 0}</span>
          </div>
        ))}
      </div>

      {SUBJECTS.filter((s) => s.ready && s.skills.length).map((subject) => (
        <div key={subject.id}>
          <h3>{subject.icon} {subject.name}: curriculum progress</h3>
          <table className="skills-table">
            <thead>
              <tr><th>Skill</th><th>Alberta outcome</th><th>Level</th><th>Accuracy (recent)</th><th>Status</th></tr>
            </thead>
            <tbody>
              {subject.skills.map((s) => {
                const st = p.skills[s.id];
                const recent = st?.history.slice(-20) ?? [];
                const acc = recent.length ? Math.round((recent.filter((a) => a.correct).length / recent.length) * 100) : null;
                const top = st ? topLevelAccuracy(s, st) : null;
                return (
                  <tr key={s.id}>
                    <td>{s.icon} {s.name}</td>
                    <td className="small">{s.strand}<br /><span className="muted">{s.outcome}</span></td>
                    <td>{st ? `${st.level + 1}/${s.levels.length}: ${s.levels[st.level]}` : 'Not started'}</td>
                    <td>{acc === null ? '–' : `${acc}% of ${recent.length}`}{top && top.count > 0 && !st?.masteredAt ? <span className="muted small"><br />top level {top.count}/20 answers, {top.days} day(s)</span> : null}</td>
                    <td><span className={`chip ${status(st)}`}>{status(st)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      <SpellingList p={p} />

      <h3>Recent trouble spots</h3>
      {trouble.length === 0 ? (
        <p className="muted">Nothing missed recently.</p>
      ) : (
        <ul className="trouble">
          {trouble.map((t, i) => (
            <li key={i}><span className="chip">{t.skill!.name}</span> {t.q.prompt} <span className="muted">(answer: {t.q.answer})</span></li>
          ))}
        </ul>
      )}
      <p className="muted small">Mastered means at least 90% right over 20 answers at the top level, on two or more days. Mastered skills come back for review after 1, 3, 7, 21 and 60 days.</p>
    </section>
  );
}

function Settings() {
  const { data, setData } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const set = (patch: Partial<typeof data.settings>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `grade3-studio-backup-${dayKey(Date.now())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (f: File) => {
    try {
      const next = parse(await f.text());
      setData(() => next);
      setMsg('Backup restored.');
    } catch {
      setMsg('That file is not a Grade 3 Studio backup.');
    }
  };

  return (
    <section className="card">
      <h2>Settings</h2>
      <label className="field inline">
        <span>Daily goal (questions)</span>
        <select value={data.settings.dailyGoal} onChange={(e) => set({ dailyGoal: Number(e.target.value) })}>
          {[10, 20, 30, 40, 50].map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <label className="field inline">
        <span>Questions per session</span>
        <select value={data.settings.sessionLength} onChange={(e) => set({ sessionLength: Number(e.target.value) })}>
          {[5, 10, 15, 20].map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <label className="field inline">
        <span>Read questions aloud</span>
        <input type="checkbox" checked={data.settings.readAloud} onChange={(e) => set({ readAloud: e.target.checked })} />
      </label>
      <div className="field">
        <span>Daily warm-up focus (none ticked means all subjects)</span>
        <div className="row" style={{ justifyContent: 'flex-start' }}>
          {SUBJECTS.filter((s) => s.skills.length).map((s) => {
            const on = data.settings.focus?.includes(s.id) ?? false;
            return (
              <label key={s.id} className="chip">
                <input type="checkbox" checked={on} onChange={() => set({ focus: on ? (data.settings.focus ?? []).filter((x) => x !== s.id) : [...(data.settings.focus ?? []), s.id] })} /> {s.icon} {s.name}
              </label>
            );
          })}
        </div>
      </div>
      <p className="muted small">Progress is saved in this browser on this device. Make a backup to move it to another device.</p>
      <div className="row">
        <button className="btn ghost" onClick={exportData}>Download backup</button>
        <button className="btn ghost" onClick={() => file.current?.click()}>Restore backup</button>
        <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        <button className="btn ghost" onClick={() => set({ pin: undefined })}>Reset PIN</button>
      </div>
      {msg && <p>{msg}</p>}
    </section>
  );
}

function SpellingList({ p }: { p: Profile }) {
  const { setData } = useStore();
  const [text, setText] = useState((p.spellingList ?? []).join('\n'));
  const [saved, setSaved] = useState(false);
  const save = () => {
    const words = text.split(/[\n,]+/).map((w) => w.trim()).filter(Boolean);
    setData((d) => ({ ...d, profiles: d.profiles.map((x) => (x.id === p.id ? { ...x, spellingList: words } : x)) }));
    setSaved(true);
  };
  return (
    <div>
      <h3>🔤 This week's spelling words</h3>
      <p className="muted small">One word per line (or separated by commas). Spell Builder reads them aloud for practice.</p>
      <textarea className="word-list" rows={5} value={text} onChange={(e) => { setText(e.target.value); setSaved(false); }} />
      <div className="row" style={{ justifyContent: 'flex-start' }}>
        <button className="btn ghost" onClick={save}>Save list</button>
        {saved && <span className="good">Saved</span>}
      </div>
    </div>
  );
}
