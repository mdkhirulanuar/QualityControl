// Ensure partsList is available globally (loaded from partsList.js)
if (!window.partsList) {
    console.error('partsList is not defined. Ensure partsList.js is loaded.');
}

function populatePartNameDropdown() {
    const partNameSelect = document.getElementById('partName');
    const partIdInput = document.getElementById('partId');

    // Clear existing options except the default
    partNameSelect.innerHTML = '<option value="">-- Select Part Name --</option>';

    // Populate dropdown with part names
    if (window.partsList && window.partsList.length > 0) {
        window.partsList.forEach(part => {
            const option = document.createElement('option');
            option.value = part.partName;
            option.textContent = part.partName;
            partNameSelect.appendChild(option);
        });
    } else {
        console.error('No parts available to populate dropdown.');
    }

    // Update partId when partName is selected
    partNameSelect.addEventListener('change', () => {
        const selectedPart = window.partsList.find(part => part.partName === partNameSelect.value);
        partIdInput.value = selectedPart ? selectedPart.partId : '';
    });
}

function initSamplingPlan() {
    const calculateButton = document.getElementById('calculateButton');
    const aqlForm = document.getElementById('aqlForm');
    const resultsSection = document.getElementById('results');
    const defectsInputArea = document.getElementById('defectsInputArea');
    const submitDefectsButton = document.getElementById('submitDefectsButton');
    const verdictMessage = document.getElementById('verdictMessage');
    const defectChecklist = document.getElementById('defectChecklist');
    const defectSearch = document.getElementById('defectSearch');
    const photoCaptureArea = document.getElementById('photoCaptureArea');
    const generateReportButton = document.getElementById('generateReportButton');

    calculateButton.addEventListener('click', () => {
        const numBoxes = parseInt(document.getElementById('numBoxes').value);
        const pcsPerBox = parseInt(document.getElementById('pcsPerBox').value);
        const aql = parseFloat(document.getElementById('aql').value);

        if (!numBoxes || !pcsPerBox || !aql) {
            alert('Please fill in all required fields.');
            return;
        }

        const lotSize = numBoxes * pcsPerBox;
        document.getElementById('lotSize').value = lotSize;

        let sampleSize, acceptNumber, rejectNumber;

        // AQL Sampling Logic (simplified for brevity)
        if (lotSize <= 280) {
            sampleSize = 20;
            acceptNumber = aql === 1.0 ? 0 : aql === 2.5 ? 1 : 2;
        } else if (lotSize <= 500) {
            sampleSize = 32;
            acceptNumber = aql === 1.0 ? 1 : aql === 2.5 ? 2 : 3;
        } else if (lotSize <= 1200) {
            sampleSize = 50;
            acceptNumber = aql === 1.0 ? 2 : aql === 2.5 ? 3 : 5;
        } else if (lotSize <= 3200) {
            sampleSize = 80;
            acceptNumber = aql === 1.0 ? 3 : aql === 2.5 ? 5 : 7;
        } else {
            sampleSize = 125;
            acceptNumber = aql === 1.0 ? 5 : aql === 2.5 ? 7 : 10;
        }

        rejectNumber = acceptNumber + 1;

        resultsSection.innerHTML = 
            <h3>Sampling Plan Results</h3>
            <p>Lot Size: ${lotSize}</p>
            <p>Sample Size: ${sampleSize}</p>
            <p>Accept Number: ${acceptNumber}</p>
            <p>Reject Number: ${rejectNumber}</p>
        ;

        // Store results for report generation
        aqlForm.dataset.sampleSize = sampleSize;
        aqlForm.dataset.acceptNumber = acceptNumber;
        aqlForm.dataset.rejectNumber = rejectNumber;

        // Show defects input area
        fadeIn(defectsInputArea);
        submitDefectsButton.disabled = false;

        // Update progress bar
        document.querySelectorAll('.step')[1].classList.remove('active');
        document.querySelectorAll('.step')[2].classList.add('active');
    });

    submitDefectsButton.addEventListener('click', () => {
        const defectsFound = parseInt(document.getElementById('defectsFound').value);
        const acceptNumber = parseInt(aqlForm.dataset.acceptNumber);
        const rejectNumber = parseInt(aqlForm.dataset.rejectNumber);

        if (isNaN(defectsFound)) {
            alert('Please select the number of defects found.');
            return;
        }

        const verdict = defectsFound <= acceptNumber ? 'ACCEPT' : 'REJECT';
        verdictMessage.innerHTML = 
            <h3>Inspection Verdict</h3>
            <p>Defects Found: ${defectsFound}</p>
            <p>Verdict: <span class="${verdict.toLowerCase()}">${verdict}</span></p>
        ;

        aqlForm.dataset.verdict = verdict;
        aqlForm.dataset.defectsFound = defectsFound;

        fadeIn(verdictMessage);
        fadeIn(defectChecklist);
        fadeIn(photoCaptureArea);
        fadeIn(generateReportButton);

        // Update progress bar
        document.querySelectorAll('.step')[2].classList.remove('active');
        document.querySelectorAll('.step')[3].classList.add('active');

        // Defect search functionality
        defectSearch.addEventListener('input', () => {
            const searchTerm = defectSearch.value.toLowerCase();
            document.querySelectorAll('.checklist-container label').forEach(label => {
                const defectText = label.textContent.toLowerCase();
                label.style.display = defectText.includes(searchTerm) ? 'block' : 'none';
            });
        });
    });
}

// Expose functions globally
window.populatePartNameDropdown = populatePartNameDropdown;
window.initSamplingPlan = initSamplingPlan;
