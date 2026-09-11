import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Prevent scroll wheel from accidentally modifying number inputs
if (typeof window !== 'undefined') {
  window.addEventListener('wheel', (e) => {
    if (document.activeElement && document.activeElement.type === 'number') {
      document.activeElement.blur();
    }
  }, { passive: true });
}

// Register Service Worker for promotional push notifications & offline caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('Push ServiceWorker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('Push ServiceWorker registration skipped:', err?.message || err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

