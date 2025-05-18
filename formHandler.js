// formHandler.js

function resetAll() {
  aqlForm.reset();
  lotSizeInput.value = '';
  partIdInput.value = '';
  partNameInput.value = '';
  poNumberInput.value = '';
  productionDateInput.value = '';

  populatePartNameDropdown();

  resultsDiv.innerHTML = '<p class="initial-message">Please enter batch details, select quality level, and click calculate.</p>';

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

  currentSamplingPlan = null;
  defectsFoundInput.value = '';
  capturedPhotos = [];
  updatePhotoPreview();

  document.querySelectorAll('#defectChecklist input[type="checkbox"]').forEach(cb => cb.checked = false);

  clearError();
  validateBatchSection();
}
