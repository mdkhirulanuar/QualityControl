// pdfGenerator.js

function pdf_bindExportButton() {
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function () {
      const formData = form_getFormData();
      if (!form_validateFields(formData)) {
        alert('Please complete all required fields before exporting.');
        return;
      }
      generatePDFReport(formData);
    });
  }
}

function generatePDFReport(data) {
  const doc = new jsPDF();

  const leftX = 15;
  let currentY = 15;
  const lineSpacing = 10;

  doc.setFontSize(14);
  doc.text('INCOMING MATERIAL INSPECTION REPORT', 105, currentY, null, null, 'center');
  currentY += lineSpacing * 2;

  doc.setFontSize(11);
  doc.text(`Date: ${data.date}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Part No: ${data.partNumber}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Description: ${data.partDescription}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Supplier: ${data.supplierName}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Delivery Note No: ${data.deliveryNote}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Lot No: ${data.lotNumber}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Quantity Received: ${data.quantityReceived}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`No. of Boxes: ${data.boxCount}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Pcs/Box: ${data.pcsPerBox}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Major Defects: ${data.majorDefects}`, leftX, currentY); currentY += lineSpacing;
  doc.text(`Minor Defects: ${data.minorDefects}`, leftX, currentY); currentY += lineSpacing;

  const verdict = calculateVerdict(parseInt(data.majorDefects), parseInt(data.minorDefects));
  doc.text(`Short Verdict: ${verdict}`, leftX, currentY); currentY += lineSpacing;

  if (data.remarks) {
    doc.text(`Remarks: ${data.remarks}`, leftX, currentY); currentY += lineSpacing;
  }

  doc.text(`Inspected by: ${data.inspectorName}`, leftX, currentY); currentY += lineSpacing * 2;

  if (verdict === 'REJECTED') {
    doc.setFont(undefined, 'italic');
    doc.text('[This inspection requires QA Executive review and signature]', leftX, currentY);
  }

  doc.save(`InspectionReport_${data.partNumber}_${data.date}.pdf`);
}
