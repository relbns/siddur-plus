import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

console.log(`📖 Siddur+ v${__APP_VERSION__} (${__COMMIT_HASH__}) — ${import.meta.env.MODE}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
