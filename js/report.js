import { elements } from './domRefs.js';
import { state } from './state.js';
import { copyrightNotice, qcMonitorContact } from './config.js';

export function displayVerdict(defectsFound) {
  const plan = state.currentSamplingPlan;
  const isRejected = defectsFound > plan.accept;
  const verdict = isRejected ? 'REJECTED 🔴' : 'ACCEPTED 🟢';
  const message = isRejected
    ? `This batch is REJECTED due to ${defectsFound} defects, exceeding rejection threshold (≥ ${plan.reject}). This batch requires 100% inspection.`
    : `This batch is ACCEPTED as it has ${defectsFound} defects, within acceptance limit (≤ ${plan.accept}).`;

  elements.verdictMessageDiv.innerHTML = `
    <div class="${isRejected ? 'reject' : 'accept'}">
      <strong>${verdict}</strong><br>${message}
      ${isRejected ? `<br><small>Notify QC Executive immediately for further action</small>` : ''}
    </div>
  `;

  elements.verdictMessageDiv.style.display = 'block';
  elements.defectChecklistDiv.style.display = 'block';

  if (isRejected) {
    elements.photoCaptureArea.style.display = 'block';
    elements.generateReportButton.style.display = 'none';
  } else {
    elements.photoCaptureArea.style.display = 'none';
    elements.generateReportButton.style.display = 'block';
  }
}

export function generateReport() {
  if (!state.currentSamplingPlan) return;

  const defectsFound = parseInt(elements.defectsFoundInput.value, 10) || 0;
  const verdictText = defectsFound <= state.currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT';
  const verdictColor = verdictText === 'ACCEPT' ? 'green' : 'red';
  const reportId = `Report_${elements.partIdInput.value || 'NoID'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,8).replace(/:/g,'')}`;

  const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked')).map(cb => cb.value);
  const lotSize = parseInt(elements.lotSizeInput.value, 10);
  const aqlValue = elements.aqlSelect.value;

  const aqlText = aqlValue === '1.0' ? 'High (1.0%)' :
                  aqlValue === '2.5' ? 'Medium (2.5%)' :
                  aqlValue === '4.0' ? 'Low (4.0%)' :
                  `AQL ${aqlValue}%`;

  const inspectionNote = state.currentSamplingPlan.sampleSize >= lotSize
    ? `<p style="color: orange; font-weight: bold;">Note: 100% inspection required/performed.</p>` : '';

  const photoSection = state.capturedPhotos.length > 0
    ? state.capturedPhotos.map((photo, i) => `<p>Photo ${i + 1}:</p><img src="${photo}" style="max-width: 200px; border-radius: 8px;">`).join('')
    : '<p>No photos added.</p>';

  const reportHTML = `
    <h3>Batch Identification</h3>
    <p><strong>Report ID:</strong> ${reportId}</p>
    <p><strong>QC Inspector:</strong> ${elements.qcInspectorInput.value}</p>
    <p><strong>Machine No:</strong> ${elements.machineNumberInput.value}</p>
    <p><strong>Part Name:</strong> ${elements.partNameInput.value}</p>
    <p><strong>Part ID:</strong> ${elements.partIdInput.value}</p>
    <p><strong>PO Number:</strong> ${elements.poNumberInput.value}</p>
    <p><strong>Production Date:</strong> ${elements.productionDateInput.value}</p>
    <p><strong>Inspection Date:</strong> ${new Date().toLocaleDateString()}</p>
    <p><strong>Inspection Time:</strong> ${new Date().toLocaleTimeString()}</p>

    <h3>Sampling Details & Plan</h3>
    <p><strong>Total Lot Size:</strong> ${lotSize}</p>
    <p><strong>Inspection Level:</strong> General Level II (Normal)</p>
    <p><strong>AQL Level:</strong> ${aqlText}</p>
    <p><strong>Sample Size Code:</strong> ${state.currentSamplingPlan.codeLetter}</p>
    <p><strong>Sample Size Inspected:</strong> ${state.currentSamplingPlan.sampleSize}</p>
    ${inspectionNote}
    <p><strong>Acceptance Number (Ac):</strong> ${state.currentSamplingPlan.accept}</p>
    <p><strong>Rejection Number (Re):</strong> ${state.currentSamplingPlan.reject}</p>

    <h3>Inspection Results</h3>
    <p><strong>Defects Found:</strong> ${defectsFound}</p>
    <p><strong>Verdict:</strong> <span style="color: ${verdictColor}; font-weight: bold;">${verdictText}</span></p>

    <h3>Defect Types</h3>
    ${selectedDefects.length > 0
      ? `<ul>${selectedDefects.map(defect => `<li>${defect}</li>`).join('')}</ul>`
      : '<p>No specific defect types recorded.</p>'}

    <h3>Photo Documentation</h3>
    ${photoSection}

    <p>${copyrightNotice}</p>
  `;

  elements.reportContentDiv.innerHTML = reportHTML;
  elements.finalReportAreaDiv.style.display = 'block';
  elements.savePdfButton.style.display = 'block';
  elements.printButton.style.display = 'block';
}

export function saveReportAsPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const margin = 10;
  let y = 20;

  doc.setFontSize(16);
  doc.text("Quality Control Inspection Report", margin, y);
  y += 10;

  const reportId = `Report_${elements.partIdInput.value || 'NoID'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,8).replace(/:/g,'')}`;
  const aqlValue = elements.aqlSelect.value;

  const aqlText = aqlValue === '1.0' ? 'High (1.0%)' :
                  aqlValue === '2.5' ? 'Medium (2.5%)' :
                  aqlValue === '4.0' ? 'Low (4.0%)' :
                  `AQL ${aqlValue}%`;

  const lotSize = parseInt(elements.lotSizeInput.value, 10);
  const defectsFound = parseInt(elements.defectsFoundInput.value, 10) || 0;

  doc.setFontSize(12);
  doc.autoTable({
    startY: y,
    head: [['Field', 'Value']],
    body: [
      ['Report ID', reportId],
      ['QC Inspector', elements.qcInspectorInput.value],
      ['Machine No', elements.machineNumberInput.value],
      ['Part Name', elements.partNameInput.value],
      ['Part ID', elements.partIdInput.value],
      ['PO Number', elements.poNumberInput.value],
      ['Production Date', elements.productionDateInput.value],
      ['Inspection Date', new Date().toLocaleDateString()],
      ['Inspection Time', new Date().toLocaleTimeString()],
      ['Lot Size', lotSize],
      ['AQL Level', aqlText],
      ['Sample Size Code', state.currentSamplingPlan.codeLetter],
      ['Sample Size Inspected', state.currentSamplingPlan.sampleSize],
      ...(state.currentSamplingPlan.sampleSize >= lotSize ? [['Note', '100% inspection required']] : []),
      ['Ac', state.currentSamplingPlan.accept],
      ['Re', state.currentSamplingPlan.reject],
      ['Defects Found', defectsFound],
      ['Verdict', defectsFound <= state.currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT']
    ],
    theme: 'grid'
  });

  let yAfter = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Observed Defect Types", margin, yAfter);
  yAfter += 7;

  const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked')).map(cb => cb.value);
  if (selectedDefects.length > 0) {
    selectedDefects.forEach(defect => {
      if (yAfter > 270) {
        doc.addPage(); yAfter = 20;
      }
      doc.text(`- ${defect}`, margin, yAfter);
      yAfter += 6;
    });
  } else {
    doc.text("No specific defect types recorded.", margin, yAfter);
    yAfter += 6;
  }

  yAfter += 8;
  doc.text("Ownership", margin, yAfter);
  yAfter += 6;
  doc.text(copyrightNotice, margin, yAfter, {
    maxWidth: 190
  });

  doc.save(`${reportId}.pdf`);
  alert(`PDF report saved.\nPlease send to ${qcMonitorContact}`);
}

export function printReport() {
  window.print();
}
