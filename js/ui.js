import { elements } from './domRefs.js';

/**
 * Smoothly fades in an element.
 */
export function fadeIn(element) {
  element.style.opacity = 0;
  element.style.display = 'block';
  let op = 0;
  const timer = setInterval(() => {
    if (op >= 1) clearInterval(timer);
    element.style.opacity = op;
    op += 0.1;
  }, 30);
}

/**
 * Smoothly fades out an element.
 */
export function fadeOut(element) {
  let op = 1;
  const timer = setInterval(() => {
    if (op <= 0) {
      clearInterval(timer);
      element.style.display = 'none';
    }
    element.style.opacity = op;
    op -= 0.1;
  }, 30);
}

/**
 * Display error message in the UI.
 */
export function displayError(message) {
  elements.errorMessageDiv.textContent = message;
  elements.errorMessageDiv.style.display = 'block';
}

/**
 * Clears any displayed error message.
 */
export function clearError() {
  elements.errorMessageDiv.textContent = '';
  elements.errorMessageDiv.style.display = 'none';
}

/**
 * Populates the Part Name dropdown with unique names from global partsList.
 * Assumes partsList is available in the global scope (non-module script).
 */
export function populatePartNameDropdown() {
  if (typeof partsList === 'undefined') {
    console.error('⚠️ partsList is not defined. Ensure partsList.js is loaded before main.js.');
    return;
  }

  elements.partNameInput.innerHTML = '<option value="">-- Select Part Name --</option>';
  const uniqueNames = [...new Set(partsList.map(part => part.partName))];

  uniqueNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    elements.partNameInput.appendChild(option);
  });
}
