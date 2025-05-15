import { elements } from './domRefs.js';
import { capturedPhotos } from './photo.js';
import { copyrightNotice, qcMonitorContact } from './config.js';

export function displayVerdict(defectsFound, plan) {
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

export function generateReportHTML(reportId, plan, defectsFound, selectedDefects, aqlValue) {
  const aqlText =
    aqlValue === '1.0' ? 'High Quality (AQL 1.0%)' :
    aqlValue === '2.5' ? 'Medium Quality (AQL 2.5%)' :
    aqlValue === '4.0' ? 'Low Quality (AQL 4.0%)' :
    `AQL ${aqlValue}%`;

  const lotSize = parseInt(elements.lotSizeInput.value, 10);
  const inspectionNote = lotSize && plan.sampleSize >= lotSize
    ? `<p style="color: orange; font-weight: bold;">Note: 100% inspection required/performed.</p>`
    : '';

  const verdictText = defectsFound <= plan.accept ? 'ACCEPT' : 'REJECT';
  const verdictColor = verdictText === 'ACCEPT' ? 'green' : 'red';

  return `
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
    <p><strong>Acceptable Quality Level:</strong> ${aqlText}</p>
    <p><strong>Sample Size Code Letter:</strong> ${plan.codeLetter}</p>
    <p><strong>Sample Size Inspected:</strong> ${plan.sampleSize}</p>
    ${inspectionNote}
    <p><strong>Acceptance Number (Ac):</strong> ${plan.accept}</p>
    <p><strong>Rejection Number (Re):</strong> ${plan.reject}</p>

    <h3>Inspection Results</h3>
    <p><strong>Number of Defects Found:</strong> ${defectsFound}</p>
    <p><strong>Verdict:</strong> <strong style="color: ${verdictColor};">${verdictText}</strong></p>

    <h3>Observed Defect Types</h3>
    ${selectedDefects.length > 0
      ? `<ul>${selectedDefects.map(defect => `<li>${defect}</li>`).join('')}</ul>`
      : '<p>No specific defect types recorded.</p>'}

    <h3>Photo Documentation</h3>
    ${capturedPhotos.length > 0
      ? capturedPhotos.map((photo, index) => `
          <p>Photo ${index + 1}:</p>
          <img src="${photo}" style="max-width: 200px; border-radius: 8px;">
        `).join('')
      : '<p>No photos added.</p>'}

    <p>${copyrightNotice}</p>
  `;
}

export function renderReportToPage(html) {
  elements.reportContentDiv.innerHTML = html;
  elements.finalReportAreaDiv.style.display = 'block';
  elements.savePdfButton.style.display = 'block';
  elements.printButton.style.display = 'block';
}

export function saveReportAsPdf(reportId, plan, defectsFound, selectedDefects, aqlValue) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const margin = 10;
  let y = 20;

  doc.setFontSize(16);
  doc.text("Quality Control Inspection Report", margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.autoTable({
    startY: y,
    head: [['Field', 'Value']],
    body: [
      ['Report ID', reportId],
      ['QC Inspector', elements.qcInspectorInput.value],
      ['Machine No', elements.machineNumberInput.value],
      ['Part ID', elements.partIdInput.value],
      ['Part Name', elements.partNameInput.value],
      ['PO Number', elements.poNumberInput.value],
      ['Production Date', elements.productionDateInput.value],
      ['Inspection Date', new Date().toLocaleDateString()],
      ['Inspection Time', new Date().toLocaleTimeString()]
    ],
    theme: 'grid'
  });
  y = doc.lastAutoTable.finalY + 10;

  doc.text("Sampling Details & Plan", margin, y);
  y += 5;

  const aqlText =
    aqlValue === '1.0' ? 'High Quality (AQL 1.0%)' :
    aqlValue === '2.5' ? 'Medium Quality (AQL 2.5%)' :
    aqlValue === '4.0' ? 'Low Quality (AQL 4.0%)' :
    `AQL ${aqlValue}%`;

  const lotSize = parseInt(elements.lotSizeInput.value, 10);

  doc.autoTable({
    startY: y,
    head: [['Field', 'Value']],
    body: [
      ['Total Lot Size', lotSize],
      ['Inspection Level', 'General Level II (Normal)'],
      ['Acceptable Quality Level', aqlText],
      ['Sample Size Code Letter', plan.codeLetter],
      ['Sample Size Inspected', plan.sampleSize],
      ...(plan.sampleSize >= lotSize ? [['Note', '100% inspection required/performed.']] : []),
      ['Acceptance Number (Ac)', plan.accept],
      ['Rejection Number (Re)', plan.reject]
    ],
    theme: 'grid'
  });
  y = doc.lastAutoTable.finalY + 10;

  doc.text("Inspection Results", margin, y);
  y += 5;
  doc.autoTable({
    startY: y,
    head: [['Field', 'Value']],
    body: [
      ['Number of Defects Found', defectsFound],
      ['Verdict', defectsFound <= plan.accept ? 'ACCEPT' : 'REJECT']
    ],
    theme: 'grid'
  });
  y = doc.lastAutoTable.finalY + 10;

  doc.text("Observed Defect Types", margin, y);
  y += 7;
  if (selectedDefects.length > 0) {
    selectedDefects.forEach(defect => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.text(`- ${defect}`, margin, y);
      y += 7;
    });
  } else {
    doc.text("No specific defect types recorded.", margin, y);
    y += 7;
  }

  y += 10;
  doc.text("Photo Documentation", margin, y);
  y += 7;
  if (capturedPhotos.length > 0) {
    capturedPhotos.forEach((photo, index) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.text(`Photo ${index + 1}:`, margin, y);
      y += 5;
      try {
        doc.addImage(photo, 'JPEG', margin, y, 50, 50);
        y += 55;
      } catch (err) {
        doc.text("(Photo could not be included)", margin, y);
        y += 7;
      }
    });
  } else {
    doc.text("No photos added.", margin, y);
    y += 7;
  }

  y += 10;
  if (y > 260) { doc.addPage(); y = 20; }
  doc.text("Ownership", margin, y);
  y += 7;
  doc.text(copyrightNotice, margin, y, { maxWidth: 190 });

  doc.save(`${reportId}.pdf`);
  alert(`PDF report saved. Please send the PDF with Report ID ${reportId} to ${qcMonitorContact}.`);
}

export function printReport() {
  window.print();
}
