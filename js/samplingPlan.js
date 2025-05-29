// samplingPlan.js

export const aqlMasterTable_Simplified = {
  'A': { sampleSize: 2, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
  'B': { sampleSize: 3, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
  'C': { sampleSize: 5, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
  // ... (continue with D to Q)
};

// Calculates and returns sampling plan
export function calculateSamplingPlan(lotSize, aql) {
  if (!lotSize || isNaN(lotSize)) return null;

  let code;
  if (lotSize <= 8) code = 'A';
  else if (lotSize <= 15) code = 'B';
  else if (lotSize <= 25) code = 'C';
  else if (lotSize <= 50) code = 'D';
  else if (lotSize <= 90) code = 'E';
  else if (lotSize <= 150) code = 'F';
  else if (lotSize <= 280) code = 'G';
  else if (lotSize <= 500) code = 'H';
  else if (lotSize <= 1200) code = 'J';
  else if (lotSize <= 3200) code = 'K';
  else if (lotSize <= 10000) code = 'L';
  else if (lotSize <= 35000) code = 'M';
  else if (lotSize <= 150000) code = 'N';
  else if (lotSize <= 500000) code = 'P';
  else code = 'Q';

  const plan = aqlMasterTable_Simplified[code]?.plans[aql];
  if (!plan) return null;

  return {
    codeLetter: code,
    sampleSize: aqlMasterTable_Simplified[code].sampleSize,
    acceptanceNumber: plan.ac,
    rejectionNumber: plan.re
  };
}
