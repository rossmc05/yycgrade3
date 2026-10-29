import { useEffect, useRef, useState } from 'react';
import { ZoneScene } from '../art/scenes';
import { Sprite } from '../art/sprite';
import { useStore } from '../engine/store';
import { FxLayer, type FxHandle } from './fx';
import { AvatarArt } from '../avatar/AvatarArt';
import type { Look } from '../avatar/catalog';
import type { SubjectId } from '../engine/types';
import { MonsterArt, SceneArt } from './Art';
import { COMBO_FOR_SPECIAL, type Battle, type HitKind } from './engine';
import { sfx } from './sfx';
import type { Zone } from './zones';

/** What just happened, for the animation. `id` changes on every new event. */
export interface StageEvent {
  id: number;
  kind: HitKind | 'attack';
  damage: number;
  heal: number;
  finished: boolean;
  coins: number;
  /** Which foe the event happened to. */
  foe: number;
}

const WORDS: Partial<Record<StageEvent['kind'], string>> = {
  crit: 'CRITICAL!',
  block: 'Shield bash!',
  miss: 'It healed!',
  flee: 'It ran away!',
  attack: 'Ouch!',
};

export function BattleStage({ zone, battle, event, look }: { zone: Zone; battle: Battle; event: StageEvent | null; look: Look }) {
  const subject = zone.subject as SubjectId;
  // Keep showing a beaten monster for a moment before the next one walks in.
  const [shown, setShown] = useState(battle.current);
  const [leaving, setLeaving] = useState<'defeated' | 'fled' | null>(null);
  const last = useRef<number | null>(null);
  const fx = useRef<FxHandle>(null);
  const stage = useRef<HTMLElement>(null);
  const { data } = useStore();
  const classic = !!data.settings.classicLook;

  useEffect(() => {
    if (!event || event.id === last.current) return;
    last.current = event.id;
    const play: Record<string, () => void> = {
      hit: sfx.hit, crit: sfx.crit, special: sfx.special, block: sfx.block, miss: sfx.growl, flee: sfx.whoosh, attack: () => { sfx.growl(); setTimeout(sfx.ouch, 250); },
    };
    sfx.whoosh();
    setTimeout(() => play[event.kind]?.(), event.kind === 'attack' || event.kind === 'miss' ? 0 : 280);
    // Particles land with the projectile, on the monster (or on the hero when the monster attacks).
    const k = event.kind;
    const shake = classic ? '' : k === 'special' ? 'shake-l' : k === 'crit' || k === 'attack' ? 'shake-m' : k === 'hit' ? 'shake-s' : '';
    const fxTimer = setTimeout(() => {
      const el = stage.current;
      if (el && shake) {
        el.classList.remove('shake-s', 'shake-m', 'shake-l');
        void el.offsetWidth; // restart the animation
        el.classList.add(shake);
      }
      if (k === 'hit' || k === 'crit' || k === 'special' || k === 'block') fx.current?.burst(k, 0.76, 0.55);
      if (k === 'attack') fx.current?.burst('hit', 0.2, 0.6, '#ef4444');
      if (k === 'miss' && event.heal) fx.current?.burst('heal', 0.76, 0.55);
    }, k === 'attack' || k === 'miss' ? 300 : 420);
    if (event.finished) {
      const foe = battle.foes[shown];
      const t1 = setTimeout(() => { setLeaving(foe?.end ?? 'defeated'); if (foe?.end === 'defeated') { sfx.defeat(); fx.current?.burst('poof', 0.76, 0.6); } }, 700);
      const t2 = setTimeout(() => { if (event.coins) { sfx.coin(); fx.current?.burst('coins', 0.76, 0.5); } }, 1100);
      const t3 = setTimeout(() => { setLeaving(null); setShown(battle.current); }, 1500);
      return () => { clearTimeout(fxTimer); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    return () => clearTimeout(fxTimer);
  }, [event?.id]);

  const foe = battle.foes[shown];
  const kind = event && event.foe === shown ? event.kind : null;
  const heroAttacks = kind === 'hit' || kind === 'crit' || kind === 'special' || kind === 'block';
  const monsterAttacks = kind === 'attack' || kind === 'miss';
  const hpPct = foe ? (foe.hp / foe.maxHp) * 100 : 0;
  const projectile = kind === 'special' ? zone.attack.special : kind === 'block' ? '🛡️' : zone.attack.hit;

  return (
    <section ref={stage} className={`battle-stage zone-${subject} ${kind === 'special' && classic ? 'quake' : ''}`} aria-label={`${zone.name} battle`}>
      {classic ? <SceneArt subject={subject} /> : <ZoneScene id={subject} battle />}
      {!classic && <FxLayer ref={fx} />}
      {!classic && heroAttacks && <div className={`hit-flash ${kind}`} />}
      <div className="battle-hud">
        <div className="foe-info">
          <strong>{foe?.boss ? '👑 ' : ''}{foe?.name}</strong>
          <div className="hp" role="meter" aria-label={`${foe?.name} health`} aria-valuenow={foe?.hp} aria-valuemin={0} aria-valuemax={foe?.maxHp}>
            <span style={{ width: `${hpPct}%` }} className={hpPct < 30 ? 'low' : ''} />
          </div>
          <small>{foe?.hp} / {foe?.maxHp} HP · Monster {shown + 1} of {battle.foes.length}</small>
        </div>
        <div className="hud-right">
          <div className={`combo ${battle.combo === COMBO_FOR_SPECIAL - 1 ? 'charged' : ''}`} aria-label={`Combo ${battle.combo} of ${COMBO_FOR_SPECIAL}`}>
            {Array.from({ length: COMBO_FOR_SPECIAL }, (_, i) => <i key={i} className={i < battle.combo ? 'on' : ''} />)}
            <span>{battle.combo === COMBO_FOR_SPECIAL - 1 ? `${zone.attack.specialName} ready!` : 'Combo'}</span>
          </div>
          <div className="loot">🪙 {battle.coins}</div>
        </div>
      </div>

      <div className="fighters">
        <div key={`hero-${event?.id ?? 0}`} className={`hero ${heroAttacks ? 'lunge' : ''} ${monsterAttacks ? 'shake' : ''}`}>
          <AvatarArt look={look} size={150} background={false} />
          {kind === 'block' && <span className="shield">{classic ? '🛡️' : <Sprite e="🛡️" size="1em" />}</span>}
        </div>
        {heroAttacks && <span key={`p-${event!.id}`} className={`projectile ${kind}`}>{classic ? projectile : <Sprite e={projectile} size="1em" />}</span>}
        {foe && (
          <div key={`foe-${shown}`} className={`foe enter ${foe.boss ? 'boss' : ''} ${leaving ? leaving : ''}`}>
            <div key={`f-${event?.id ?? 0}`} className={`foe-body ${heroAttacks ? 'hurt' : ''} ${monsterAttacks ? 'pounce' : ''}`}>
              <MonsterArt subject={subject} kind={foe.kind} hurt={heroAttacks || !!leaving} size={foe.boss ? 180 : 150} />
            </div>
            {heroAttacks && event!.damage > 0 && <span key={`d-${event!.id}`} className={`dmg ${kind}`}>−{event!.damage}</span>}
            {kind === 'miss' && event!.heal > 0 && <span key={`h-${event!.id}`} className="dmg heal">+{event!.heal}</span>}
            {leaving === 'defeated' && classic && <span className="poof">💥</span>}
            {leaving && event?.coins ? <span className="coin-drop">+{event.coins} 🪙</span> : null}
          </div>
        )}
      </div>
      {kind && (WORDS[kind] || kind === 'special') && (
        <div key={`w-${event!.id}`} className={`battle-word ${kind}`}>{kind === 'special' ? `${zone.attack.specialName}!` : WORDS[kind]}</div>
      )}
    </section>
  );
}
