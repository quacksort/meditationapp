
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
    // Use `import.meta.env.BASE_URL` to create the correct path to the SW file
    const swUrl = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swUrl)
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
