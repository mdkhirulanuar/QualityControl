// main.js — Entry point for initializing modules (with wait-for-partsList safety)

import { initFormHandlers } from './formHandler.js';
import { initDefectHandlers } from './defectHandler.js';
import { initPhotoHandlers } from './photoHandler.js';
import { initAnnotationTools } from './annotationTool.js';
import { initReportGenerator } from './reportGenerator.js';

// Retry until partsList is defined globally by partsList.js
function waitForPartsList(retries = 20) {
  if (typeof partsList !== 'undefined' && Array.isArray(partsList)) {
    console.log("✅ partsList is ready. Initializing app...");
    initFormHandlers();
    initDefectHandlers();
    initPhotoHandlers();
    initAnnotationTools();
    initReportGenerator();
  } else if (retries > 0) {
    console.log("⏳ Waiting for partsList to be ready...");
    setTimeout(() => waitForPartsList(retries - 1), 100);
  } else {
    console.error("❌ partsList is not available after retrying. Check partsList.js load order.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  waitForPartsList();
});
