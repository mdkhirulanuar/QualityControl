/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/
import { openDB } from '/libs/idb.min.js';
import { populatePartNameDropdown } from './samplingPlan.js';
import { fadeIn, fadeOut } from './utils.js';

const dbPromise = openDB('InspectWiseDB', 1, {
    upgrade(db) {
        db.createObjectStore('formData', { keyPath: 'id' });
        db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
    }
});

export function initFormValidation() {
    // DOM Elements
    const aqlForm = document.getElementById('aqlForm');
    const qcInspectorInput = document.getElementById('qcInspector');
    const machineNumberInput = document.getElementById('machineNumber');
    const partNameInput = document.getElementById('partId');
    const partIdInput = document.getElementById('partId');
    const poNumberInput = document.getElementById('poNumber');
    const productionDateInput = document.getElementById('productionDate');
    const numBoxesInput = document.getElementById('numBoxes');
    const pcsPerBoxInput = document.getElementById('pcsPerBox');
    const lotSizeInput = document.getElementById('lotSize');
    const aqlSelect = document.getElementById('aql');
    const calculateButton = document.getElementById('calculateButton');
    const resultsDiv = document.getElementById('results');
    const defectsInputArea = document.getElementById('defectsInputArea');
    const defectsFoundInput = document.getElementById('defectsFound');
    const submitDefectsButton = document.getElementById('submitDefectsButton');
    const photoCaptureArea = document.getElementById('photoCaptureArea');
    const verdictMessageDiv = document.getElementById('verdictMessage');
    const defectChecklistDiv = document.getElementById('defectChecklist');
    const generateReportButton = document.getElementById('generateReportButton');
    const finalReportAreaDiv = document.getElementById('finalReportArea');
    const savePdfButton = document.getElementById('savePdfButton');
    const printButton = document.getElementById('printButton');
    const batchSection = document.querySelector('.batch-info');
    const lotSection = document.querySelector('.lot-details');
    const buttonGroup = document.querySelector('.button-group');
    const errorMessageDiv = document.getElementById('error-message');

    // Helper Functions
    function displayError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
        logError(message, {});
    }

    function clearError() {
        errorMessageDiv.textContent = '';
        errorMessageDiv.style.display = 'none';
    }

    function logError(message, details) {
        const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
        errorLog.push({ timestamp: new Date().toISOString(), message, details });
        localStorage.setItem('errorLog', JSON.stringify(errorLog));
        console.error(message, details);
    }

    function calculateLotSize() {
        const numBoxes = parseInt(numBoxesInput.value, 10);
        const pcsPerBox = parseInt(pcsPerBoxInput.value, 10);
        if (!isNaN(numBoxes) && numBoxes > 0 && !isNaN(pcsPerBox) && pcsPerBox > 0) {
            lotSizeInput.value = numBoxes * pcsPerBox;
        } else {
            lotSizeInput.value = '';
        }
        validateLotSection();
    }

    // Validation Functions
    export function validateBatchSection() {
        const isValid = qcInspectorInput.value !== '' &&
                        machineNumberInput.value !== '' &&
                        partIdInput.value !== '' &&
                        partNameInput.value !== '' &&
                        /^[a-zA-Z0-9]{1,20}$/.test(poNumberInput.value.trim()) &&
                        productionDateInput.value !== '';
        if (isValid) {
            fadeIn(lotSection);
            fadeIn(buttonGroup);
        } else {
            fadeOut(lotSection);
            fadeOut(buttonGroup);
            fadeOut(resultsDiv);
            fadeOut(defectsInputArea);
            fadeOut(photoCaptureArea);
            fadeOut(verdictMessageDiv);
            fadeOut(defectChecklistDiv);
            fadeOut(finalReportAreaDiv);
            fadeOut(generateReportButton);
            fadeOut(savePdfButton);
            fadeOut(printButton);
        }
        return isValid;
    }

    export function validateLotSection() {
        const numBoxes = parseInt(numBoxesInput.value, 10);
        const pcsPerBox = parseInt(pcsPerBoxInput.value, 10);
        const isValid = numBoxes > 0 && numBoxes <= 9999 && pcsPerBox > 0 && pcsPerBox <= 9999 && aqlSelect.value !== '' && validateBatchSection();
        calculateButton.disabled = !isValid;
        if (!isValid) {
            fadeOut(resultsDiv);
            fadeOut(defectsInputArea);
            fadeOut(photoCaptureArea);
            fadeOut(verdictMessageDiv);
            fadeOut(defectChecklistDiv);
            fadeOut(finalReportAreaDiv);
            fadeOut(generateReportButton);
            fadeOut(savePdfButton);
            fadeOut(printButton);
        }
        return isValid;
    }

    export function validateDefectsSection() {
        const defectsFound = parseInt(defectsFoundInput.value, 10);
        const isValid = !isNaN(defectsFound) && defectsFound >= 0 && currentSamplingPlan;
        submitDefectsButton.disabled = !isValid;
        if (!isValid) {
            fadeOut(verdictMessageDiv);
            fadeOut(defectChecklistDiv);
            fadeOut(photoCaptureArea);
            fadeOut(finalReportAreaDiv);
            fadeOut(generateReportButton);
            fadeOut(savePdfButton);
            fadeOut(printButton);
        }
        return isValid;
    }

    // Event Listeners
    qcInspectorInput.addEventListener('change', validateBatchSection);
    machineNumberInput.addEventListener('change', validateBatchSection);
    partNameInput.addEventListener('change', validateBatchSection);
    poNumberInput.addEventListener('input', () => {
        const value = DOMPurify.sanitize(poNumberInput.value);
        if (!/^[a-zA-Z0-9]{0,20}$/.test(value)) {
            displayError('PO Number must be alphanumeric, max 20 characters.');
            poNumberInput.value = value.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '');
        } else {
            clearError();
            poNumberInput.value = value;
        }
        validateBatchSection();
    });
    productionDateInput.addEventListener('change', validateBatchSection);
    numBoxesInput.addEventListener('input', () => {
        const value = parseInt(numBoxesInput.value, 10);
        if (value < 1 || value > 9999) {
            displayError('Number of Boxes must be between 1 and 9999.');
            numBoxesInput.value = '';
        } else {
            clearError();
        }
        calculateLotSize();
    });
    pcsPerBoxInput.addEventListener('input', () => {
        const value = parseInt(pcsPerBoxInput.value, 10);
        if (value < 1 || value > 9999) {
            displayError('Pieces per Box must be between 1 and 9999.');
            pcsPerBoxInput.value = '';
        } else {
            clearError();
        }
        calculateLotSize();
    });
    aqlSelect.addEventListener('change', validateLotSection);
    defectsFoundInput.addEventListener('change', validateDefectsSection);

    // Virtual Keyboard Handling
    window.visualViewport.addEventListener('resize', () => {
        const viewportHeight = window.visualViewport.height;
        document.querySelector('.container').style.paddingBottom = ${window.innerHeight - viewportHeight + 20}px;
    });

    // Scroll to Input on Focus
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('focus', () => {
            setTimeout(() => input.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        });
    });

    // Persist Form Data
    aqlForm.addEventListener('input', async () => {
        const db = await dbPromise;
        await db.put('formData', { id: 'current', data: new FormData(aqlForm) });
    });

    async function loadFormData() {
        const db = await dbPromise;
        const saved = await db.get('formData', 'current');
        if (saved) {
            for (const [key, value] of saved.data.entries()) {
                const input = document.getElementById(key);
                if (input) input.value = value;
            }
            calculateLotSize();
            validateBatchSection();
        }
    }

    // Initialize
    populatePartNameDropdown();
    loadFormData();
}
