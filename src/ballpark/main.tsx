import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from '../engine/store';
import { BallApp } from './BallApp';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-700.css';
import '../styles.css';
import '../game.css';
import './ballpark.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <BallApp />
    </StoreProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
