// formHandler.js

function form_bindEvents() {
  const form = document.getElementById('inspectionForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const data = form_getFormData();

    if (!form_validateFields(data)) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!validatePhotoUploads()) {
      alert('Photo(s) required for rejected inspection.');
      return;
    }

    updateShortVerdict(data);
    generatePDFReport(data);
    form_resetFields();
  });
}

function form_getFormData() {
  return {
    date: document.getElementById('date').value.trim(),
    partNumber: document.getElementById('partNumber').value.trim(),
    partDescription: document.getElementById('partDescription').value.trim(),
    supplierName: document.getElementById('supplierName').value.trim(),
    deliveryNote: document.getElementById('deliveryNote').value.trim(),
    quantityReceived: document.getElementById('quantityReceived').value.trim(),
    lotNumber: document.getElementById('lotNumber').value.trim(),
    boxCount: document.getElementById('boxCount').value.trim(),
    pcsPerBox: document.getElementById('pcsPerBox').value.trim(),
    majorDefects: document.getElementById('majorDefects').value.trim(),
    minorDefects: document.getElementById('minorDefects').value.trim(),
    inspectorName: document.getElementById('inspectorName').value.trim(),
    remarks: document.getElementById('remarks').value.trim(),
    photos: [
      document.getElementById('photo1').files[0],
      document.getElementById('photo2').files[0]
    ]
  };
}

function form_validateFields(data) {
  return (
    data.date &&
    data.partNumber &&
    data.partDescription &&
    data.supplierName &&
    data.deliveryNote &&
    data.quantityReceived &&
    data.lotNumber &&
    data.boxCount &&
    data.pcsPerBox &&
    data.majorDefects !== '' &&
    data.minorDefects !== '' &&
    data.inspectorName
  );
}

function form_resetFields() {
  document.getElementById('inspectionForm').reset();
  document.getElementById('shortVerdict').textContent = '';
  togglePhotoFieldsIfRequired(); // Reset photo display
}
