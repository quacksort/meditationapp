
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { audioService } from './services/audio';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Register Service Worker for PWA features
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Standard relative path for SW registration in sandboxed environments
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('ZenInterval: Service Worker registered', reg.scope);
      })
      .catch(err => {
        console.error('ZenInterval: SW registration failed', err);
      });
  });
}

// Global click listener to unlock audio capability in the browser
const unlockAudio = () => {
  audioService.init();
};

document.addEventListener('click', unlockAudio, { once: true });
document.addEventListener('touchstart', unlockAudio, { once: true });

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
