// main.js — Entry point for initializing modules

import { initFormHandlers } from './formHandler.js';
import { initDefectHandlers } from './defectHandler.js';
import { initPhotoHandlers } from './photoHandler.js';
import { initAnnotationTools } from './annotationTool.js';
import { initReportGenerator } from './reportGenerator.js';


document.addEventListener('DOMContentLoaded', function() {
  initFormHandlers();
  initDefectHandlers();
  initPhotoHandlers();
  initAnnotationTools();
  initReportGenerator();
});

