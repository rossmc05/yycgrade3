import { useEffect, useState } from 'react';

type Doc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void; webkitFullscreenEnabled?: boolean };
type El = HTMLElement & { webkitRequestFullscreen?: () => void };

const doc = () => document as Doc;
export const canFullScreen = () => typeof document !== 'undefined' && !!(doc().fullscreenEnabled || doc().webkitFullscreenEnabled);
const isFull = () => !!(doc().fullscreenElement || doc().webkitFullscreenElement);

export function toggleFullScreen() {
  try {
    if (isFull()) {
      if (document.exitFullscreen) void document.exitFullscreen();
      else doc().webkitExitFullscreen?.();
    } else {
      const el = document.documentElement as El;
      if (el.requestFullscreen) void el.requestFullscreen().catch(() => {});
      else el.webkitRequestFullscreen?.();
    }
  } catch {
    /* not allowed here */
  }
}

export function FullScreenButton() {
  const [full, setFull] = useState(isFull);
  useEffect(() => {
    const on = () => setFull(isFull());
    document.addEventListener('fullscreenchange', on);
    document.addEventListener('webkitfullscreenchange', on);
    return () => {
      document.removeEventListener('fullscreenchange', on);
      document.removeEventListener('webkitfullscreenchange', on);
    };
  }, []);
  if (!canFullScreen()) return null;
  return (
    <button className="icon-btn fs-btn" onClick={toggleFullScreen} aria-label={full ? 'Leave full screen' : 'Full screen'} title={full ? 'Leave full screen' : 'Full screen'}>
      {full ? '⤡' : '⛶'}
    </button>
  );
}
