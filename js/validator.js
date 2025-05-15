import { elements } from './domRefs.js';
import { fadeIn, fadeOut } from './ui.js';

export function validateBatchSection() {
  const isValid =
    elements.qcInspectorInput.value !== '' &&
    elements.machineNumberInput.value !== '' &&
    elements.partIdInput.value !== '' &&
    elements.partNameInput.value !== '' &&
    elements.poNumberInput.value.trim() !== '' &&
    elements.productionDateInput.value !== '';

  if (isValid) {
    fadeIn(elements.lotSection);
    fadeIn(elements.buttonGroup);
  } else {
    fadeOut(elements.lotSection);
    fadeOut(elements.buttonGroup);
    fadeOut(elements.resultsDiv);
    fadeOut(elements.defectsInputArea);
    fadeOut(elements.photoCaptureArea);
    fadeOut(elements.verdictMessageDiv);
    fadeOut(elements.defectChecklistDiv);
    fadeOut(elements.finalReportAreaDiv);
    fadeOut(elements.generateReportButton);
    fadeOut(elements.savePdfButton);
    fadeOut(elements.printButton);
  }

  return isValid;
}

export function validateLotSection() {
  const numBoxes = parseInt(elements.numBoxesInput.value, 10);
  const pcsPerBox = parseInt(elements.pcsPerBoxInput.value, 10);

  const isValid =
    numBoxes > 0 &&
    pcsPerBox > 0 &&
    elements.aqlSelect.value !== '' &&
    validateBatchSection();

  elements.calculateButton.disabled = !isValid;

  if (!isValid) {
    fadeOut(elements.resultsDiv);
    fadeOut(elements.defectsInputArea);
    fadeOut(elements.photoCaptureArea);
    fadeOut(elements.verdictMessageDiv);
    fadeOut(elements.defectChecklistDiv);
    fadeOut(elements.finalReportAreaDiv);
    fadeOut(elements.generateReportButton);
    fadeOut(elements.savePdfButton);
    fadeOut(elements.printButton);
  }

  return isValid;
}

export function validateDefectsSection(currentSamplingPlan) {
  const defectsFound = parseInt(elements.defectsFoundInput.value, 10);
  const isValid = !isNaN(defectsFound) && defectsFound >= 0 && currentSamplingPlan;
  elements.submitDefectsButton.disabled = !isValid;

  if (!isValid) {
    fadeOut(elements.verdictMessageDiv);
    fadeOut(elements.defectChecklistDiv);
    fadeOut(elements.photoCaptureArea);
    fadeOut(elements.finalReportAreaDiv);
    fadeOut(elements.generateReportButton);
    fadeOut(elements.savePdfButton);
    fadeOut(elements.printButton);
  }

  return isValid;
}
