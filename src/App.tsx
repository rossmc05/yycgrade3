import { useEffect, useState } from 'react';
import { useStore } from './engine/store';
import { useRoute } from './router';
import { Arcade, GameScreen } from './screens/Arcade';
import { AvatarStudio } from './screens/AvatarStudio';
import { Home } from './screens/Home';
import { World } from './screens/World';
import { WorldMap } from './screens/WorldMap';
import { Zone } from './screens/Zone';
import { Parent } from './screens/Parent';
import { Play } from './screens/Play';
import { Title } from './screens/Title';
import { Profiles } from './screens/Profiles';
import { Rewards } from './screens/Rewards';
import { SubjectScreen } from './screens/SubjectScreen';
import { TypingHome, TypingLesson } from './screens/Typing';

export function App() {
  const { profile, data } = useStore();
  const [page, a, b] = useRoute();
  const classic = !!data.settings.classicLook;
  // The title screen shows once each time the game is opened.
  const [started, setStarted] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('game', !classic);
  }, [classic]);

  if (!classic && !started && page !== 'parent') return <Title onStart={() => setStarted(true)} />;

  if (page === 'parent') return <Parent />;
  if (!profile || page === 'profiles') return <Profiles />;
  if (page === 'subject' && a === 'typing') return <TypingHome />;
  if (page === 'type' && a) return <TypingLesson key={a} lessonId={a} />;
  if (page === 'subject' && a) return <SubjectScreen subjectId={a} />;
  if (page === 'play' && a && b) return <Play key={`${a}/${b}`} subjectId={a} target={b} />;
  if (page === 'rewards') return <Rewards />;
  if (page === 'avatar') return <AvatarStudio />;
  if (page === 'world') return <World />;
  if (page === 'arcade') return <Arcade />;
  if (page === 'game' && a) return <GameScreen key={a} id={a} />;
  if (page === 'zone' && a) return <Zone key={a} subjectId={a} />;
  if (page === 'menu' || data.settings.battle === false) return <Home />;
  return <WorldMap />;
}
