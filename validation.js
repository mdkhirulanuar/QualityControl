// validation.js

function validateBatchSection() {
  const isValid =
    qcInspectorInput.value !== '' &&
    machineNumberInput.value !== '' &&
    partIdInput.value !== '' &&
    partNameInput.value !== '' &&
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

function validateLotSection() {
  const numBoxes = parseInt(numBoxesInput.value, 10);
  const pcsPerBox = parseInt(pcsPerBoxInput.value, 10);
  const isValid =
    numBoxes > 0 &&
    pcsPerBox > 0 &&
    aqlSelect.value !== '' &&
    validateBatchSection();

  calculateButton.disabled = !isValid;

  if (!isValid) {
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

function validateDefectsSection() {
  const defectsFound = parseInt(defectsFoundInput.value, 10);
  const isValid = !isNaN(defectsFound) && defectsFound >= 0 && currentSamplingPlan;

  submitDefectsButton.disabled = !isValid;

  if (!isValid) {
    fadeOut(verdictMessageDiv);
    fadeOut(defectChecklistDiv);
    fadeOut(photoCaptureArea);
    fadeOut(finalReportAreaDiv);
    fadeOut(generateReportButton);
    fadeOut(savePdfButton);
    fadeOut(printButton);
  }

  return isValid;
}

// --- UI Effects ---
function fadeIn(element) {
  element.style.opacity = 0;
  element.style.display = 'block';
  let op = 0;
  const timer = setInterval(() => {
    if (op >= 1) clearInterval(timer);
    element.style.opacity = op;
    op += 0.1;
  }, 30);
}

function fadeOut(element) {
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
