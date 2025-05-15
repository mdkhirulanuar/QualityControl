import { elements } from './domRefs.js';

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

export function displayError(message) {
  elements.errorMessageDiv.textContent = message;
  elements.errorMessageDiv.style.display = 'block';
}

export function clearError() {
  elements.errorMessageDiv.textContent = '';
  elements.errorMessageDiv.style.display = 'none';
}

export function populatePartNameDropdown() {
  elements.partNameInput.innerHTML = '<option value="">-- Select Part Name --</option>';
  const uniquePartNames = [...new Set(partsList.map(part => part.partName))]; // ✅ uses global
  uniquePartNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    elements.partNameInput.appendChild(option);
  });
}
