// verdictHandler.js

function verdict_bindEvents() {
  const majorInput = document.getElementById('majorDefects');
  const minorInput = document.getElementById('minorDefects');

  if (majorInput && minorInput) {
    majorInput.addEventListener('input', updateShortVerdict);
    minorInput.addEventListener('input', updateShortVerdict);
  }
}

function updateShortVerdict(data) {
  const major = data ? parseInt(data.majorDefects) : parseInt(document.getElementById('majorDefects').value);
  const minor = data ? parseInt(data.minorDefects) : parseInt(document.getElementById('minorDefects').value);

  const verdictText = calculateVerdict(major, minor);
  const verdictDisplay = document.getElementById('shortVerdict');

  if (verdictDisplay) {
    verdictDisplay.textContent = verdictText;
  }

  togglePhotoFieldsIfRequired(); // Ensure photos are shown if Rejected
}

function calculateVerdict(major, minor) {
  if (isNaN(major) || isNaN(minor)) return '';

  return major === 0 && minor === 0 ? 'PASSED' : 'REJECTED';
}
