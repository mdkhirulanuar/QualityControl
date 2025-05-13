/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/
import { openDB } from '/libs/idb.min.js';
import { fadeIn, fadeOut } from './utils.js';
import { validateDefectsSection } from './formValidation.js';

const dbPromise = openDB('InspectWiseDB', 1, {
    upgrade(db) {
        db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
    }
});

let capturedPhotos = [];
const MAX_PHOTOS = 5;
let fabricCanvas = null;
let currentPhotoIndex = null;
let annotationHistory = [];
let redoHistory = [];
let currentMode = null;

export function initPhotoHandler() {
    const uploadMultiplePhotosInput = document.getElementById('uploadMultiplePhotos');
    const photoPreview = document.getElementById('photoPreview');
    const photoCount = document.getElementById('photoCount');
    const annotationModal = document.getElementById('annotationModal');
    const annotationCanvas = document.getElementById('annotationCanvas');
    const closeModal = document.querySelector('.close-modal');
    const drawCircleButton = document.getElementById('drawCircleButton');
    const drawTextButton = document.getElementById('drawTextButton');
    const drawFreehandButton = document.getElementById('drawFreehandButton');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    const saveAnnotationButton = document.getElementById('saveAnnotationButton');
    const brushColorInput = document.getElementById('brushColor');
    const brushSizeInput = document.getElementById('brushSize');
    const scanBarcodeButton = document.getElementById('scanBarcode');
    const barcodeScanner = document.getElementById('barcodeScanner');
    const poNumberInput = document.getElementById('poNumber');
    const errorMessageDiv = document.getElementById('error-message');
    const photoActions = document.querySelector('.photo-actions');

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

    function updatePhotoPreview() {
        photoPreview.innerHTML = capturedPhotos.length === 0
            ? '<p>No photos added yet.</p>'
            : capturedPhotos.map((photo, index) => 
                <img src="${photo}" alt="Photo ${index + 1}" data-index="${index}" title="Tap to annotate or remove">
              ).join('');
        photoCount.textContent = Photos: ${capturedPhotos.length}/${MAX_PHOTOS};
        uploadMultiplePhotosInput.disabled = capturedPhotos.length >= MAX_PHOTOS;
        if (validateDefectsSection()) {
            fadeIn(document.getElementById('generateReportButton'));
        }
    }

    async function addPhoto(base64) {
        if (capturedPhotos.length >= MAX_PHOTOS) {
            displayError(Maximum ${MAX_PHOTOS} photos reached.);
            return false;
        }
        capturedPhotos.push(base64);
        const db = await dbPromise;
        await db.add('photos', { base64, timestamp: Date.now() });
        updatePhotoPreview();
        clearError();
        return true;
    }

    async function removePhoto(index) {
        const db = await dbPromise;
        const allPhotos = await db.getAll('photos');
        const photoId = allPhotos[index].id;
        await db.delete('photos', photoId);
        capturedPhotos.splice(index, 1);
        updatePhotoPreview();
        clearError();
    }

    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxSize = 800;
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                callback(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function handleFileUpload(files) {
        const validImages = Array.from(files).filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                displayError(Invalid file type: ${file.name});
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                displayError(File too large: ${file.name});
                return false;
            }
            return true;
        });
        validImages.forEach(file => {
            if (captiuploadMultiplePhotosInput.disabled = capturedPhotos.length >= MAX_PHOTOS) return;
            compressImage(file, (compressedBase64) => addPhoto(compressedBase64));
        });
    }

    function initAnnotationCanvas(imageSrc, index) {
        currentPhotoIndex = index;
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            const viewportWidth = Math.min(window.innerWidth * 0.9, 500);
            const viewportHeight = Math.min(window.innerHeight * 0.6, 400);
            let width = img.width;
            let height = img.height;

            if (width > viewportWidth) {
                height = (viewportWidth / width) * height;
                width = viewportWidth;
            }
            if (height > viewportHeight) {
                width = (viewportHeight / height) * width;
                height = viewportHeight;
            }

            annotationCanvas.width = width;
            annotationCanvas.height = height;

            fabricCanvas = new fabric.Canvas('annotationCanvas', {
                width: width,
                height: height
            });

            fabric.Image.fromURL(imageSrc, function(imgObj) {
                imgObj.set({ selectable: false, evented: false });
                imgObj.scaleToWidth(width);
                imgObj.scaleToHeight(height);
                fabricCanvas.add(imgObj);
                fabricCanvas.sendToBack(imgObj);
            });

            currentMode = null;
            annotationHistory = JSON.parse(localStorage.getItem(annotation_${index}) || '[]').map(data => fabric.util.object.clone(data));
            redoHistory = [];
            annotationHistory.forEach(obj => fabricCanvas.add(obj));
            updateToolButtons();

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
                fabricCanvas.freeDrawingBrush.color = brushColorInput.value;
                fabricCanvas.freeDrawingBrush.width = parseInt(brushSizeInput.value, 10);
                updateToolButtons();
            });

            brushColorInput.addEventListener('change', () => {
                if (currentMode === 'freehand') {
                    fabricCanvas.freeDrawingBrush.color = brushColorInput.value;
                }
            });

            brushSizeInput.addEventListener('change', () => {
                if (currentMode === 'freehand') {
                    fabricCanvas.freeDrawingBrush.width = parseInt(brushSizeInput.value, 10);
                }
            });

            fabricCanvas.on('mouse:down', (options) => {
                if (currentMode === 'circle') {
                    const pointer = fabricCanvas.getPointer(options.e);
                    const circle = new fabric.Circle({
                        left: pointer.x - 20,
                        top: pointer.y - 20,
                        radius: 20,
                        fill: '',
                        stroke: brushColorInput.value,
                        strokeWidth: parseInt(brushSizeInput.value, 10),
                        originX: 'center',
                        originY: 'center'
                    });
                    fabricCanvas.add(circle);
                    annotationHistory.push(circle);
                    redoHistory = [];
                    saveAnnotationState();
                } else if (currentMode === 'text') {
                    const pointer = fabricCanvas.getPointer(options.e);
                    const text = new fabric.IText('Enter text', {
                        left: pointer.x,
                        top: pointer.y,
                        fill: brushColorInput.value,
                        fontSize: 16,
                        fontFamily: 'Arial'
                    });
                    fabricCanvas.add(text);
                    fabricCanvas.setActiveObject(text);
                    annotationHistory.push(text);
                    redoHistory = [];
                    saveAnnotationState();
                }
            });

            fabricCanvas.on('path:created', (e) => {
                annotationHistory.push(e.path);
                redoHistory = [];
                saveAnnotationState();
            });

            fabricCanvas.on('touch:gesture', (e) => {
                // Handle pinch-to-zoom or other gestures if needed
            });

            undoButton.addEventListener('click', () => {
                if (annotationHistory.length > 0) {
                    const lastAction = annotationHistory.pop();
                    redoHistory.push(lastAction);
                    fabricCanvas.remove(lastAction);
                    fabricCanvas.renderAll();
                    saveAnnotationState();
                }
            });

            redoButton.addEventListener('click', () => {
                if (redoHistory.length > 0) {
                    const action = redoHistory.pop();
                    annotationHistory.push(action);
                    fabricCanvas.add(action);
                    fabricCanvas.renderAll();
                    saveAnnotationState();
                }
            });

            saveAnnotationButton.addEventListener('click', async () => {
                const annotatedImage = fabricCanvas.toDataURL('image/jpeg');
                capturedPhotos[currentPhotoIndex] = annotatedImage;
                const db = await dbPromise;
                const allPhotos = await db.getAll('photos');
                await db.put('photos', { id: allPhotos[currentPhotoIndex].id, base64: annotatedImage, timestamp: Date.now() });
                updatePhotoPreview();
                closeAnnotationModal();
            });
        };
        img.onerror = () => {
            displayError('Error loading image for annotation.');
            logError('Image load error', { src: imageSrc });
        };
        img.src = imageSrc;
    }

    function saveAnnotationState() {
        localStorage.setItem(annotation_${currentPhotoIndex}, JSON.stringify(annotationHistory.map(obj => obj.toJSON())));
    }

    function updateToolButtons() {
        drawCircleButton.classList.toggle('active', currentMode === 'circle');
        drawTextButton.classList.toggle('active', currentMode === 'text');
        drawFreehandButton.classList.toggle('active', currentMode === 'freehand');
    }

    function closeAnnotationModal() {
        annotationModal.style.display = 'none';
        if (fabricCanvas) {
            fabricCanvas.dispose();
            fabricCanvas = null;
        }
        currentPhotoIndex = null;
        currentMode = null;
        annotationHistory = [];
        redoHistory = [];
        photoActions.style.display = 'none';
    }

    async function loadPhotos() {
        const db = await dbPromise;
        capturedPhotos = (await db.getAll('photos')).map(item => item.base64);
        updatePhotoPreview();
    }

    // Barcode Scanning
    scanBarcodeButton.addEventListener('click', () => {
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: barcodeScanner
            },
            decoder: { readers: ['code_128_reader', 'ean_reader'] }
        }, (err) => {
            if (err) {
                displayError('Barcode scanner initialization failed.');
                logError('Barcode scanner error', { error: err });
                return;
            }
            barcodeScanner.style.display = 'block';
            Quagga.start();
        });
        Quagga.onDetected((result) => {
            poNumberInput.value = DOMPurify.sanitize(result.codeResult.code.slice(0, 20));
            Quagga.stop();
            barcodeScanner.style.display = 'none';
            validateBatchSection();
        });
    });

    // Event Listeners
    uploadMultiplePhotosInput.addEventListener('change', (e) => handleFileUpload(e.target.files));

    photoPreview.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            const index = parseInt(e.target.dataset.index, 10);
            photoActions.style.display = 'flex';
            document.querySelector('.annotate-photo').onclick = () => {
                initAnnotationCanvas(capturedPhotos[index], index);
                annotationModal.style.display = 'flex';
                photoActions.style.display = 'none';
            };
            document.querySelector('.remove-photo').onclick = () => {
                if (confirm('Remove this photo?')) {
                    removePhoto(index);
                }
                photoActions.style.display = 'none';
            };
        }
    });

    closeModal.addEventListener('click', closeAnnotationModal);

    // Focus Trapping for Modal
    function trapFocus(modal) {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusable
