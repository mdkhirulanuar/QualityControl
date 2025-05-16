// main.js
// Primary initializer for InspectWise Go™

import { elements } from './domRefs.js';
import { state } from './state.js';
import { calculateSamplingPlan, displaySamplingPlan } from './logic/sampling.js'; // Adjust if inside /logic/
import { fadeIn, fadeOut, displayError, clearError } from './ui.js';
import { qcMonitorContact } from './config.js';

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
  populatePartNameDropdown();       // ✅ Ensures dropdown is filled
  setupEventListeners();
  resetFormState();
  registerServiceWorker();
});

/**
 * Populate Part Name dropdown from global partsList.
 */
function populatePartNameDropdown() {
  try {
    console.log('✅ partsList available in main.js:', typeof partsList, partsList); // Debug

    elements.partNameInput.innerHTML = '<option value="">-- Select Part Name --</option>';

    const uniquePartNames = [...new Set(partsList.map(part => part.partName))];
    uniquePartNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      elements.partNameInput.appendChild(option);
    });
  } catch (error) {
    console.error('❌ Failed to populate Part Name dropdown:', error);
    displayError('Unable to load Part Name list. Please check partsList.js.', elements.errorMessageDiv);
  }
}

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

  // Future integration: defects.js, photo.js, report.js
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
