document.addEventListener('DOMContentLoaded', function() {
  // --- DOM Element Selection ---
  const aqlForm = document.getElementById('aqlForm');
  const qcInspectorInput = document.getElementById('qcInspector');
  const operatorNameInput = document.getElementById('operatorName');
  const machineNumberInput = document.getElementById('machineNumber');
  const partNameInput = document.getElementById('partName');
  const partIdInput = document.getElementById('partId');
  const numBoxesInput = document.getElementById('numBoxes');
  const pcsPerBoxInput = document.getElementById('pcsPerBox');
  const lotSizeInput = document.getElementById('lotSize');
  const aqlSelect = document.getElementById('aql');
  const calculateButton = document.getElementById('calculateButton');
  const resetButton = document.getElementById('resetButton');
  const resultsDiv = document.getElementById('results');
  const defectsInputArea = document.getElementById('defectsInputArea');
  const defectsFoundInput = document.getElementById('defectsFound');
  const submitDefectsButton = document.getElementById('submitDefectsButton');
  const photoCaptureArea = document.getElementById('photoCaptureArea');
  const captureSinglePhotoButton = document.getElementById('captureSinglePhotoButton');
  const captureMultiplePhotosButton = document.getElementById('captureMultiplePhotosButton');
  const uploadSinglePhotoInput = document.getElementById('uploadSinglePhoto');
  const uploadMultiplePhotosInput = document.getElementById('uploadMultiplePhotos');
  const dragDropArea = document.getElementById('dragDropArea');
  const photoPreview = document.getElementById('photoPreview');
  const photoCount = document.getElementById('photoCount');
  const verdictMessageDiv = document.getElementById('verdictMessage');
  const defectChecklistDiv = document.getElementById('defectChecklist');
  const generateReportButton = document.getElementById('generateReportButton');
  const finalReportAreaDiv = document.getElementById('finalReportArea');
  const reportContentDiv = document.getElementById('reportContent');
  const savePdfButton = document.getElementById('savePdfButton');
  const saveExcelButton = document.getElementById('saveExcelButton');
  const printButton = document.getElementById('printButton');
  const errorMessageDiv = document.getElementById('error-message');

  // --- State Variables ---
  let currentSamplingPlan = null; // To store { codeLetter, sampleSize, accept, reject }
  let capturedPhotos = []; // Array to store photo data (base64 strings)
  const MAX_PHOTOS = 5; // Maximum number of photos allowed

  // --- AQL Data & Logic (Simplified & Based on Khirul's List) ---
  const sampleSizeCodeLetters_Level_II = {
    '2-8': 'A', '9-15': 'B', '16-25': 'C', '26-50': 'D', '51-90': 'E',
    '91-150': 'F', '151-280': 'G', '281-500': 'H', '501-1200': 'J',
    '1201-3200': 'K', '3201-10000': 'L', '10001-35000': 'M',
    '35001-150000': 'N', '150001-500000': 'P', '500001+': 'Q'
  };

  const aqlMasterTable_Simplified = {
    'A': { sampleSize: 2, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
    'B': { sampleSize: 3, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
    'C': { sampleSize: 5, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
    'D': { sampleSize: 8, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 1, re: 2 } } },
    'E': { sampleSize: 13, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 1, re: 2 }, '4.0': { ac: 1, re: 2 } } },
    'F': { sampleSize: 20, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 1, re: 2 }, '4.0': { ac: 2, re: 3 } } },
    'G': { sampleSize: 32, plans: { '1.0': { ac: 1, re: 2 }, '2.5': { ac: 2, re: 3 }, '4.0': { ac: 3, re: 4 } } },
    'H': { sampleSize: 50, plans: { '1.0': { ac: 1, re: 2 }, '2.5': { ac: 3, re: 4 }, '4.0': { ac: 5, re: 6 } } },
    'J': { sampleSize: 80, plans: { '1.0': { ac: 2, re: 3 }, '2.5': { ac: 5, re: 6 }, '4.0': { ac: 7, re: 8 } } },
    'K': { sampleSize: 125, plans: { '1.0': { ac: 3, re: 4 }, '2.5': { ac: 7, re: 8 }, '4.0': { ac: 10, re: 11 } } },
    'L': { sampleSize: 200, plans: { '1.0': { ac: 5, re: 6 }, '2.5': { ac: 10, re: 11 }, '4.0': { ac: 14, re: 15 } } },
    'M': { sampleSize: 315, plans: { '1.0': { ac: 7, re: 8 }, '2.5': { ac: 14, re: 15 }, '4.0': { ac: 21, re: 22 } } },
    'N': { sampleSize: 500, plans: { '1.0': { ac: 10, re: 11 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } },
    'P': { sampleSize: 800, plans: { '1.0': { ac: 14, re: 15 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } },
    'Q': { sampleSize: 1250, plans: { '1.0': { ac: 21, re: 22 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } },
    'R': { sampleSize: 2000, plans: { '1.0': { ac: 21, re: 22 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } }
  };

  // --- Helper Functions ---
  function displayError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
  }

  function clearError() {
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
  }

  function getLotSizeRange(lotSize) {
    if (lotSize >= 2 && lotSize <= 8) return '2-8';
    if (lotSize >= 9 && lotSize <= 15) return '9-15';
    if (lotSize >= 16 && lotSize <= 25) return '16-25';
    if (lotSize >= 26 && lotSize <= 50) return '26-50';
    if (lotSize >= 51 && lotSize <= 90) return '51-90';
    if (lotSize >= 91 && lotSize <= 150) return '91-150';
    if (lotSize >= 151 && lotSize <= 280) return '151-280';
    if (lotSize >= 281 && lotSize <= 500) return '281-500';
    if (lotSize >= 501 && lotSize <= 1200) return '501-1200';
    if (lotSize >= 1201 && lotSize <= 3200) return '1201-3200';
    if (lotSize >= 3201 && lotSize <= 10000) return '3201-10000';
    if (lotSize >= 10001 && lotSize <= 35000) return '10001-35000';
    if (lotSize >= 35001 && lotSize <= 150000) return '35001-150000';
    if (lotSize >= 150001 && lotSize <= 500000) return '150001-500000';
    if (lotSize >= 500001) return '500001+';
    return null;
  }

  function calculateLotSize() {
    const numBoxes = parseInt(numBoxesInput.value, 10);
    const pcsPerBox = parseInt(pcsPerBoxInput.value, 10);
    if (!isNaN(numBoxes) && numBoxes > 0 && !isNaN(pcsPerBox) && pcsPerBox > 0) {
      lotSizeInput.value = numBoxes * pcsPerBox;
    } else {
      lotSizeInput.value = '';
    }
  }

  // --- Core Calculation Function ---
  function calculateSamplingPlan() {
    clearError();
    const lotSize = parseInt(lotSizeInput.value, 10);
    const aqlValue = aqlSelect.value;

    if (isNaN(lotSize) || lotSize <= 0) {
      displayError('Please enter valid Number of Boxes and Pieces per Box to calculate Lot Size.');
      return null;
    }
    if (lotSize < 2) {
      displayError('Lot Size must be 2 or greater for standard AQL sampling.');
      return null;
    }
    if (!['1.0', '2.5', '4.0'].includes(aqlValue)) {
      displayError('Invalid AQL selected. Please choose High (1.0%), Medium (2.5%), or Low (4.0%).');
      return null;
    }

    const lotRange = getLotSizeRange(lotSize);
    if (!lotRange) {
      displayError('Lot size is outside the standard range defined in the table.');
      return null;
    }
    const codeLetter = sampleSizeCodeLetters_Level_II[lotRange];
    if (!codeLetter) {
      displayError(`Could not determine Sample Size Code Letter for Lot Size ${lotSize} (using Level II).`);
      return null;
    }

    const planData = aqlMasterTable_Simplified[codeLetter];
    if (!planData || !planData.plans) {
      displayError(`Internal Error: AQL data not found for Code Letter ${codeLetter}.`);
      return null;
    }

    const sampleSize = planData.sampleSize;
    const planDetails = planData.plans[aqlValue];

    if (!planDetails || typeof planDetails.ac === 'undefined' || typeof planDetails.re === 'undefined') {
      displayError(`Internal Error: Ac/Re values not found for Code Letter ${codeLetter} and AQL ${aqlValue}. Check table data.`);
      return null;
    }

    if (sampleSize >= lotSize) {
      console.warn(`Warning: Sample Size (${sampleSize}) equals or exceeds Lot Size (${lotSize}). Standard recommends 100% inspection.`);
    }

    return {
      codeLetter: codeLetter,
      sampleSize: sampleSize,
      accept: planDetails.ac,
      reject: planDetails.re
    };
  }

  // --- Fade In/Out Helpers ---
  function fadeIn(element) {
    element.style.opacity = 0;
    element.style.display = 'block';
    let op = 0;
    const timer = setInterval(() => {
      if (op >= 1) clearInterval(timer);
      element.style.opacity = op;
      op += 0.1;
    }, 30);
  }

  function fadeOut(element) {
    let op = 1;
    const timer = setInterval(() => {
      if (op <= 0) {
        clearInterval(timer);
        element.style.display = 'none';
      }
      element.style.opacity = op;
      op -= 0.1;
    }, 30);
  }

  // --- Photo Handling Functions ---
  function updatePhotoPreview() {
    photoPreview.innerHTML = capturedPhotos.length === 0
      ? '<p>No photos added yet.</p>'
      : capturedPhotos.map((photo, index) => `
          <img src="${photo}" alt="Photo ${index + 1}" data-index="${index}" title="Click to remove">
        `).join('');
    photoCount.textContent = `Photos: ${capturedPhotos.length}/${MAX_PHOTOS}`;
    if (capturedPhotos.length >= MAX_PHOTOS) {
      captureSinglePhotoButton.disabled = true;
      captureMultiplePhotosButton.disabled = true;
      uploadSinglePhotoInput.disabled = true;
      uploadMultiplePhotosInput.disabled = true;
      dragDropArea.classList.add('disabled');
    } else {
      captureSinglePhotoButton.disabled = false;
      captureMultiplePhotosButton.disabled = false;
      uploadSinglePhotoInput.disabled = false;
      uploadMultiplePhotosInput.disabled = false;
      dragDropArea.classList.remove('disabled');
    }
  }

  function addPhoto(base64) {
    if (capturedPhotos.length >= MAX_PHOTOS) {
      displayError(`Maximum ${MAX_PHOTOS} photos reached.`);
      return false;
    }
    capturedPhotos.push(base64);
    updatePhotoPreview();
    clearError();
    return true;
  }

  function removePhoto(index) {
    capturedPhotos.splice(index, 1);
    updatePhotoPreview();
    clearError();
  }

  function capturePhotoFromCamera(multiple = false) {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const captureButton = document.createElement('button');
    captureButton.textContent = 'Capture Photo';
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8); display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 1000;
    `;
    video.style.maxWidth = '90%';
    captureButton.style.cssText = closeButton.style.cssText = `
      margin: 10px; padding: 10px 20px; font-size: 1rem; color: white;
      background: #2575fc; border: none; border-radius: 8px; cursor: pointer;
    `;
    modal.append(video, captureButton, closeButton);
    document.body.appendChild(modal);

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        video.srcObject = stream;
        video.play();
        captureButton.onclick = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg');
          if (addPhoto(base64) && multiple) {
            // Continue capturing for multiple photos
          } else {
            stream.getTracks().forEach(track => track.stop());
            modal.remove();
          }
        };
        closeButton.onclick = () => {
          stream.getTracks().forEach(track => track.stop());
          modal.remove();
        };
      })
      .catch(err => {
        displayError('Camera access denied or unavailable.');
        modal.remove();
      });
  }

  function handleFileUpload(files) {
    const validImages = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validImages.length === 0) {
      displayError('No valid images selected.');
      return;
    }
    validImages.forEach(file => {
      if (capturedPhotos.length >= MAX_PHOTOS) return;
      const reader = new FileReader();
      reader.onload = () => addPhoto(reader.result);
      reader.onerror = () => displayError('Error reading file.');
      reader.readAsDataURL(file);
    });
  }

  // --- Display Sampling Plan ---
  function displaySamplingPlan(plan) {
    const lotSizeVal = parseInt(lotSizeInput.value, 10);
    let samplingInstructions = '';
    const numBoxesVal = parseInt(numBoxesInput.value, 10);
    const pcsPerBoxVal = parseInt(pcsPerBoxInput.value, 10);

    if (isNaN(lotSizeVal) || lotSizeVal <= 0) {
      samplingInstructions = '<p style="color: red;">Cannot calculate sampling instructions without valid lot size.</p>';
    } else if (plan.sampleSize >= lotSizeVal) {
      samplingInstructions = '<p><strong>Sampling Instructions:</strong> Inspect all pieces from all boxes (100% inspection required).</p>';
    } else if (isNaN(numBoxesVal) || numBoxesVal <= 0 || isNaN(pcsPerBoxVal) || pcsPerBoxVal <= 0) {
      samplingInstructions = '<p style="color: red;">Enter valid Number of Boxes and Pieces per Box to see sampling instructions.</p>';
    } else {
      const minBoxesTheoretical = plan.sampleSize / pcsPerBoxVal;
      const minBoxesToOpen = Math.ceil(minBoxesTheoretical);
      const boxesToOpen = Math.min(minBoxesToOpen, numBoxesVal);

      const pcsPerOpenedBoxTheoretical = plan.sampleSize / boxesToOpen;
      const pcsPerOpenedBox = Math.ceil(pcsPerOpenedBoxTheoretical);
      const totalActuallyInspected = boxesToOpen * pcsPerOpenedBox;

      samplingInstructions = `
        <p><strong>Sampling Instructions:</strong></p>
        <ul>
          <li>Randomly select and open <strong>${boxesToOpen}</strong> box(es) (out of ${numBoxesVal} total).</li>
          <li>From each opened box, randomly select and inspect <strong>${pcsPerOpenedBox}</strong> piece(s).</li>
        </ul>
      `;

      if (totalActuallyInspected > plan.sampleSize) {
        samplingInstructions += `<p><small>(Total pieces inspected: ${totalActuallyInspected}. This slightly exceeds the minimum sample size of ${plan.sampleSize} due to practical sampling per box.)</small></p>`;
      } else {
        samplingInstructions += `<p><small>(Total pieces inspected: ${totalActuallyInspected})</small></p>`;
      }
    }

    let aqlText = '';
    if (aqlSelect.value === '1.0') aqlText = 'High Quality (AQL 1.0%)';
    else if (aqlSelect.value === '2.5') aqlText = 'Medium Quality (AQL 2.5%)';
    else if (aqlSelect.value === '4.0') aqlText = 'Low Quality (AQL 4.0%)';
    else aqlText = `AQL ${aqlSelect.value}%`;

    resultsDiv.innerHTML = `
      <p><strong>Sampling Plan Calculated:</strong></p>
      <p>Lot Size: ${lotSizeInput.value}</p>
      <p>Inspection Level: General Level II (Normal)</p>
      <p>Acceptable Quality Level: ${aqlText}</p>
      <p>Sample Size Code Letter: <strong>${plan.codeLetter}</strong></p>
      <p>Sample Size (pieces to inspect): <strong>${plan.sampleSize}</strong></p>
      <p>Acceptance Number (Ac): Max ${plan.accept} defects allowed in sample.</p>
      <p>Rejection Number (Re): If ${plan.reject} or more defects found, reject lot.</p>
      ${samplingInstructions}
    `;

    fadeIn(resultsDiv);
    fadeIn(defectsInputArea);
    fadeIn(photoCaptureArea);
    fadeOut(verdictMessageDiv);
    fadeOut(defectChecklistDiv);
    fadeOut(finalReportAreaDiv);
    fadeOut(generateReportButton);
    fadeOut(savePdfButton);
    fadeOut(saveExcelButton);
    fadeOut(printButton);
  }

  // --- Defect Submission ---
  function submitDefects() {
    clearError();
    const defectsFound = parseInt(defectsFoundInput.value, 10);
    if (isNaN(defectsFound) || defectsFound < 0) {
      displayError('Please enter a valid number of defects found (0 or more).');
      fadeOut(verdictMessageDiv);
      fadeOut(defectChecklistDiv);
      fadeOut(generateReportButton);
      fadeOut(finalReportAreaDiv);
      fadeOut(savePdfButton);
      fadeOut(saveExcelButton);
      fadeOut(printButton);
      return;
    }
    if (!currentSamplingPlan) {
      displayError('Please calculate the sampling plan first.');
      return;
    }
    let verdict = '';
    let verdictClass = '';
    if (defectsFound <= currentSamplingPlan.accept) {
      verdict = `ACCEPT Lot (Found ${defectsFound} defects, Acceptance limit is ${currentSamplingPlan.accept})`;
      verdictClass = 'accept';
    } else {
      verdict = `REJECT Lot (Found ${defectsFound} defects, Rejection limit is ${currentSamplingPlan.reject})`;
      verdictClass = 'reject';
    }
    verdictMessageDiv.innerHTML = `<p class="${verdictClass}">${verdict}</p>`;
    fadeIn(verdictMessageDiv);
    fadeIn(defectChecklistDiv);
    fadeIn(generateReportButton);
    fadeOut(finalReportAreaDiv);
    fadeOut(savePdfButton);
    fadeOut(saveExcelButton);
    fadeOut(printButton);
  }

  // --- File Naming Helper ---
  function generateFileName(extension) {
    const partName = partNameInput.value || 'UnknownPart';
    const partId = partIdInput.value || 'NoID';
    const qcInspector = qcInspectorInput.value || 'UnknownInspector';
    const machineNo = machineNumberInput.value || 'NoMachine';
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
    const safePartName = partName.replace(/[^a-z0-9_.-]/gi, '_');
    const safePartId = partId.replace(/[^a-z0-9_.-]/gi, '_');
    const safeInspector = qcInspector.replace(/[^a-z0-9_.-]/gi, '_');
    const safeMachineNo = machineNo.replace(/[^a-z0-9_.-]/gi, '_');
    return `QC_Report_${safePartName}_${safePartId}_${safeInspector}_${safeMachineNo}_${dateStr}_${timeStr}.${extension}`;
  }

  // --- Report Generation ---
  function generateReport() {
    if (!currentSamplingPlan) {
      displayError('Cannot generate report without a calculated sampling plan and verdict.');
      return;
    }
    const defectsFound = parseInt(defectsFoundInput.value, 10);
    if (isNaN(defectsFound) || defectsFound < 0) {
      displayError('Cannot generate report without valid defects found input.');
      return;
    }

    const verdictText = (defectsFound <= currentSamplingPlan.accept) ? 'ACCEPT' : 'REJECT';
    const verdictColor = (verdictText === 'ACCEPT') ? 'green' : 'red';
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
      .map(cb => cb.value);
    const lotSizeVal = parseInt(lotSizeInput.value, 10);
    let inspectionNote = '';
    if (!isNaN(lotSizeVal) && currentSamplingPlan.sampleSize >= lotSizeVal) {
      inspectionNote = `<p style="color: orange; font-weight: bold;">Note: 100% inspection was required/performed.</p>`;
    }

    let aqlReportText = '';
    if (aqlSelect.value === '1.0') aqlReportText = 'High Quality (AQL 1.0%)';
    else if (aqlSelect.value === '2.5') aqlReportText = 'Medium Quality (AQL 2.5%)';
    else if (aqlSelect.value === '4.0') aqlReportText = 'Low Quality (AQL 4.0%)';
    else aqlReportText = `AQL ${aqlSelect.value}%`;

    const reportHTML = `
      <h3>Batch Identification</h3>
      <p><strong>QC Inspector:</strong> ${qcInspectorInput.value || 'N/A'}</p>
      <p><strong>Operator Name:</strong> ${operatorNameInput.value || 'N/A'}</p>
      <p><strong>Machine No:</strong> ${machineNumberInput.value || 'N/A'}</p>
      <p><strong>Part Name:</strong> ${partNameInput.value || 'N/A'}</p>
      <p><strong>Part ID:</strong> ${partIdInput.value || 'N/A'}</p>
      <p><strong>Inspection Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Inspection Time:</strong> ${new Date().toLocaleTimeString()}</p>

      <h3>Sampling Details & Plan</h3>
      <p><strong>Total Lot Size:</strong> ${lotSizeInput.value}</p>
      <p><strong>Inspection Level:</strong> General Level II (Normal)</p>
      <p><strong>Acceptable Quality Level:</strong> ${aqlReportText}</p>
      <p><strong>Sample Size Code Letter:</strong> ${currentSamplingPlan.codeLetter}</p>
      <p><strong>Sample Size Inspected:</strong> ${currentSamplingPlan.sampleSize}</p>
      ${inspectionNote}
      <p><strong>Acceptance Number (Ac):</strong> ${currentSamplingPlan.accept}</p>
      <p><strong>Rejection Number (Re):</strong> ${currentSamplingPlan.reject}</p>

      <h3>Inspection Results</h3>
      <p><strong>Number of Defects Found:</strong> ${defectsFound}</p>
      <p><strong>Verdict:</strong> <strong style="color: ${verdictColor};">${verdictText}</strong></p>

      <h3>Observed Defect Types</h3>
      ${selectedDefects.length > 0
        ? `<ul>${selectedDefects.map(defect => `<li>${defect}</li>`).join('')}</ul>`
        : '<p>No specific defect types recorded.</p>'
      }

      <h3>Photo Documentation</h3>
      ${capturedPhotos.length > 0
        ? capturedPhotos.map((photo, index) => `
            <p>Photo ${index + 1}:</p>
            <img src="${photo}" style="max-width: 200px; border-radius: 8px;">
          `).join('')
        : '<p>No photos added.</p>'
      }
    `;

    reportContentDiv.innerHTML = reportHTML;
    fadeIn(finalReportAreaDiv);
    fadeIn(savePdfButton);
    fadeIn(saveExcelButton);
    fadeIn(printButton);
  }

  // --- PDF Saving ---
  function saveReportAsPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 10;
    let y = 20;

    doc.setFontSize(16);
    doc.text("Quality Control Inspection Report", margin, y);
    y += 10;

    doc.setFontSize(12);
    doc.text("Batch Identification", margin, y);
    y += 7;
    doc.text(`QC Inspector: ${qcInspectorInput.value || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Operator Name: ${operatorNameInput.value || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Machine No: ${machineNumberInput.value || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Part Name: ${partNameInput.value || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Part ID: ${partIdInput.value || 'N/A'}`, margin, y);
    y += 7;
    doc.text(`Inspection Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 7;
    doc.text(`Inspection Time: ${new Date().toLocaleTimeString()}`, margin, y);
    y += 10;

    doc.text("Sampling Details & Plan", margin, y);
    y += 7;
    doc.text(`Total Lot Size: ${lotSizeInput.value}`, margin, y);
    y += 7;
    doc.text("Inspection Level: General Level II (Normal)", margin, y);
    y += 7;
    const aqlReportText = aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                          aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                          aqlSelect.value === '4.0' ? 'Low Quality (AQL 4.0%)' :
                          `AQL ${aqlSelect.value}%`;
    doc.text(`Acceptable Quality Level: ${aqlReportText}`, margin, y);
    y += 7;
    doc.text(`Sample Size Code Letter: ${currentSamplingPlan.codeLetter}`, margin, y);
    y += 7;
    doc.text(`Sample Size Inspected: ${currentSamplingPlan.sampleSize}`, margin, y);
    y += 7;
    if (currentSamplingPlan.sampleSize >= parseInt(lotSizeInput.value, 10)) {
      doc.text("Note: 100% inspection was required/performed.", margin, y);
      y += 7;
    }
    doc.text(`Acceptance Number (Ac): ${currentSamplingPlan.accept}`, margin, y);
    y += 7;
    doc.text(`Rejection Number (Re): ${currentSamplingPlan.reject}`, margin, y);
    y += 10;

    doc.text("Inspection Results", margin, y);
    y += 7;
    doc.text(`Number of Defects Found: ${defectsFoundInput.value}`, margin, y);
    y += 7;
    const verdictText = parseInt(defectsFoundInput.value, 10) <= currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT';
    doc.text(`Verdict: ${verdictText}`, margin, y);
    y += 10;

    doc.text("Observed Defect Types", margin, y);
    y += 7;
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
      .map(cb => cb.value);
    if (selectedDefects.length > 0) {
      selectedDefects.forEach(defect => {
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
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
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

    doc.save(generateFileName('pdf'));
  }

  // --- Save as Excel ---
  function saveReportAsExcel() {
    if (!currentSamplingPlan) {
      displayError('Cannot generate Excel report without a calculated sampling plan.');
      return;
    }

    const defectsFound = parseInt(defectsFoundInput.value, 10);
    const verdictText = defectsFound <= currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT';
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
      .map(cb => cb.value);
    const aqlReportText = aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                          aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                          aqlSelect.value === '4.0' ? 'Low Quality (AQL 4.0%)' :
                          `AQL ${aqlSelect.value}%`;

    const data = [
      ['Quality Control Inspection Report'],
      [],
      ['Batch Identification'],
      ['QC Inspector', qcInspectorInput.value || 'N/A'],
      ['Operator Name', operatorNameInput.value || 'N/A'],
      ['Machine No', machineNumberInput.value || 'N/A'],
      ['Part Name', partNameInput.value || 'N/A'],
      ['Part ID', partIdInput.value || 'N/A'],
      ['Inspection Date', new Date().toLocaleDateString()],
      ['Inspection Time', new Date().toLocaleTimeString()],
      [],
      ['Sampling Details & Plan'],
      ['Total Lot Size', lotSizeInput.value],
      ['Inspection Level', 'General Level II (Normal)'],
      ['Acceptable Quality Level', aqlReportText],
      ['Sample Size Code Letter', currentSamplingPlan.codeLetter],
      ['Sample Size Inspected', currentSamplingPlan.sampleSize],
      ['Acceptance Number (Ac)', currentSamplingPlan.accept],
      ['Rejection Number (Re)', currentSamplingPlan.reject],
      [],
      ['Inspection Results'],
      ['Number of Defects Found', defectsFound],
      ['Verdict', verdictText],
      [],
      ['Observed Defect Types'],
      ...(selectedDefects.length > 0 ? selectedDefects.map(defect => [defect]) : [['No specific defect types recorded.']]),
      [],
      ['Photo Documentation'],
      ...(capturedPhotos.length > 0
        ? capturedPhotos.map((photo, index) => [`Photo ${index + 1} (Base64)`, photo])
        : [['No photos added.']])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inspection Report');
    XLSX.writeFile(wb, generateFileName('xlsx'));
  }

  // --- Printing ---
  function printReport() {
    window.print();
  }

  // --- Reset ---
  function resetAll() {
    aqlForm.reset();
    lotSizeInput.value = '';
    resultsDiv.innerHTML = '<p class="initial-message">Please enter batch details, select quality level, and click calculate.</p>';
    fadeIn(resultsDiv);
    fadeOut(defectsInputArea);
    fadeOut(photoCaptureArea);
    fadeOut(verdictMessageDiv);
    fadeOut(defectChecklistDiv);
    fadeOut(finalReportAreaDiv);
    fadeOut(generateReportButton);
    fadeOut(savePdfButton);
    fadeOut(saveExcelButton);
    fadeOut(printButton);
    currentSamplingPlan = null;
    defectsFoundInput.value = '';
    capturedPhotos = [];
    updatePhotoPreview();
    document.querySelectorAll('#defectChecklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    clearError();
    validateInputs();
  }

  // --- Validation & Interactivity ---
  calculateButton.disabled = true;

  function validateInputs() {
    const numBoxesValid = numBoxesInput.value && parseInt(numBoxesInput.value, 10) > 0;
    const pcsPerBoxValid = pcsPerBoxInput.value && parseInt(pcsPerBoxInput.value, 10) > 0;
    const aqlSelected = aqlSelect.value !== '';
    calculateButton.disabled = !(numBoxesValid && pcsPerBoxValid && aqlSelected);
  }

  numBoxesInput.addEventListener('input', () => {
    calculateLotSize();
    validateInputs();
    clearError();
  });
  pcsPerBoxInput.addEventListener('input', () => {
    calculateLotSize();
    validateInputs();
    clearError();
  });
  aqlSelect.addEventListener('change', validateInputs);

  calculateButton.addEventListener('click', () => {
    currentSamplingPlan = calculateSamplingPlan();
    if (currentSamplingPlan) {
      displaySamplingPlan(currentSamplingPlan);
    } else {
      fadeOut(defectsInputArea);
      fadeOut(photoCaptureArea);
      fadeOut(verdictMessageDiv);
      fadeOut(defectChecklistDiv);
      fadeOut(finalReportAreaDiv);
      fadeOut(generateReportButton);
      fadeOut(savePdfButton);
      fadeOut(saveExcelButton);
      fadeOut(printButton);
    }
  });

  submitDefectsButton.addEventListener('click', submitDefects);
  generateReportButton.addEventListener('click', generateReport);
  savePdfButton.addEventListener('click', saveReportAsPdf);
  saveExcelButton.addEventListener('click', saveReportAsExcel);
  printButton.addEventListener('click', printReport);

  // --- Photo Event Listeners ---
  captureSinglePhotoButton.addEventListener('click', () => capturePhotoFromCamera(false));
  captureMultiplePhotosButton.addEventListener('click', () => capturePhotoFromCamera(true));
  uploadSinglePhotoInput.addEventListener('change', (e) => handleFileUpload(e.target.files));
  uploadMultiplePhotosInput.addEventListener('change', (e) => handleFileUpload(e.target.files));

  dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropArea.classList.add('drag-active');
  });
  dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('drag-active');
  });
  dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropArea.classList.remove('drag-active');
    handleFileUpload(e.dataTransfer.files);
  });

  photoPreview.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const index = parseInt(e.target.dataset.index, 10);
      if (confirm('Remove this photo?')) {
        removePhoto(index);
      }
    }
  });

  // --- Mobile Touch Enhancements ---
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', () => {
      button.classList.add('active');
    });
    button.addEventListener('touchend', () => {
      button.classList.remove('active');
    });
  });

  // Initial setup
  resetAll();
});