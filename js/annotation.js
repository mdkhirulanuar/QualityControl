import { elements } from './domRefs.js';
import { capturedPhotos, updatePhotoPreview } from './photo.js';

let fabricCanvas = null;
let currentPhotoIndex = null;
let annotationHistory = [];
let currentMode = null;

export function initAnnotationCanvas(imageSrc, index) {
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

    elements.annotationCanvas.width = width;
    elements.annotationCanvas.height = height;

    fabricCanvas = new fabric.Canvas('annotationCanvas', {
      width: width,
      height: height
    });

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

    elements.drawCircleButton.addEventListener('click', () => {
      currentMode = currentMode === 'circle' ? null : 'circle';
      fabricCanvas.isDrawingMode = false;
      updateToolButtons();
    });

    elements.drawTextButton.addEventListener('click', () => {
      currentMode = currentMode === 'text' ? null : 'text';
      fabricCanvas.isDrawingMode = false;
      updateToolButtons();
    });

    elements.drawFreehandButton.addEventListener('click', () => {
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

    elements.undoButton.addEventListener('click', () => {
      if (annotationHistory.length > 0) {
        const lastAction = annotationHistory.pop();
        fabricCanvas.remove(lastAction);
        fabricCanvas.renderAll();
      }
    });

    elements.saveAnnotationButton.addEventListener('click', () => {
      const annotatedImage = fabricCanvas.toDataURL('image/jpeg');
      capturedPhotos[currentPhotoIndex] = annotatedImage;
      updatePhotoPreview();
      closeAnnotationModal();
    });
  };

  img.onerror = () => {
    alert('Error loading image for annotation.');
  };

  img.src = imageSrc;
}

function updateToolButtons() {
  elements.drawCircleButton.classList.toggle('active', currentMode === 'circle');
  elements.drawTextButton.classList.toggle('active', currentMode === 'text');
  elements.drawFreehandButton.classList.toggle('active', currentMode === 'freehand');
}

function closeAnnotationModal() {
  elements.annotationModal.style.display = 'none';
  if (fabricCanvas) {
    fabricCanvas.dispose();
    fabricCanvas = null;
  }
  currentPhotoIndex = null;
  currentMode = null;
  annotationHistory = [];
}
