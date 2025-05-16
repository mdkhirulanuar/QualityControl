// ui.js
// Reusable UI utilities for animations and error messaging

/**
 * Smoothly fades in an element by increasing opacity.
 */
export function fadeIn(element) {
  element.style.opacity = 0;
  element.style.display = 'block';
  let op = 0;
  const timer = setInterval(() => {
    if (op >= 1) clearInterval(timer);
    element.style.opacity = op;
    op += 0.1;
  }, 30);
}

/**
 * Smoothly fades out an element by decreasing opacity.
 */
export function fadeOut(element) {
  let op = 1;
  const timer = setInterval(() => {
    if (op <= 0) {
      clearInterval(timer);
      element.style.display = 'none';
    }
    element.style.opacity = op;
    op -= 0.1;
  }, 30);
}

/**
 * Displays an error message in the designated error container.
 */
export function displayError(message, errorContainer) {
  errorContainer.textContent = message;
  errorContainer.style.display = 'block';
}

/**
 * Clears the displayed error message.
 */
export function clearError(errorContainer) {
  errorContainer.textContent = '';
  errorContainer.style.display = 'none';
}
