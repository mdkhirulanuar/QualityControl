// utils.js — Common utility functions

export function populatePartNameDropdown(partNameInput, partsList) {
  partNameInput.innerHTML = '<option value="">-- Select Part Name --</option>';
  const uniquePartNames = [...new Set(partsList.map(part => part.partName))];
  uniquePartNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    partNameInput.appendChild(option);
  });
}

export function displayError(message, errorMessageDiv) {
  errorMessageDiv.textContent = message;
  errorMessageDiv.style.display = 'block';
}

export function clearError(errorMessageDiv) {
  errorMessageDiv.textContent = '';
  errorMessageDiv.style.display = 'none';
}
