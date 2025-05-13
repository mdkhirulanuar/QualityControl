function initPhotoHandler() {
    const uploadMultiplePhotos = document.getElementById('uploadMultiplePhotos');
    const photoPreview = document.getElementById('photoPreview');
    const photoCount = document.getElementById('photoCount');
    const annotationModal = document.getElementById('annotationModal');
    const annotationCanvas = document.getElementById('annotationCanvas');
    const closeModal = annotationModal.querySelector('.close-modal');
    const saveAnnotationButton = document.getElementById('saveAnnotationButton');
    const brushColor = document.getElementById('brushColor');
    const brushSize = document.getElementById('brushSize');
    const drawCircleButton = document.getElementById('drawCircleButton');
    const drawTextButton = document.getElementById('drawTextButton');
    const drawFreehandButton = document.getElementById('drawFreehandButton');
    const undoButton = document.getElementById('undoButton');
    const redoButton = document.getElementById('redoButton');
    const barcodeScanner = document.getElementById('barcodeScanner');
    const scanBarcodeButton = document.getElementById('scanBarcode');
    const poNumberInput = document.getElementById('poNumber');

    let photos = [];
    let currentPhotoIndex = -1;
    let canvas, fabricCanvas;
    let isDrawing = false;
    let drawingMode = 'freehand';
    let history = [];
    let historyIndex = -1;

    uploadMultiplePhotos.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        const remainingSlots = 5 - photos.length;

        if (files.length > remainingSlots) {
            alert(You can only upload ${remainingSlots} more photos.);
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    photos.push({ src: e.target.result, annotations: [] });
                    updatePhotoPreview();
                };
            };
            reader.readAsDataURL(file);
        });

        event.target.value = '';
    });

    function updatePhotoPreview() {
        photoPreview.innerHTML = photos.length === 0 ? '<p>No photos added yet.</p>' : '';
        photos.forEach((photo, index) => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'photo-item';
            const img = document.createElement('img');
            img.src = photo.src;
            img.alt = Photo ${index + 1};
            photoDiv.appendChild(img);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'photo-actions';
            const annotateButton = document.createElement('button');
            annotateButton.className = 'annotate-photo';
            annotateButton.textContent = 'Annotate';
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-photo';
            removeButton.textContent = 'Remove';
            actionsDiv.appendChild(annotateButton);
            actionsDiv.appendChild(removeButton);
            photoDiv.appendChild(actionsDiv);

            photoDiv.addEventListener('click', () => {
                currentPhotoIndex = index;
                photoPreview.querySelectorAll('.photo-item').forEach(item => item.classList.remove('selected'));
                photoDiv.classList.add('selected');
            });

            annotateButton.addEventListener('click', () => {
                currentPhotoIndex = index;
                openAnnotationModal(photo.src);
            });

            removeButton.addEventListener('click', () => {
                photos.splice(index, 1);
                currentPhotoIndex = -1;
                updatePhotoPreview();
            });

            photoPreview.appendChild(photoDiv);
        });

        photoCount.textContent = Photos: ${photos.length}/5;
        window.photos = photos; // Expose for report generation
    }

    function openAnnotationModal(imageSrc) {
        annotationModal.style.display = 'block';
        canvas = annotationCanvas;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            fabricCanvas = new fabric.Canvas('annotationCanvas', {
                isDrawingMode: true
            });
            fabricCanvas.freeDrawingBrush.color = brushColor.value;
            fabricCanvas.freeDrawingBrush.width = parseInt(brushSize.value);

            fabricCanvas.loadFromJSON(photos[currentPhotoIndex].annotations, () => {
                history = [JSON.stringify(fabricCanvas.toJSON())];
                historyIndex = 0;
            });

            brushColor.addEventListener('change', () => {
                fabricCanvas.freeDrawingBrush.color = brushColor.value;
            });

            brushSize.addEventListener('change', () => {
                fabricCanvas.freeDrawingBrush.width = parseInt(brushSize.value);
            });

            drawCircleButton.addEventListener('click', () => {
                drawingMode = 'circle';
                fabricCanvas.isDrawingMode = false;
            });

            drawTextButton.addEventListener('click', () => {
                drawingMode = 'text';
                fabricCanvas.isDrawingMode = false;
            });

            drawFreehandButton.addEventListener('click', () => {
                drawingMode = 'freehand';
                fabricCanvas.isDrawingMode = true;
            });

            undoButton.addEventListener('click', () => {
                if (historyIndex > 0) {
                    historyIndex--;
                    fabricCanvas.loadFromJSON(history[historyIndex], fabricCanvas.renderAll.bind(fabricCanvas));
                }
            });

            redoButton.addEventListener('click', () => {
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    fabricCanvas.loadFromJSON(history[historyIndex], fabricCanvas.renderAll.bind(fabricCanvas));
                }
            });

            fabricCanvas.on('mouse:down', (options) => {
                if (drawingMode === 'circle') {
                    const pointer = fabricCanvas.getPointer(options.e);
                    const circle = new fabric.Circle({
                        left: pointer.x,
                        top: pointer.y,
                        radius: 20,
                        fill: '',
                        stroke: brushColor.value,
                        strokeWidth: parseInt(brushSize.value)
                    });
                    fabricCanvas.add(circle);
                    updateHistory();
                } else if (drawingMode === 'text') {
                    const pointer = fabricCanvas.getPointer(options.e);
                    const text = new fabric.IText('Text', {
                        left: pointer.x,
                        top: pointer.y,
                        fill: brushColor.value,
                        fontSize: parseInt(brushSize.value) * 5
                    });
                    fabricCanvas.add(text);
                    fabricCanvas.setActiveObject(text);
                    updateHistory();
                }
            });

            fabricCanvas.on('path:created', () => {
                updateHistory();
            });
        };
    }

    function updateHistory() {
        history = history.slice(0, historyIndex + 1);
        history.push(JSON.stringify(fabricCanvas.toJSON()));
        historyIndex++;
    }

    closeModal.addEventListener('click', () => {
        annotationModal.style.display = 'none';
        fabricCanvas.dispose();
    });

    saveAnnotationButton.addEventListener('click', () => {
        photos[currentPhotoIndex].annotations = JSON.stringify(fabricCanvas.toJSON());
        const dataURL = canvas.toDataURL('image/png');
        photos[currentPhotoIndex].src = dataURL;
        updatePhotoPreview();
        annotationModal.style.display = 'none';
        fabricCanvas.dispose();
    });

    scanBarcodeButton.addEventListener('click', () => {
        barcodeScanner.style.display = 'block';
        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: barcodeScanner
            },
            decoder: {
                readers: ["code_128_reader", "ean_reader", "upc_reader"]
            }
        }, (err) => {
            if (err) {
                console.error('Quagga init error:', err);
                barcodeScanner.style.display = 'none';
                return;
            }
            Quagga.start();
        });

        Quagga.onDetected((data) => {
            poNumberInput.value = data.codeResult.code;
            Quagga.stop();
            barcodeScanner.style.display = 'none';
        });
    });
}

// Expose globally
window.initPhotoHandler = initPhotoHandler;
window.photos = []; // Ensure photos array is accessible
