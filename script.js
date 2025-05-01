/*
    Copyright © 2025 Khirul Anuar. This AQL Sampling Calculator Tool is the initiative of Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/

// DOM Elements
const aqlForm = document.getElementById('aqlForm');
const qcInspectorInput = document.getElementById('qcInspector');
const operatorNameInput = document.getElementById('operatorName');
const machineNumberInput = document.getElementById('machineNumber');
const partIdInput = document.getElementById('partId');
const partNameInput = document.getElementById('partName');
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
const uploadSinglePhoto = document.getElementById('uploadSinglePhoto');
const uploadMultiplePhotos = document.getElementById('uploadMultiplePhotos');
const photoPreview = document.getElementById('photoPreview');
const photoCount = document.getElementById('photoCount');
const annotationModal = document.getElementById('annotationModal');
const annotationCanvas = document.getElementById('annotationCanvas');
const drawCircleButton = document.getElementById('drawCircleButton');
const drawTextButton = document.getElementById('drawTextButton');
const drawFreehandButton = document.getElementById('drawFreehandButton');
const undoButton = document.getElementById('undoButton');
const saveAnnotationButton = document.getElementById('saveAnnotationButton');
const closeModal = document.querySelector('.close-modal');
const verdictMessageDiv = document.getElementById('verdictMessage');
const defectChecklistDiv = document.getElementById('defectChecklist');
const generateReportButton = document.getElementById('generateReportButton');
const savePdfButton = document.getElementById('savePdfButton');
const printButton = document.getElementById('printButton');
const finalReportAreaDiv = document.getElementById('finalReportArea');
const errorMessageDiv = document.getElementById('error-message');

// Predefined values for dropdowns
const machineNumbers = Array.from({ length: 30 }, (_, i) => `M${i + 1}`); // M1 to M30
const numBoxesOptions = Array.from({ length: 100 }, (_, i) => i + 1); // 1 to 100
const pcsPerBoxOptions = Array.from({ length: 299 }, (_, i) => i + 2); // 2 to 300
const defectsFoundOptions = Array.from({ length: 26 }, (_, i) => i); // 0 to 25

// Constants
const MAX_PHOTOS = 5;
const qcMonitorContact = 'QC Monitor (qc.monitor@kpiem.com.my)';
let currentSamplingPlan = null;
let capturedPhotos = [];
let fabricCanvas = null;
let currentMode = null;
let annotationHistory = [];
let currentPhotoIndex = null;

// AQL Master Table (Simplified)
const aqlMasterTable_Simplified = {
    lotSizeRanges: [
        { min: 2, max: 8, codeLetter: 'A' },
        { min: 9, max: 15, codeLetter: 'B' },
        { min: 16, max: 25, codeLetter: 'C' },
        { min: 26, max: 50, codeLetter: 'D' },
        { min: 51, max: 90, codeLetter: 'E' },
        { min: 91, max: 150, codeLetter: 'F' },
        { min: 151, max: 280, codeLetter: 'G' },
        { min: 281, max: 500, codeLetter: 'H' },
        { min: 501, max: 1200, codeLetter: 'J' },
        { min: 1201, max: 3200, codeLetter: 'K' },
        { min: 3201, max: 10000, codeLetter: 'L' },
        { min: 10001, max: 35000, codeLetter: 'M' },
        { min: 35001, max: 150000, codeLetter: 'N' },
        { min: 150001, max: 500000, codeLetter: 'P' },
        { min: 500001, max: Infinity, codeLetter: 'Q' }
    ],
    sampleSizes: {
        'A': 2,
        'B': 3,
        'C': 5,
        'D': 8,
        'E': 13,
        'F': 20,
        'G': 32,
        'H': 50,
        'J': 80,
        'K': 125,
        'L': 200,
        'M': 315,
        'N': 500,
        'P': 800,
        'Q': 1250
    },
    acceptanceNumbers: {
        '1.0': {
            'A': { accept: 0, reject: 1 },
            'B': { accept: 0, reject: 1 },
            'C': { accept: 0, reject: 1 },
            'D': { accept: 0, reject: 1 },
            'E': { accept: 1, reject: 2 },
            'F': { accept: 1, reject: 2 },
            'G': { accept: 2, reject: 3 },
            'H': { accept: 3, reject: 4 },
            'J': { accept: 5, reject: 6 },
            'K': { accept: 7, reject: 8 },
            'L': { accept: 10, reject: 11 },
            'M': { accept: 14, reject: 15 },
            'N': { accept: 21, reject: 22 },
            'P': { accept: 21, reject: 22 },
            'Q': { accept: 21, reject: 22 }
        },
        '2.5': {
            'A': { accept: 0, reject: 1 },
            'B': { accept: 0, reject: 1 },
            'C': { accept: 0, reject: 1 },
            'D': { accept: 1, reject: 2 },
            'E': { accept: 1, reject: 2 },
            'F': { accept: 2, reject: 3 },
            'G': { accept: 3, reject: 4 },
            'H': { accept: 5, reject: 6 },
            'J': { accept: 7, reject: 8 },
            'K': { accept: 10, reject: 11 },
            'L': { accept: 14, reject: 15 },
            'M': { accept: 21, reject: 22 },
            'N': { accept: 21, reject: 22 },
            'P': { accept: 21, reject: 22 },
            'Q': { accept: 21, reject: 22 }
        },
        '4.0': {
            'A': { accept: 0, reject: 1 },
            'B': { accept: 0, reject: 1 },
            'C': { accept: 1, reject: 2 },
            'D': { accept: 1, reject: 2 },
            'E': { accept: 2, reject: 3 },
            'F': { accept: 3, reject: 4 },
            'G': { accept: 5, reject: 6 },
            'H': { accept: 7, reject: 8 },
            'J': { accept: 10, reject: 11 },
            'K': { accept: 14, reject: 15 },
            'L': { accept: 21, reject: 22 },
            'M': { accept: 21, reject: 22 },
            'N': { accept: 21, reject: 22 },
            'P': { accept: 21, reject: 22 },
            'Q': { accept: 21, reject: 22 }
        }
    }
};

// Utility Functions
function fadeIn(element) {
    element.style.opacity = '0';
    element.style.display = 'block';
    let opacity = 0;
    const interval = setInterval(() => {
        if (opacity >= 1) {
            clearInterval(interval);
        }
        element.style.opacity = opacity;
        opacity += 0.1;
    }, 50);
}

function fadeOut(element) {
    let opacity = 1;
    const interval = setInterval(() => {
        if (opacity <= 0) {
            element.style.display = 'none';
            clearInterval(interval);
        }
        element.style.opacity = opacity;
        opacity -= 0.1;
    }, 50);
}

function displayError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    setTimeout(() => {
        errorMessageDiv.style.display = 'none';
    }, 5000);
}

function clearError() {
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';
}

// Populate Part ID Dropdown
function populatePartIdDropdown() {
    partIdInput.innerHTML = '<option value="">-- Select Part ID --</option>';
    partsList.forEach(part => {
        const option = document.createElement('option');
        option.value = part.partId;
        option.textContent = `${part.partId} - ${part.partName}`;
        partIdInput.appendChild(option);
    });
}

// Populate Dropdowns for Machine No, Number of Boxes, Pieces per Box, and Defects Found
function populateDropdowns() {
    // Populate Machine No
    machineNumberInput.innerHTML = '<option value="">-- Select Machine No --</option>';
    machineNumbers.forEach(machine => {
        const option = document.createElement('option');
        option.value = machine;
        option.textContent = machine;
        machineNumberInput.appendChild(option);
    });

    // Populate Number of Boxes
    numBoxesInput.innerHTML = '<option value="">-- Select Number of Boxes --</option>';
    numBoxesOptions.forEach(num => {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        numBoxesInput.appendChild(option);
    });

    // Populate Pieces per Box
    pcsPerBoxInput.innerHTML = '<option value="">-- Select Pieces per Box --</option>';
    pcsPerBoxOptions.forEach(num => {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        pcsPerBoxInput.appendChild(option);
    });

    // Populate Defects Found
    defectsFoundInput.innerHTML = '<option value="">-- Select Defects Found --</option>';
    defectsFoundOptions.forEach(num => {
        const option = document.createElement('option');
        option.value = num;
        option.textContent = num;
        defectsFoundInput.appendChild(option);
    });
}

// Calculate Lot Size
function calculateLotSize() {
    const numBoxes = parseInt(numBoxesInput.value, 10);
    const pcsPerBox = parseInt(pcsPerBoxInput.value, 10);
    if (!isNaN(numBoxes) && numBoxes > 0 && !isNaN(pcsPerBox) && pcsPerBox > 0) {
        lotSizeInput.value = numBoxes * pcsPerBox;
    } else {
        lotSizeInput.value = '';
    }
}

// Validate Inputs
function validateInputs() {
    const machineNumberValid = machineNumberInput.value !== '';
    const numBoxesValid = numBoxesInput.value !== '';
    const pcsPerBoxValid = pcsPerBoxInput.value !== '';
    const aqlSelected = aqlSelect.value !== '';
    calculateButton.disabled = !(machineNumberValid && numBoxesValid && pcsPerBoxValid && aqlSelected);
}

// Calculate Sampling Plan
function calculateSamplingPlan() {
    clearError();
    const lotSize = parseInt(lotSizeInput.value, 10);
    const aql = aqlSelect.value;

    if (isNaN(lotSize) || lotSize <= 0) {
        displayError('Please enter valid Number of Boxes and Pieces per Box.');
        return null;
    }
    if (!aql) {
        displayError('Please select an Acceptable Quality Level.');
        return null;
    }

    const range = aqlMasterTable_Simplified.lotSizeRanges.find(r => lotSize >= r.min && lotSize <= r.max);
    if (!range) {
        displayError('Lot size is outside the supported range.');
        return null;
    }

    const codeLetter = range.codeLetter;
    const sampleSize = aqlMasterTable_Simplified.sampleSizes[codeLetter];
    const acceptance = aqlMasterTable_Simplified.acceptanceNumbers[aql][codeLetter];

    return {
        codeLetter,
        sampleSize,
        accept: acceptance.accept,
        reject: acceptance.reject
    };
}

// Display Sampling Plan
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

// Submit Defects
function submitDefects() {
    clearError();
    const defectsFound = parseInt(defectsFoundInput.value, 10);
    if (isNaN(defectsFound) || defectsFoundInput.value === '') {
        displayError('Please select a valid number of defects.');
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
    const verdictMessage = defectsFound <= currentSamplingPlan.accept
        ? `Please proceed with ACCEPT procedures for this lot.`
        : `REJECT this lot and report to ${qcMonitorContact}.`;
    const verdictClass = defectsFound <= currentSamplingPlan.accept ? 'accept' : 'reject';
    verdictMessageDiv.innerHTML = `
        <p class="${verdictClass}">${verdict}</p>
        <p>${verdictMessage}</p>`;
    fadeIn(verdictMessageDiv);
    fadeIn(defectChecklistDiv);
    fadeIn(generateReportButton);
    fadeOut(finalReportAreaDiv);
    fadeOut(savePdfButton);
    fadeOut(printButton);
}

// Photo Handling
function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_PHOTOS - capturedPhotos.length;
    if (files.length > remainingSlots) {
        displayError(`You can only add ${remainingSlots} more photo(s).`);
        return;
    }

    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            displayError('Only image files are allowed.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            capturedPhotos.push(e.target.result);
            updatePhotoPreview();
        };
        reader.readAsDataURL(file);
    });

    // Reset the input
    event.target.value = '';
}

function updatePhotoPreview() {
    if (capturedPhotos.length === 0) {
        photoPreview.innerHTML = '<p>No photos added yet.</p>';
        uploadMultiplePhotos.disabled = false;
    } else {
        photoPreview.innerHTML = capturedPhotos.map((photo, index) => `
            <div class="photo-item" data-index="${index}">
                <img src="${photo}" alt="Captured Photo ${index + 1}">
                <p>Photo ${index + 1}</p>
            </div>
        `).join('');
        uploadMultiplePhotos.disabled = capturedPhotos.length >= MAX_PHOTOS;
    }
    photoCount.textContent = `Photos: ${capturedPhotos.length}/${MAX_PHOTOS}`;
}

// Annotation Handling
function initializeCanvas(imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
        annotationCanvas.width = img.width;
        annotationCanvas.height = img.height;
        fabricCanvas = new fabric.Canvas('annotationCanvas', {
            width: img.width,
            height: img.height
        });
        fabricCanvas.setBackgroundImage(img.src, fabricCanvas.renderAll.bind(fabricCanvas));
        fabricCanvas.isDrawingMode = false;
        annotationHistory = [];

        fabricCanvas.on('mouse:down', (options) => {
            if (currentMode === 'circle') {
                const pointer = fabricCanvas.getPointer(options.e);
                const circle = new fabric.Circle({
                    left: pointer.x - 25,
                    top: pointer.y - 25,
                    radius: 25,
                    fill: '',
                    stroke: 'red',
                    strokeWidth: 2,
                    selectable: false
                });
                fabricCanvas.add(circle);
                annotationHistory.push(circle);
            } else if (currentMode === 'text') {
                const pointer = fabricCanvas.getPointer(options.e);
                const text = new fabric.Textbox('Defect', {
                    left: pointer.x,
                    top: pointer.y,
                    fontSize: 20,
                    fill: 'red',
                    editable: true
                });
                fabricCanvas.add(text);
                fabricCanvas.setActiveObject(text);
                text.enterEditing();
                annotationHistory.push(text);
            }
        });
    };
}

function closeAnnotationModal() {
    annotationModal.style.display = 'none';
    if (fabricCanvas) {
        fabricCanvas.dispose();
        fabricCanvas = null;
    }
    currentMode = null;
    annotationHistory = [];
    currentPhotoIndex = null;
}

// Generate Report
function generateReport() {
    const qcInspector = qcInspectorInput.value || 'Not specified';
    const operatorName = operatorNameInput.value || 'Not specified';
    const machineNumber = machineNumberInput.value || 'Not specified';
    const partId = partIdInput.value || 'Not specified';
    const partName = partNameInput.value || 'Not specified';
    const numBoxes = numBoxesInput.value || 'Not specified';
    const pcsPerBox = pcsPerBoxInput.value || 'Not specified';
    const lotSize = lotSizeInput.value || 'Not specified';
    const aql = aqlSelect.value ? (aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                                  aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                                  'Low Quality (AQL 4.0%)') : 'Not specified';
    const defectsFound = defectsFoundInput.value || 'Not specified';
    const verdictHtml = verdictMessageDiv.innerHTML || '<p>Not calculated</p>';

    const defectTypes = Array.from(document.querySelectorAll('#defectChecklist input[type="checkbox"]:checked'))
        .map(cb => cb.value)
        .join(', ') || 'None specified';

    let photosHtml = capturedPhotos.length > 0
        ? capturedPhotos.map((photo, index) => `
            <div class="report-photo">
                <p>Photo ${index + 1}</p>
                <img src="${photo}" alt="Photo ${index + 1}">
            </div>
        `).join('')
        : '<p>No photos included.</p>';

    const reportHtml = `
        <h3>Batch Identification</h3>
        <table class="report-table">
            <tr><th>QC Inspector</th><td>${qcInspector}</td></tr>
            <tr><th>Operator Name</th><td>${operatorName}</td></tr>
            <tr><th>Machine No</th><td>${machineNumber}</td></tr>
            <tr><th>Part ID</th><td>${partId}</td></tr>
            <tr><th>Part Name</th><td>${partName}</td></tr>
        </table>

        <h3>Sampling Details & Plan</h3>
        <table class="report-table">
            <tr><th>Number of Boxes</th><td>${numBoxes}</td></tr>
            <tr><th>Pieces per Box</th><td>${pcsPerBox}</td></tr>
            <tr><th>Total Lot Size</th><td>${lotSize}</td></tr>
            <tr><th>Acceptable Quality Level</th><td>${aql}</td></tr>
            <tr><th>Sample Size</th><td>${currentSamplingPlan ? currentSamplingPlan.sampleSize : 'Not calculated'}</td></tr>
            <tr><th>Acceptance Number (Ac)</th><td>${currentSamplingPlan ? currentSamplingPlan.accept : 'Not calculated'}</td></tr>
            <tr><th>Rejection Number (Re)</th><td>${currentSamplingPlan ? currentSamplingPlan.reject : 'Not calculated'}</td></tr>
        </table>

        <h3>Inspection Results</h3>
        <table class="report-table">
            <tr><th>Defects Found</th><td>${defectsFound}</td></tr>
            <tr><th>Verdict</th><td>${verdictHtml}</td></tr>
            <tr><th>Defect Types Observed</th><td>${defectTypes}</td></tr>
        </table>

        <h3>Photo Documentation</h3>
        ${photosHtml}
    `;

    document.getElementById('reportContent').innerHTML = reportHtml;
    fadeIn(finalReportAreaDiv);
    fadeIn(savePdfButton);
    fadeIn(printButton);
}

// Save Report as PDF
function saveReportAsPdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const reportElement = document.getElementById('reportContent');
    const tables = reportElement.querySelectorAll('.report-table');
    let yOffset = 10;

    doc.setFontSize(16);
    doc.text('AQL Sampling Inspection Report', 10, yOffset);
    yOffset += 10;

    tables.forEach((table, index) => {
        const sectionTitle = reportElement.querySelectorAll('h3')[index].textContent;
        doc.setFontSize(12);
        doc.text(sectionTitle, 10, yOffset);
        yOffset += 5;

        doc.autoTable({
            html: table,
            startY: yOffset,
            theme: 'striped',
            styles: { fontSize: 10 },
            headStyles: { fillColor: [37, 117, 252] },
            margin: { left: 10, right: 10 }
        });
        yOffset = doc.lastAutoTable.finalY + 10;
    });

    const photosSection = reportElement.querySelectorAll('.report-photo');
    if (photosSection.length > 0) {
        doc.setFontSize(12);
        doc.text('Photo Documentation', 10, yOffset);
        yOffset += 5;

        photosSection.forEach((photoDiv, index) => {
            const img = photoDiv.querySelector('img');
            if (img && yOffset < 270) {
                const imgData = img.src;
                try {
                    doc.addImage(imgData, 'JPEG', 10, yOffset, 50, 50);
                    yOffset += 55;
                } catch (e) {
                    console.error('Error adding image to PDF:', e);
                }
            }
            if (yOffset >= 270 && index < photosSection.length - 1) {
                doc.addPage();
                yOffset = 10;
                doc.setFontSize(12);
                doc.text('Photo Documentation (Continued)', 10, yOffset);
                yOffset += 5;
            }
        });
    }

    doc.save('AQL_Inspection_Report.pdf');
    alert(`PDF report has been downloaded. Please send it to ${qcMonitorContact} for records.`);
}

// Print Report
function printReport() {
    window.print();
}

// Reset All
function resetAll() {
    aqlForm.reset();
    lotSizeInput.value = '';
    partIdInput.value = '';
    partNameInput.value = '';
    populatePartIdDropdown();
    populateDropdowns();
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

// Event Listeners
partIdInput.addEventListener('change', () => {
    const selectedPart = partsList.find(part => part.partId === partIdInput.value);
    partNameInput.value = selectedPart ? selectedPart.partName : '';
    clearError();
});

numBoxesInput.addEventListener('change', () => {
    calculateLotSize();
    validateInputs();
    clearError();
});

pcsPerBoxInput.addEventListener('change', () => {
    calculateLotSize();
    validateInputs();
    clearError();
});

machineNumberInput.addEventListener('change', () => {
    validateInputs();
    clearError();
});

aqlSelect.addEventListener('change', () => {
    validateInputs();
    clearError();
});

calculateButton.addEventListener('click', () => {
    const plan = calculateSamplingPlan();
    if (plan) {
        currentSamplingPlan = plan;
        displaySamplingPlan(plan);
    }
});

resetButton.addEventListener('click', resetAll);

submitDefectsButton.addEventListener('click', submitDefects);

uploadSinglePhoto.addEventListener('change', handleFileUpload);
uploadMultiplePhotos.addEventListener('change', handleFileUpload);

photoPreview.addEventListener('click', (event) => {
    const photoItem = event.target.closest('.photo-item');
    if (photoItem) {
        const index = parseInt(photoItem.dataset.index, 10);
        const action = prompt('Type "annotate" to annotate or "remove" to delete this photo:').toLowerCase();
        if (action === 'annotate') {
            currentPhotoIndex = index;
            initializeCanvas(capturedPhotos[index]);
            annotationModal.style.display = 'block';
        } else if (action === 'remove') {
            if (confirm('Are you sure you want to remove this photo?')) {
                capturedPhotos.splice(index, 1);
                updatePhotoPreview();
            }
        }
    }
});

drawCircleButton.addEventListener('click', () => {
    currentMode = currentMode === 'circle' ? null : 'circle';
    fabricCanvas.isDrawingMode = false;
    drawCircleButton.classList.toggle('active', currentMode === 'circle');
    drawTextButton.classList.remove('active');
    drawFreehandButton.classList.remove('active');
});

drawTextButton.addEventListener('click', () => {
    currentMode = currentMode === 'text' ? null : 'text';
    fabricCanvas.isDrawingMode = false;
    drawTextButton.classList.toggle('active', currentMode === 'text');
    drawCircleButton.classList.remove('active');
    drawFreehandButton.classList.remove('active');
});

drawFreehandButton.addEventListener('click', () => {
    currentMode = currentMode === 'freehand' ? null : 'freehand';
    fabricCanvas.isDrawingMode = currentMode === 'freehand';
    fabricCanvas.freeDrawingBrush.color = 'red';
    fabricCanvas.freeDrawingBrush.width = 2;
    drawFreehandButton.classList.toggle('active', currentMode === 'freehand');
    drawCircleButton.classList.remove('active');
    drawTextButton.classList.remove('active');
});

undoButton.addEventListener('click', () => {
    if (annotationHistory.length > 0) {
        const lastObject = annotationHistory.pop();
        fabricCanvas.remove(lastObject);
        fabricCanvas.renderAll();
    }
});

saveAnnotationButton.addEventListener('click', () => {
    if (currentPhotoIndex !== null) {
        capturedPhotos[currentPhotoIndex] = fabricCanvas.toDataURL('image/jpeg');
        updatePhotoPreview();
        closeAnnotationModal();
    }
});

closeModal.addEventListener('click', closeAnnotationModal);

generateReportButton.addEventListener('click', generateReport);
savePdfButton.addEventListener('click', saveReportAsPdf);
printButton.addEventListener('click', printReport);

// Initial Setup
populatePartIdDropdown();
populateDropdowns();
resetAll();
