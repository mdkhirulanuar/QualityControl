/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/
import { fadeIn, fadeOut } from './utils.js';
import { validateLotSection, validateDefectsSection } from './formValidation.js';

export let currentSamplingPlan = null;

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

export function populatePartNameDropdown() {
    const partNameInput = document.getElementById('partName');
    partNameInput.innerHTML = '<option value="">-- Select Part Name --</option>';
    const uniquePartNames = [...new Set(partsList.map(part => part.partName))];
    uniquePartNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        partNameInput.appendChild(option);
    });
}

export function initSamplingPlan() {
    const partNameInput = document.getElementById('partName');
    const partIdInput = document.getElementById('partId');
    const calculateButton = document.getElementById('calculateButton');
    const resultsDiv = document.getElementById('results');
    const defectsInputArea = document.getElementById('defectsInputArea');
    const photoCaptureArea = document.getElementById('photoCaptureArea');
    const verdictMessageDiv = document.getElementById('verdictMessage');
    const defectChecklistDiv = document.getElementById('defectChecklist');
    const generateReportButton = document.getElementById('generateReportButton');
    const finalReportAreaDiv = document.getElementById('finalReportArea');
    const savePdfButton = document.getElementById('savePdfButton');
    const printButton = document.getElementById('printButton');
    const errorMessageDiv = document.getElementById('error-message');
    const lotSizeInput = document.getElementById('lotSize');
    const aqlSelect = document.getElementById('aql');
    const numBoxesInput = document.getElementById('numBoxes');
    const pcsPerBoxInput = document.getElementById('pcsPerBox');

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
            displayError(Could not determine Sample Size Code Letter for Lot Size ${lotSize}.);
            return null;
        }

        const planData = aqlMasterTable_Simplified[codeLetter];
        if (!planData || !planData.plans) {
            displayError(AQL data not found for Code Letter ${codeLetter}.);
            return null;
        }

        const sampleSize = planData.sampleSize;
        const planDetails = planData.plans[aqlValue];

        if (!planDetails || typeof planDetails.ac === 'undefined' || typeof planDetails.re === 'undefined') {
            displayError(Ac/Re values not found for Code Letter ${codeLetter} and AQL ${aqlValue}.);
            return null;
        }

        if (sampleSize >= lotSize) {
            console.warn(Sample Size (${sampleSize}) equals/exceeds Lot Size (${lotSize}).);
        }

        return {
            codeLetter: codeLetter,
            sampleSize: sampleSize,
            accept: planDetails.ac,
            reject: planDetails.re
        };
    }

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

            samplingInstructions = 
                <p><strong>Sampling Instructions:</strong></p>
                <ul>
                    <li>Randomly select and open <strong>${boxesToOpen}</strong> box(es) (out of ${numBoxesVal}).</li>
                    <li>From each opened box, inspect <strong>${pcsPerOpenedBox}</strong> piece(s).</li>
                </ul>
                <p><small>(Total pieces inspected: ${totalInspected}${totalInspected > plan.sampleSize ? ', slightly exceeding the minimum sample size of ' + plan.sampleSize : ''})</small></p>;
        }

        const aqlText = aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                        aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                        aqlSelect.value === '4.0' ? 'Low Quality (AQL 4.0%)' :
                        AQL ${aqlSelect.value}%;

        resultsDiv.innerHTML = 
            <p><strong>Sampling Plan Calculated:</strong></p>
            <p>Lot Size: ${lotSizeInput.value}</p>
            <p>Inspection Level: General Level II (Normal)</p>
            <p>Acceptable Quality Level: ${aqlText}</p>
            <p>Sample Size Code Letter: <strong>${plan.codeLetter}</strong></p>
            <p>Sample Size: <strong>${plan.sampleSize}</strong></p>
            <p>Acceptance Number (Ac): Max ${plan.accept} defects.</p>
            <p>Rejection Number (Re): ${plan.reject} or more defects, reject lot.</p>
            ${samplingInstructions}
        ;

        fadeIn(resultsDiv);
        fadeIn(defectsInputArea);
        fadeOut(photoCaptureArea);
        fadeOut(verdictMessageDiv);
        fadeOut(defectChecklistDiv);
        fadeOut(finalReportAreaDiv);
        fadeOut(generateReportButton);
        fadeOut(savePdfButton);
        fadeOut(printButton);
        updateProgress(3);
    }

    function updateProgress(step) {
        document.querySelectorAll('.step').forEach((s, i) => {
            s.classList.toggle('active', i + 1 === step);
        });
    }

    calculateButton.addEventListener('click', () => {
        currentSamplingPlan = calculateSamplingPlan();
        if (currentSamplingPlan) {
            displaySamplingPlan(currentSamplingPlan);
        } else {
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
    });

    partNameInput.addEventListener('change', function() {
        const selectedPartName = partNameInput.value;
        const part = partsList.find(p => p.partName === selectedPartName);
        partIdInput.value = part ? part.partId : '';
        validateBatchSection();
    });
}
