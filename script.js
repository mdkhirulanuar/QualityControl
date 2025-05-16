// script.js
// Remaining logic: defects, photos, report, validation — integrated with modules

import { elements } from './domRefs.js';
import { state } from './state.js';
import { fadeIn, fadeOut, displayError, clearError } from './ui.js';
import { qcMonitorContact, copyrightNotice } from './config.js';

/* ---------------------- Submit Defects Verdict Logic ---------------------- */
elements.submitDefectsButton.addEventListener('click', () => {
  clearError(elements.errorMessageDiv);
  const defectsFound = parseInt(elements.defectsFoundInput.value, 10);
  const plan = state.currentSamplingPlan;

  if (!plan || isNaN(defectsFound) || defectsFound < 0) {
    displayError('Please calculate sampling plan and enter valid number of defects.', elements.errorMessageDiv);
    return;
  }

  const isRejected = defectsFound > plan.accept;
  const verdict = isRejected ? 'REJECTED 🔴' : 'ACCEPTED 🟢';
  const message = isRejected
    ? `This batch is REJECTED due to ${defectsFound} defects, exceeding rejection threshold (≥ ${plan.reject}). This batch requires 100% inspection.`
    : `This batch is ACCEPTED with ${defectsFound} defects, within acceptance limit (≤ ${plan.accept}).`;

  elements.verdictMessageDiv.innerHTML = `
    <div class="${isRejected ? 'reject' : 'accept'}">
      <strong>${verdict}</strong><br>${message}
      ${isRejected ? `<br><small>Notify QC Executive immediately for further action</small>` : ''}
    </div>
  `;

  fadeIn(elements.verdictMessageDiv);
  fadeIn(elements.defectChecklistDiv);
  if (isRejected) {
    fadeIn(elements.photoCaptureArea);
    elements.generateReportButton.style.display = 'none';
  } else {
    fadeOut(elements.photoCaptureArea);
    fadeIn(elements.generateReportButton);
  }
});

/* ---------------------- Photo Upload & Annotation ---------------------- */
function updatePhotoPreview() {
  const count = state.capturedPhotos.length;
  elements.photoPreview.innerHTML = count === 0
    ? '<p>No photos added yet.</p>'
    : state.capturedPhotos.map((photo, index) => `
        <img src="${photo}" data-index="${index}" alt="Photo ${index + 1}" title="Click to annotate or remove">
      `).join('');
  elements.photoCount.textContent = `Photos: ${count}/${state.MAX_PHOTOS}`;
  elements.uploadMultiplePhotosInput.disabled = count >= state.MAX_PHOTOS;
}

function addPhoto(base64) {
  if (state.capturedPhotos.length >= state.MAX_PHOTOS) {
    displayError(`Maximum ${state.MAX_PHOTOS} photos reached.`, elements.errorMessageDiv);
    return;
  }
  state.capturedPhotos.push(base64);
  updatePhotoPreview();
}

function removePhoto(index) {
  state.capturedPhotos.splice(index, 1);
  updatePhotoPreview();
}

function handleFileUpload(files) {
  const images = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (images.length === 0) {
    displayError('Only image files are allowed.', elements.errorMessageDiv);
    return;
  }

  images.forEach(file => {
    if (state.capturedPhotos.length >= state.MAX_PHOTOS) return;
    const reader = new FileReader();
    reader.onload = () => addPhoto(reader.result);
    reader.onerror = () => displayError('Photo read failed.', elements.errorMessageDiv);
    reader.readAsDataURL(file);
  });
}

// Photo click → Annotate or Remove
elements.photoPreview.addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    const index = parseInt(e.target.dataset.index, 10);
    const action = prompt('Type "annotate" or "remove"');

    if (action === 'annotate') {
      alert('Annotation feature requires full modular photo.js implementation.');
      // Future: open annotation modal here
    } else if (action === 'remove') {
      if (confirm('Delete this photo?')) removePhoto(index);
    }
  }
});

elements.uploadMultiplePhotosInput.addEventListener('change', (e) => {
  handleFileUpload(e.target.files);
});

/* ---------------------- Generate Report (HTML + PDF) ---------------------- */
elements.generateReportButton.addEventListener('click', () => {
  const plan = state.currentSamplingPlan;
  const defects = parseInt(elements.defectsFoundInput.value, 10);
  const defectTypes = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
    .map(cb => cb.value);

  const verdict = defects <= plan.accept ? 'ACCEPT' : 'REJECT';
  const verdictColor = verdict === 'ACCEPT' ? 'green' : 'red';

  elements.reportContentDiv.innerHTML = `
    <h3>Inspection Report</h3>
    <p><strong>Verdict:</strong> <span style="color:${verdictColor}">${verdict}</span></p>
    <p><strong>Defects Found:</strong> ${defects}</p>
    <p><strong>Acceptance Number:</strong> ${plan.accept}</p>
    <p><strong>Rejection Number:</strong> ${plan.reject}</p>
    <h4>Defect Types</h4>
    ${defectTypes.length ? `<ul>${defectTypes.map(d => `<li>${d}</li>`).join('')}</ul>` : '<p>No defects recorded.</p>'}
    <h4>Photos</h4>
    ${state.capturedPhotos.length
      ? state.capturedPhotos.map((p, i) => `<p>Photo ${i + 1}</p><img src="${p}" style="max-width:200px;">`).join('')
      : '<p>No photos provided.</p>'
    }
    <p>${copyrightNotice}</p>
  `;
  fadeIn(elements.finalReportAreaDiv);
  fadeIn(elements.savePdfButton);
  fadeIn(elements.printButton);
});

/* ---------------------- Save PDF ---------------------- */
elements.savePdfButton.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(16);
  doc.text("QC Inspection Report", 10, y);
  y += 10;

  doc.setFontSize(12);
  doc.autoTable({
    startY: y,
    head: [['Field', 'Value']],
    body: [
      ['Verdict', elements.defectsFoundInput.value <= state.currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT'],
      ['Defects Found', elements.defectsFoundInput.value],
      ['Acceptance', state.currentSamplingPlan.accept],
      ['Rejection', state.currentSamplingPlan.reject],
    ],
    theme: 'grid',
  });
  y = doc.lastAutoTable.finalY + 10;

  doc.text("Defect Types", 10, y);
  y += 6;
  const types = Array.from(document.querySelectorAll('input[name="defect_type"]:checked')).map(cb => cb.value);
  types.forEach(type => {
    doc.text(`- ${type}`, 10, y);
    y += 6;
  });

  y += 10;
  doc.text("Photo Evidence", 10, y);
  y += 6;
  state.capturedPhotos.forEach((img, i) => {
    doc.text(`Photo ${i + 1}`, 10, y);
    y += 5;
    try {
      doc.addImage(img, 'JPEG', 10, y, 50, 50);
      y += 55;
    } catch {
      doc.text("Unable to load photo", 10, y);
      y += 7;
    }
  });

  y += 10;
  doc.text("QC Contact", 10, y);
  y += 6;
  doc.text(qcMonitorContact, 10, y);

  doc.save(`QC_Report_${Date.now()}.pdf`);
});

/* ---------------------- Print Report ---------------------- */
elements.printButton.addEventListener('click', () => {
  window.print();
});
