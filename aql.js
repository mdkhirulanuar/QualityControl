// aql.js

// --- AQL Constants ---
const sampleSizeCodeLetters_Level_II = {
  '2-8': 'A', '9-15': 'B', '16-25': 'C', '26-50': 'D', '51-90': 'E',
  '91-150': 'F', '151-280': 'G', '281-500': 'H', '501-1200': 'J',
  '1201-3200': 'K', '3201-10000': 'L', '10001-35000': 'M',
  '35001-150000': 'N', '150001-500000': 'P', '500001+': 'Q'
};

const aqlMasterTable_Simplified = {
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
  'Q': { sampleSize: 1250, plans: { '1.0': { ac: 21, re: 22 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } },
  'R': { sampleSize: 2000, plans: { '1.0': { ac: 21, re: 22 }, '2.5': { ac: 21, re: 22 }, '4.0': { ac: 21, re: 22 } } }
};

// --- AQL Utilities ---
function getLotSizeRange(lotSize) {
  const ranges = Object.keys(sampleSizeCodeLetters_Level_II);
  for (const range of ranges) {
    const [min, max] = range.includes('+') ? [parseInt(range), Infinity] : range.split('-').map(Number);
    if (lotSize >= min && lotSize <= max) return range;
  }
  return null;
}

function calculateSamplingPlan() {
  clearError();
  const lotSize = parseInt(lotSizeInput.value, 10);
  const aqlValue = aqlSelect.value;

  if (isNaN(lotSize) || lotSize < 2) {
    displayError('Please enter valid Number of Boxes and Pieces per Box (Lot Size ≥ 2).');
    return null;
  }

  const lotRange = getLotSizeRange(lotSize);
  const codeLetter = sampleSizeCodeLetters_Level_II[lotRange];
  const planData = aqlMasterTable_Simplified[codeLetter];
  const planDetails = planData?.plans?.[aqlValue];

  if (!codeLetter || !planData || !planDetails) {
    displayError('Unable to determine sampling plan. Check lot size or AQL value.');
    return null;
  }

  return {
    codeLetter: codeLetter,
    sampleSize: planData.sampleSize,
    accept: planDetails.ac,
    reject: planDetails.re
  };
}
