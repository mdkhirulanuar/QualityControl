// main.js — Entry point for initializing modules

import { initFormHandlers } from './formHandler.js';
import { initDefectHandlers } from './defectHandler.js';
import { initPhotoHandlers } from './photoHandler.js';
import { initAnnotationTools } from './annotationTool.js';
import { initReportGenerator } from './reportGenerator.js';

// Wait until partsList is available
function waitForPartsList(retries = 10) {
  if (typeof partsList !== 'undefined') {
    initFormHandlers();
    initDefectHandlers();
    initPhotoHandlers();
    initAnnotationTools();
    initReportGenerator();
  } else if (retries > 0) {
    setTimeout(() => waitForPartsList(retries - 1), 100);
  } else {
    console.error("partsList not found. Check if partsList.js is loaded correctly.");
  }
}

document.addEventListener('DOMContentLoaded', waitForPartsList);
