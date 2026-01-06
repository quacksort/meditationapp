
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
    // Use relative path 'sw.js' instead of '/sw.js' to stay within the sandbox origin
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => {
      console.error('SW registration failed:', err);
    });
  });
}

// Global click listener to unlock audio
const unlockAudio = () => {
  audioService.init();
  document.removeEventListener('click', unlockAudio);
  document.removeEventListener('touchstart', unlockAudio);
};
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
