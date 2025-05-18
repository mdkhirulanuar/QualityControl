// photoHandler.js

// --- Photo State ---
let capturedPhotos = [];
const MAX_PHOTOS = 5;
let currentPhotoIndex = null;
let annotationHistory = [];
let currentMode = null;
let fabricCanvas = null;

// --- Update Photo Preview UI ---
function updatePhotoPreview() {
  photoPreview.innerHTML = capturedPhotos.length === 0
    ? '<p>No photos added yet.</p>'
    : capturedPhotos.map((photo, index) => `
        <img src="${photo}" alt="Photo ${index + 1}" data-index="${index}" title="Click to annotate or remove">
      `).join('');

  photoCount.textContent = `Photos: ${capturedPhotos.length}/${MAX_PHOTOS}`;
  uploadMultiplePhotosInput.disabled = capturedPhotos.length >= MAX_PHOTOS;

  if (validateDefectsSection()) {
    const defectsFound = parseInt(defectsFoundInput.value, 10);
    if (defectsFound > currentSamplingPlan.accept) {
      if (capturedPhotos.length > 0) {
        fadeIn(generateReportButton);
      } else {
        generateReportButton.style.display = 'none';
      }
    }
  }
}

// --- Add & Remove Photos ---
function addPhoto(base64) {
  if (capturedPhotos.length >= MAX_PHOTOS) {
    displayError(`Maximum ${MAX_PHOTOS} photos reached.`);
    return false;
  }
  capturedPhotos.push(base64);
  updatePhotoPreview();
  clearError();
  return true;
}

function removePhoto(index) {
  capturedPhotos.splice(index, 1);
  updatePhotoPreview();
  clearError();
}

// --- File Upload Handler ---
function handleFileUpload(files) {
  const validImages = Array.from(files).filter(file => file.type.startsWith('image/'));
  if (validImages.length === 0) {
    displayError('No valid images selected.');
    return;
  }

  validImages.forEach(file => {
    if (capturedPhotos.length >= MAX_PHOTOS) return;
    const reader = new FileReader();
    reader.onload = () => addPhoto(reader.result);
    reader.onerror = () => displayError('Error reading file.');
    reader.readAsDataURL(file);
  });
}

// --- Annotation Modal (Canvas via Fabric.js) ---
function initAnnotationCanvas(imageSrc, index) {
  currentPhotoIndex = index;
  const img = new Image();
  img.crossOrigin = "Anonymous";

  img.onload = function () {
    const maxWidth = 500;
    const maxHeight = 400;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = (maxWidth / width) * height;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (maxHeight / height) * width;
      height = maxHeight;
    }

    annotationCanvas.width = width;
    annotationCanvas.height = height;

    fabricCanvas = new fabric.Canvas('annotationCanvas', { width, height });

    fabric.Image.fromURL(imageSrc, function (imgObj) {
      imgObj.set({ selectable: false, evented: false });
      imgObj.scaleToWidth(width);
      imgObj.scaleToHeight(height);
      fabricCanvas.add(imgObj);
      fabricCanvas.sendToBack(imgObj);
    });

    currentMode = null;
    annotationHistory = [];
    updateToolButtons();

    // Tool buttons
    drawCircleButton.addEventListener('click', () => {
      currentMode = currentMode === 'circle' ? null : 'circle';
      fabricCanvas.isDrawingMode = false;
      updateToolButtons();
    });

    drawTextButton.addEventListener('click', () => {
      currentMode = currentMode === 'text' ? null : 'text';
      fabricCanvas.isDrawingMode = false;
      updateToolButtons();
    });

    drawFreehandButton.addEventListener('click', () => {
      currentMode = currentMode === 'freehand' ? null : 'freehand';
      fabricCanvas.isDrawingMode = currentMode === 'freehand';
      fabricCanvas.freeDrawingBrush.color = '#ff0000';
      fabricCanvas.freeDrawingBrush.width = 2;
      updateToolButtons();
    });

    fabricCanvas.on('mouse:down', (options) => {
      if (currentMode === 'circle') {
        const pointer = fabricCanvas.getPointer(options.e);
        const circle = new fabric.Circle({
          left: pointer.x - 20,
          top: pointer.y - 20,
          radius: 20,
          fill: '',
          stroke: '#ff0000',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center'
        });
        fabricCanvas.add(circle);
        annotationHistory.push(circle);
      } else if (currentMode === 'text') {
        const pointer = fabricCanvas.getPointer(options.e);
        const text = new fabric.IText('Enter text', {
          left: pointer.x,
          top: pointer.y,
          fill: '#ff0000',
          fontSize: 16,
          fontFamily: 'Arial'
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        annotationHistory.push(text);
      }
    });

    fabricCanvas.on('path:created', (e) => {
      annotationHistory.push(e.path);
    });

    undoButton.addEventListener('click', () => {
      if (annotationHistory.length > 0) {
        const last = annotationHistory.pop();
        fabricCanvas.remove(last);
        fabricCanvas.renderAll();
      }
    });

    saveAnnotationButton.addEventListener('click', () => {
      const annotatedImage = fabricCanvas.toDataURL('image/jpeg');
      capturedPhotos[currentPhotoIndex] = annotatedImage;
      updatePhotoPreview();
      closeAnnotationModal();
    });
  };

  img.onerror = () => displayError('Error loading image for annotation.');
  img.src = imageSrc;
}

// --- Tool Button Highlight ---
function updateToolButtons() {
  drawCircleButton.classList.toggle('active', currentMode === 'circle');
  drawTextButton.classList.toggle('active', currentMode === 'text');
  drawFreehandButton.classList.toggle('active', currentMode === 'freehand');
}

// --- Close Modal ---
function closeAnnotationModal() {
  annotationModal.style.display = 'none';
  if (fabricCanvas) {
    fabricCanvas.dispose();
    fabricCanvas = null;
  }
  currentPhotoIndex = null;
  currentMode = null;
  annotationHistory = [];
}
