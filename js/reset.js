import { elements } from './domRefs.js';
import { capturedPhotos, updatePhotoPreview } from './photo.js';
import { fadeOut, clearError } from './ui.js';

export function resetAll() {
  elements.aqlForm.reset();
  elements.lotSizeInput.value = '';
  elements.partIdInput.value = '';
  elements.partNameInput.value = '';
  elements.poNumberInput.value = '';
  elements.productionDateInput.value = '';

  elements.resultsDiv.innerHTML = '<p class="initial-message">Please enter batch details, select quality level, and click calculate.</p>';

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

  elements.defectsFoundInput.value = '';
  capturedPhotos.length = 0; // Clear photo array
  updatePhotoPreview();

  document.querySelectorAll('#defectChecklist input[type="checkbox"]').forEach(cb => cb.checked = false);

  clearError();
}
