// validation.js

// Select DOM Elements
const lotSection = document.querySelector('.lot-details');
const buttonGroup = document.querySelector('.button-group');
const resultsDiv = document.getElementById('results');
const defectsInputArea = document.getElementById('defectsInputArea');
const photoCaptureArea = document.getElementById('photoCaptureArea');
const verdictMessageDiv = document.getElementById('verdictMessage');
const defectChecklistDiv = document.getElementById('defectChecklist');
const finalReportAreaDiv = document.getElementById('finalReportArea');
const generateReportButton = document.getElementById('generateReportButton');
const savePdfButton = document.getElementById('savePdfButton');
const printButton = document.getElementById('printButton');

// === Animation ===
export function fadeIn(element) {
  element.style.opacity = 0;
  element.style.display = 'block';
  let op = 0;
  const timer = setInterval(() => {
    if (op >= 1) clearInterval(timer);
    element.style.opacity = op;
    op += 0.1;
  }, 30);
}

export function fadeOut(element) {
  let op = 1;
  const timer = setInterval(() => {
    if (op <= 0) {
      clearInterval(timer);
      element.style.display = 'none';
    }
    element.style.opacity = op;
    op -= 0.1;
  }, 30);
}

// === ✅ Batch Validation & Section Display ===
export function validateBatchSection() {
  const qcInspectorInput = document.getElementById('qcInspector');
  const machineNumberInput = document.getElementById('machineNumber');
  const partNameInput = document.getElementById('partName');
  const partIdInput = document.getElementById('partId');
  const poNumberInput = document.getElementById('poNumber');
  const productionDateInput = document.getElementById('productionDate');

  const isValid =
    qcInspectorInput.value !== '' &&
    machineNumberInput.value !== '' &&
    partNameInput.value !== '' &&
    partIdInput.value !== '' &&
    poNumberInput.value.trim() !== '' &&
    productionDateInput.value !== '';

  if (isValid) {
    fadeIn(lotSection);
    fadeIn(buttonGroup);
  } else {
    fadeOut(lotSection);
    fadeOut(buttonGroup);
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

  return isValid;
}

// === Lot Validation (Only enables Calculate button) ===
export function validateLotSection() {
  const numBoxes = parseInt(document.getElementById('numBoxes').value, 10);
  const pcsPerBox = parseInt(document.getElementById('pcsPerBox').value, 10);
  const aqlSelect = document.getElementById('aql');
  const calculateButton = document.getElementById('calculateButton');

  const isValid =
    numBoxes > 0 &&
    pcsPerBox > 0 &&
    aqlSelect.value !== '' &&
    validateBatchSection();

  calculateButton.disabled = !isValid;
  return isValid;
}

// === Optional: Validate Defect Entry ===
export function validateDefectsSection(currentSamplingPlan) {
  const defectsFoundInput = document.getElementById('defectsFound');
  const submitDefectsButton = document.getElementById('submitDefectsButton');

  const defectsFound = parseInt(defectsFoundInput.value, 10);
  const isValid = !isNaN(defectsFound) && defectsFound >= 0 && currentSamplingPlan;

  submitDefectsButton.disabled = !isValid;
  return isValid;
}
