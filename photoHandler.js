// photoHandler.js

function photo_bindEvents() {
  // You may add future event listeners here for photo inputs
  togglePhotoFieldsIfRequired(); // Run at startup
}

function togglePhotoFieldsIfRequired() {
  const major = parseInt(document.getElementById('majorDefects').value);
  const minor = parseInt(document.getElementById('minorDefects').value);

  const verdict = calculateVerdict(major, minor);
  const photoSection = document.getElementById('photoUploadSection');

  if (photoSection) {
    photoSection.style.display = (verdict === 'REJECTED') ? 'block' : 'none';
  }
}

function validatePhotoUploads() {
  const major = parseInt(document.getElementById('majorDefects').value);
  const minor = parseInt(document.getElementById('minorDefects').value);
  const verdict = calculateVerdict(major, minor);

  if (verdict === 'PASSED') return true;

  const photo1 = document.getElementById('photo1').files[0];
  const photo2 = document.getElementById('photo2').files[0];

  return !!(photo1 || photo2); // At least one photo is required
}
