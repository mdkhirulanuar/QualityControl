// --- Tooltip Functionality for Mobile/Click ---
// This function finds all tooltip triggers and adds a click listener
// to show the title text in an alert box.
function initializeTooltips() {
    const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');

    tooltipTriggers.forEach(trigger => {
        const tooltipText = trigger.getAttribute('title');
        if (tooltipText) {
            // Remove previous listeners if any to avoid duplicates on reset/recalc
            trigger.removeEventListener('click', handleTooltipClick);
            // Add the new listener
            trigger.addEventListener('click', handleTooltipClick);
        }
    });
}

// Separate handler function for tooltips to manage listeners
function handleTooltipClick(event) {
    event.preventDefault(); // Prevent default browser action
    const tooltipText = this.getAttribute('title'); // 'this' refers to the clicked element
    // Replace HTML entity for newline with actual newline for alert
    alert(tooltipText.replace(/&#10;/g, '\n'));
}


document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const aqlForm = document.getElementById('aqlForm');
    // Batch Identification Inputs
    const qcInspectorInput = document.getElementById('qcInspector');
    const operatorNameInput = document.getElementById('operatorName');
    const machineNumberInput = document.getElementById('machineNumber');
    const partNameInput = document.getElementById('partName');
    const partIdInput = document.getElementById('partId');
    // Lot & Sampling Inputs
    const numBoxesInput = document.getElementById('numBoxes');
    const pcsPerBoxInput = document.getElementById('pcsPerBox');
    const lotSizeInput = document.getElementById('lotSize');
    const inspectionLevelSelect = document.getElementById('inspectionLevel');
    const aqlSelect = document.getElementById('aql');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const resultsDiv = document.getElementById('results');
    const errorMessageDiv = document.getElementById('error-message');

    // --- Elements for Step-by-Step Sections ---
    const defectsInputArea = document.getElementById('defectsInputArea');
    const defectsFoundInput = document.getElementById('defectsFound');
    const submitDefectsButton = document.getElementById('submitDefectsButton');
    const verdictMessageDiv = document.getElementById('verdictMessage');
    const defectChecklistDiv = document.getElementById('defectChecklist');
    const generateReportButton = document.getElementById('generateReportButton');
    const finalReportArea = document.getElementById('finalReportArea');
    const reportContentDiv = document.getElementById('reportContent');
    const checklistItems = defectChecklistDiv.querySelectorAll('input[type="checkbox"][name="defect_type"]');

    // --- Global variables to store state ---
    let currentAc = -1;
    let currentRe = -1;
    let currentSampleSize = -1;
    let currentVerdict = ''; // Will store "BATCH ACCEPT" or "BATCH REJECT..."
    let currentDefectsFound = -1;

    // --- AQL Data & Helper Functions ---

    // Sample Size Code Letters (Based on MIL-STD-105E / ISO 2859-1 Table I)
    const codeLetters = [
        { range: [2, 8], levels: { I: 'A', II: 'A', III: 'B' } },
        { range: [9, 15], levels: { I: 'A', II: 'B', III: 'C' } },
        { range: [16, 25], levels: { I: 'B', II: 'C', III: 'D' } },
        { range: [26, 50], levels: { I: 'C', II: 'D', III: 'E' } },
        { range: [51, 90], levels: { I: 'C', II: 'E', III: 'F' } },
        { range: [91, 150], levels: { I: 'D', II: 'F', III: 'G' } },
        { range: [151, 280], levels: { I: 'E', II: 'G', III: 'H' } },
        { range: [281, 500], levels: { I: 'F', II: 'H', III: 'J' } },
        { range: [501, 1200], levels: { I: 'G', II: 'J', III: 'K' } },
        { range: [1201, 3200], levels: { I: 'H', II: 'K', III: 'L' } },
        { range: [3201, 10000], levels: { I: 'J', II: 'L', III: 'M' } },
        { range: [10001, 35000], levels: { I: 'K', II: 'M', III: 'N' } },
        { range: [35001, 150000], levels: { I: 'L', II: 'N', III: 'P' } },
        { range: [150001, 500000], levels: { I: 'M', II: 'P', III: 'Q' } }, // Corrected upper range
        { range: [500001, Infinity], levels: { I: 'N', II: 'Q', III: 'R' } }
    ];

    // Ordered list of code letters for arrow navigation
    const orderedCodeLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R']; // Note: 'I' and 'O' are skipped in the standard

    function getPreviousCodeLetter(letter) {
        const index = orderedCodeLetters.indexOf(letter);
        return index > 0 ? orderedCodeLetters[index - 1] : null; // Return null if already at the first letter
    }

    function getNextCodeLetter(letter) {
        const index = orderedCodeLetters.indexOf(letter);
        return index < orderedCodeLetters.length - 1 ? orderedCodeLetters[index + 1] : null; // Return null if already at the last letter
    }

    // Single Sampling Plans for Normal Inspection (Based on MIL-STD-105E / ISO 2859-1 Table II-A image provided)
    // Structure: { sampleSize: number, plans: { aqlValue: { ac: number, re: number } OR { arrow: 'up'/'down' } } }
    // Values updated to reflect the table image including arrows.
    const aqlData = {
        'A': { sampleSize: 2, plans: { '0.065': { arrow: 'down' }, '0.10': { arrow: 'down' }, '0.15': { arrow: 'down' }, '0.25': { arrow: 'down' }, '0.40': { arrow: 'down' }, '0.65': { arrow: 'down' }, '1.0': { arrow: 'down' }, '1.5': { arrow: 'down' }, '2.5': { arrow: 'down' }, '4.0': { arrow: 'down' }, '6.5': { ac: 0, re: 1 } } },
        'B': { sampleSize: 3, plans: { '0.065': { arrow: 'down' }, '0.10': { arrow: 'down' }, '0.15': { arrow: 'down' }, '0.25': { arrow: 'down' }, '0.40': { arrow: 'down' }, '0.65': { arrow: 'down' }, '1.0': { arrow: 'down' }, '1.5': { arrow: 'down' }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 }, '6.5': { ac: 1, re: 2 } } },
        'C': { sampleSize: 5, plans: { '0.065': { arrow: 'down' }, '0.10': { arrow: 'down' }, '0.15': { arrow: 'down' }, '0.25': { arrow: 'down' }, '0.40': { arrow: 'down' }, '0.65': { ac: 0, re: 1 }, '1.0': { ac: 0, re: 1 }, '1.5': { ac: 0, re: 1 }, '2.5': { ac: 1, re: 2 }, '4.0': { ac: 1, re: 2 }, '6.5': { ac: 2, re: 3 } } },
        'D': { sampleSize: 8, plans: { '0.065': { arrow: 'down' }, '0.10': { arrow: 'down' }, '0.15': { arrow: 'down' }, '0.25': { ac: 0, re: 1 }, '0.40': { ac: 0, re: 1 }, '0.65': { ac: 0, re: 1 }, '1.0': { ac: 1, re: 2 }, '1.5': { ac: 1, re: 2 }, '2.5': { ac: 2, re: 3 }, '4.0': { ac: 3, re: 4 }, '6.5': { ac: 5, re: 6 } } },
        'E': { sampleSize: 13, plans: { '0.065': { arrow: 'down' }, '0.10': { arrow: 'down' }, '0.15': { ac: 0, re: 1 }, '0.25': { ac: 0, re: 1 }, '0.40': { ac: 1, re: 2 }, '0.65': { ac: 1, re: 2 }, '1.0': { ac: 2, re: 3 }, '1.5': { ac: 3, re: 4 }, '2.5': { ac: 5, re: 6 }, '4.0': { ac: 7, re: 8 }, '6.5': { ac: 10, re: 11 } } },
        'F': { sampleSize: 20, plans: { '0.065': { arrow: 'down' }, '0.10': { ac: 0, re: 1 }, '0.15': { ac: 0, re: 1 }, '0.25': { ac: 1, re: 2 }, '0.40': { ac: 1, re: 2 }, '0.65': { ac: 2, re: 3 }, '1.0': { ac: 3, re: 4 }, '1.5': { ac: 5, re: 6 }, '2.5': { ac: 7, re: 8 }, '4.0': { ac: 10, re: 11 }, '6.5': { ac: 14, re: 15 } } },
        'G': { sampleSize: 32, plans: { '0.065': { ac: 0, re: 1 }, '0.10': { ac: 0, re: 1 }, '0.15': { ac: 1, re: 2 }, '0.25': { ac: 1, re: 2 }, '0.40': { ac: 2, re: 3 }, '0.65': { ac: 3, re: 4 }, '1.0': { ac: 5, re: 6 }, '1.5': { ac: 7, re: 8 }, '2.5': { ac: 10, re: 11 }, '4.0': { ac: 14, re: 15 }, '6.5': { ac: 21, re: 22 } } },
        'H': { sampleSize: 50, plans: { '0.065': { ac: 0, re: 1 }, '0.10': { ac: 1, re: 2 }, '0.15': { ac: 1, re: 2 }, '0.25': { ac: 2, re: 3 }, '0.40': { ac: 3, re: 4 }, '0.65': { ac: 5, re: 6 }, '1.0': { ac: 7, re: 8 }, '1.5': { ac: 10, re: 11 }, '2.5': { ac: 14, re: 15 }, '4.0': { ac: 21, re: 22 }, '6.5': { arrow: 'up' } } }, // 6.5 has arrow up in image
        'J': { sampleSize: 80, plans: { '0.065': { ac: 1, re: 2 }, '0.10': { ac: 1, re: 2 }, '0.15': { ac: 2, re: 3 }, '0.25': { ac: 3, re: 4 }, '0.40': { ac: 5, re: 6 }, '0.65': { ac: 7, re: 8 }, '1.0': { ac: 10, re: 11 }, '1.5': { ac: 14, re: 15 }, '2.5': { arrow: 'down' }, '4.0': { arrow: 'down' }, '6.5': { arrow: 'down' } } }, // 2.5, 4.0, 6.5 have arrows down
        'K': { sampleSize: 125, plans: { '0.065': { ac: 1, re: 2 }, '0.10': { arrow: 'up' }, '0.15': { ac: 3, re: 4 }, '0.25': { ac: 5, re: 6 }, '0.40': { ac: 7, re: 8 }, '0.65': { ac: 10, re: 11 }, '1.0': { ac: 14, re: 15 }, '1.5': { ac: 21, re: 22 }, '2.5': { ac: 7, re: 8 }, '4.0': { ac: 10, re: 11 }, '6.5': { ac: 14, re: 15 } } }, // 0.10 has arrow up
        'L': { sampleSize: 200, plans: { '0.065': { ac: 2, re: 3 }, '0.10': { ac: 0, re: 1 }, '0.15': { ac: 5, re: 6 }, '0.25': { ac: 7, re: 8 }, '0.40': { ac: 10, re: 11 }, '0.65': { ac: 14, re: 15 }, '1.0': { ac: 21, re: 22 }, '1.5': { arrow: 'up' }, '2.5': { arrow: 'up' }, '4.0': { arrow: 'up' }, '6.5': { arrow: 'up' } } }, // 1.5, 2.5, 4.0, 6.5 have arrows up
        'M': { sampleSize: 315, plans: { '0.065': { ac: 3, re: 4 }, '0.10': { ac: 1, re: 2 }, '0.15': { ac: 7, re: 8 }, '0.25': { ac: 10, re: 11 }, '0.40': { ac: 14, re: 15 }, '0.65': { ac: 21, re: 22 }, '1.0': { arrow: 'up' }, '1.5': { ac: 10, re: 11 }, '2.5': { ac: 14, re: 15 }, '4.0': { ac: 21, re: 22 }, '6.5': { ac: 21, re: 22 } } }, // 1.0 has arrow up
        'N': { sampleSize: 500, plans: { '0.065': { ac: 5, re: 6 }, '0.10': { ac: 2, re: 3 }, '0.15': { ac: 10, re: 11 }, '0.25': { ac: 14, re: 15 }, '0.40': { ac: 21, re: 22 }, '0.65': { arrow: 'up' }, '1.0': { ac: 10, re: 11 }, '1.5': { ac: 14, re: 15 }, '2.5': { ac: 21, re: 22 }, '4.0': { arrow: 'up' }, '6.5': { arrow: 'up' } } }, // 0.65, 4.0, 6.5 have arrows up
        'P': { sampleSize: 800, plans: { '0.065': { ac: 7, re: 8 }, '0.10': { ac: 3, re: 4 }, '0.15': { ac: 14, re: 15 }, '0.25': { ac: 21, re: 22 }, '0.40': { arrow: 'up' }, '0.65': { ac: 14, re: 15 }, '1.0': { ac: 21, re: 22 }, '1.5': { arrow: 'up' }, '2.5': { arrow: 'up' }, '4.0': { ac: 21, re: 22 }, '6.5': { ac: 21, re: 22 } } }, // 0.40, 1.5, 2.5 have arrows up
        'Q': { sampleSize: 1250, plans: { '0.065': { ac: 10, re: 11 }, '0.10': { ac: 5, re: 6 }, '0.15': { ac: 21, re: 22 }, '0.25': { arrow: 'up' }, '0.40': { ac: 14, re: 15 }, '0.65': { ac: 21, re: 22 }, '1.0': { arrow: 'up' }, '1.5': { ac: 21, re: 22 }, '2.5': { ac: 21, re: 22 }, '4.0': { arrow: 'up' }, '6.5': { arrow: 'up' } } }, // 0.25, 1.0, 4.0, 6.5 have arrows up
        'R': { sampleSize: 2000, plans: { '0.065': { ac: 14, re: 15 }, '0.10': { ac: 7, re: 8 }, '0.15': { arrow: 'up' }, '0.25': { ac: 21, re: 22 }, '0.40': { arrow: 'up' }, '0.65': { arrow: 'up' }, '1.0': { ac: 21, re: 22 }, '1.5': { arrow: 'up' }, '2.5': { arrow: 'up' }, '4.0': { ac: 21, re: 22 }, '6.5': { ac: 21, re: 22 } } } // 0.15, 0.40, 0.65, 1.5, 2.5 have arrows up
    };


    function getSampleCodeLetter(lotSize, inspectionLevel) {
        for (const entry of codeLetters) {
            const maxRange = entry.range[1] === Infinity ? Infinity : entry.range[1];
            if (lotSize >= entry.range[0] && lotSize <= maxRange) {
                return entry.levels[inspectionLevel];
            }
        }
        return null;
    }

    // --- REWRITTEN findPlan function with Arrow Logic ---
    function findPlan(initialCodeLetter, aqlValue) {
        const letterData = aqlData[initialCodeLetter];
        if (!letterData) {
            return { error: `Invalid Sample Code Letter: ${initialCodeLetter}` };
        }
        const initialSampleSize = letterData.sampleSize;

        // Internal recursive function to follow arrows
        function findRecursivePlan(currentCodeLetter, currentAqlValue, depth = 0) {
            const maxDepth = orderedCodeLetters.length; // Prevent infinite loops
            if (depth > maxDepth) {
                return { error: `Could not resolve plan for ${initialCodeLetter}/${currentAqlValue} after ${maxDepth} steps (possible loop or issue).` };
            }

            const currentLetterData = aqlData[currentCodeLetter];
            if (!currentLetterData || !currentLetterData.plans || !currentLetterData.plans.hasOwnProperty(currentAqlValue)) {
                 return { error: `Sampling plan details not found for intermediate step: ${currentCodeLetter}/${currentAqlValue}.` };
            }

            const plan = currentLetterData.plans[currentAqlValue];

            if (plan && typeof plan.ac === 'number' && typeof plan.re === 'number') {
                // Found the actual Ac/Re numbers
                return { ac: plan.ac, re: plan.re };
            } else if (plan && plan.arrow === 'down') {
                const nextLetter = getNextCodeLetter(currentCodeLetter);
                if (!nextLetter) {
                     const lastPlan = aqlData['R'].plans[currentAqlValue];
                     if (lastPlan && typeof lastPlan.ac === 'number') return { ac: lastPlan.ac, re: lastPlan.re };
                     else return { error: `Arrow points down from ${currentCodeLetter}, but no valid plan found at bottom (R) for AQL ${currentAqlValue}.`};

                }
                // Recursively call with the next letter down
                return findRecursivePlan(nextLetter, currentAqlValue, depth + 1);
            } else if (plan && plan.arrow === 'up') {
                const prevLetter = getPreviousCodeLetter(currentCodeLetter);
                 if (!prevLetter) {
                     const firstPlan = aqlData['A'].plans[currentAqlValue];
                     if (firstPlan && typeof firstPlan.ac === 'number') return { ac: firstPlan.ac, re: firstPlan.re };
                     else return { error: `Arrow points up from ${currentCodeLetter}, but no valid plan found at top (A) for AQL ${currentAqlValue}.`};
                 }
                // Recursively call with the previous letter up
                return findRecursivePlan(prevLetter, currentAqlValue, depth + 1);
            } else {
                // Plan is missing or invalid format
                return { error: `Invalid or missing plan data for ${currentCodeLetter}/${currentAqlValue}.` };
            }
        }

        // Start the recursive search
        const resultAcRe = findRecursivePlan(initialCodeLetter, aqlValue);

        // Combine the found Ac/Re with the original sample size
        if (resultAcRe.error) {
            return { error: resultAcRe.error };
        } else {
            return {
                sampleSize: initialSampleSize,
                ac: resultAcRe.ac,
                re: resultAcRe.re,
                note: undefined // Can add notes later if needed
            };
        }
    }
    // --- END of REWRITTEN findPlan ---


    function updateLotSize() {
        const numBoxes = parseInt(numBoxesInput.value);
        const pcsPerBox = parseInt(pcsPerBoxInput.value);
        lotSizeInput.value = (!isNaN(numBoxes) && numBoxes > 0 && !isNaN(pcsPerBox) && pcsPerBox > 0) ? numBoxes * pcsPerBox : '';
    }

    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.style.display = 'block';
    }

    function hideError() {
        errorMessageDiv.style.display = 'none';
        errorMessageDiv.textContent = '';
    }

    function getFormattedDateTime() {
        const now = new Date();
        const date = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const time = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        return `${date} ${time}`;
    }

    /**
    * Resets the entire application state.
    */
    function resetCalculator() {
        aqlForm.reset();
        lotSizeInput.value = '';
        resultsDiv.innerHTML = '<p class="initial-message">Please enter batch details, select levels, and click calculate.</p>';
        hideError();
        numBoxesInput.classList.remove('input-error');
        pcsPerBoxInput.classList.remove('input-error');
        defectsInputArea.style.display = 'none';
        verdictMessageDiv.style.display = 'none';
        defectChecklistDiv.style.display = 'none';
        generateReportButton.style.display = 'none';
        finalReportArea.style.display = 'none';
        defectsFoundInput.value = '';
        verdictMessageDiv.innerHTML = '';
        verdictMessageDiv.className = 'step-section';
        reportContentDiv.innerHTML = '';
        checklistItems.forEach(checkbox => { checkbox.checked = false; });
        currentAc = -1;
        currentRe = -1;
        currentSampleSize = -1;
        currentVerdict = '';
        currentDefectsFound = -1;
        qcInspectorInput.focus();
    }

    /**
    * Submits defects found, calculates and displays the verdict, shows checklist.
    */
    function submitDefects() {
        const defectsFound = parseInt(defectsFoundInput.value);
        verdictMessageDiv.innerHTML = '';
        verdictMessageDiv.className = 'step-section';
        defectChecklistDiv.style.display = 'none';
        generateReportButton.style.display = 'none';
        finalReportArea.style.display = 'none';
        reportContentDiv.innerHTML = '';

        if (isNaN(defectsFound) || defectsFound < 0) {
            verdictMessageDiv.textContent = 'Please enter a valid number of defects (0 or more).';
            verdictMessageDiv.className = 'step-section verdict-error';
            verdictMessageDiv.style.display = 'block';
            return;
        }
        if (currentAc < 0 || currentRe < 0 || currentSampleSize < 0) {
            verdictMessageDiv.textContent = 'Error: Sampling plan details (Ac/Re/Sample Size) not available or invalid. Please calculate sampling plan first.';
            verdictMessageDiv.className = 'step-section verdict-error';
            verdictMessageDiv.style.display = 'block';
            return;
        }
        if (defectsFound > currentSampleSize) {
             verdictMessageDiv.textContent = `Error: Defects found (${defectsFound}) cannot exceed the sample size (${currentSampleSize}).`;
             verdictMessageDiv.className = 'step-section verdict-error';
             verdictMessageDiv.style.display = 'block';
             return;
        }


        currentDefectsFound = defectsFound;

        // Determine verdict based on Ac and Re
        if (defectsFound <= currentAc) {
            currentVerdict = `BATCH ACCEPT (Defects Found ${defectsFound} ≤ Ac ${currentAc})`;
            verdictMessageDiv.textContent = `Verdict: ${currentVerdict}`;
            verdictMessageDiv.className = 'step-section verdict-accept';
        } else {
            // <<< MODIFIED LINE >>>
            currentVerdict = `BATCH REJECT (100% INSPECTION) (Defects Found ${defectsFound} ≥ Re ${currentRe})`;
            verdictMessageDiv.textContent = `Verdict: ${currentVerdict}`;
            verdictMessageDiv.className = 'step-section verdict-reject';
        }
        verdictMessageDiv.style.display = 'block';
        defectChecklistDiv.style.display = 'block';
        generateReportButton.style.display = 'block';
    }

    /**
    * Gathers all data and generates the final report.
    */
    function generateReport() {
        const qcInspector = qcInspectorInput.value.trim() || 'N/A';
        const operatorName = operatorNameInput.value.trim() || 'N/A';
        const machineNumber = machineNumberInput.value.trim() || 'N/A';
        const partName = partNameInput.value.trim() || 'N/A';
        const partId = partIdInput.value.trim() || 'N/A';
        const numBoxes = numBoxesInput.value || 'N/A';
        const pcsPerBox = pcsPerBoxInput.value || 'N/A';
        const lotSize = lotSizeInput.value || 'N/A';
        const inspLevel = inspectionLevelSelect.options[inspectionLevelSelect.selectedIndex].text;
        const aql = aqlSelect.value;
        const selectedDefects = [];
        checklistItems.forEach(checkbox => {
            if (checkbox.checked) {
                selectedDefects.push(checkbox.value);
            }
        });

        // Determine CSS class for verdict text color in the report
        let verdictClass = '';
        if (currentVerdict.includes('ACCEPT')) {
            verdictClass = 'verdict-accept-text';
        } else if (currentVerdict.includes('REJECT')) {
            verdictClass = 'verdict-reject-text';
        }


        let reportHTML = `
        <h4>Batch Identification</h4>
        <p><strong>Date/Time:</strong> ${getFormattedDateTime()}</p>
        <p><strong>QC Inspector:</strong> ${qcInspector}</p>
        <p><strong>Operator Name:</strong> ${operatorName}</p>
        <p><strong>Machine No:</strong> ${machineNumber}</p>
        <p><strong>Part Name:</strong> ${partName}</p>
        <p><strong>Part ID:</strong> ${partId}</p>

        <h4>Lot & Plan Details</h4>
        <p><strong>Number of Boxes:</strong> ${numBoxes}</p>
        <p><strong>Pieces per Box:</strong> ${pcsPerBox}</p>
        <p><strong>Total Lot Size:</strong> ${lotSize}</p>
        <p><strong>Inspection Level:</strong> ${inspLevel}</p>
        <p><strong>AQL:</strong> ${aql}</p>

        <h4>Sampling Results</h4>
        <p><strong>Required Sample Size:</strong> ${currentSampleSize >= 0 ? currentSampleSize : 'N/A'}</p>
        <p><strong>Acceptance No. (Ac):</strong> ${currentAc >= 0 ? currentAc : 'N/A'}</p>
        <p><strong>Rejection No. (Re):</strong> ${currentRe >= 0 ? currentRe : 'N/A'}</p>

        <h4>Inspection Outcome</h4>
        <p><strong>Defects Found in Sample:</strong> ${currentDefectsFound >= 0 ? currentDefectsFound : 'N/A'}</p>
        <p><strong>Verdict:</strong> <strong class="${verdictClass}">${currentVerdict || 'N/A'}</strong></p>
        `; // Used verdictClass here

        if (selectedDefects.length > 0) {
            reportHTML += `
            <h4>Recorded Plastic Defects</h4>
            <ul>
            ${selectedDefects.map(defect => `<li>${defect}</li>`).join('')}
            </ul>
            `;
        } else if (currentDefectsFound > 0) {
            reportHTML += `
            <h4>Recorded Plastic Defects</h4>
            <p><em>None selected from the list, although ${currentDefectsFound} defect(s) were reported.</em></p>
            `;
        } else {
            if (currentSampleSize >= 0) { // Only show 'None recorded' if sampling was actually done
                 reportHTML += `
                 <h4>Recorded Plastic Defects</h4>
                 <p><em>None recorded.</em></p>
                 `;
            }
        }


        reportContentDiv.innerHTML = reportHTML;
        finalReportArea.style.display = 'block';
        finalReportArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }


    /**
    * Main function to calculate and display the AQL sampling plan.
    */
    function calculateAQL() {
        calculateButton.disabled = true;
        calculateButton.textContent = 'Calculating...';
        calculateButton.classList.add('calculating');

        resultsDiv.innerHTML = '';
        hideError();
        numBoxesInput.classList.remove('input-error');
        pcsPerBoxInput.classList.remove('input-error');
        defectsInputArea.style.display = 'none';
        verdictMessageDiv.style.display = 'none';
        defectChecklistDiv.style.display = 'none';
        generateReportButton.style.display = 'none';
        finalReportArea.style.display = 'none';
        currentAc = -1; currentRe = -1; currentSampleSize = -1; currentVerdict = ''; currentDefectsFound = -1;

        const numBoxes = parseInt(numBoxesInput.value);
        const pcsPerBox = parseInt(pcsPerBoxInput.value);
        const inspectionLevel = inspectionLevelSelect.value;
        const aqlValue = aqlSelect.value;

        let isValid = true;
        if (isNaN(numBoxes) || numBoxes <= 0) { showError("Please enter a valid number of boxes/batch (> 0)."); numBoxesInput.classList.add('input-error'); numBoxesInput.focus(); isValid = false; }
        if (isNaN(pcsPerBox) || pcsPerBox <= 0) { if (isValid) { showError("Please enter a valid number of pieces per box (> 0)."); pcsPerBoxInput.classList.add('input-error'); pcsPerBoxInput.focus(); } isValid = false; }
        if (!isValid) { calculateButton.disabled = false; calculateButton.textContent = 'Calculate Sampling Plan'; calculateButton.classList.remove('calculating'); return; }

        const lotSize = numBoxes * pcsPerBox;
        lotSizeInput.value = lotSize;

        if (lotSize < 2) {
            showError(`Calculated Lot Size (${lotSize}) is too small for standard sampling (minimum is 2). Consider 100% inspection.`);
            calculateButton.disabled = false; calculateButton.textContent = 'Calculate Sampling Plan'; calculateButton.classList.remove('calculating');
            return;
        }

        const determinedCodeLetter = getSampleCodeLetter(lotSize, inspectionLevel);

        if (!determinedCodeLetter) {
            showError(`Could not determine Sample Code Letter for Lot Size ${lotSize} and Level ${inspectionLevel}.`);
            calculateButton.disabled = false; calculateButton.textContent = 'Calculate Sampling Plan'; calculateButton.classList.remove('calculating');
            return;
        }

        // --- Use the NEW findPlan function ---
        const result = findPlan(determinedCodeLetter, aqlValue);
        // ---

        let resultsHTML = `
        <div class="result-section">
        <h4>Input Summary</h4>
        <p><strong>Number of Boxes:</strong> ${numBoxes}</p>
        <p><strong>Pieces per Box:</strong> ${pcsPerBox}</p>
        <p><strong>Total Lot Size:</strong> ${lotSize}</p>
        <p><strong>Inspection Level:</strong> ${inspectionLevelSelect.options[inspectionLevelSelect.selectedIndex].text}</p>
        <p><strong>AQL:</strong> ${aqlValue}</p>
        <p><strong>Sample Size Code Letter:</strong> ${determinedCodeLetter}</p>
        </div>`;

        if (result.error) {
            resultsHTML += `<p class="error-message" style="display: block; margin-top: 10px;">Error: ${result.error}</p>`;
            resultsDiv.innerHTML = resultsHTML;
            // Keep subsequent sections hidden on error
            defectsInputArea.style.display = 'none';
            verdictMessageDiv.style.display = 'none';
            defectChecklistDiv.style.display = 'none';
            generateReportButton.style.display = 'none';
            finalReportArea.style.display = 'none';
        } else {
            // Store results globally for later steps
            currentAc = result.ac;
            currentRe = result.re;
            currentSampleSize = result.sampleSize;

            resultsHTML += `
            <div class="result-section">
            <h4>Sampling Plan</h4>
            <p><strong>Required Total Sample Size:</strong> ${result.sampleSize}</p>
            <p><strong>Acceptance Number (Ac):</strong> ${result.ac}</p>
            <p><strong>Rejection Number (Re):</strong> ${result.re}</p>
            ${result.note ? `<p><em>Note: ${result.note}</em></p>` : ''}
            </div>`;

            // --- Sampling Instructions Logic ---
            let instructionHTML = '<div class="result-section"><h4>Sampling Instructions</h4>';
            if (result.sampleSize >= lotSize) {
                instructionHTML += `<p>Sample size (${result.sampleSize}) is ≥ lot size (${lotSize}). Inspect <strong>100%</strong> of the ${lotSize} pieces.</p>`;
                 defectsInputArea.style.display = 'block'; // Keep visible for 100% inspection case too
                 defectsFoundInput.value = '';
                 defectsFoundInput.focus();

            } else {
                 // Show defect input area only if sampling
                 defectsInputArea.style.display = 'block';
                 defectsFoundInput.value = '';
                 defectsFoundInput.focus();

                 if (numBoxes === 1) {
                     instructionHTML += `<p>Randomly select <strong>${result.sampleSize} pieces</strong> from the single box.</p>`;
                 } else {
                     const requiredSampleSize = result.sampleSize;
                     if (pcsPerBox > 0) {
                         const numBoxesToSample = Math.ceil(requiredSampleSize / pcsPerBox);
                         const piecesPerSelectedBox = Math.ceil(requiredSampleSize / numBoxesToSample);
                         const actualBoxesToSample = Math.min(numBoxesToSample, numBoxes);

                         instructionHTML += `<p>1. Randomly select <strong>${actualBoxesToSample} boxes</strong>.</p>`;
                         if (actualBoxesToSample < numBoxesToSample) {
                             instructionHTML += `<p><em>(Note: Required sample spans more boxes than available. Sampling adjusted.)</em></p>`;
                         }
                         instructionHTML += `<p>2. From each selected box, randomly select approximately <strong>${piecesPerSelectedBox} pieces</strong>.</p>`;
                         instructionHTML += `<p>3. Ensure the total number of pieces selected across all chosen boxes equals <strong>${requiredSampleSize} pieces</strong>.</p>`;
                         instructionHTML += `<p><em>(Adjust the count from the last box as needed to reach the exact total sample size.)</em></p>`;

                     } else {
                         instructionHTML += `<p><em>Error: Cannot calculate box sampling instructions because 'Pieces per Box' is zero or invalid.</em></p>`;
                     }
                 }
            }
            instructionHTML += `</div>`;
            resultsHTML += instructionHTML;
            // --- End Sampling Instructions ---

            resultsDiv.innerHTML = resultsHTML;
        }

        calculateButton.disabled = false;
        calculateButton.textContent = 'Calculate Sampling Plan';
        calculateButton.classList.remove('calculating');
    }

    // --- Add Event Listeners ---
    numBoxesInput.addEventListener('input', updateLotSize);
    pcsPerBoxInput.addEventListener('input', updateLotSize);
    calculateButton.addEventListener('click', calculateAQL);
    resetButton.addEventListener('click', resetCalculator);
    submitDefectsButton.addEventListener('click', submitDefects);
    generateReportButton.addEventListener('click', generateReport);

    // Initial setup
    resetCalculator(); // Call reset on load to set initial state and focus

    // *** Initialize tooltips after everything else is set up ***
    initializeTooltips();

}); // End of DOMContentLoaded listener