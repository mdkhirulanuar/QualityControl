// main.js
// Primary initializer for InspectWise Go™

import { elements } from './domRefs.js';
import { state } from './state.js';
import { calculateSamplingPlan, displaySamplingPlan } from './logic/sampling.js';
import { fadeIn, fadeOut, displayError, clearError } from './ui.js';
import { qcMonitorContact } from './config.js';

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
  populatePartNameDropdown();
  setupEventListeners();
  resetFormState();
  registerServiceWorker();
});

/**
 * Attach all event listeners for inputs and buttons.
 */
function setupEventListeners() {
  elements.calculateButton.addEventListener('click', () => {
    const plan = calculateSamplingPlan();
    if (plan) {
      state.currentSamplingPlan = plan;
      displaySamplingPlan(plan);
    }
  });

  elements.resetButton.addEventListener('click', () => {
    resetFormState();
  });

  // You can also hook up defect submission, photo handling, report generation
  // from other modules like defects.js, photo.js, report.js
}

/**
 * Resets the UI and form inputs to initial state.
 */
function resetFormState() {
  elements.aqlForm.reset();
  state.currentSamplingPlan = null;
  state.capturedPhotos = [];
  state.currentPhotoIndex = null;

  fadeOut(elements.resultsDiv);
  fadeOut(elements.defectsInputArea);
  fadeOut(elements.verdictMessageDiv);
  fadeOut(elements.photoCaptureArea);
  fadeOut(elements.finalReportAreaDiv);
  fadeOut(elements.generateReportButton);
  fadeOut(elements.savePdfButton);
  fadeOut(elements.printButton);
  clearError(elements.errorMessageDiv);
}

/**
 * Registers the PWA service worker (if supported).
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js')
        .then(reg => console.log('ServiceWorker registered:', reg.scope))
        .catch(err => console.warn('ServiceWorker registration failed:', err));
    });
  }
}
