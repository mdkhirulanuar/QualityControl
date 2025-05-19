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

  // --- Event Handlers ---
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

  resetButton.addEventListener('click', resetAll);

  // Populate part name dropdown from global partsList
  populatePartNameDropdown(partNameInput, partsList);
}
