import { useEffect, useState } from 'react';

/** Hash routes (#/subject/math) so the app works on GitHub Pages without server rewrites. */
export function useRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [parts, setParts] = useState(read);
  useEffect(() => {
    const on = () => {
      setParts(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return parts;
}

export function go(...parts: string[]): void {
  window.location.hash = '/' + parts.map(encodeURIComponent).join('/');
}
