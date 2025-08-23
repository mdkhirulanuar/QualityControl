/*
  InspectWise Go
  Updated: 2025-08-23
  CHANGE: Shift (Day/Night) added to form validation, report preview, and PDF.
  NOTE: This file gracefully uses your existing samplingPlan.js if available.
*/

document.addEventListener('DOMContentLoaded', () => {
  // ---------- Element handles ----------
  const form = document.getElementById('aqlForm');

  // Batch Identification
  const qcInspectorInput = document.getElementById('qcInspector');
  const operatorNameSelect = document.getElementById('operatorName');
  const machineNumberInput = document.getElementById('machineNumber');
  const partNameSelect = document.getElementById('partName');
  const partIdInput = document.getElementById('partId');
  const poNumberInput = document.getElementById('poNumber');
  const productionDateInput = document.getElementById('productionDate');
  const shiftInputs = document.querySelectorAll('input[name="shift"]'); // ✅ NEW Shift radios

  // Lot & Sampling
  const lotSection = document.querySelector('.lot-details');
  const buttonGroup = document.querySelector('.button-group');
  const numBoxesInput = document.getElementById('numBoxes');
  const pcsPerBoxInput = document.getElementById('pcsPerBox');
  const lotSizeInput = document.getElementById('lotSize');
  const aqlSelect = document.getElementById('aql');
  const calculateButton = document.getElementById('calculateButton');
  const resetButton = document.getElementById('resetButton');

  // Output areas
  const resultsDiv = document.getElementById('results');
  const defectChecklistDiv = document.getElementById('defectChecklist');
  const photoCaptureArea = document.getElementById('photoCaptureArea');
  const verdictMessageDiv = document.getElementById('verdictMessage');
  const generateReportButton = document.getElementById('generateReportButton');
  const finalReportAreaDiv = document.getElementById('finalReportArea');
  const reportContentDiv = document.getElementById('reportContent');
  const savePdfButton = document.getElementById('savePdfButton');

  // ---------- Helpers ----------
  const fadeIn = (el) => { if (el) { el.style.display = ''; el.style.opacity = 1; } };
  const fadeOut = (el) => { if (el) { el.style.opacity = 0; el.style.display = 'none'; } };

  const getShiftValue = () => {
    const picked = [...shiftInputs].find(r => r.checked);
    return picked ? picked.value : '';
  };

  const todayStr = () => new Date().toLocaleDateString();
  const nowTimeStr = () => new Date().toLocaleTimeString();

  // If you ship parts/operators lists as globals, populate selects
  (function hydrateDropdownsIfAvailable() {
    try {
      if (window.OPERATORS && Array.isArray(window.OPERATORS)) {
        operatorNameSelect.innerHTML = '<option value="">— Select Operator —</option>' +
          window.OPERATORS.map(o => `<option value="${o}">${o}</option>`).join('');
      }
      if (window.PARTS && Array.isArray(window.PARTS)) {
        partNameSelect.innerHTML = '<option value="">— Select Part —</option>' +
          window.PARTS.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
      }
    } catch (_) {}
  })();

  // When part selected, auto-fill Part ID if PARTS map exists
  partNameSelect?.addEventListener('change', () => {
    if (window.PARTS && Array.isArray(window.PARTS)) {
      const found = window.PARTS.find(p => p.name === partNameSelect.value);
      if (found && partIdInput) partIdInput.value = found.id || '';
    }
    validateBatchSection();
  });

  // ---------- Validation flows ----------
  // Disable downstream UI until batch info is valid
  const disableDownstream = () => {
    [lotSection, buttonGroup, resultsDiv, defectChecklistDiv, photoCaptureArea,
     verdictMessageDiv, finalReportAreaDiv, generateReportButton, savePdfButton]
      .forEach(fadeOut);
    if (calculateButton) calculateButton.disabled = true;
  };

  const validateBatchSection = () => {
    const shiftSelected = !!getShiftValue(); // ✅ NEW
    const isValid =
      (qcInspectorInput?.value || '').trim() !== '' &&
      (operatorNameSelect?.value || '').trim() !== '' &&
      (machineNumberInput?.value || '').trim() !== '' &&
      (partNameSelect?.value || '').trim() !== '' &&
      (partIdInput?.value || '').trim() !== '' &&
      (poNumberInput?.value || '').trim() !== '' &&
      !!productionDateInput?.value &&
      shiftSelected; // ✅ NEW

    if (isValid) {
      fadeIn(lotSection);
      fadeIn(buttonGroup);
    } else {
      disableDownstream();
    }
    return isValid;
  };

  // Validate when any batch field changes
  [qcInspectorInput, operatorNameSelect, machineNumberInput, partNameSelect,
   partIdInput, poNumberInput, productionDateInput].forEach(el => {
    el?.addEventListener('input', validateBatchSection);
    el?.addEventListener('change', validateBatchSection);
  });
  shiftInputs.forEach(r => r.addEventListener('change', validateBatchSection)); // ✅ NEW

  // ---------- Lot & Sampling calculations ----------
  const calcLotSize = () => {
    const boxes = Number(numBoxesInput?.value || 0);
    const pcs = Number(pcsPerBoxInput?.value || 0);
    const lot = Math.max(0, boxes * pcs);
    if (lotSizeInput) lotSizeInput.value = lot;
    return lot;
  };

  const codeLetterByLotSize = (lot) => {
    // ISO 2859-1 / ANSI Z1.4 — General II (typical code-letter bands)
    if (lot <= 0) return '-';
    if (lot <= 8) return 'A';
    if (lot <= 15) return 'B';
    if (lot <= 25) return 'C';
    if (lot <= 50) return 'D';
    if (lot <= 90) return 'E';
    if (lot <= 150) return 'F';
    if (lot <= 280) return 'G';
    if (lot <= 500) return 'H';
    if (lot <= 1200) return 'J';
    if (lot <= 3200) return 'K';
    if (lot <= 10000) return 'L';
    if (lot <= 35000) return 'M';
    if (lot <= 150000) return 'N';
    if (lot <= 500000) return 'P';
    return 'Q';
  };

  const sampleSizeByCodeLetter = (code) => ({
    A: 2, B: 3, C: 5, D: 8, E: 13, F: 20, G: 32, H: 50,
    J: 80, K: 125, L: 200, M: 315, N: 500, P: 800, Q: 1250
  }[code] || 0);

  // Try to use existing samplingPlan.js if available; otherwise return a fallback
  const computeSamplingPlan = (lotSize, aqlStr) => {
    const aql = String(aqlStr || '2.5').trim();

    // 1) Your own helper (samplingPlan.js) — try common names
    try {
      if (window.SAMPLING && typeof window.SAMPLING.getPlan === 'function') {
        const plan = window.SAMPLING.getPlan(lotSize, aql);
        if (plan) return plan;
      }
      if (typeof window.getSamplingPlan === 'function') {
        const plan = window.getSamplingPlan(lotSize, aql);
        if (plan) return plan;
      }
      if (window.SAMPLING_PLAN && typeof window.SAMPLING_PLAN.lookup === 'function') {
        const plan = window.SAMPLING_PLAN.lookup(lotSize, aql);
        if (plan) return plan;
      }
    } catch (_) {}

    // 2) Fallback (code letter + sample size); leave Ac/Re as “—”
    const code = codeLetterByLotSize(lotSize);
    const n = sampleSizeByCodeLetter(code);
    return {
      level: 'General II (Normal)',
      aql,
      codeLetter: code,
      sampleSize: n,
      ac: '—',
      re: '—',
      source: 'fallback'
    };
  };

  // React to lot inputs
  const validateLotSection = () => {
    const lot = calcLotSize();
    const ready = lot > 0 && !!aqlSelect?.value;
    if (calculateButton) calculateButton.disabled = !ready;
    return ready;
  };

  [numBoxesInput, pcsPerBoxInput].forEach(el => {
    el?.addEventListener('input', () => {
      calcLotSize();
      validateLotSection();
    });
  });
  aqlSelect?.addEventListener('change', validateLotSection);

  // ---------- Results rendering ----------
  const renderResults = (plan) => {
    if (!resultsDiv) return;
    const { level, aql, codeLetter, sampleSize, ac, re, source } = plan;

    resultsDiv.innerHTML = `
      <div class="form-section">
        <h2>Sampling Plan</h2>
        <p><strong>Inspection Level:</strong> ${level || 'General II (Normal)'}</p>
        <p><strong>AQL:</strong> ${aql}</p>
        <p><strong>Sample Size Code Letter:</strong> ${codeLetter}</p>
        <p><strong>Sample Size (n):</strong> ${sampleSize}</p>
        <p><strong>Acceptance Number (Ac):</strong> ${ac}</p>
        <p><strong>Rejection Number (Re):</strong> ${re}</p>
        ${source === 'fallback'
          ? `<p style="font-size:12px;color:#777;">(Ac/Re provided by your samplingPlan.js if present; using fallback “—” here.)</p>`
          : ''
        }
      </div>
    `;

    fadeIn(resultsDiv);
    fadeIn(generateReportButton);
  };

  calculateButton?.addEventListener('click', () => {
    if (!validateBatchSection() || !validateLotSection()) return;
    const lot = calcLotSize();
    const plan = computeSamplingPlan(lot, aqlSelect?.value);
    renderResults(plan);
  });

  // ---------- Report generation (preview) ----------
  const buildReportHTML = (plan) => {
    const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;

    const batchBlock = `
      <h3>Batch Identification</h3>
      <p><strong>Report ID:</strong> ${reportId}</p>
      <p><strong>QC Inspector:</strong> ${qcInspectorInput.value || 'N/A'}</p>
      <p><strong>Operator Name:</strong> ${operatorNameSelect.value || 'N/A'}</p>
      <p><strong>Machine No:</strong> ${machineNumberInput.value || 'N/A'}</p>
      <p><strong>Part Name:</strong> ${partNameSelect.value || 'N/A'}</p>
      <p><strong>Part ID:</strong> ${partIdInput.value || 'N/A'}</p>
      <p><strong>PO Number:</strong> ${poNumberInput.value || 'N/A'}</p>
      <p><strong>Production Date:</strong> ${productionDateInput.value || 'N/A'}</p>
      <p><strong>Shift:</strong> ${getShiftValue() || 'N/A'}</p>  <!-- ✅ NEW -->
      <p><strong>Inspection Date:</strong> ${todayStr()}</p>
      <p><strong>Inspection Time:</strong> ${nowTimeStr()}</p>
    `;

    const lotBlock = `
      <h3>Lot & Sampling Details</h3>
      <p><strong>Number of Boxes:</strong> ${numBoxesInput.value || 0}</p>
      <p><strong>Pieces per Box:</strong> ${pcsPerBoxInput.value || 0}</p>
      <p><strong>Lot Size:</strong> ${lotSizeInput.value || 0}</p>
      <p><strong>AQL:</strong> ${plan.aql}</p>
      <p><strong>Inspection Level:</strong> ${plan.level}</p>
      <p><strong>Sample Size Code Letter:</strong> ${plan.codeLetter}</p>
      <p><strong>Sample Size (n):</strong> ${plan.sampleSize}</p>
      <p><strong>Acceptance Number (Ac):</strong> ${plan.ac}</p>
      <p><strong>Rejection Number (Re):</strong> ${plan.re}</p>
    `;

    return `
      <div class="report">
        ${batchBlock}
        ${lotBlock}
      </div>
    `;
  };

  generateReportButton?.addEventListener('click', () => {
    const lot = calcLotSize();
    const plan = computeSamplingPlan(lot, aqlSelect?.value);
    const html = buildReportHTML(plan);
    if (reportContentDiv) reportContentDiv.innerHTML = html;
    fadeIn(finalReportAreaDiv);
    fadeIn(savePdfButton);
    window.scrollTo({ top: finalReportAreaDiv.offsetTop - 20, behavior: 'smooth' });
  });

  // ---------- PDF export ----------
  savePdfButton?.addEventListener('click', () => {
    const lot = calcLotSize();
    const plan = computeSamplingPlan(lot, aqlSelect?.value);

    const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      alert('jsPDF not loaded. Please check your internet connection.');
      return;
    }
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 14;
    let y = 12;

    doc.setFontSize(14);
    doc.text('AQL Sampling Inspection Report', margin, y);
    y += 6;
    doc.setFontSize(10);
    doc.text('KPI-F25 AQL SAMPLING INSPECTION RECORD (Export)', margin, y);
    y += 8;

    // Batch Identification table (includes Shift) ✅
    doc.setFontSize(11);
    doc.text('Batch Identification', margin, y); y += 3;
    doc.autoTable({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10 },
      head: [['Field', 'Value']],
      body: [
        ['Report ID', reportId],
        ['QC Inspector', qcInspectorInput.value || 'N/A'],
        ['Operator Name', operatorNameSelect.value || 'N/A'],
        ['Machine No', machineNumberInput.value || 'N/A'],
        ['Part Name', partNameSelect.value || 'N/A'],
        ['Part ID', partIdInput.value || 'N/A'],
        ['PO Number', poNumberInput.value || 'N/A'],
        ['Production Date', productionDateInput.value || 'N/A'],
        ['Shift', getShiftValue() || 'N/A'], // ✅ NEW
        ['Inspection Date', todayStr()],
        ['Inspection Time', nowTimeStr()]
      ]
    });
    y = doc.lastAutoTable.finalY + 6;

    // Sampling Plan table
    doc.text('Lot & Sampling Details', margin, y); y += 3;
    doc.autoTable({
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10 },
      head: [['Field', 'Value']],
      body: [
        ['Number of Boxes', numBoxesInput.value || '0'],
        ['Pieces per Box', pcsPerBoxInput.value || '0'],
        ['Lot Size', lotSizeInput.value || '0'],
        ['AQL', plan.aql],
        ['Inspection Level', plan.level],
        ['Sample Size Code Letter', plan.codeLetter],
        ['Sample Size (n)', String(plan.sampleSize)],
        ['Acceptance Number (Ac)', String(plan.ac)],
        ['Rejection Number (Re)', String(plan.re)]
      ]
    });

    doc.save(`KPI-F25_Report_${reportId}.pdf`);
  });

  // ---------- Reset ----------
  resetButton?.addEventListener('click', () => {
    form?.reset();
    lotSizeInput.value = 0;
    disableDownstream();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Initial state
  disableDownstream();
  validateBatchSection();
  validateLotSection();
});
