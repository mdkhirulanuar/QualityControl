// js/customerList.js
// Central list + helper for Customer Name dropdown

const CUSTOMER_LIST = [
  "KHIND Mistral",
  "Scent Pure",
  "Vitar",
  "Rezo"
];

function populateCustomerDropdown(selectId) {
  const selectEl = document.getElementById(selectId);
  if (!selectEl) return;

  // Keep the first placeholder option (if present), then rebuild
  const first = selectEl.querySelector("option");
  selectEl.innerHTML = "";
  if (first) selectEl.appendChild(first);

  CUSTOMER_LIST.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    selectEl.appendChild(opt);
  });
}