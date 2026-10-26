import { useStore } from './engine/store';
import { useRoute } from './router';
import { Home } from './screens/Home';
import { Parent } from './screens/Parent';
import { Play } from './screens/Play';
import { Profiles } from './screens/Profiles';
import { Rewards } from './screens/Rewards';
import { SubjectScreen } from './screens/SubjectScreen';

export function App() {
  const { profile } = useStore();
  const [page, a, b] = useRoute();

  if (page === 'parent') return <Parent />;
  if (!profile || page === 'profiles') return <Profiles />;
  if (page === 'subject' && a) return <SubjectScreen subjectId={a} />;
  if (page === 'play' && a && b) return <Play key={`${a}/${b}`} subjectId={a} target={b} />;
  if (page === 'rewards') return <Rewards />;
  return <Home />;
}
