// domRefs.js
// All DOM elements used across the InspectWise Go™ app

export const elements = {
  // Form Sections
  aqlForm: document.getElementById('aqlForm'),
  batchSection: document.querySelector('.batch-info'),
  lotSection: document.querySelector('.lot-details'),
  buttonGroup: document.querySelector('.button-group'),

  // Batch Details Inputs
  qcInspectorInput: document.getElementById('qcInspector'),
  machineNumberInput: document.getElementById('machineNumber'),
  partNameInput: document.getElementById('partName'),
  partIdInput: document.getElementById('partId'),
  poNumberInput: document.getElementById('poNumber'),
  productionDateInput: document.getElementById('productionDate'),

  // Lot Details
  numBoxesInput: document.getElementById('numBoxes'),
  pcsPerBoxInput: document.getElementById('pcsPerBox'),
  lotSizeInput: document.getElementById('lotSize'),
  aqlSelect: document.getElementById('aql'),

  // Buttons
  calculateButton: document.getElementById('calculateButton'),
  resetButton: document.getElementById('resetButton'),
  submitDefectsButton: document.getElementById('submitDefectsButton'),
  generateReportButton: document.getElementById('generateReportButton'),
  savePdfButton: document.getElementById('savePdfButton'),
  printButton: document.getElementById('printButton'),

  // Output & Display
  resultsDiv: document.getElementById('results'),
  defectsInputArea: document.getElementById('defectsInputArea'),
  defectsFoundInput: document.getElementById('defectsFound'),
  defectChecklistDiv: document.getElementById('defectChecklist'),
  verdictMessageDiv: document.getElementById('verdictMessage'),
  finalReportAreaDiv: document.getElementById('finalReportArea'),
  reportContentDiv: document.getElementById('reportContent'),
  errorMessageDiv: document.getElementById('error-message'),

  // Photo Section
  photoCaptureArea: document.getElementById('photoCaptureArea'),
  uploadMultiplePhotosInput: document.getElementById('uploadMultiplePhotos'),
  photoPreview: document.getElementById('photoPreview'),
  photoCount: document.getElementById('photoCount'),

  // Annotation Modal
  annotationModal: document.getElementById('annotationModal'),
  annotationCanvas: document.getElementById('annotationCanvas'),
  closeModal: document.querySelector('.close-modal'),
  drawCircleButton: document.getElementById('drawCircleButton'),
  drawTextButton: document.getElementById('drawTextButton'),
  drawFreehandButton: document.getElementById('drawFreehandButton'),
  undoButton: document.getElementById('undoButton'),
  saveAnnotationButton: document.getElementById('saveAnnotationButton'),
};
