// annotationTool.js — Handles drawing tools and annotation modal

export function initAnnotationTools() {
const annotationModal = document.getElementById('annotationModal');
  const annotationCanvas = document.getElementById('annotationCanvas');
  const closeModal = document.querySelector('.close-modal');
  const drawCircleButton = document.getElementById('drawCircleButton');
  const drawTextButton = document.getElementById('drawTextButton');
  const drawFreehandButton = document.getElementById('drawFreehandButton');
  const undoButton = document.getElementById('undoButton');
  const saveAnnotationButton = document.getElementById('saveAnnotationButton');
}


  // --- Event Handlers ---
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

      undoButton.addEventListener('click', () => {
        if (annotationHistory.length > 0) {
          const lastAction = annotationHistory.pop();
          fabricCanvas.remove(lastAction);
          fabricCanvas.renderAll();
        }
      });

      saveAnnotationButton.addEventListener('click', () => {
        const annotatedImage = fabricCanvas.toDataURL('image/jpeg');
        capturedPhotos[currentPhotoIndex] = annotatedImage;
        updatePhotoPreview();
        closeAnnotationModal();
      });

  closeModal.addEventListener('click', closeAnnotationModal);

  // --- Mobile Touch Enhancements ---
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('touchstart', () => button.classList.add('active'));
    button.addEventListener('touchend', () => button.classList.remove('active'));
  });

