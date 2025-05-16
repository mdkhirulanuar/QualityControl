// sampling.js
// Sampling plan calculation and display logic

import { elements } from '../domRefs.js';
import { state } from '../state.js';
import { sampleSizeCodeLetters_Level_II, aqlMasterTable_Simplified } from '../aql.js';
import { fadeIn, fadeOut, displayError, clearError } from '../ui.js';

/**
 * Determines the lot size category range string based on lot size.
 */
export function getLotSizeRange(lotSize) {
  if (lotSize >= 2 && lotSize <= 8) return '2-8';
  if (lotSize >= 9 && lotSize <= 15) return '9-15';
  if (lotSize >= 16 && lotSize <= 25) return '16-25';
  if (lotSize >= 26 && lotSize <= 50) return '26-50';
  if (lotSize >= 51 && lotSize <= 90) return '51-90';
  if (lotSize >= 91 && lotSize <= 150) return '91-150';
  if (lotSize >= 151 && lotSize <= 280) return '151-280';
  if (lotSize >= 281 && lotSize <= 500) return '281-500';
  if (lotSize >= 501 && lotSize <= 1200) return '501-1200';
  if (lotSize >= 1201 && lotSize <= 3200) return '1201-3200';
  if (lotSize >= 3201 && lotSize <= 10000) return '3201-10000';
  if (lotSize >= 10001 && lotSize <= 35000) return '10001-35000';
  if (lotSize >= 35001 && lotSize <= 150000) return '35001-150000';
  if (lotSize >= 150001 && lotSize <= 500000) return '150001-500000';
  if (lotSize >= 500001) return '500001+';
  return null;
}

/**
 * Calculate the sampling plan from inputs.
 * Returns object with sample size, ac/re, and codeLetter.
 */
export function calculateSamplingPlan() {
  clearError(elements.errorMessageDiv);
  const lotSize = parseInt(elements.lotSizeInput.value, 10);
  const aqlValue = elements.aqlSelect.value;

  if (isNaN(lotSize) || lotSize < 2) {
    displayError('Lot Size must be 2 or greater.', elements.errorMessageDiv);
    return null;
  }
  if (!['1.0', '2.5', '4.0'].includes(aqlValue)) {
    displayError('Please select a valid AQL level (1.0, 2.5, 4.0).', elements.errorMessageDiv);
    return null;
  }

  const lotRange = getLotSizeRange(lotSize);
  const codeLetter = sampleSizeCodeLetters_Level_II[lotRange];
  const planData = aqlMasterTable_Simplified[codeLetter];
  const planDetails = planData?.plans[aqlValue];

  if (!codeLetter || !planData || !planDetails) {
    displayError('Unable to determine sampling plan for this lot size or AQL.', elements.errorMessageDiv);
    return null;
  }

  return {
    codeLetter: codeLetter,
    sampleSize: planData.sampleSize,
    accept: planDetails.ac,
    reject: planDetails.re
  };
}

/**
 * Display the sampling instructions and results.
 */
export function displaySamplingPlan(plan) {
  const lotSizeVal = parseInt(elements.lotSizeInput.value, 10);
  const numBoxesVal = parseInt(elements.numBoxesInput.value, 10);
  const pcsPerBoxVal = parseInt(elements.pcsPerBoxInput.value, 10);

  let instructions = '';

  if (plan.sampleSize >= lotSizeVal) {
    instructions = '<p><strong>Sampling Instructions:</strong> 100% inspection required.</p>';
  } else {
    const boxesToOpen = Math.min(Math.ceil(plan.sampleSize / pcsPerBoxVal), numBoxesVal);
    const pcsPerOpenedBox = Math.ceil(plan.sampleSize / boxesToOpen);
    const totalInspected = boxesToOpen * pcsPerOpenedBox;

    instructions = `
      <p><strong>Sampling Instructions:</strong></p>
      <ul>
        <li>Open <strong>${boxesToOpen}</strong> box(es) randomly.</li>
        <li>Inspect <strong>${pcsPerOpenedBox}</strong> piece(s) from each opened box.</li>
      </ul>
      <p><small>Total pieces inspected: ${totalInspected}${totalInspected > plan.sampleSize ? ` (above minimum ${plan.sampleSize})` : ''}</small></p>
    `;
  }

  const aqlText = elements.aqlSelect.value === '1.0' ? 'High Quality (AQL 1.0%)'
                  : elements.aqlSelect.value === '2.5' ? 'Medium Quality (AQL 2.5%)'
                  : 'Low Quality (AQL 4.0%)';

  elements.resultsDiv.innerHTML = `
    <p><strong>Sampling Plan:</strong></p>
    <p>Lot Size: ${lotSizeVal}</p>
    <p>Inspection Level: General Level II</p>
    <p>Acceptable Quality Level: ${aqlText}</p>
    <p>Sample Size Code Letter: <strong>${plan.codeLetter}</strong></p>
    <p>Sample Size: <strong>${plan.sampleSize}</strong></p>
    <p>Acceptance Number (Ac): ${plan.accept}</p>
    <p>Rejection Number (Re): ${plan.reject}</p>
    ${instructions}
  `;

  fadeIn(elements.resultsDiv);
  fadeIn(elements.defectsInputArea);
  fadeOut(elements.verdictMessageDiv);
  fadeOut(elements.photoCaptureArea);
  fadeOut(elements.finalReportAreaDiv);
  fadeOut(elements.generateReportButton);
  fadeOut(elements.savePdfButton);
  fadeOut(elements.printButton);
}
