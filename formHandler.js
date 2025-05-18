function resetAll() {
  aqlForm.reset();
  lotSizeInput.value = '';
  partIdInput.value = '';
  partNameInput.value = '';
  poNumberInput.value = '';
  productionDateInput.value = '';
  defectsFoundInput.value = '';
  resultsDiv.innerHTML = '<p class="initial-message">Please enter batch details, select AQL quality level, and click calculate.</p>';

  // Reset dropdown
  populatePartNameDropdown();

  // Hide all dynamic sections
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
  capturedPhotos = [];

  updatePhotoPreview();

  // Uncheck all defect checkboxes
  document.querySelectorAll('#defectChecklist input[type="checkbox"]').forEach(cb => cb.checked = false);

  clearError();
  validateBatchSection(); // Ensure logic is re-evaluated
}
