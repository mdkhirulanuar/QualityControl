// brandList.js
// Defines a list of brand names for the KPI‑F18 inspection form.
// Brands can be extended as new product lines are introduced.

window.BRAND_LIST = [
  'Vitar',
  'Scent Pur',
  'Khind'
];

/**
 * Populates a <select> element with brand names.
 * @param {string} selectId The id of the select element to populate
 */
window.populateBrandDropdown = function populateBrandDropdown(selectId) {
  const el = document.getElementById(selectId);
  if (!el) return;
  const firstOption = el.querySelector('option');
  el.innerHTML = '';
  if (firstOption) el.appendChild(firstOption);
  window.BRAND_LIST.forEach((brand) => {
    const opt = document.createElement('option');
    opt.value = brand;
    opt.textContent = brand;
    el.appendChild(opt);
  });
};