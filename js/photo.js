import { elements } from './domRefs.js';
import { fadeIn, fadeOut, displayError, clearError } from './ui.js';

export const MAX_PHOTOS = 5;
export const capturedPhotos = [];

export function updatePhotoPreview(currentSamplingPlan) {
  const defectsFound = parseInt(elements.defectsFoundInput.value, 10);
  const canGenerate = defectsFound > currentSamplingPlan?.accept;

  elements.photoPreview.innerHTML =
    capturedPhotos.length === 0
      ? '<p>No photos added yet.</p>'
      : capturedPhotos.map((photo, index) => `
          <img src="${photo}" alt="Photo ${index + 1}" data-index="${index}" title="Click to annotate or remove">
        `).join('');

  elements.photoCount.textContent = `Photos: ${capturedPhotos.length}/${MAX_PHOTOS}`;
  elements.uploadMultiplePhotosInput.disabled = capturedPhotos.length >= MAX_PHOTOS;

  // Logic: show generate button only if REJECTED and photos attached
  if (canGenerate) {
    if (capturedPhotos.length > 0) {
      fadeIn(elements.generateReportButton);
    } else {
      elements.generateReportButton.style.display = 'none';
    }
  }
}

export function addPhoto(base64, currentSamplingPlan) {
  if (capturedPhotos.length >= MAX_PHOTOS) {
    displayError(`Maximum ${MAX_PHOTOS} photos reached.`);
    return false;
  }
  capturedPhotos.push(base64);
  updatePhotoPreview(currentSamplingPlan);
  clearError();
  return true;
}

export function removePhoto(index, currentSamplingPlan) {
  capturedPhotos.splice(index, 1);
  updatePhotoPreview(currentSamplingPlan);
  clearError();
}

export function handleFileUpload(files, currentSamplingPlan) {
  const validImages = Array.from(files).filter(file => file.type.startsWith('image/'));
  if (validImages.length === 0) {
    displayError('No valid images selected.');
    return;
  }

  validImages.forEach(file => {
    if (capturedPhotos.length >= MAX_PHOTOS) return;
    const reader = new FileReader();
    reader.onload = () => addPhoto(reader.result, currentSamplingPlan);
    reader.onerror = () => displayError('Error reading file.');
    reader.readAsDataURL(file);
  });
}
