import { elements } from './domRefs.js';
import { setupEventListeners } from './eventHandlers.js';
import { resetAll } from './reset.js';
import { populatePartNameDropdown } from './ui.js';
import { calculateSamplingPlan } from './sampling.js';
import { displayVerdict, generateReport, saveReportAsPdf, printReport } from './report.js';
import { handleFileUpload } from './photo.js';
import { state } from './state.js';
import { registerServiceWorker } from './serviceWorker.js';

document.addEventListener('DOMContentLoaded', () => {
  populatePartNameDropdown();
  resetAll();
  setupEventListeners();
  registerServiceWorker();

  // Sampling Plan
  elements.calculateButton.addEventListener('click', () => {
    const plan = calculateSamplingPlan();
    if (!plan) return;

    // Display results (manually updated in UI file or here)
    elements.resultsDiv.innerHTML = `
      <p><strong>Sample Size:</strong> ${plan.sampleSize}</p>
      <p><strong>Accept (Ac):</strong> ${plan.accept}</p>
      <p><strong>Reject (Re):</strong> ${plan.reject}</p>
    `;
    elements.resultsDiv.style.display = 'block';
    elements.defectsInputArea.style.display = 'block';
  });

  // Submit defects & verdict
  elements.submitDefectsButton.addEventListener('click', () => {
    const defects = parseInt(elements.defectsFoundInput.value, 10);
    if (isNaN(defects) || !state.currentSamplingPlan) return;
    displayVerdict(defects);
  });

  // Report generation
  elements.generateReportButton.addEventListener('click', generateReport);
  elements.savePdfButton.addEventListener('click', saveReportAsPdf);
  elements.printButton.addEventListener('click', printReport);

  // Upload photos
  elements.uploadMultiplePhotosInput.addEventListener('change', (e) => {
    handleFileUpload(e.target.files);
  });

  // Annotation / photo preview handled in annotation.js separately
});
