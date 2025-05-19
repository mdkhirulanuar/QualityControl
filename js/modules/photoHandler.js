// photoHandler.js — Manages photo uploads and preview display

export function initPhotoHandlers() {
const uploadMultiplePhotosInput = document.getElementById('uploadMultiplePhotos');
  const photoPreview = document.getElementById('photoPreview');
  const photoCount = document.getElementById('photoCount');
}


  // --- Event Handlers ---
  uploadMultiplePhotosInput.addEventListener('change', (e) => handleFileUpload(e.target.files));


  photoPreview.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const index = parseInt(e.target.dataset.index, 10);
      const action = prompt('Type "annotate" to annotate or "remove" to delete this photo.');
      if (action && action.toLowerCase() === 'annotate') {
        initAnnotationCanvas(capturedPhotos[index], index);
        annotationModal.style.display = 'flex';
      } else if (action && action.toLowerCase() === 'remove') {
        if (confirm('Remove this photo?')) {
          removePhoto(index);
        }
      }
    }
  });

