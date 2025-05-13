/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/
import { initFormValidation } from './formValidation.js';
import { initSamplingPlan, populatePartNameDropdown } from './samplingPlan.js';
import { initPhotoHandler } from './photoHandler.js';
import { initReportGenerator } from './reportGenerator.js';
import { fadeIn, fadeOut } from './utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Modules
    populatePartNameDropdown();
    initFormValidation();
    initSamplingPlan();
    initPhotoHandler();
    initReportGenerator();

    // PWA Installation Prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installButton = document.createElement('button');
        installButton.textContent = 'Install InspectWise Go';
        installButton.className = 'install-button';
        document.querySelector('.container').appendChild(installButton);
        installButton.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
                deferredPrompt = null;
                installButton.remove();
            });
        });
    });

    // Offline Status
    const offlineStatus = document.getElementById('offlineStatus');
    window.addEventListener('online', () => offlineStatus.style.display = 'none');
    window.addEventListener('offline', () => offlineStatus.style.display = 'block');

    // Dark Mode Toggle
    const toggleThemeButton = document.getElementById('toggleTheme');
    toggleThemeButton.addEventListener('click', () => {
        document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    });

    // Mobile Touch Enhancements
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('touchstart', () => button.classList.add('active'));
        button.addEventListener('touchend', () => button.classList.remove('active'));
    });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js')
            .then(function(registration) {
                console.log('ServiceWorker registered with scope:', registration.scope);
            }, function(err) {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}
