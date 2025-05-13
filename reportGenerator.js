/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/
import { fadeIn, fadeOut } from './utils.js';
import { currentSamplingPlan } from './samplingPlan.js';

const copyrightNotice = "Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.";
const qcMonitorContact = "qaqc@kpielectrical.com.my or whatsapp to +60182523255 immediately";

export function initReportGenerator() {
    const generateReportButton = document.getElementById('generateReportButton');
    const finalReportAreaDiv = document.getElementById('finalReportArea');
    const reportContentDiv = document.getElementById('reportContent');
    const savePdfButton = document.getElementById('savePdfButton');
    const printButton = document.getElementById('printButton');
    const errorMessageDiv = document.getElementById('error-message');
    const partIdInput = document.getElementById('partId');
    const qcInspectorInput = document.getElementById('qcInspector');
    const machineNumberInput = document.getElementById('machineNumber');
    const partNameInput = document.getElementById('partName');
    const poNumberInput = document.getElementById('poNumber');
    const productionDateInput = document.getElementById('productionDate');
    const lotSizeInput = document.getElementById('lotSize');
    const aqlSelect = document.getElementById('aql');
    const defectsFoundInput = document.getElementById('defectsFound');

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

    function generateReport() {
        if (!currentSamplingPlan) {
            displayError('Calculate sampling plan and submit defects first.');
            return;
        }
        const defectsFound = parseInt(defectsFoundInput.value, 10) || 0;
        if (isNaN(defectsFound) || defectsFound < 0) {
            displayError('Enter a valid number of defects found.');
            return;
        }

        const reportId = Report_${partIdInput.value || 'NoID'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,8).replace(/:/g,'')};
        const verdictText = defectsFound <= currentSamplingPlan.accept ? 'ACCEPT' : 'REJECT';
        const verdictColor = verdictText === 'ACCEPT' ? 'green' : 'red';
        const selectedDefects = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
            .map(cb => cb.value);
        const lotSizeVal = parseInt(lotSizeInput.value, 10);
        const inspectionNote = lotSizeVal && currentSamplingPlan.sampleSize >= lotSizeVal
            ? <p style="color: orange; font-weight: bold;">Note: 100% inspection required/performed.</p>
            : '';

        const aqlText = aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)' :
                        aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)' :
                        aqlSelect.value === '4.0' ? 'Low Quality (AQL 4.0%)' :
                        AQL ${aqlSelect.value}%;

        const reportHTML = 
            <h3>Batch Identification</h3>
            <p><strong>Report ID:</strong> ${reportId}</p>
            <p><strong>QC Inspector:</strong> ${qcInspectorInput.value || 'N/A'}</p>
            <p><strong>Machine No:</strong> ${machineNumberInput.value || 'N/A'}</p>
            <p><strong>Part Name:</strong> ${partNameInput.value || 'N/A'}</p>
            <p><strong>Part ID:</strong> ${partIdInput.value || 'N/A'}</p>
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
                ? <ul>${selectedDefects.map(defect => <li>${defect}</li>).join('')}</ul>
                : '<p>No specific defect types recorded.</p>'
            }

            <h3>Photo Documentation</h3>
            ${capturedPhotos.length > 0
                ? capturedPhotos.map((photo, index) => 
                    <p>Photo ${index + 1}:</p>
                    <img src="${photo}" style="max-width: 200px; border-radius: 8px;">
                  ).join('')
                : '<p>No photos added.</p>'
            }

            <p>${copyrightNotice}</p>
        ;

        reportContentDiv.innerHTML = reportHTML;
        fadeIn(finalReportAreaDiv);
        fadeIn(savePdfButton);
        fadeIn(printButton);
    }

    async function saveReportAsPdf() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const margin = 10;
        let y = 20;

        doc.setFontSize(16);
        doc.text("Quality Control Inspection Report", margin, y);
        y += 10;

        doc.setFontSize(12);
        const reportId = Report_${partIdInput.value || 'NoID'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${new Date().toTimeString().slice(0,8).replace(/:/g,'')};
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
                        AQL ${aqlSelect.value}%;
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
                doc.text(- ${defect}, margin, y);
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
                doc.text(Photo ${index + 1}:, margin, y);
                y += 5;
                try {
                    doc.addImage(photo, 'JPEG', margin, y, 50, 50);
                    y += 55;
                } catch (err) {
                    doc.text("(Photo could not be included)", margin, y);
                    y += 7;
                    logError('Failed to add image to PDF', { index, error: err.message });
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

        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], ${reportId}.pdf, { type: 'application/pdf' });

        if (navigator.share) {
            try {
                await navigator.share({
                    files: [file],
                    title: Inspection Report ${reportId},
                    text: Please review the inspection report with ID ${reportId}.
                });
            } catch (err) {
                logError('Web Share API error', { error: err.message });
                doc.save(${reportId}.pdf);
                alert(PDF saved. Please send to ${qcMonitorContact}.);
            }
        } else {
            doc.save(${reportId}.pdf);
            alert(PDF saved. Please send to ${qcMonitorContact}.);
        }
    }

    function printReport() {
        window.print();
    }

    generateReportButton.addEventListener('click', generateReport);
    savePdfButton.addEventListener('click', saveReportAsPdf);
    printButton.addEventListener('click', printReport);
}
