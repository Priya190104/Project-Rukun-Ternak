import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Cleanup old Service Workers first
if ('serviceWorker' in navigator) {
  // First, unregister any existing service workers
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister().then(() => {
        console.log('✅ Unregistered old Service Worker');
      });
    });
  });
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);