import { elements } from './domRefs.js';
import { validateBatchSection, validateLotSection, validateDefectsSection } from './validator.js';
import { calculateLotSize } from './sampling.js';
import { displayVerdict, generateReportHTML, renderReportToPage, saveReportAsPdf, printReport } from './report.js';
import { capturedPhotos, updatePhotoPreview, handleFileUpload } from './photo.js';
import { initAnnotationCanvas } from './annotation.js';
import { resetAll } from './reset.js';

let currentSamplingPlan = null;

export function setupEventListeners() {
  elements.calculateButton.disabled = true;
  elements.submitDefectsButton.disabled = true;

  // Input validations
  elements.qcInspectorInput.addEventListener('change', validateBatchSection);
  elements.machineNumberInput.addEventListener('change', validateBatchSection);
  elements.partNameInput.addEventListener('change', validateBatchSection);
  elements.poNumberInput.addEventListener('input', validateBatchSection);
  elements.productionDateInput.addEventListener('change', validateBatchSection);

  elements.numBoxesInput.addEventListener('input', () => {
    calculateLotSize();
    validateLotSection();
  });
  elements.pcsPerBoxInput.addEventListener('input', () => {
    calculateLotSize();
    validateLotSection();
  });
  elements.aqlSelect.addEventListener('change', validateLotSection);
  elements.defectsFoundInput.addEventListener('change', () => validateDefectsSection(currentSamplingPlan));

  // Calculate sampling
  elements.calculateButton.addEventListener('click', () => {
    const plan = window.calculateSamplingPlan(); // function from sampling.js
    if (plan) {
      currentSamplingPlan = plan;
      const lotSize = parseInt(elements.lotSizeInput.value, 10);
      const aqlText = elements.aqlSelect.value;
      const resultHtml = generateReportHTML('PREVIEW', currentSamplingPlan, 0, [], aqlText);
      elements.resultsDiv.innerHTML = resultHtml;
      elements.defectsInputArea.style.display = 'block';
    }
  });

  // Submit defects and show verdict
  elements.submitDefectsButton.addEventListener('click', () => {
    const defectsFound = parseInt(elements.defectsFoundInput.value, 10);
    if (isNaN(defectsFound) || !currentSamplingPlan) return;
    displayVerdict(defectsFound, currentSamplingPlan);
  });

  // Generate report view
  elements.generateReportButton.addEventListener('click', () => {
    const defectsFound = parseInt(elements.defectsFoundInput.value, 10);
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked')).map(cb => cb.value);
    const aqlText = elements.aqlSelect.value;
    const reportId = `Report_${elements.partIdInput.value || 'NoID'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,8).replace(/:/g,'')}`;
    const reportHTML = generateReportHTML(reportId, currentSamplingPlan, defectsFound, selectedDefects, aqlText);
    renderReportToPage(reportHTML);
  });

  elements.savePdfButton.addEventListener('click', () => {
    const defectsFound = parseInt(elements.defectsFoundInput.value, 10);
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked')).map(cb => cb.value);
    const aqlText = elements.aqlSelect.value;
    const reportId = `Report_${elements.partIdInput.value || 'NoID'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,8).replace(/:/g,'')}`;
    saveReportAsPdf(reportId, currentSamplingPlan, defectsFound, selectedDefects, aqlText);
  });

  elements.printButton.addEventListener('click', printReport);
  elements.resetButton.addEventListener('click', resetAll);

  // Upload photos
  elements.uploadMultiplePhotosInput.addEventListener('change', (e) => handleFileUpload(e.target.files, currentSamplingPlan));

  // Preview click = annotate or remove
  elements.photoPreview.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const index = parseInt(e.target.dataset.index, 10);
      const action = prompt('Type "annotate" to annotate or "remove" to delete this photo.');
      if (action && action.toLowerCase() === 'annotate') {
        initAnnotationCanvas(capturedPhotos[index], index, currentSamplingPlan);
        elements.annotationModal.style.display = 'flex';
      } else if (action && action.toLowerCase() === 'remove') {
        if (confirm('Remove this photo?')) {
          capturedPhotos.splice(index, 1);
          updatePhotoPreview(currentSamplingPlan);
        }
      }
    }
  });

  // Close annotation modal
  elements.closeModal.addEventListener('click', () => {
    elements.annotationModal.style.display = 'none';
  });

  // Touch feedback
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', () => button.classList.add('active'));
    button.addEventListener('touchend', () => button.classList.remove('active'));
  });
}
