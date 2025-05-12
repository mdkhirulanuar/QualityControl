/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const elements = {
    aqlForm: document.getElementById('aqlForm'),
    qcInspector: document.getElementById('qcInspector'),
    machineNumber: document.getElementById('machineNumber'),
    partName: document.getElementById('partName'),
    partId: document.getElementById('partId'),
    poNumber: document.getElementById('poNumber'),
    productionDate: document.getElementById('productionDate'),
    numBoxes: document.getElementById('numBoxes'),
    pcsPerBox: document.getElementById('pcsPerBox'),
    lotSize: document.getElementById('lotSize'),
    aql: document.getElementById('aql'),
    calculateButton: document.getElementById('calculateButton'),
    resetButton: document.getElementById('resetButton'),
    results: document.getElementById('results'),
    defectsInputArea: document.getElementById('defectsInputArea'),
    defectsFound: document.getElementById('defectsFound'),
    submitDefectsButton: document.getElementById('submitDefectsButton'),
    photoCaptureArea: document.getElementById('photoCaptureArea'),
    uploadMultiplePhotos: document.getElementById('uploadMultiplePhotos'),
    photoPreview: document.getElementById('photoPreview'),
    photoCount: document.getElementById('photoCount'),
    verdictMessage: document.getElementById('verdictMessage'),
    defectChecklist: document.getElementById('defectChecklist'),
    generateReportButton: document.getElementById('generateReportButton'),
    finalReportArea: document.getElementById('finalReportArea'),
    reportContent: document.getElementById('reportContent'),
    savePdfButton: document.getElementById('savePdfButton'),
    printButton: document.getElementById('printButton'),
    errorMessage: document.getElementById('error-message'),
    batchSection: document.querySelector('.batch-info'),
    lotSection: document.querySelector('.lot-details'),
    buttonGroup: document.querySelector('.button-group'),
    annotationModal: document.getElementById('annotationModal'),
    annotationCanvas: document.getElementById('annotationCanvas'),
    closeModal: document.querySelector('.close-modal'),
    drawCircleButton: document.getElementById('drawCircleButton'),
    drawTextButton: document.getElementById('drawTextButton'),
    drawFreehandButton: document.getElementById('drawFreehandButton'),
    undoButton: document.getElementById('undoButton'),
    saveAnnotationButton: document.getElementById('saveAnnotationButton')
  };

  // --- State Variables ---
  let currentSamplingPlan = null;
  let capturedPhotos = [];
  const MAX_PHOTOS = 5;
  let fabricCanvas = null;
  let currentPhotoIndex = null;
  let annotationHistory = [];
  let currentMode = null;
  const qcMonitorContact = "qaqc@kpielectrical.com.my or WhatsApp to +60182523255";
  const copyrightNotice = "Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.";

  // --- AQL Data ---
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
    'Q': { sampleSize: 1250, plans: { '1.0': { ac: 21, re: 22 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } }
  };

  // --- Helper Functions ---
  const sanitizeInput = (input) => {
    return input.replace(/[<>"'&]/g, '').trim();
  };

  const displayError = (message) => {
    elements.errorMessage.textContent = sanitizeInput(message);
    elements.errorMessage.style.display = 'block';
    elements.errorMessage.focus();
  };

  const clearError = () => {
    elements.errorMessage.textContent = '';
    elements.errorMessage.style.display = 'none';
  };

  const fadeIn = (element) => {
    if (element.style.display === 'block') return;
    element.style.opacity = '0';
    element.style.display = 'block';
    let opacity = 0;
    const interval = setInterval(() => {
      opacity += 0.1;
      element.style.opacity = opacity;
      if (opacity >= 1) clearInterval(interval);
    }, 30);
  };

  const fadeOut = (element) => {
    let opacity = 1;
    const interval = setInterval(() => {
      opacity -= 0.1;
      element.style.opacity = opacity;
      if (opacity <= 0) {
        element.style.display = 'none';
        clearInterval(interval);
      }
    }, 30);
  };

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // --- Populate Part Name Dropdown ---
  const populatePartNameDropdown = () => {
    elements.partName.innerHTML = '<option value="">-- Select Part Name --</option>';
    const uniquePartNames = [...new Set(partsList.map(part => part.partName))].sort();
    uniquePartNames.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      elements.partName.appendChild(option);
    });
  };

  // --- Auto-Populate Part ID ---
  elements.partName.addEventListener('change', () => {
    const selectedPartName = sanitizeInput(elements.partName.value);
    const part = partsList.find(p => p.partName === selectedPartName);
    elements.partId.value = part ? part.partId : '';
    validateBatchSection();
  });

  // --- Calculate Lot Size ---
  const calculateLotSize = () => {
    const numBoxes = parseInt(elements.numBoxes.value, 10);
    const pcsPerBox = parseInt(elements.pcsPerBox.value, 10);
    if (numBoxes > 0 && pcsPerBox > 0) {
      elements.lotSize.value = numBoxes * pcsPerBox;
    } else {
      elements.lotSize.value = '';
    }
    validateLotSection();
  };

  // --- Validation Functions ---
  const validateBatchSection = () => {
    const isValid = elements.qcInspector.value &&
                    elements.machineNumber.value &&
                    elements.partName.value &&
                    elements.partId.value &&
                    sanitizeInput(elements.poNumber.value) &&
                    elements.productionDate.value;
    if (isValid) {
      fadeIn(elements.lotSection);
      fadeIn(elements.buttonGroup);
    } else {
      fadeOut(elements.lotSection);
      fadeOut(elements.buttonGroup);
      resetDownstreamSections();
    }
    return isValid;
  };

  const validateLotSection = () => {
    const numBoxes = parseInt(elements.numBoxes.value, 10);
    const pcsPerBox = parseInt(elements.pcsPerBox.value, 10);
    const isValid = numBoxes > 0 && pcsPerBox > 0 && elements.aql.value && validateBatchSection();
    elements.calculateButton.disabled = !isValid;
    if (!isValid) resetDownstreamSections();
    return isValid;
  };

  const validateDefectsSection = () => {
    const defectsFound = parseInt(elements.defectsFound.value, 10);
    const isValid = !isNaN(defectsFound) && defectsFound >= 0 && currentSamplingPlan;
    elements.submitDefectsButton.disabled = !isValid;
    if (!isValid) {
      fadeOut(elements.verdictMessage);
      fadeOut(elements.defectChecklist);
      fadeOut(elements.photoCaptureArea);
      fadeOut(elements.finalReportArea);
      fadeOut(elements.generateReportButton);
    }
    return isValid;
  };

  const resetDownstreamSections = () => {
    fadeOut(elements.results);
    fadeOut(elements.defectsInputArea);
    fadeOut(elements.photoCaptureArea);
    fadeOut(elements.verdictMessage);
    fadeOut(elements.defectChecklist);
    fadeOut(elements.finalReportArea);
    fadeOut(elements.generateReportButton);
    fadeOut(elements.savePdfButton);
    fadeOut(elements.printButton);
    currentSamplingPlan = null;
    capturedPhotos = [];
    updatePhotoPreview();
  };

  // --- Calculate Sampling Plan ---
  const calculateSamplingPlan = () => {
    clearError();
    const lotSize = parseInt(elements.lotSize.value, 10);
    const aqlValue = elements.aql.value;

    if (isNaN(lotSize) || lotSize <= 0) {
      displayError('Please enter valid Number of Boxes and Pieces per Box.');
      return null;
    }
    if (lotSize < 2) {
      displayError('Lot Size must be 2 or greater.');
      return null;
    }
    if (!['1.0', '2.5', '4.0'].includes(aqlValue)) {
      displayError('Please select a valid AQL level (1.0%, 2.5%, or 4.0%).');
      return null;
    }

    const lotRange = Object.keys(sampleSizeCodeLetters_Level_II).find(range => {
      const [min, max] = range.split('-').map(Number);
      return lotSize >= min && (max ? lotSize <= max : true);
    });

    if (!lotRange) {
      displayError('Lot size outside standard range.');
      return null;
    }

    const codeLetter = sampleSizeCodeLetters_Level_II[lotRange];
    const planData = aqlMasterTable_Simplified[codeLetter];

    if (!planData || !planData.plans[aqlValue]) {
      displayError(`AQL data not found for Code Letter ${codeLetter} and AQL ${aqlValue}.`);
      return null;
    }

    return {
      codeLetter,
      sampleSize: planData.sampleSize,
      accept: planData.plans[aqlValue].ac,
      reject: planData.plans[aqlValue].re
    };
  };

  // --- Display Sampling Plan ---
  const displaySamplingPlan = (plan) => {
    const lotSizeVal = parseInt(elements.lotSize.value, 10);
    const numBoxesVal = parseInt(elements.numBoxes.value, 10);
    const pcsPerBoxVal = parseInt(elements.pcsPerBox.value, 10);
    let samplingInstructions = '';

    if (isNaN(lotSizeVal) || lotSizeVal <= 0) {
      samplingInstructions = '<p style="color: red;">Invalid lot size.</p>';
    } else if (plan.sampleSize >= lotSizeVal) {
      samplingInstructions = '<p><strong>Sampling Instructions:</strong> Inspect all pieces (100% inspection).</p>';
    } else if (isNaN(numBoxesVal) || isNaN(pcsPerBoxVal)) {
      samplingInstructions = '<p style="color: red;">Enter valid Number of Boxes and Pieces per Box.</p>';
    } else {
      const minBoxesToOpen = Math.ceil(plan.sampleSize / pcsPerBoxVal);
      const boxesToOpen = Math.min(minBoxesToOpen, numBoxesVal);
      const pcsPerOpenedBox = Math.ceil(plan.sampleSize / boxesToOpen);
      const totalInspected = boxesToOpen * pcsPerOpenedBox;

      samplingInstructions = `
        <p><strong>Sampling Instructions:</strong></p>
        <ul>
          <li>Randomly select <strong>${boxesToOpen}</strong> box(es).</li>
          <li>Inspect <strong>${pcsPerOpenedBox}</strong> piece(s) per box.</li>
        </ul>
        <p><small>(Total inspected: ${totalInspected}${totalInspected > plan.sampleSize ? ', exceeds sample size of ' + plan.sampleSize : ''})</small></p>`;
    }

    const aqlText = elements.aql.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                    elements.aql.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                    'Low Quality (AQL 4.0%)';

    elements.results.innerHTML = `
      <h3>Sampling Plan</h3>
      <p><strong>Lot Size:</strong> ${lotSizeVal}</p>
      <p><strong>Inspection Level:</strong> General Level II</p>
      <p><strong>AQL:</strong> ${aqlText}</p>
      <p><strong>Code Letter:</strong> ${plan.codeLetter}</p>
      <p><strong>Sample Size:</strong> ${plan.sampleSize}</p>
      <p><strong>Accept (Ac):</strong> ${plan.accept}</p>
      <p><strong>Reject (Re):</strong> ${plan.reject}</p>
      ${samplingInstructions}
    `;

    fadeIn(elements.results);
    fadeIn(elements.defectsInputArea);
    fadeIn(elements.photoCaptureArea);
    fadeOut(elements.verdictMessage);
    fadeOut(elements.defectChecklist);
    fadeOut(elements.finalReportArea);
    fadeOut(elements.generateReportButton);
  };

  // --- Photo Handling ---
  const updatePhotoPreview = () => {
    elements.photoPreview.innerHTML = capturedPhotos.length === 0
      ? '<p>No photos added yet.</p>'
      : capturedPhotos.map((photo, index) => `
          <img src="${photo}" alt="Photo ${index + 1}" data-index="${index}" tabindex="0">
        `).join('');
    elements.photoCount.textContent = `Photos: ${capturedPhotos.length}/${MAX_PHOTOS}`;
    elements.uploadMultiplePhotos.disabled = capturedPhotos.length >= MAX_PHOTOS;
    if (validateDefectsSection()) fadeIn(elements.generateReportButton);
  };

  const addPhoto = (base64) => {
    if (capturedPhotos.length >= MAX_PHOTOS) {
      displayError(`Maximum ${MAX_PHOTOS} photos reached.`);
      return false;
    }
    capturedPhotos.push(base64);
    updatePhotoPreview();
    clearError();
    return true;
  };

  const removePhoto = (index) => {
    capturedPhotos.splice(index, 1);
    updatePhotoPreview();
  };

  const handleFileUpload = (files) => {
    const validImages = Array.from(files).filter(file => file.type.startsWith('image/') && file.size < 5 * 1024 * 1024);
    if (validImages.length === 0) {
      displayError('No valid images selected (max 5MB each).');
      return;
    }
    validImages.forEach(file => {
      if (capturedPhotos.length >= MAX_PHOTOS) return;
      const reader = new FileReader();
      reader.onload = () => addPhoto(reader.result);
      reader.onerror = () => displayError('Error reading image.');
      reader.readAsDataURL(file);
    });
  };

  // --- Annotation Functions ---
  const initAnnotationCanvas = (imageSrc, index) => {
    currentPhotoIndex = index;
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const maxWidth = Math.min(window.innerWidth * 0.8, 500);
      const maxHeight = Math.min(window.innerHeight * 0.6, 400);
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

      elements.annotationCanvas.width = width;
      elements.annotationCanvas.height = height;

      fabricCanvas = new fabric.Canvas(elements.annotationCanvas, {
        width,
        height,
        preserveObjectStacking: true
      });

      fabric.Image.fromURL(imageSrc, (imgObj) => {
        imgObj.set({ selectable: false, evented: false });
        imgObj.scaleToWidth(width);
        imgObj.scaleToHeight(height);
        fabricCanvas.add(imgObj);
        fabricCanvas.sendToBack(imgObj);
      });

      currentMode = null;
      annotationHistory = [];
      updateToolButtons();

      elements.drawCircleButton.addEventListener('click', () => toggleMode('circle'));
      elements.drawTextButton.addEventListener('click', () => toggleMode('text'));
      elements.drawFreehandButton.addEventListener('click', () => toggleMode('freehand'));

      fabricCanvas.on('mouse:down', (options) => {
        if (currentMode === 'circle') {
          const pointer = fabricCanvas.getPointer(options.e);
          const circle = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
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

      elements.undoButton.addEventListener('click', () => {
        if (annotationHistory.length > 0) {
          const lastAction = annotationHistory.pop();
          fabricCanvas.remove(lastAction);
          fabricCanvas.renderAll();
        }
      });

      elements.saveAnnotationButton.addEventListener('click', () => {
        capturedPhotos[currentPhotoIndex] = fabricCanvas.toDataURL('image/jpeg', 0.8);
        updatePhotoPreview();
        closeAnnotationModal();
      });
    };
    img.onerror = () => displayError('Error loading image for annotation.');
    img.src = imageSrc;
  };

  const toggleMode = (mode) => {
    currentMode = currentMode === mode ? null : mode;
    fabricCanvas.isDrawingMode = currentMode === 'freehand';
    if (currentMode === 'freehand') {
      fabricCanvas.freeDrawingBrush.color = '#ff0000';
      fabricCanvas.freeDrawingBrush.width = 2;
    }
    updateToolButtons();
  };

  const updateToolButtons = () => {
    elements.drawCircleButton.classList.toggle('active', currentMode === 'circle');
    elements.drawTextButton.classList.toggle('active', currentMode === 'text');
    elements.drawFreehandButton.classList.toggle('active', currentMode === 'freehand');
  };

  const closeAnnotationModal = () => {
    elements.annotationModal.style.display = 'none';
    if (fabricCanvas) {
      fabricCanvas.dispose();
      fabricCanvas = null;
    }
    currentPhotoIndex = null;
    currentMode = null;
    annotationHistory = [];
    elements.calculateButton.focus();
  };

  // --- Submit Defects ---
  const submitDefects = () => {
    clearError();
    const defectsFound = parseInt(elements.defectsFound.value, 10);
    if (isNaN(defectsFound) || defectsFound < 0) {
      displayError('Please select a valid number of defects.');
      return;
    }
    if (!currentSamplingPlan) {
      displayError('Please calculate the sampling plan first.');
      return;
    }
    const verdict = defectsFound <= currentSamplingPlan.accept
      ? `ACCEPT Lot (Defects: ${defectsFound}, Limit: ${currentSamplingPlan.accept})`
      : `REJECT Lot (Defects: ${defectsFound}, Limit: ${currentSamplingPlan.reject})`;
    const verdictClass = defectsFound <= currentSamplingPlan.accept ? 'accept' : 'reject';
    elements.verdictMessage.innerHTML = `<p class="${verdictClass}">${verdict}</p>`;
    fadeIn(elements.verdictMessage);
    fadeIn(elements.defectChecklist);
    fadeIn(elements.photoCaptureArea);
    fadeIn(elements.generateReportButton);
  };

  // --- Generate Report ---
  const generateReport = () => {
    if (!currentSamplingPlan || isNaN(parseInt(elements.defectsFound.value, 10))) {
      displayError('Please complete sampling and defect submission.');
      return;
    }
    const defectsFound = parseInt(elements.defectsFound.value, 10);
    const reportId = `Report_${elements.partId.value || 'NoID'}_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;
    const verdictText = defectsFound <= currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT';
    const verdictColor = verdictText === 'ACCEPT' ? 'green' : 'red';
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
      .map(cb => sanitizeInput(cb.value));
    const lotSizeVal = parseInt(elements.lotSize.value, 10);
    const inspectionNote = lotSizeVal && currentSamplingPlan.sampleSize >= lotSizeVal
      ? '<p style="color: orange;">Note: 100% inspection performed.</p>'
      : '';

    const aqlText = elements.aql.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                    elements.aql.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                    'Low Quality (AQL 4.0%)';

    elements.reportContent.innerHTML = `
      <h3>Batch Identification</h3>
      <p><strong>Report ID:</strong> ${reportId}</p>
      <p><strong>QC Inspector:</strong> ${sanitizeInput(elements.qcInspector.value) || 'N/A'}</p>
      <p><strong>Machine No:</strong> ${sanitizeInput(elements.machineNumber.value) || 'N/A'}</p>
      <p><strong>Part Name:</strong> ${sanitizeInput(elements.partName.value) || 'N/A'}</p>
      <p><strong>Part ID:</strong> ${sanitizeInput(elements.partId.value) || 'N/A'}</p>
      <p><strong>PO Number:</strong> ${sanitizeInput(elements.poNumber.value) || 'N/A'}</p>
      <p><strong>Production Date:</strong> ${elements.productionDate.value || 'N/A'}</p>
      <p><strong>Inspection Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Inspection Time:</strong> ${new Date().toLocaleTimeString()}</p>

      <h3>Sampling Details</h3>
      <p><strong>Lot Size:</strong> ${lotSizeVal}</p>
      <p><strong>Inspection Level:</strong> General Level II</p>
      <p><strong>AQL:</strong> ${aqlText}</p>
      <p><strong>Code Letter:</strong> ${currentSamplingPlan.codeLetter}</p>
      <p><strong>Sample Size:</strong> ${currentSamplingPlan.sampleSize}</p>
      ${inspectionNote}
      <p><strong>Accept (Ac):</strong> ${currentSamplingPlan.accept}</p>
      <p><strong>Reject (Re):</strong> ${currentSamplingPlan.reject}</p>

      <h3>Inspection Results</h3>
      <p><strong>Defects Found:</strong> ${defectsFound}</p>
      <p><strong>Verdict:</strong> <span style="color: ${verdictColor};">${verdictText}</span></p>

      <h3>Defect Types</h3>
      ${selectedDefects.length > 0
        ? `<ul>${selectedDefects.map(defect => `<li>${defect}</li>`).join('')}</ul>`
        : '<p>No defect types recorded.</p>'}

      <h3>Photos</h3>
      ${capturedPhotos.length > 0
        ? capturedPhotos.map((photo, index) => `<p>Photo ${index + 1}:<br><img src="${photo}" style="max-width: 200px;"></p>`).join('')
        : '<p>No photos added.</p>'}

      <p>${copyrightNotice}</p>
    `;

    fadeIn(elements.finalReportArea);
    fadeIn(elements.savePdfButton);
    fadeIn(elements.printButton);
  };

  // --- Save PDF ---
  const saveReportAsPdf = () => {
    if (!window.jspdf) {
      displayError('PDF generation unavailable. Please check your internet connection.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 10;
    let y = 15;

    doc.setFontSize(16);
    doc.text("Quality Control Inspection Report", margin, y);
    y += 10;

    doc.setFontSize(12);
    const reportId = `Report_${elements.partId.value || 'NoID'}_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;
    doc.autoTable({
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Report ID', reportId],
        ['QC Inspector', sanitizeInput(elements.qcInspector.value) || 'N/A'],
        ['Machine No', sanitizeInput(elements.machineNumber.value) || 'N/A'],
        ['Part Name', sanitizeInput(elements.partName.value) || 'N/A'],
        ['Part ID', sanitizeInput(elements.partId.value) || 'N/A'],
        ['PO Number', sanitizeInput(elements.poNumber.value) || 'N/A'],
        ['Production Date', elements.productionDate.value || 'N/A'],
        ['Inspection Date', new Date().toLocaleDateString()],
        ['Inspection Time', new Date().toLocaleTimeString()]
      ],
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 130 } }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.text("Sampling Details", margin, y);
    y += 5;
    const aqlText = elements.aql.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                    elements.aql.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                    'Low Quality (AQL 4.0%)';
    doc.autoTable({
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Lot Size', elements.lotSize.value],
        ['Inspection Level', 'General Level II'],
        ['AQL', aqlText],
        ['Code Letter', currentSamplingPlan.codeLetter],
        ['Sample Size', currentSamplingPlan.sampleSize],
        ...(currentSamplingPlan.sampleSize >= parseInt(elements.lotSize.value, 10) ? [['Note', '100% inspection']] : []),
        ['Accept (Ac)', currentSamplingPlan.accept],
        ['Reject (Re)', currentSamplingPlan.reject]
      ],
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.text("Inspection Results", margin, y);
    y += 5;
    doc.autoTable({
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Defects Found', elements.defectsFound.value],
        ['Verdict', defectsFound <= currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT']
      ],
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    y = doc.lastAutoTable.finalY + 10;

    doc.text("Defect Types", margin, y);
    y += 7;
    const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
      .map(cb => sanitizeInput(cb.value));
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
      doc.text("No defect types recorded.", margin, y);
      y += 7;
    }
    y += 10;

    doc.text("Photos", margin, y);
    y += 7;
    if (capturedPhotos.length > 0) {
      capturedPhotos.forEach((photo, index) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        doc.text(`Photo ${index + 1}:`, margin, y);
        y += 5;
        try {
          doc.addImage(photo, 'JPEG', margin, y, 50, 50, undefined, 'FAST');
          y += 55;
        } catch (err) {
          doc.text("(Photo unavailable)", margin, y);
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
    doc.setFontSize(8);
    doc.text(copyrightNotice, margin, y, { maxWidth: 180 });

    doc.save(`${reportId}.pdf`);
    alert(`PDF saved. Send report ${reportId} to ${qcMonitorContact}.`);
  };

  // --- Print Report ---
  const printReport = () => {
    window.print();
  };

  // --- Reset ---
  const resetAll = () => {
    elements.aqlForm.reset();
    elements.lotSize.value = '';
    elements.partId.value = '';
    populatePartNameDropdown();
    elements.results.innerHTML = '<p class="initial-message">Please enter batch details, select AQL, and calculate.</p>';
    resetDownstreamSections();
    elements.defectsFound.value = '';
    document.querySelectorAll('#defectChecklist input[type="checkbox"]').forEach(cb => cb.checked = false);
    clearError();
    validateBatchSection();
    elements.qcInspector.focus();
  };

  // --- Event Listeners ---
  elements.qcInspector.addEventListener('change', validateBatchSection);
  elements.machineNumber.addEventListener('change', validateBatchSection);
  elements.poNumber.addEventListener('input', debounce(validateBatchSection, 300));
  elements.productionDate.addEventListener('change', validateBatchSection);
  elements.numBoxes.addEventListener('input', debounce(calculateLotSize, 300));
  elements.pcsPerBox.addEventListener('input', debounce(calculateLotSize, 300));
  elements.aql.addEventListener('change', validateLotSection);
  elements.defectsFound.addEventListener('change', validateDefectsSection);

  elements.calculateButton.addEventListener('click', () => {
    currentSamplingPlan = calculateSamplingPlan();
    if (currentSamplingPlan) displaySamplingPlan(currentSamplingPlan);
  });

  elements.submitDefectsButton.addEventListener('click', submitDefects);
  elements.generateReportButton.addEventListener('click', generateReport);
  elements.savePdfButton.addEventListener('click', saveReportAsPdf);
  elements.printButton.addEventListener('click', printReport);
  elements.resetButton.addEventListener('click', resetAll);

  elements.uploadMultiplePhotos.addEventListener('change', (e) => handleFileUpload(e.target.files));

  elements.photoPreview.addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG') {
      const index = parseInt(e.target.dataset.index, 10);
      const action = prompt('Type "annotate" to annotate or "remove" to delete this photo.');
      if (action?.toLowerCase() === 'annotate') {
        initAnnotationCanvas(capturedPhotos[index], index);
        elements.annotationModal.style.display = 'flex';
      } else if (action?.toLowerCase() === 'remove' && confirm('Remove this photo?')) {
        removePhoto(index);
      }
    }
  });

  elements.photoPreview.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'IMG' && e.key === 'Enter') {
      e.target.click();
    }
  });

  elements.closeModal.addEventListener('click', closeAnnotationModal);
  elements.annotationModal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAnnotationModal();
  });

  // --- Touch Enhancements ---
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', () => button.classList.add('active'), { passive: true });
    button.addEventListener('touchend', () => button.classList.remove('active'), { passive: true });
  });

  // --- Offline Detection ---
  window.addEventListener('offline', () => {
    displayError('You are offline. Some features may be limited.');
  });

  // --- Initial Setup ---
  populatePartNameDropdown();
  resetAll();

  // --- Register Service Worker ---
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('ServiceWorker registered:', reg.scope))
      .catch(err => console.error('ServiceWorker registration failed:', err));
  }
});