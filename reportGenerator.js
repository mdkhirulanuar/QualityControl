function initReportGenerator() {
    const generateReportButton = document.getElementById('generateReportButton');
    const finalReportArea = document.getElementById('finalReportArea');
    const reportContent = document.getElementById('reportContent');
    const savePdfButton = document.getElementById('savePdfButton');
    const printButton = document.getElementById('printButton');
    const aqlForm = document.getElementById('aqlForm');

    generateReportButton.addEventListener('click', () => {
        const qcInspector = document.getElementById('qcInspector').value;
        const machineNumber = document.getElementById('machineNumber').value;
        const partName = document.getElementById('partName').value;
        const partId = document.getElementById('partId').value;
        const poNumber = document.getElementById('poNumber').value;
        const productionDate = document.getElementById('productionDate').value;
        const lotSize = document.getElementById('lotSize').value;
        const aql = document.getElementById('aql').value;
        const sampleSize = aqlForm.dataset.sampleSize;
        const acceptNumber = aqlForm.dataset.acceptNumber;
        const rejectNumber = aqlForm.dataset.rejectNumber;
        const defectsFound = aqlForm.dataset.defectsFound;
        const verdict = aqlForm.dataset.verdict;

        const defectTypes = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
            .map(checkbox => checkbox.value);

        const photos = window.photos || [];

        reportContent.innerHTML = 
            <h3>Inspection Report</h3>
            <p><strong>QC Inspector:</strong> ${DOMPurify.sanitize(qcInspector)}</p>
            <p><strong>Machine No:</strong> ${DOMPurify.sanitize(machineNumber)}</p>
            <p><strong>Part Name:</strong> ${DOMPurify.sanitize(partName)}</p>
            <p><strong>Part ID:</strong> ${DOMPurify.sanitize(partId)}</p>
            <p><strong>PO Number:</strong> ${DOMPurify.sanitize(poNumber)}</p>
            <p><strong>Production Date:</strong> ${DOMPurify.sanitize(productionDate)}</p>
            <p><strong>Lot Size:</strong> ${lotSize}</p>
            <p><strong>AQL Level:</strong> ${aql}%</p>
            <p><strong>Sample Size:</strong> ${sampleSize}</p>
            <p><strong>Accept Number:</strong> ${acceptNumber}</p>
            <p><strong>Reject Number:</strong> ${rejectNumber}</p>
            <p><strong>Defects Found:</strong> ${defectsFound}</p>
            <p><strong>Verdict:</strong> <span class="${verdict.toLowerCase()}">${verdict}</span></p>
            <h4>Defect Types Found:</h4>
            <ul>${defectTypes.length > 0 ? defectTypes.map(type => <li>${DOMPurify.sanitize(type)}</li>).join('') : '<li>None</li>'}</ul>
            <h4>Photos:</h4>
            <div class="report-photos">
                ${photos.length > 0 ? photos.map(photo => <img src="${photo.src}" alt="Inspection Photo" style="max-width: 100%;">).join('') : '<p>No photos added.</p>'}
            </div>
        ;

        fadeIn(finalReportArea);
        savePdfButton.style.display = 'block';
        printButton.style.display = 'block';

        // Update progress bar
        document.querySelectorAll('.step')[2].classList.remove('active');
        document.querySelectorAll('.step')[3].classList.add('active');
    });

    savePdfButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        let yPosition = 20;

        doc.setFontSize(16);
        doc.text('Inspection Report', 10, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        doc.text(QC Inspector: ${DOMPurify.sanitize(document.getElementById('qcInspector').value)}, 10, yPosition);
        yPosition += 10;
        doc.text(Machine No: ${DOMPurify.sanitize(document.getElementById('machineNumber').value)}, 10, yPosition);
        yPosition += 10;
        doc.text(Part Name: ${DOMPurify.sanitize(document.getElementById('partName').value)}, 10, yPosition);
        yPosition += 10;
        doc.text(Part ID: ${DOMPurify.sanitize(document.getElementById('partId').value)}, 10, yPosition);
        yPosition += 10;
        doc.text(PO Number: ${DOMPurify.sanitize(document.getElementById('poNumber').value)}, 10, yPosition);
        yPosition += 10;
        doc.text(Production Date: ${DOMPurify.sanitize(document.getElementById('productionDate').value)}, 10, yPosition);
        yPosition += 10;
        doc.text(Lot Size: ${document.getElementById('lotSize').value}, 10, yPosition);
        yPosition += 10;
        doc.text(AQL Level: ${document.getElementById('aql').value}%, 10, yPosition);
        yPosition += 10;
        doc.text(Sample Size: ${aqlForm.dataset.sampleSize}, 10, yPosition);
        yPosition += 10;
        doc.text(Accept Number: ${aqlForm.dataset.acceptNumber}, 10, yPosition);
        yPosition += 10;
        doc.text(Reject Number: ${aqlForm.dataset.rejectNumber}, 10, yPosition);
        yPosition += 10;
        doc.text(Defects Found: ${aqlForm.dataset.defectsFound}, 10, yPosition);
        yPosition += 10;
        doc.text(Verdict: ${aqlForm.dataset.verdict}, 10, yPosition);
        yPosition += 10;

        doc.text('Defect Types Found:', 10, yPosition);
        yPosition += 10;
        const defectTypes = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
            .map(checkbox => checkbox.value);
        if (defectTypes.length > 0) {
            defectTypes.forEach(type => {
                if (yPosition > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(- ${DOMPurify.sanitize(type)}, 10, yPosition);
                yPosition += 10;
            });
        } else {
            doc.text('- None', 10, yPosition);
            yPosition += 10;
        }

        const photos = window.photos || [];
        if (photos.length > 0) {
            doc.text('Photos:', 10, yPosition);
            yPosition += 10;
            photos.forEach((photo, index) => {
                if (yPosition > pageHeight - 100) {
                    doc.addPage();
                    yPosition = 20;
                }
                try {
                    doc.addImage(photo.src, 'PNG', 10, yPosition, 50, 50);
                    yPosition += 60;
                } catch (error) {
                    console.error('Error adding image to PDF:', error);
                }
            });
        }

        doc.save(Inspection_Report_${new Date().toISOString().split('T')[0]}.pdf);
    });

    printButton.addEventListener('click', () => {
        window.print();
    });

    // Offline Data Storage
    if ('indexedDB' in window) {
        const dbPromise = idb.openDB('inspectWiseDB', 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('formData')) {
                    db.createObjectStore('formData', { keyPath: 'id' });
                }
            }
        });

        aqlForm.addEventListener('input', async () => {
            const formData = {
                id: 'current',
                qcInspector: document.getElementById('qcInspector').value,
                machineNumber: document.getElementById('machineNumber').value,
                partName: document.getElementById('partName').value,
                partId: document.getElementById('partId').value,
                poNumber: document.getElementById('poNumber').value,
                productionDate: document.getElementById('productionDate').value,
                numBoxes: document.getElementById('numBoxes').value,
                pcsPerBox: document.getElementById('pcsPerBox').value,
                aql: document.getElementById('aql').value
            };

            const db = await dbPromise;
            const tx = db.transaction('formData', 'readwrite');
            await tx.store.put(formData);
            await tx.done;
        });

        // Load saved data on page load
        (async () => {
            const db = await dbPromise;
            const savedData = await db.get('formData', 'current');
            if (savedData) {
                document.getElementById('qcInspector').value = savedData.qcInspector || '';
                document.getElementById('machineNumber').value = savedData.machineNumber || '';
                document.getElementById('partName').value = savedData.partName || '';
                document.getElementById('partId').value = savedData.partId || '';
                document.getElementById('poNumber').value = savedData.poNumber || '';
                document.getElementById('productionDate').value = savedData.productionDate || '';
                document.getElementById('numBoxes').value = savedData.numBoxes || '';
                document.getElementById('pcsPerBox').value = savedData.pcsPerBox || '';
                document.getElementById('aql').value = savedData.aql || '';
            }
        })();
    }
}

// Expose globally
window.initReportGenerator = initReportGenerator;
