// main.js

// --- Global DOM Elements ---
const aqlForm = document.getElementById('aqlForm');
const qcInspectorInput = document.getElementById('qcInspector');
const machineNumberInput = document.getElementById('machineNumber');
const partNameInput = document.getElementById('partName');
const partIdInput = document.getElementById('partId');
const poNumberInput = document.getElementById('poNumber');
const productionDateInput = document.getElementById('productionDate');
const numBoxesInput = document.getElementById('numBoxes');
const pcsPerBoxInput = document.getElementById('pcsPerBox');
const lotSizeInput = document.getElementById('lotSize');
const aqlSelect = document.getElementById('aql');
const calculateButton = document.getElementById('calculateButton');
const resetButton = document.getElementById('resetButton');
const resultsDiv = document.getElementById('results');
const defectsInputArea = document.getElementById('defectsInputArea');
const defectsFoundInput = document.getElementById('defectsFound');
const submitDefectsButton = document.getElementById('submitDefectsButton');
const photoCaptureArea = document.getElementById('photoCaptureArea');
const uploadMultiplePhotosInput = document.getElementById('uploadMultiplePhotos');
const photoPreview = document.getElementById('photoPreview');
const photoCount = document.getElementById('photoCount');
const verdictMessageDiv = document.getElementById('verdictMessage');
const defectChecklistDiv = document.getElementById('defectChecklist');
const generateReportButton = document.getElementById('generateReportButton');
const finalReportAreaDiv = document.getElementById('finalReportArea');
const reportContentDiv = document.getElementById('reportContent');
const savePdfButton = document.getElementById('savePdfButton');
const printButton = document.getElementById('printButton');
const errorMessageDiv = document.getElementById('error-message');
const batchSection = document.querySelector('.batch-info');
const lotSection = document.querySelector('.lot-details');
const buttonGroup = document.querySelector('.button-group');

// Annotation Elements
const annotationModal = document.getElementById('annotationModal');
const annotationCanvas = document.getElementById('annotationCanvas');
const closeModal = document.querySelector('.close-modal');
const drawCircleButton = document.getElementById('drawCircleButton');
const drawTextButton = document.getElementById('drawTextButton');
const drawFreehandButton = document.getElementById('drawFreehandButton');
const undoButton = document.getElementById('undoButton');
const saveAnnotationButton = document.getElementById('saveAnnotationButton');

// Contact for report submission
const qcMonitorContact = "qaqc@kpielectrical.com.my or whatsapp to +60182523255 immediately";

// App Initialization
document.addEventListener('DOMContentLoaded', function () {
  populatePartNameDropdown();
  resetAll();

  // --- Input Validation Events ---
  qcInspectorInput.addEventListener('change', validateBatchSection);
  machineNumberInput.addEventListener('change', validateBatchSection);
  partNameInput.addEventListener('change', validateBatchSection);
  poNumberInput.addEventListener('input', validateBatchSection);
  productionDateInput.addEventListener('change', validateBatchSection);
  numBoxesInput.addEventListener('input', () => {
    calculateLotSize();
    validateLotSection();
  });
  pcsPerBoxInput.addEventListener('input', () => {
    calculateLotSize();
    validateLotSection();
  });
  aqlSelect.addEventListener('change', validateLotSection);
  defectsFoundInput.addEventListener('change', validateDefectsSection);

  // --- Main Logic Buttons ---
  calculateButton.addEventListener('click', () => {
    currentSamplingPlan = calculateSamplingPlan();
    if (currentSamplingPlan) {
      displaySamplingPlan(currentSamplingPlan);
    } else {
      fadeOut(resultsDiv);
      fadeOut(defectsInputArea);
      fadeOut(photoCaptureArea);
      fadeOut(verdictMessageDiv);
      fadeOut(defectChecklistDiv);
      fadeOut(finalReportAreaDiv);
      fadeOut(generateReportButton);
      fadeOut(savePdfButton);
      fadeOut(printButton);
    }
  });

  submitDefectsButton.addEventListener('click', submitDefects);
  generateReportButton.addEventListener('click', generateReport);
  savePdfButton.addEventListener('click', saveReportAsPdf);
  printButton.addEventListener('click', printReport);
  resetButton.addEventListener('click', resetAll);

  // --- Photo & Annotation Events ---
  uploadMultiplePhotosInput.addEventListener('change', (e) => handleFileUpload(e.target.files));

  photoPreview.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const index = parseInt(e.target.dataset.index, 10);
      const action = prompt('Type "annotate" to annotate or "remove" to delete this photo.');
      if (action && action.toLowerCase() === 'annotate') {
        initAnnotationCanvas(capturedPhotos[index], index);
        annotationModal.style.display = 'flex';
      } else if (action && action.toLowerCase() === 'remove') {
        if (confirm('Remove this photo?')) {
          removePhoto(index);
        }
      }
    }
  });

  closeModal.addEventListener('click', closeAnnotationModal);

  // --- Touch Enhancements (Mobile) ---
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', () => button.classList.add('active'));
    button.addEventListener('touchend', () => button.classList.remove('active'));
  });
});

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered with scope:', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  });
}
