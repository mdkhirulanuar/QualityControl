// Loads JSON data into window.appData and signals readiness
window.appData = { operatorList: [], partsList: [] };

async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

async function loadAppData() {
  const [operators, parts] = await Promise.all([
    loadJSON('./data/operatorList.json'),
    loadJSON('./data/partsList.json'),
  ]);
  window.appData.operatorList = operators;
  window.appData.partsList = parts;

  document.dispatchEvent(new CustomEvent('appDataReady', { detail: window.appData }));
}

document.addEventListener('DOMContentLoaded', loadAppData);
