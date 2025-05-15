import { setupEventListeners } from './eventHandlers.js';
import { resetAll } from './reset.js';
import { populatePartNameDropdown } from './ui.js';
import { registerServiceWorker } from './serviceWorker.js';

document.addEventListener('DOMContentLoaded', () => {
  populatePartNameDropdown();
  resetAll();
  setupEventListeners();
  registerServiceWorker();
});
