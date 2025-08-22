// js/supplierList.js
// Central list + helper for Supplier Name dropdown

const SUPPLIER_LIST = [
  "KHIND Mistral",
  "Scent Pure",
  "Vitar",
  "Rezo"
];

function populateSupplierDropdown(selectId) {
  const selectEl = document.getElementById(selectId);
  if (!selectEl) return;

  // Keep the first placeholder option (if present), then rebuild
  const first = selectEl.querySelector("option");
  selectEl.innerHTML = "";
  if (first) selectEl.appendChild(first);

  SUPPLIER_LIST.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    selectEl.appendChild(opt);
  });
}