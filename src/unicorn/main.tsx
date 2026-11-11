import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreProvider } from '../engine/store';
import { UnicornApp } from './UnicornApp';
import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-700.css';
import './unicorn.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <UnicornApp />
    </StoreProvider>
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
