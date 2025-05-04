/*
    Copyright © 2025. This AQL Sampling Calculator Tool is the initiative of Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/

document.addEventListener('DOMContentLoaded', function() {
  // --- DOM Element Selection ---
  const aqlForm = document.getElementById('aqlForm');
  const qcInspectorInput = document.getElementById('qcInspector');
  const machineNumberInput = document.getElementById('machineNumber');
  const partNameInput = document.getElementById('partName');
  const partIdInput = document.getElementById('partId');
  const poNumberInput = document.getElementById('poNumber');
  const productionDateInput = document.getElementById('productionDate');
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
  const uploadMultiplePhotosInput = document.getElementById('uploadMultiplePhotos');
  const photoPreview = document.getElementById('photoPreview');
  const photoCount = document.getElementById('photoCount');
  const verdictMessageDiv = document.getElementById('verdictMessage');
  const defectChecklistDiv = document.getElementById('defectChecklist');
  const generateReportButton = document.getElementById('generateReportButton');
  const finalReportAreaDiv = document.getElementById('finalReportArea');
  const reportContentDiv = document.getElementById('reportContent');
  const savePdfButton = document.getElementById('savePdfButton');
  const printButton = document.getElementById('printButton');
  const errorMessageDiv = document.getElementById('error-message');

  // --- Annotation DOM Elements ---
  const annotationModal = document.getElementById('annotationModal');
  const annotationCanvas = document.getElementById('annotationCanvas');
  const closeModal = document.querySelector('.close-modal');
  const drawCircleButton = document.getElementById('drawCircleButton');
  const drawTextButton = document.getElementById('drawTextButton');
  const drawFreehandButton = document.getElementById('drawFreehandButton');
  const undoButton = document.getElementById('undoButton');
  const saveAnnotationButton = document.getElementById('saveAnnotationButton');

  // --- State Variables ---
  let currentSamplingPlan = null; // Stores { codeLetter, sampleSize, accept, reject }
  let capturedPhotos = []; // Array of photo data (base64 strings)
  const MAX_PHOTOS = 5; // Max photos allowed
  let fabricCanvas = null; // Fabric.js canvas instance
  let currentPhotoIndex = null; // Index of photo being annotated
  let annotationHistory = []; // For undo functionality
  let currentMode = null; // Tracks annotation mode (circle, text, freehand)
  const qcMonitorContact = "qaqc@kpielectrical.com.my or whatsapp to +60182523255 immediately"; // UPDATE THIS with your email/WhatsApp

  // --- Copyright Notice ---
  const copyrightNotice = "Copyright © 2025. This AQL Sampling Calculator Tool is the initiative of Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.";

  // --- Populate Part ID Dropdown ---
  function populatePartIdDropdown() {
    partIdInput.innerHTML = '<option value="">-- Select Part ID --</option>';
    partsList.forEach(part => {
      const option = document.createElement('option');
      option.value = part.partId;
      option.textContent = part.partId;
      partIdInput.appendChild(option);
    });
  }

  // --- Auto-Populate Part Name ---
  partIdInput.addEventListener('change', function() {
    const selectedPartId = partIdInput.value;
    const part = partsList.find(p => p.partId === selectedPartId);
    partNameInput.value = part ? part.partName : '';
  });

  // --- AQL Data (Simplified, from your list) ---
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

  // --- Calculate Sampling Plan ---
  function calculateSamplingPlan() {
    clearError();
    const lotSize = parseInt(lotSizeInput.value, 10);
    const aqlValue = aqlSelect.value;

    if (isNaN(lotSize) || lotSize <= 0) {
      displayError('Please enter valid Number of Boxes and Pieces per Box.');
      return null;
    }
    if (lotSize < 2) {
      displayError('Lot Size must be 2 or greater.');
      return null;
    }
    if (!['1.0', '2.5', '4.0'].includes(aqlValue)) {
      displayError('Please select High (1.0%), Medium (2.5%), or Low (4.0%) AQL.');
      return null;
    }

    const lotRange = getLotSizeRange(lotSize);
    if (!lotRange) {
      displayError('Lot size outside standard range.');
      return null;
    }
    const codeLetter = sampleSizeCodeLetters_Level_II[lotRange];
    if (!codeLetter) {
      displayError(`Could not determine Sample Size Code Letter for Lot Size ${lotSize}.`);
      return null;
    }

    const planData = aqlMasterTable_Simplified[codeLetter];
    if (!planData || !planData.plans) {
      displayError(`AQL data not found for Code Letter ${codeLetter}.`);
      return null;
    }

    const sampleSize = planData.sampleSize;
    const planDetails = planData.plans[aqlValue];

    if (!planDetails || typeof planDetails.ac === 'undefined' || typeof planDetails.re === 'undefined') {
      displayError(`Ac/Re values not found for Code Letter ${codeLetter} and AQL ${aqlValue}.`);
      return null;
    }

    if (sampleSize >= lotSize) {
      console.warn(`Sample Size (${sampleSize}) equals/exceeds Lot Size (${lotSize}).`);
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

  // --- Photo Handling ---
  function updatePhotoPreview() {
    photoPreview.innerHTML = capturedPhotos.length === 0
      ? '<p>No photos added yet.</p>'
      : capturedPhotos.map((photo, index) => `
          <img src="${photo}" alt="Photo ${index + 1}" data-index="${index}" title="Click to annotate or remove">
        `).join('');
    photoCount.textContent = `Photos: ${capturedPhotos.length}/${MAX_PHOTOS}`;
    uploadMultiplePhotosInput.disabled = capturedPhotos.length >= MAX_PHOTOS;
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

  // --- Annotation Functions ---
  function initAnnotationCanvas(imageSrc, index) {
    currentPhotoIndex = index;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
      const maxWidth = 500;
      const maxHeight = 400;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }

      annotationCanvas.width = width;
      annotationCanvas.height = height;

      fabricCanvas = new fabric.Canvas('annotationCanvas', {
        width: width,
        height: height
      });

      fabric.Image.fromURL(imageSrc, function(imgObj) {
        imgObj.set({ selectable: false, evented: false });
        imgObj.scaleToWidth(width);
        imgObj.scaleToHeight(height);
        fabricCanvas.add(imgObj);
        fabricCanvas.sendToBack(imgObj);
      });

      currentMode = null;
      annotationHistory = [];
      updateToolButtons();

      drawCircleButton.addEventListener('click', () => {
        currentMode = currentMode === 'circle' ? null : 'circle';
        fabricCanvas.isDrawingMode = false;
        updateToolButtons();
      });

      drawTextButton.addEventListener('click', () => {
        currentMode = currentMode === 'text' ? null : 'text';
        fabricCanvas.isDrawingMode = false;
        updateToolButtons();
      });

      drawFreehandButton.addEventListener('click', () => {
        currentMode = currentMode === 'freehand' ? null : 'freehand';
        fabricCanvas.isDrawingMode = currentMode === 'freehand';
        fabricCanvas.freeDrawingBrush.color = '#ff0000';
        fabricCanvas.freeDrawingBrush.width = 2;
        updateToolButtons();
      });

      fabricCanvas.on('mouse:down', (options) => {
        if (currentMode === 'circle') {
          const pointer = fabricCanvas.getPointer(options.e);
          const circle = new fabric.Circle({
            left: pointer.x - 20,
            top: pointer.y - 20,
            radius: 20,
            fill: '',
            stroke: '#ff0000',
            strokeWidth: 2,
            originX: 'center',
            originY: 'center'
          });
          fabricCanvas.add(circle);
          annotationHistory.push(circle);
        } else if (currentMode === 'text') {
          const pointer = fabricCanvas.getPointer(options.e);
          const text = new fabric.IText('Enter text', {
            left: pointer.x,
            top: pointer.y,
            fill: '#ff0000',
            fontSize: 16,
            fontFamily: 'Arial'
          });
          fabricCanvas.add(text);
          fabricCanvas.setActiveObject(text);
          annotationHistory.push(text);
        }
      });

      fabricCanvas.on('path:created', (e) => {
        annotationHistory.push(e.path);
      });

      undoButton.addEventListener('click', () => {
        if (annotationHistory.length > 0) {
          const lastAction = annotationHistory.pop();
          fabricCanvas.remove(lastAction);
          fabricCanvas.renderAll();
        }
      });

      saveAnnotationButton.addEventListener('click', () => {
        const annotatedImage = fabricCanvas.toDataURL('image/jpeg');
        capturedPhotos[currentPhotoIndex] = annotatedImage;
        updatePhotoPreview();
        closeAnnotationModal();
      });
    };
    img.onerror = () => displayError('Error loading image for annotation.');
    img.src = imageSrc;
  }

  function updateToolButtons() {
    drawCircleButton.classList.toggle('active', currentMode === 'circle');
    drawTextButton.classList.toggle('active', currentMode === 'text');
    drawFreehandButton.classList.toggle('active', currentMode === 'freehand');
  }

  function closeAnnotationModal() {
    annotationModal.style.display = 'none';
    if (fabricCanvas) {
      fabricCanvas.dispose();
      fabricCanvas = null;
    }
    currentPhotoIndex = null;
    currentMode = null;
    annotationHistory = [];
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
      samplingInstructions = '<p style="color: red;">Enter valid Number of Boxes and Pieces per Box.</p>';
    } else {
      const minBoxesToOpen = Math.ceil(plan.sampleSize / pcsPerBoxVal);
      const boxesToOpen = Math.min(minBoxesToOpen, numBoxesVal);
      const pcsPerOpenedBox = Math.ceil(plan.sampleSize / boxesToOpen);
      const totalInspected = boxesToOpen * pcsPerOpenedBox;

      samplingInstructions = `
        <p><strong>Sampling Instructions:</strong></p>
        <ul>
          <li>Randomly select and open <strong>${boxesToOpen}</strong> box(es) (out of ${numBoxesVal}).</li>
          <li>From each opened box, inspect <strong>${pcsPerOpenedBox}</strong> piece(s).</li>
        </ul>
        <p><small>(Total pieces inspected: ${totalInspected}${totalInspected > plan.sampleSize ? ', slightly exceeding the minimum sample size of ' + plan.sampleSize : ''})</small></p>`;
    }

    const aqlText = aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                    aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                    aqlSelect.value === '4.0' ? 'Low Quality (AQL 4.0%)' :
                    `AQL ${aqlSelect.value}%`;

    resultsDiv.innerHTML = `
      <p><strong>Sampling Plan Calculated:</strong></p>
      <p>Lot Size: ${lotSizeInput.value}</p>
      <p>Inspection Level: General Level II (Normal)</p>
      <p>Acceptable Quality Level: ${aqlText}</p>
      <p>Sample Size Code Letter: <strong>${plan.codeLetter}</strong></p>
      <p>Sample Size: <strong>${plan.sampleSize}</strong></p>
      <p>Acceptance Number (Ac): Max ${plan.accept} defects.</p>
      <p>Rejection Number (Re): ${plan.reject} or more defects, reject lot.</p>
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
    fadeOut(printButton);
  }

  // --- Submit Defects ---
  function submitDefects() {
    clearError();
    const defectsFound = parseInt(defectsFoundInput.value, 10);
    if (isNaN(defectsFound) || defectsFound < 0) {
      displayError('Please enter a valid number of defects (0 or more).');
      fadeOut(verdictMessageDiv);
      fadeOut(defectChecklistDiv);
      fadeOut(generateReportButton);
      fadeOut(finalReportAreaDiv);
      fadeOut(savePdfButton);
      fadeOut(printButton);
      return;
    }
    if (!currentSamplingPlan) {
      displayError('Please calculate the sampling plan first.');
      return;
    }
    const verdict = defectsFound <= currentSamplingPlan.accept
      ? `ACCEPT Lot (Found ${defectsFound} defects, Acceptance limit: ${currentSamplingPlan.accept})`
      : `REJECT Lot (Found ${defectsFound} defects, Rejection limit: ${currentSamplingPlan.reject})`;
    const verdictClass = defectsFound <= currentSamplingPlan.accept ? 'accept' : 'reject';
    verdictMessageDiv.innerHTML = `<p class="${verdictClass}">${verdict}</p>`;
    fadeIn(verdictMessageDiv); // Show verdict first
    fadeIn(defectChecklistDiv); // Show checklist after verdict
    fadeIn(generateReportButton);
    fadeOut(finalReportAreaDiv);
    fadeOut(savePdfButton);
    fadeOut(printButton);
  }

  // --- Generate Report ---
  function generateReport() {
    if (!currentSamplingPlan) {
      displayError('Calculate sampling plan and submit defects first.');
      return;
    }
    const defectsFound = parseInt(defectsFoundInput.value, 10);
    if (isNaN(defectsFound) || defectsFound < 0) {
      displayError('Enter valid defects found.');
      return;
    }

    const reportId = `Report_${partIdInput.value || 'NoID'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,8).replace(/:/g,'')}`;
    const verdictText = defectsFound <= currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT';
    const verdictColor = verdictText === 'ACCEPT' ? 'green' : 'red';
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
      .map(cb => cb.value);
    const lotSizeVal = parseInt(lotSizeInput.value, 10);
    const inspectionNote = lotSizeVal && currentSamplingPlan.sampleSize >= lotSizeVal
      ? `<p style="color: orange; font-weight: bold;">Note: 100% inspection required/performed.</p>`
      : '';

    const aqlText = aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                    aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                    aqlSelect.value === '4.0' ? 'Low Quality (AQL 4.0%)' :
                    `AQL ${aqlSelect.value}%`;

    const reportHTML = `
      <h3>Batch Identification</h3>
      <p><strong>Report ID:</strong> ${reportId}</p>
      <p><strong>QC Inspector:</strong> ${qcInspectorInput.value || 'N/A'}</p>
      <p><strong>Machine No:</strong> ${machineNumberInput.value || 'N/A'}</p>
      <p><strong>Part ID:</strong> ${partIdInput.value || 'N/A'}</p>
      <p><strong>Part Name:</strong> ${partNameInput.value || 'N/A'}</p>
      <p><strong>PO Number:</strong> ${poNumberInput.value || 'N/A'}</p>
      <p><strong>Production Date:</strong> ${productionDateInput.value || 'N/A'}</p>
      <p><strong>Inspection Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Inspection Time:</strong> ${new Date().toLocaleTimeString()}</p>

      <h3>Sampling Details & Plan</h3>
      <p><strong>Total Lot Size:</strong> ${lotSizeInput.value}</p>
      <p><strong>Inspection Level:</strong> General Level II (Normal)</p>
      <p><strong>Acceptable Quality Level:</strong> ${aqlText}</p>
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

      <h3>Ownership</h3>
      <p>${copyrightNotice}</p>
    `;

    reportContentDiv.innerHTML = reportHTML;
    fadeIn(finalReportAreaDiv);
    fadeIn(savePdfButton);
    fadeIn(printButton);
  }

  // --- Save PDF ---
  function saveReportAsPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const margin = 10;
    let y = 20;

    doc.setFontSize(16);
    doc.text("Quality Control Inspection Report", margin, y);
    y += 10;

    doc.setFontSize(12);
    const reportId = `Report_${partIdInput.value || 'NoID'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,8).replace(/:/g,'')}`;
    doc.autoTable({
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Report ID', reportId],
        ['QC Inspector', qcInspectorInput.value || 'N/A'],
        ['Machine No', machineNumberInput.value || 'N/A'],
        ['Part ID', partIdInput.value || 'N/A'],
        ['Part Name', partNameInput.value || 'N/A'],
        ['PO Number', poNumberInput.value || 'N/A'],
        ['Production Date', productionDateInput.value || 'N/A'],
        ['Inspection Date', new Date().toLocaleDateString()],
        ['Inspection Time', new Date().toLocaleTimeString()]
      ],
      theme: 'grid'
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.text("Sampling Details & Plan", margin, y);
    y += 5;
    const aqlText = aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                    aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                    aqlSelect.value === '4.0' ? 'Low Quality (AQL 4.0%)' :
                    `AQL ${aqlSelect.value}%`;
    doc.autoTable({
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Total Lot Size', lotSizeInput.value],
        ['Inspection Level', 'General Level II (Normal)'],
        ['Acceptable Quality Level', aqlText],
        ['Sample Size Code Letter', currentSamplingPlan.codeLetter],
        ['Sample Size Inspected', currentSamplingPlan.sampleSize],
        ...(currentSamplingPlan.sampleSize >= parseInt(lotSizeInput.value, 10) ? [['Note', '100% inspection required/performed.']] : []),
        ['Acceptance Number (Ac)', currentSamplingPlan.accept],
        ['Rejection Number (Re)', currentSamplingPlan.reject]
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
        ['Number of Defects Found', defectsFoundInput.value],
        ['Verdict', parseInt(defectsFoundInput.value, 10) <= currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT']
      ],
      theme: 'grid'
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.text("Observed Defect Types", margin, y);
    y += 7;
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
      .map(cb => cb.value);
    if (selectedDefects.length > 0) {
      selectedDefects.forEach(defect => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
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
    y += 10;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.text("Ownership", margin, y);
    y += 7;
    doc.text(copyrightNotice, margin, y, { maxWidth: 190 });

    doc.save(`${reportId}.pdf`);
    alert(`PDF report saved. Please send the PDF with Report ID ${reportId} to ${qcMonitorContact}.`);
  }

  // --- Print Report ---
  function printReport() {
    window.print();
  }

  // --- Reset ---
  function resetAll() {
    aqlForm.reset();
    lotSizeInput.value = '';
    partIdInput.value = '';
    partNameInput.value = '';
    poNumberInput.value = '';
    productionDateInput.value = '';
    populatePartIdDropdown();
    resultsDiv.innerHTML = '<p class="initial-message">Please enter batch details, select quality level, and click calculate.</p>';
    fadeIn(resultsDiv);
    fadeOut(defectsInputArea);
    fadeOut(photoCaptureArea);
    fadeOut(verdictMessageDiv);
    fadeOut(defectChecklistDiv);
    fadeOut(finalReportAreaDiv);
    fadeOut(generateReportButton);
    fadeOut(savePdfButton);
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
      fadeOut(printButton);
    }
  });

  submitDefectsButton.addEventListener('click', submitDefects);
  generateReportButton.addEventListener('click', generateReport);
  savePdfButton.addEventListener('click', saveReportAsPdf);
  printButton.addEventListener('click', printReport);
  resetButton.addEventListener('click', resetAll);

  // --- Photo Event Listeners ---
  uploadMultiplePhotosInput.addEventListener('change', (e) => handleFileUpload(e.target.files));

  photoPreview.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const index = parseInt(e.target.dataset.index, 10);
      const action = prompt('Type "annotate" to annotate or "remove" to delete this photo.');
      if (action && action.toLowerCase() === 'annotate') {
        initAnnotationCanvas(capturedPhotos[index], index);
        annotationModal.style.display = 'flex';
      } else if (action && action.toLowerCase() === 'remove') {
        if (confirm('Remove this photo?')) {
          removePhoto(index);
        }
      }
    }
  });

  closeModal.addEventListener('click', closeAnnotationModal);

  // --- Mobile Touch Enhancements ---
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', () => button.classList.add('active'));
    button.addEventListener('touchend', () => button.classList.remove('active'));
  });

  // --- Initial Setup ---
  populatePartIdDropdown();
  resetAll();
});
