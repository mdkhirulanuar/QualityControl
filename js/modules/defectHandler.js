// defectHandler.js — Handles defect count and verdict logic

export function initDefectHandlers() {
const defectsInputArea = document.getElementById('defectsInputArea');
  const defectsFoundInput = document.getElementById('defectsFound');
  const submitDefectsButton = document.getElementById('submitDefectsButton');
  const photoCaptureArea = document.getElementById('photoCaptureArea');
}


  // --- Event Handlers ---
 submitDefectsButton.addEventListener('click', () => {
  const defectsFound = parseInt(defectsFoundInput.value, 10);
  if (isNaN(defectsFound) || !currentSamplingPlan) return;

  const isRejected = defectsFound > currentSamplingPlan.accept;
  const verdict = isRejected ? 'REJECTED 🔴' : 'ACCEPTED 🟢';
  const message = isRejected
    ? `This batch is REJECTED due to ${defectsFound} defects, exceeding rejection threshold (≥ ${currentSamplingPlan.reject}).This batch require 100% inspection.`
    : `This batch is ACCEPTED as it has ${defectsFound} defects, within acceptance limit (≤ ${currentSamplingPlan.accept}).`;

  verdictMessageDiv.innerHTML = `
    <div class="${isRejected ? 'reject' : 'accept'}">
      <strong>${verdict}</strong><br>${message}
      ${isRejected ? `<br><small>Notify QC Executive immediately for further action</small>` : ''}
    </div>
  `;

  fadeIn(verdictMessageDiv);
  fadeIn(defectChecklistDiv); // always show defect checklist

  if (isRejected) {
    fadeIn(photoCaptureArea);
    generateReportButton.style.display = 'none'; // wait for photo
  } else {
    fadeOut(photoCaptureArea);
    fadeIn(generateReportButton); // immediately allow report generation
  }
});

