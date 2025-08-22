// js/operatorList.js
// Central list of operators + helper to populate a <select>

const OPERATOR_LIST = [
  "Md Repon Hossen",
  "Sree Sukumar Shil",
  "Md Ashik Ali",
  "Salek Abdus",
  "Ahmod Naim",
  "Naim",
  "Md Tohidul Islam",
  "Mozid Mohammad Abdul",
  "Suman Mia",
  "Md Beltu Ali",
  "Abu Talib",
  "Aye Aye Aung",
  "Khin Hlaing San",
  "Thet Mar Htwe"
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
