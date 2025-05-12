// Utility Functions
function displayError(message, type = 'user') {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.className = `error-message ${type === 'system' ? 'system' : ''} ${type === 'user' ? 'user' : ''}`;
  errorDiv.classList.remove('hidden');
  setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}

function updatePhotoCount() {
  const count = document.getElementById('photoCount');
  count.textContent = `Photos: ${photoPreviews.length}/5`;
}

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  const partSelect = document.getElementById('partName');
  const partIdInput = document.getElementById('partId');
  const calculateButton = document.getElementById('calculateButton');
  const resetButton = document.getElementById('resetButton');
  const submitDefectsButton = document.getElementById('submitDefectsButton');
  const generateReportButton = document.getElementById('generateReportButton');
  const savePdfButton = document.getElementById('savePdfButton');
  const printButton = document.getElementById('printButton');
  const uploadInput = document.getElementById('uploadMultiplePhotos');
  const photoPreview = document.getElementById('photoPreview');
  let photoPreviews = [];
  let canvas = null;
  let samplingPlan = null;
  let defectsFound = 0;

  // Function to populate part dropdown
  function populatePartDropdown() {
    try {
      // Check if partsList is available (global or imported)
      if (typeof partsList === 'undefined') {
        fetch('/QualityControl/partsList.js')
          .then(response => response.text())
          .then(script => {
            const tempScript = document.createElement('script');
            tempScript.textContent = script;
            document.body.appendChild(tempScript);
            document.body.removeChild(tempScript); // Clean up
            if (partsList && Array.isArray(partsList)) {
              partSelect.innerHTML = '<option value="">-- Select Part --</option>';
              partsList.forEach(part => {
                const option = document.createElement('option');
                option.value = part.name;
                option.textContent = part.name;
                partSelect.appendChild(option);
              });
            } else {
              displayError('Failed to load parts list. Please refresh the page.', 'system');
              partSelect.innerHTML = '<option value="">-- Parts Unavailable --</option>';
            }
          })
          .catch(err => {
            console.error('Error loading partsList.js:', err);
            displayError('Failed to load parts list. Please refresh the page.', 'system');
            partSelect.innerHTML = '<option value="">-- Parts Unavailable --</option>';
          });
      } else if (partsList && Array.isArray(partsList)) {
        partSelect.innerHTML = '<option value="">-- Select Part --</option>';
        partsList.forEach(part => {
          const option = document.createElement('option');
          option.value = part.name;
          option.textContent = part.name;
          partSelect.appendChild(option);
        });
      } else {
        displayError('Failed to load parts list. Please refresh the page.', 'system');
        partSelect.innerHTML = '<option value="">-- Parts Unavailable --</option>';
      }
    } catch (err) {
      console.error('Error populating part dropdown:', err);
      displayError('Failed to load parts list. Please refresh the page.', 'system');
      partSelect.innerHTML = '<option value="">-- Parts Unavailable --</option>';
    }

    // Event listener for part selection
    partSelect.addEventListener('change', () => {
      const selectedPart = partsList.find(part => part.name === partSelect.value);
      partIdInput.value = selectedPart ? selectedPart.id : '';
      calculateButton.disabled = !partSelect.value || !document.getElementById('aql').value || !document.getElementById('numBoxes').value || !document.getElementById('pcsPerBox').value;
    });
  }

  populatePartDropdown();

  // Calculate Sampling Plan
  calculateButton.addEventListener('click', () => {
    const numBoxes = parseInt(document.getElementById('numBoxes').value);
    const pcsPerBox = parseInt(document.getElementById('pcsPerBox').value);
    const lotSize = numBoxes * pcsPerBox;
    document.getElementById('lotSize').value = lotSize;

    const aql = parseFloat(document.getElementById('aql').value);
    const sampleSize = calculateSamplingPlan(lotSize, aql);
    const acceptLimit = Math.ceil(sampleSize * (aql / 100));

    samplingPlan = { sampleSize, acceptLimit };
    document.getElementById('results').innerHTML = `
      <h2>Sampling Plan</h2>
      <p>Sample Size: ${sampleSize}</p>
      <p>Acceptable Defects: ${acceptLimit}</p>
    `;
    document.getElementById('defectsInputArea').style.display = 'block';
    submitDefectsButton.disabled = false;
    document.getElementById('photoCaptureArea').style.display = 'block';
    document.getElementById('defectChecklist').style.display = 'block';
  });

  // Reset Form
  resetButton.addEventListener('click', () => {
    document.getElementById('aqlForm').reset();
    document.getElementById('lotSize').value = '';
    document.getElementById('partId').value = '';
    document.getElementById('results').innerHTML = '<p class="initial-message">Please enter batch details, select quality level, and click calculate.</p>';
    document.getElementById('defectsInputArea').style.display = 'none';
    document.getElementById('photoCaptureArea').style.display = 'none';
    document.getElementById('defectChecklist').style.display = 'none';
    document.getElementById('verdictMessage').style.display = 'none';
    document.getElementById('generateReportButton').style.display = 'none';
    document.getElementById('finalReportArea').style.display = 'none';
    photoPreviews = [];
    photoPreview.innerHTML = '';
    updatePhotoCount();
    calculateButton.disabled = true;
    submitDefectsButton.disabled = true;
    if (canvas) canvas.clear();
  });

  // Submit Defects
  submitDefectsButton.addEventListener('click', () => {
    defectsFound = parseInt(document.getElementById('defectsFound').value);
    const verdict = defectsFound <= samplingPlan.acceptLimit ? 'Lot Accepted' : 'Lot Rejected';
    document.getElementById('verdictMessage').innerHTML = `<h2>Verdict</h2><p>${verdict}</p>`;
    document.getElementById('verdictMessage').style.display = 'block';
    generateReportButton.style.display = 'block';
  });

  // Photo Upload Handler
  uploadInput.addEventListener('change', function (e) {
    const files = Array.from(e.target.files);
    if (files.length + photoPreviews.length > 5) {
      displayError('Maximum 5 photos allowed.', 'user');
      return;
    }
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        displayError('File size exceeds 5MB.', 'user');
        return;
      }
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          const preview = document.createElement('div');
          preview.className = 'photo-preview';
          preview.innerHTML = `<img src="${event.target.result}" alt="Preview"> <button class="delete-photo">×</button> <button class="annotate-photo">Annotate</button>`;
          photoPreviews.push({ img, element: preview });
          photoPreview.appendChild(preview);
          updatePhotoCount();
          // Add event listener for annotate button
          preview.querySelector('.annotate-photo').addEventListener('click', () => showAnnotationModal(event.target.result));
          preview.querySelector('.delete-photo').addEventListener('click', () => {
            photoPreview.removeChild(preview);
            photoPreviews = photoPreviews.filter(p => p.element !== preview);
            updatePhotoCount();
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  // Generate Report
  generateReportButton.addEventListener('click', () => {
    const qcInspector = document.getElementById('qcInspector').value;
    const machineNumber = document.getElementById('machineNumber').value;
    const partName = partSelect.value;
    const partId = partIdInput.value;
    const poNumber = document.getElementById('poNumber').value;
    const productionDate = document.getElementById('productionDate').value;
    const numBoxes = document.getElementById('numBoxes').value;
    const pcsPerBox = document.getElementById('pcsPerBox').value;
    const lotSize = document.getElementById('lotSize').value;
    const aql = document.getElementById('aql').value;
    const defects = defectsFound;
    const verdict = defectsFound <= samplingPlan.acceptLimit ? 'Accepted' : 'Rejected';
    const defectTypes = Array.from(document.querySelectorAll('input[name="defect_type"]:checked'))
      .map(cb => cb.value)
      .join(', ') || 'None';

    const reportContent = `
      <h2>Inspection Report</h2>
      <p><strong>QC Inspector:</strong> ${qcInspector}</p>
      <p><strong>Machine No:</strong> ${machineNumber}</p>
      <p><strong>Part Name:</strong> ${partName}</p>
      <p><strong>Part ID:</strong> ${partId}</p>
      <p><strong>PO Number:</strong> ${poNumber}</p>
      <p><strong>Production Date:</strong> ${productionDate}</p>
      <p><strong>Number of Boxes:</strong> ${numBoxes}</p>
      <p><strong>Pieces per Box:</strong> ${pcsPerBox}</p>
      <p><strong>Total Lot Size:</strong> ${lotSize}</p>
      <p><strong>AQL:</strong> ${aql}%</p>
      <p><strong>Sample Size:</strong> ${samplingPlan.sampleSize}</p>
      <p><strong>Acceptable Defects:</strong> ${samplingPlan.acceptLimit}</p>
      <p><strong>Defects Found:</strong> ${defects}</p>
      <p><strong>Verdict:</strong> ${verdict}</p>
      <p><strong>Defect Types:</strong> ${defectTypes}</p>
      <h3>Photos</h3>
      ${photoPreviews.map((p, i) => `<img src="${p.element.querySelector('img').src}" alt="Photo ${i + 1}" style="max-width: 200px;">`).join('')}
    `;
    document.getElementById('reportContent').innerHTML = reportContent;
    document.getElementById('finalReportArea').style.display = 'block';
    savePdfButton.style.display = 'block';
    printButton.style.display = 'block';
  });

  // Save as PDF
  savePdfButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const reportContent = document.getElementById('reportContent').innerHTML;
    doc.setFontSize(12);
    doc.text(reportContent.replace(/<[^>]+>/g, ' '), 10, 10); // Basic text conversion
    doc.save('inspection-report.pdf');
  });

  // Print Report
  printButton.addEventListener('click', () => {
    window.print();
  });

  // Service Worker Messaging
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/QualityControl/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered with scope:', registration.scope);
      })
      .catch(err => {
        console.error('ServiceWorker registration failed:', err);
        displayError('Offline support may not be available.', 'system');
      });
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'SERVICE_WORKER_MESSAGE') {
        displayError(event.data.message, 'system');
      }
    });
  }

  // Calculate Sampling Plan Function
  function calculateSamplingPlan(lotSize, aql) {
    const aqlLevels = {
      '1.0': { sizes: [2, 8, 32, 125, 500, 1200, 3200, 10000], samples: [2, 5, 14, 32, 80, 125, 200, 315] },
      '2.5': { sizes: [2, 8, 32, 125, 500, 1200, 3200, 10000], samples: [3, 13, 32, 50, 125, 200, 315, 500] },
      '4.0': { sizes: [2, 8, 32, 125, 500, 1200, 3200, 10000], samples: [5, 20, 50, 80, 200, 315, 500, 800] }
    };
    const aqlData = aqlLevels[aql];
    for (let i = 0; i < aqlData.sizes.length; i++) {
      if (lotSize <= aqlData.sizes[i]) return aqlData.samples[i];
    }
    return aqlData.samples[aqlData.samples.length - 1];
  }

  // Form Validation and Button Enable/Disable
  ['qcInspector', 'machineNumber', 'poNumber', 'productionDate', 'numBoxes', 'pcsPerBox', 'aql'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      calculateButton.disabled = !partSelect.value || !document.getElementById('aql').value || !document.getElementById('numBoxes').value || !document.getElementById('pcsPerBox').value;
    });
  });

  // Modal Control Functions
  function showAnnotationModal(imageSrc) {
    const modal = document.getElementById('annotationModal');
    modal.style.display = 'block';
    if (!canvas) {
      canvas = new fabric.Canvas('annotationCanvas', {
        height: 400,
        width: 400,
        backgroundColor: '#fff'
      });
      // Tool setup (basic example)
      document.getElementById('drawCircleButton').addEventListener('click', () => {
        canvas.add(new fabric.Circle({ radius: 20, fill: 'red', left: 100, top: 100 }));
      });
      document.getElementById('drawTextButton').addEventListener('click', () => {
        canvas.add(new fabric.IText('Text Here', { left: 100, top: 100 }));
      });
      document.getElementById('drawFreehandButton').addEventListener('click', () => {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.width = 5;
        canvas.freeDrawingBrush.color = 'black';
      });
      document.getElementById('undoButton').addEventListener('click', () => {
        canvas.remove(canvas.getObjects().pop());
      });
      document.getElementById('saveAnnotationButton').addEventListener('click', () => {
        const dataURL = canvas.toDataURL();
        const previewImg = photoPreviews.find(p => p.element.querySelector('.annotate-photo') === event.target).element.querySelector('img');
        previewImg.src = dataURL;
        hideAnnotationModal();
      });
    }
    // Load the image into the canvas
    fabric.Image.fromURL(imageSrc, function (img) {
      img.scaleToWidth(400);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  }

  function hideAnnotationModal() {
    const modal = document.getElementById('annotationModal');
    modal.style.display = 'none';
    if (canvas) canvas.isDrawingMode = false; // Disable drawing mode when closing
  }

  // Close modal on X click
  document.querySelector('.close-modal').addEventListener('click', hideAnnotationModal);

  // Prevent automatic modal on load
  window.addEventListener('load', () => {
    const modal = document.getElementById('annotationModal');
    if (modal.style.display !== 'none') modal.style.display = 'none';
  });
});