// KPI‑F18 PDF generation script
// This script collects data from the KPI‑F18 form and produces a PDF with
// blank signature spaces.  It uses the jsPDF library loaded in the HTML.

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('f18Form');
  const downloadBtn = document.getElementById('downloadPdf');

  // Grab elements for dynamic behaviour
  const totalQtyInput = document.getElementById('totalQty');
  const aqlSelect = document.getElementById('aql');
  const sampleSizeInput = document.getElementById('sampleSize');
  const codeLetterInput = document.getElementById('codeLetter');
  const inspectorSelect = document.getElementById('inspectorName');
  const productSelect = document.getElementById('productName');
  const brandSelect = document.getElementById('brandName');
  const approvedByInput = document.getElementById('approvedBy');
  const verifiedByInput = document.getElementById('verifiedBy');

  // Grab section fieldsets for dynamic enabling/disabling
  const sectionA = document.getElementById('sectionA');
  const sectionB = document.getElementById('sectionB');
  const sectionC = document.getElementById('sectionC');
  const sectionD = document.getElementById('sectionD');
  const sectionE = document.getElementById('sectionE');

  /**
   * Determines whether Section A has been fully completed.
   * Requires date, PO number, inspector, product name, brand, total quantity and AQL.
   * @param {FormData} formData
   */
  function isSectionAComplete(formData) {
    // Date is not strictly required to unlock the next section; it can be filled later.
    return !!(
      formData.get('poNumber') &&
      formData.get('inspectorName') &&
      formData.get('productName') &&
      formData.get('brandName') &&
      formData.get('totalQty') &&
      formData.get('aql')
    );
  }

  /**
   * Determines whether all checkpoints in Section B have a result selected
   * and, if the result is NG or NA, whether the corresponding remarks have been provided.
   * @param {FormData} formData
   */
  function isSectionBComplete(formData) {
    const items = [
      { key: 'surface', remarks: 'surfaceRemarks' },
      { key: 'color', remarks: 'colorRemarks' },
      { key: 'print', remarks: 'printRemarks' },
      { key: 'assembly', remarks: 'assemblyRemarks' },
      { key: 'label', remarks: 'labelRemarks' },
      { key: 'packaging', remarks: 'packagingRemarks' },
      { key: 'dimension', remarks: 'dimensionRemarks' }
    ];
    return items.every(({ key, remarks }) => {
      const result = formData.get(key);
      if (!result) return false;
      if (result === 'NG') {
        const rem = formData.get(remarks);
        return !!(rem && rem.trim());
      }
      // Remarks are optional for NA and OK selections
      return true;
    });
  }

  /**
   * Determines whether Section C (Functional Test) is complete.
   * Requires a test result to be selected; if the result is not applicable, no testPerformed is needed,
   * otherwise testPerformed must have some content.
   * @param {FormData} formData
   */
  function isSectionCComplete(formData) {
    const result = formData.get('testResult');
    if (!result) return false;
    if (result === 'Not Applicable') {
      return true;
    }
    // For Pass/Fail, require a description of the test performed
    const performed = formData.get('testPerformed');
    return !!(performed && performed.trim());
  }

  /**
   * Determines whether Section D (Disposition & Approval) is complete.
   * Requires inspectedBy, approvedBy and approvalDate fields to have values.
   * @param {FormData} formData
   */
  function isSectionDComplete(formData) {
    return !!(
      formData.get('inspectedBy') &&
      formData.get('approvedBy') &&
      formData.get('approvalDate')
    );
  }

  /**
   * Toggles whether remarks inputs are required based on the selected result for each checkpoint.
   * When the result is NG or NA, the remarks become required; otherwise they are optional.
   * @param {FormData} formData
   */
  function toggleRemarksRequirement(formData) {
    const items = [
      { key: 'surface', remarks: 'surfaceRemarks' },
      { key: 'color', remarks: 'colorRemarks' },
      { key: 'print', remarks: 'printRemarks' },
      { key: 'assembly', remarks: 'assemblyRemarks' },
      { key: 'label', remarks: 'labelRemarks' },
      { key: 'packaging', remarks: 'packagingRemarks' },
      { key: 'dimension', remarks: 'dimensionRemarks' }
    ];
    items.forEach(({ key, remarks }) => {
      const result = formData.get(key);
      const input = document.querySelector(`[name="${remarks}"]`);
      if (!input) return;
      // Require remarks only when the result is NG. Remarks are optional for NA and OK selections.
      if (result === 'NG') {
        input.required = true;
      } else {
        input.required = false;
      }
    });
  }

  /**
   * Enables or disables sections of the form based on completion of previous sections.
   */
  function updateSectionAccess() {
    const formData = new FormData(form);
    // Enforce remarks requirement based on radio selections
    toggleRemarksRequirement(formData);
    // Section B depends on A
    if (isSectionAComplete(formData)) {
      sectionB.removeAttribute('disabled');
      sectionB.style.display = '';
    } else {
      sectionB.setAttribute('disabled', 'disabled');
      sectionB.style.display = 'none';
    }
    // Section C depends on A and B
    if (isSectionAComplete(formData) && isSectionBComplete(formData)) {
      sectionC.removeAttribute('disabled');
      sectionC.style.display = '';
    } else {
      sectionC.setAttribute('disabled', 'disabled');
      sectionC.style.display = 'none';
    }
    // Section D depends on A, B and C
    if (
      isSectionAComplete(formData) &&
      isSectionBComplete(formData) &&
      isSectionCComplete(formData)
    ) {
      sectionD.removeAttribute('disabled');
      sectionD.style.display = '';
    } else {
      sectionD.setAttribute('disabled', 'disabled');
      sectionD.style.display = 'none';
    }
    // Section E depends on A, B, C and D
    if (
      isSectionAComplete(formData) &&
      isSectionBComplete(formData) &&
      isSectionCComplete(formData) &&
      isSectionDComplete(formData)
    ) {
      sectionE.removeAttribute('disabled');
      sectionE.style.display = '';
    } else {
      sectionE.setAttribute('disabled', 'disabled');
      sectionE.style.display = 'none';
    }
  }

  // Populate dropdowns from lists defined in separate scripts
  if (typeof populateInspectorDropdown === 'function') {
    populateInspectorDropdown('inspectorName');
  }
  // Populate brand dropdown
  if (typeof populateBrandDropdown === 'function') {
    populateBrandDropdown('brandName');
  }
  // Populate part/product dropdown with unique part names
  function populatePartDropdown(selectId) {
    const el = document.getElementById(selectId);
    if (!el || !window.partsList) return;
    const firstOption = el.querySelector('option');
    el.innerHTML = '';
    if (firstOption) el.appendChild(firstOption);
    const uniqueNames = [...new Set(window.partsList.map(p => p.partName))];
    uniqueNames.sort();
    uniqueNames.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      el.appendChild(opt);
    });
  }
  populatePartDropdown('productName');

  // Set default QA and supervisor names if inputs exist (HTML fallback)
  if (approvedByInput && !approvedByInput.value) {
    approvedByInput.value = 'Mohd Khirul Anuar';
  }
  if (verifiedByInput && !verifiedByInput.value) {
    verifiedByInput.value = 'Lau Seok Ting';
  }

  // Compute sample size whenever total quantity or AQL changes
  function computeSampleSize() {
    const lotSize = parseInt(totalQtyInput.value, 10);
    const aqlValue = aqlSelect.value;
    if (!lotSize || !aqlValue) {
      sampleSizeInput.value = '';
      codeLetterInput.value = '';
      return;
    }
    const plan = typeof window.calculateSamplingPlan === 'function'
      ? window.calculateSamplingPlan(lotSize, aqlValue)
      : null;
    if (plan) {
      sampleSizeInput.value = plan.sampleSize;
      codeLetterInput.value = plan.codeLetter;
    } else {
      sampleSizeInput.value = '';
      codeLetterInput.value = '';
    }
  }
  // Trigger the sample size calculation whenever the total quantity
  // field changes.  Some browsers only fire the `change` event for
  // number inputs when focus is lost, so register both `input` and
  // `change` handlers to be safe.
  totalQtyInput.addEventListener('input', computeSampleSize);
  totalQtyInput.addEventListener('change', computeSampleSize);
  // Recompute the sample plan whenever the AQL level changes.
  aqlSelect.addEventListener('change', computeSampleSize);
  // Initial compute if values pre-filled
  computeSampleSize();

  // Immediately update section accessibility on load
  updateSectionAccess();

  // Update section accessibility on any input or change in the form
  form.addEventListener('input', updateSectionAccess);
  form.addEventListener('change', updateSectionAccess);

  // Helper function to draw a generic table with headers and rows.
  // Uses dynamic row heights based on text content and automatically
  // handles page breaks. Accepts arrays of header titles, rows of data,
  // and column widths in millimeters. Returns the Y position after
  // rendering the table.
  function drawTable(doc, startY, headerTitles, rows, colWidths) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 15;
    const lineMargin = 2;
    const headerHeight = 7;
    // Determine whether to render a header row.  Only draw the header if at least
    // one title contains non‑whitespace characters.  Otherwise skip the header
    // completely and start rendering rows immediately.
    const shouldDrawHeader = Array.isArray(headerTitles) &&
      headerTitles.some(title => title && String(title).trim().length > 0);
    if (shouldDrawHeader) {
      // Add a page break if header won't fit on current page
      if (startY + headerHeight > pageHeight - 20) {
        doc.addPage();
        startY = 20;
      }
      // Draw header cells with a green background and white text
      doc.setFillColor(0, 153, 102);
      doc.setTextColor(255, 255, 255);
      let xPos = marginLeft;
      headerTitles.forEach((title, idx) => {
        const colW = colWidths[idx];
        doc.rect(xPos, startY, colW, headerHeight, 'F');
        doc.text(title || '', xPos + colW / 2, startY + headerHeight / 2 + 1, {
          align: 'center',
          baseline: 'middle'
        });
        xPos += colW;
      });
      startY += headerHeight;
      // Reset colour for body rows
      doc.setTextColor(0, 0, 0);
    }
    // Iterate over each row and draw cell contents
    rows.forEach(row => {
      const cellLines = row.map((cell, idx) => {
        const text = cell != null ? String(cell) : '';
        const maxWidth = colWidths[idx] - 2 * lineMargin;
        return doc.splitTextToSize(text, maxWidth);
      });
      const maxLines = Math.max(...cellLines.map(lines => lines.length));
      // Each row has at least 7mm height; adjust for multi‑line content
      const rowHeight = Math.max(7, maxLines * 5);
      // Page break if necessary
      if (startY + rowHeight > pageHeight - 20) {
        doc.addPage();
        startY = 20;
      }
      let x = marginLeft;
      row.forEach((cell, idx) => {
        const colW = colWidths[idx];
        doc.rect(x, startY, colW, rowHeight);
        const lines = cellLines[idx];
        let textY = startY + 4;
        lines.forEach(line => {
          doc.text(String(line), x + lineMargin, textY);
          textY += 5;
        });
        x += colW;
      });
      startY += rowHeight;
    });
    return startY;
  }

  // Helper function to draw signature lines with labels. Accepts an
  // array of entries where each entry is [label, lineLength]. Returns
  // the Y position after rendering.
  function drawSignatureLines(doc, startY, entries) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 15;
    const lineHeight = 7;
    // Ensure there is space, otherwise add new page
    if (startY + entries.length * lineHeight > pageHeight - 20) {
      doc.addPage();
      startY = 20;
    }
    entries.forEach(([label, lineLength]) => {
      doc.text(label, marginLeft, startY + 5);
      // Draw a line for signature
      doc.line(marginLeft + 40, startY + 6, marginLeft + 40 + lineLength, startY + 6);
      startY += lineHeight;
    });
    return startY;
  }

  // PDF generation handler
  downloadBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const formData = new FormData(form);
    let y = 20;
    const marginLeft = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    // Title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('KPI‑F18 Final Outgoing Inspection & Transfer Report', pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    // Section A: General Information
    doc.setFont(undefined, 'bold');
    doc.text('Section A: General Information', marginLeft, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const fieldsA = [
      ['Date', formData.get('date') || ''],
      ['PO Number', formData.get('poNumber') || ''],
      ['Inspector Name', formData.get('inspectorName') || ''],
      ['Shift', formData.get('shift') || ''],
      ['Product Name / Part Name', formData.get('productName') || ''],
      ['Brand / Model', formData.get('brandName') || ''],
      ['Lot No. / Batch ID', formData.get('lotNumber') || ''],
      ['Total Quantity in Lot', formData.get('totalQty') || ''],
      ['Sample Size (pcs)', formData.get('sampleSize') || ''],
      ['AQL Level & Code', (formData.get('aql') || '') + (formData.get('codeLetter') ? ' (' + formData.get('codeLetter') + ')' : '')]
    ];
    // Remove the "Field" column header to align with provided A4 sample.  We keep the Value header for clarity.
    // Pass all blank headers so the header row is omitted entirely.  This removes the
    // coloured header row from the report.
    y = drawTable(doc, y, ['', ''], fieldsA, [80, 95]);
    y += 6;
    // Section B
    doc.setFont(undefined, 'bold');
    doc.text('Section B: Visual & Dimensional Inspection', marginLeft, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const checkpoints = [
      { key: 'surface', label: 'Surface condition / appearance', remarks: 'surfaceRemarks' },
      { key: 'color', label: 'Color / Finish consistency', remarks: 'colorRemarks' },
      { key: 'print', label: 'Print / marking clarity', remarks: 'printRemarks' },
      { key: 'assembly', label: 'Assembly completeness', remarks: 'assemblyRemarks' },
      { key: 'label', label: 'Label presence / legibility', remarks: 'labelRemarks' },
      { key: 'packaging', label: 'Packaging condition', remarks: 'packagingRemarks' },
      { key: 'dimension', label: 'Dimensional accuracy (per Control Plan)', remarks: 'dimensionRemarks' }
    ];
    const bRows = checkpoints.map(item => {
      const result = formData.get(item.key) || '';
      const rem = formData.get(item.remarks) || '';
      return [item.label, result, rem];
    });
    // Remove the "Checkpoint Description" column header to match the desired format.  Keep Result and Remarks headers.
    // Omit headers for Section B by passing blank strings for each column
    y = drawTable(doc, y, ['', '', ''], bRows, [90, 30, 55]);
    y += 6;
    // Section C
    doc.setFont(undefined, 'bold');
    doc.text('Section C: Functional Test Result (if applicable)', marginLeft, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const testPerformed = formData.get('testPerformed') || '';
    const testResult = formData.get('testResult') || '';
    const cRows = [
      ['Test Performed', testPerformed],
      ['Result', testResult]
    ];
    // Remove the "Field" header for Section C tables; retain the Value header.
    // Omit headers for Section C
    y = drawTable(doc, y, ['', ''], cRows, [80, 95]);
    y += 6;
    // Section D
    doc.setFont(undefined, 'bold');
    doc.text('Section D: Disposition & Approval', marginLeft, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const dispRows = [
      ['Total Defect Quantity', formData.get('defectQty') || ''],
      ['Disposition', formData.get('disposition') || ''],
      ['Remarks', formData.get('dispositionRemarks') || ''],
      ['Inspected By (QC)', formData.get('inspectedBy') || ''],
      ['Approved By (QA)', formData.get('approvedBy') || ''],
      ['Date', formData.get('approvalDate') || '']
    ];
    // Remove the "Field" header for Section D tables; retain the Value header.
    // Omit headers for Section D
    y = drawTable(doc, y, ['', ''], dispRows, [80, 95]);
    y += 4;
    // Section D Signatures
    doc.setFont(undefined, 'bold');
    doc.text('Signatures (please sign below):', marginLeft, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    y = drawSignatureLines(doc, y, [
      ['Inspected By (QC):', 90],
      ['Approved By (QA):', 90]
    ]);
    y += 6;
    // Section E
    doc.setFont(undefined, 'bold');
    doc.text('Section E: Warehouse Transfer Confirmation (if applicable)', marginLeft, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    const eRows = [
      ['Quantity Received (pcs)', formData.get('receivedQty') || ''],
      ['Received On (Date)', formData.get('receivedDate') || ''],
      ['Inspected By', formData.get('warehouseInspector') || ''],
      ['Verified By (Supervisor)', formData.get('verifiedBy') || ''],
      ['Date', formData.get('warehouseDate') || '']
    ];
    // Remove the "Field" header for Section E tables; retain the Value header.
    // Omit headers for Section E
    y = drawTable(doc, y, ['', ''], eRows, [80, 95]);
    y += 4;
    // Section E signatures
    doc.setFont(undefined, 'bold');
    doc.text('Warehouse signatures (please sign below):', marginLeft, y);
    y += 6;
    doc.setFont(undefined, 'normal');
    y = drawSignatureLines(doc, y, [
      ['Inspected By:', 90],
      ['Verified By:', 90]
    ]);
    y += 6;
    // Ownership note
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    if (y + 10 > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text('Ownership', marginLeft, y);
    y += 4;
    doc.text('Copyright © 2025. Developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.', marginLeft, y);
    doc.setTextColor(0, 0, 0);
    // Generate a unique file name for each report.  Use the PO number if available,
    // otherwise fall back to the lot/batch ID or product name.  Append the current
    // date and time in YYYYMMDD_HHMMSS format to ensure uniqueness.  This
    // pattern mirrors the naming convention used in the F25 reports, e.g.
    // "Report_18-17978-01_20251018_105206.pdf".
    const idSegment = formData.get('poNumber') || formData.get('lotNumber') || formData.get('productName') || 'NoID';
    const safeSegment = String(idSegment).replace(/\s+/g, '') || 'NoID';
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const reportId = `Report_${safeSegment}_${datePart}_${timePart}`;
    doc.save(`${reportId}.pdf`);
  });
});