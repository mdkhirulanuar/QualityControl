// samplingPlan.js

// AQL Master Table for Simplified Sampling Plan
export const aqlMasterTable_Simplified = {
  'A': { sampleSize: 2, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
  'B': { sampleSize: 3, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
  'C': { sampleSize: 5, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 0, re: 1 } } },
  'D': { sampleSize: 8, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 0, re: 1 }, '4.0': { ac: 1, re: 2 } } },
  'E': { sampleSize: 13, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 1, re: 2 }, '4.0': { ac: 1, re: 2 } } },
  'F': { sampleSize: 20, plans: { '1.0': { ac: 0, re: 1 }, '2.5': { ac: 1, re: 2 }, '4.0': { ac: 2, re: 3 } } },
  'G': { sampleSize: 32, plans: { '1.0': { ac: 1, re: 2 }, '2.5': { ac: 2, re: 3 }, '4.0': { ac: 3, re: 4 } } },
  'H': { sampleSize: 50, plans: { '1.0': { ac: 1, re: 2 }, '2.5': { ac: 3, re: 4 }, '4.0': { ac: 5, re: 6 } } },
  'J': { sampleSize: 80, plans: { '1.0': { ac: 2, re: 3 }, '2.5': { ac: 5, re: 6 }, '4.0': { ac: 7, re: 8 } } },
  'K': { sampleSize: 125, plans: { '1.0': { ac: 3, re: 4 }, '2.5': { ac: 7, re: 8 }, '4.0': { ac: 10, re: 11 } } },
  'L': { sampleSize: 200, plans: { '1.0': { ac: 5, re: 6 }, '2.5': { ac: 10, re: 11 }, '4.0': { ac: 14, re: 15 } } },
  'M': { sampleSize: 315, plans: { '1.0': { ac: 7, re: 8 }, '2.5': { ac: 14, re: 15 }, '4.0': { ac: 21, re: 22 } } },
  'N': { sampleSize: 500, plans: { '1.0': { ac: 10, re: 11 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } },
  'P': { sampleSize: 800, plans: { '1.0': { ac: 14, re: 15 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } },
  'Q': { sampleSize: 1250, plans: { '1.0': { ac: 21, re: 22 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } }
};

// Function to calculate and return the sampling plan based on lot size and AQL
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
