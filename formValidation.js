function initFormValidation() {
    const aqlForm = document.getElementById('aqlForm');
    const calculateButton = document.getElementById('calculateButton');
    const resetButton = document.getElementById('resetButton');
    const errorMessage = document.getElementById('error-message');

    aqlForm.addEventListener('input', () => {
        const qcInspector = document.getElementById('qcInspector').value;
        const machineNumber = document.getElementById('machineNumber').value;
        const partName = document.getElementById('partName').value;
        const poNumber = document.getElementById('poNumber').value;
        const productionDate = document.getElementById('productionDate').value;
        const numBoxes = document.getElementById('numBoxes').value;
        const pcsPerBox = document.getElementById('pcsPerBox').value;
        const aql = document.getElementById('aql').value;

        const allFieldsFilled = qcInspector && machineNumber && partName && poNumber && productionDate && numBoxes && pcsPerBox && aql;

        calculateButton.disabled = !allFieldsFilled;

        if (!allFieldsFilled) {
            errorMessage.textContent = 'Please fill in all required fields.';
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    });

    resetButton.addEventListener('click', () => {
        aqlForm.reset();
        document.getElementById('lotSize').value = '';
        document.getElementById('results').innerHTML = '<p class="initial-message">Please enter batch details, select AQL quality level, and click calculate.</p>';
        document.getElementById('defectsInputArea').style.display = 'none';
        document.getElementById('verdictMessage').style.display = 'none';
        document.getElementById('defectChecklist').style.display = 'none';
        document.getElementById('photoCaptureArea').style.display = 'none';
        document.getElementById('generateReportButton').style.display = 'none';
        document.getElementById('finalReportArea').style.display = 'none';
        document.getElementById('submitDefectsButton').disabled = true;

        // Reset progress bar
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index === 0);
        });

        errorMessage.style.display = 'none';
        calculateButton.disabled = true;
    });

    // Production Date Picker (simplified for mobile)
    const productionDateInput = document.getElementById('productionDate');
    productionDateInput.addEventListener('focus', () => {
        productionDateInput.type = 'date';
    });
    productionDateInput.addEventListener('blur', () => {
        if (!productionDateInput.value) {
            productionDateInput.type = 'text';
        }
    });
}

// Expose globally
window.initFormValidation = initFormValidation;
