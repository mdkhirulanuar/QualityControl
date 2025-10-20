// inspectorList.js
// Provides a list of inspectors and a helper to populate a select element.
// The list can be updated as inspectors join or leave the team.
// Expose globally so it can be used without module imports.

window.INSPECTOR_LIST = [
  "Khirul Anuar",
  "Dharisini"
];

/**
 * Populates a <select> element with inspector names.
 * The select must exist in the DOM.
 * @param {string} selectId The id of the select element to populate
 */
window.populateInspectorDropdown = function populateInspectorDropdown(selectId) {
  const el = document.getElementById(selectId);
  if (!el) return;
  const firstOption = el.querySelector('option');
  el.innerHTML = '';
  if (firstOption) el.appendChild(firstOption);
  window.INSPECTOR_LIST.forEach((name) => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    el.appendChild(opt);
  });
};