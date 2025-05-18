// verdictHandler.js

function submitDefects() {
  clearError();

  const defectsFound = parseInt(defectsFoundInput.value, 10);
  if (isNaN(defectsFound) || defectsFound < 0) {
    displayError('Please enter a valid number of defects (0 or more).');
    fadeOut(verdictMessageDiv);
    fadeOut(defectChecklistDiv);
    fadeOut(photoCaptureArea);
    fadeOut(finalReportAreaDiv);
    fadeOut(generateReportButton);
    fadeOut(savePdfButton);
    fadeOut(printButton);
    return;
  }

  if (!currentSamplingPlan) {
    displayError('Please calculate the sampling plan first.');
    return;
  }

  const isRejected = defectsFound > currentSamplingPlan.accept;
  const verdict = isRejected ? 'REJECTED 🔴' : 'ACCEPTED 🟢';
  const message = isRejected
    ? `This batch is REJECTED due to ${defectsFound} defects, exceeding rejection threshold (≥ ${currentSamplingPlan.reject}). This batch requires 100% inspection.`
    : `This batch is ACCEPTED as it has ${defectsFound} defects, within acceptance limit (≤ ${currentSamplingPlan.accept}).`;

  verdictMessageDiv.innerHTML = `
    <div class="${isRejected ? 'reject' : 'accept'}">
      <strong>${verdict}</strong><br>${message}
      ${isRejected ? `<br><small>Notify QC Executive immediately for further action</small>` : ''}
    </div>
  `;

  fadeIn(verdictMessageDiv);
  fadeIn(defectChecklistDiv);

  if (isRejected) {
    fadeIn(photoCaptureArea);
    generateReportButton.style.display = 'none'; // wait for photo
  } else {
    fadeOut(photoCaptureArea);
    fadeIn(generateReportButton); // immediately allow report generation
  }
}
