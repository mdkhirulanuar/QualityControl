// formHandler.js — Handles AQL form logic and reset
import { populatePartNameDropdown } from './utils.js';

export function initFormHandlers() {
  // --- DOM Element Selection ---
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

  // --- Logic ---
  function validateBatchSection() {
    const isValid = qcInspectorInput.value !== '' &&
                    machineNumberInput.value !== '' &&
                    partIdInput.value !== '' &&
                    partNameInput.value !== '' &&
                    poNumberInput.value.trim() !== '' &&
                    productionDateInput.value !== '';
    if (isValid) {
      lotSection.style.display = 'block';
      buttonGroup.style.display = 'flex';
    } else {
      lotSection.style.display = 'none';
      buttonGroup.style.display = 'none';
      resultsDiv.style.display = 'none';
    }
    return isValid;
  }

  function resetAll() {
    aqlForm.reset();
    lotSizeInput.value = '';
    partIdInput.value = '';
    partNameInput.value = '';
    poNumberInput.value = '';
    productionDateInput.value = '';
    populatePartNameDropdown(partNameInput, partsList);
    resultsDiv.innerHTML = '<p class="initial-message">Please enter batch details, select quality level, and click calculate.</p>';
    lotSection.style.display = 'none';
    buttonGroup.style.display = 'none';
    resultsDiv.style.display = 'none';
    validateBatchSection();
  }

  // --- Event Listeners ---
  calculateButton.addEventListener('click', () => {
    console.log('Calculate clicked'); // Placeholder
  });

  resetButton.addEventListener('click', resetAll);

  // Populate and auto-fill
  populatePartNameDropdown(partNameInput, partsList);

  partNameInput.addEventListener('change', function () {
    const selectedPart = partsList.find(part => part.partName === partNameInput.value);
    partIdInput.value = selectedPart ? part.partId : '';
    validateBatchSection();
  });

  qcInspectorInput.addEventListener('change', validateBatchSection);
  machineNumberInput.addEventListener('change', validateBatchSection);
  poNumberInput.addEventListener('input', validateBatchSection);
  productionDateInput.addEventListener('change', validateBatchSection);

  // Init form on load
  resetAll();
}
