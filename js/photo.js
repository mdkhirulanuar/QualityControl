import { elements } from './domRefs.js';
import { fadeIn, fadeOut, displayError, clearError } from './ui.js';
import { state } from './state.js';

export function updatePhotoPreview() {
  const defectsFound = parseInt(elements.defectsFoundInput.value, 10);
  const canGenerate = defectsFound > (state.currentSamplingPlan?.accept ?? 0);

  elements.photoPreview.innerHTML =
    state.capturedPhotos.length === 0
      ? '<p>No photos added yet.</p>'
      : state.capturedPhotos.map((photo, index) => `
          <img src="${photo}" alt="Photo ${index + 1}" data-index="${index}" title="Click to annotate or remove">
        `).join('');

  elements.photoCount.textContent = `Photos: ${state.capturedPhotos.length}/${state.MAX_PHOTOS}`;
  elements.uploadMultiplePhotosInput.disabled = state.capturedPhotos.length >= state.MAX_PHOTOS;

  if (canGenerate) {
    if (state.capturedPhotos.length > 0) {
      fadeIn(elements.generateReportButton);
    } else {
      elements.generateReportButton.style.display = 'none';
    }
  }
}

export function addPhoto(base64) {
  if (state.capturedPhotos.length >= state.MAX_PHOTOS) {
    displayError(`Maximum ${state.MAX_PHOTOS} photos reached.`);
    return false;
  }
  state.capturedPhotos.push(base64);
  updatePhotoPreview();
  clearError();
  return true;
}

export function removePhoto(index) {
  state.capturedPhotos.splice(index, 1);
  updatePhotoPreview();
  clearError();
}

export function handleFileUpload(files) {
  const validImages = Array.from(files).filter(file => file.type.startsWith('image/'));
  if (validImages.length === 0) {
    displayError('No valid images selected.');
    return;
  }

  validImages.forEach(file => {
    if (state.capturedPhotos.length >= state.MAX_PHOTOS) return;
    const reader = new FileReader();
    reader.onload = () => addPhoto(reader.result);
    reader.onerror = () => displayError('Error reading file.');
    reader.readAsDataURL(file);
  });
}
