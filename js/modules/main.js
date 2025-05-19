// main.js — Entry point for initializing modules safely

import { initFormHandlers } from './formHandler.js';
import { initDefectHandlers } from './defectHandler.js';
import { initPhotoHandlers } from './photoHandler.js';
import { initAnnotationTools } from './annotationTool.js';
import { initReportGenerator } from './reportGenerator.js';

// Ensures partsList is defined before proceeding (due to script/module timing)
function waitForPartsList(retries = 20) {
  if (typeof partsList !== 'undefined' && Array.isArray(partsList)) {
    console.log("✅ partsList is ready. Initializing all modules...");
    initFormHandlers();
    initDefectHandlers();
    initPhotoHandlers();
    initAnnotationTools();
    initReportGenerator();
  } else if (retries > 0) {
    console.log(`⏳ Waiting for partsList... (${20 - retries + 1})`);
    setTimeout(() => waitForPartsList(retries - 1), 100);
  } else {
    console.error("❌ partsList not available after retrying. Check partsList.js load order.");
  }
}

document.addEventListener('DOMContentLoaded', waitForPartsList);
