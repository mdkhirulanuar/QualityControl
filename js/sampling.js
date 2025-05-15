import { sampleSizeCodeLetters_Level_II, aqlMasterTable_Simplified } from './config.js';
import { displayError, clearError } from './ui.js';

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

export function calculateSamplingPlan(lotSize, aqlValue) {
  clearError();

  if (isNaN(lotSize) || lotSize < 2) {
    displayError('Lot Size must be 2 or greater.');
    return null;
  }

  if (!['1.0', '2.5', '4.0'].includes(aqlValue)) {
    displayError('Please select High (1.0%), Medium (2.5%), or Low (4.0%) AQL.');
    return null;
  }

  const lotRange = getLotSizeRange(lotSize);
  if (!lotRange) {
    displayError('Lot size outside standard AQL range.');
    return null;
  }

  const codeLetter = sampleSizeCodeLetters_Level_II[lotRange];
  if (!codeLetter) {
    displayError(`Code Letter not found for Lot Size: ${lotSize}`);
    return null;
  }

  const planData = aqlMasterTable_Simplified[codeLetter];
  if (!planData || !planData.plans) {
    displayError(`No AQL plan found for Code Letter ${codeLetter}`);
    return null;
  }

  const sampleSize = planData.sampleSize;
  const plan = planData.plans[aqlValue];

  if (!plan || typeof plan.ac === 'undefined' || typeof plan.re === 'undefined') {
    displayError(`Ac/Re not defined for AQL ${aqlValue} and Code ${codeLetter}`);
    return null;
  }

  return {
    codeLetter,
    sampleSize,
    accept: plan.ac,
    reject: plan.re
  };
}
