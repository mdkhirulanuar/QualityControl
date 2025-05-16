// state.js
// Centralized state store for runtime variables in InspectWise Go™

export const state = {
  // AQL Sampling Plan
  currentSamplingPlan: null,

  // Photo & Annotation State
  capturedPhotos: [],
  currentPhotoIndex: null,
  annotationHistory: [],
  currentMode: null,
  fabricCanvas: null,

  // Constants
  MAX_PHOTOS: 5
};
