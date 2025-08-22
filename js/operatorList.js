// js/operatorList.js
// Central list of operators + helper to populate a <select>

const OPERATOR_LIST = [
  "Abdul",
  "Aishah",
  "Bala",
  "Chong",
  "Devi",
  "Hafiz",
  "Nurul",
  "Wei Liang"
];

function populateOperatorDropdown(selectId) {
  const el = document.getElementById(selectId);
  if (!el) return;

  // Keep first placeholder if present
  const firstOption = el.querySelector("option");
  el.innerHTML = "";
  if (firstOption) el.appendChild(firstOption);

  OPERATOR_LIST.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    el.appendChild(opt);
  });
}