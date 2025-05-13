/*
    Copyright © 2025. InspectWise Go™ is developed and maintained by Khirul Anuar for KPI Electrical Manufacturing Sdn. Bhd.
*/

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded fired');
    
    // Wait for partsList to be available
    const maxAttempts = 50; // 5 seconds (50 * 100ms)
    let attempts = 0;
    const waitForPartsList = setInterval(() => {
        attempts++;
        if (window.partsList) {
            clearInterval(waitForPartsList);
            console.log('partsList loaded:', window.partsList);
            console.log('Calling populatePartNameDropdown...');
            try {
                populatePartNameDropdown();
                initFormValidation();
                initSamplingPlan();
                initPhotoHandler();
                initReportGenerator();
            } catch (error) {
                console.error('Error initializing app:', error);
            }
        } else if (attempts >= maxAttempts) {
            clearInterval(waitForPartsList);
            console.error('Failed to load partsList after 5 seconds. Please ensure partsList.js is loaded correctly.');
            alert('Error: Unable to load part names. Please refresh the page or check your internet connection.');
        } else {
            console.log('Waiting for partsList... (Attempt ' + attempts + ')');
        }
    }, 100);

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

    // Fade In/Out Utility Functions
    window.fadeIn = function(element) {
        element.style.opacity = 0;
        element.style.display = 'block';
        let opacity = 0;
        const timer = setInterval(() => {
            if (opacity >= 1) {
                clearInterval(timer);
            }
            element.style.opacity = opacity;
            opacity += 0.1;
        }, 50);
    };

    window.fadeOut = function(element) {
        let opacity = 1;
        const timer = setInterval(() => {
            if (opacity <= 0) {
                clearInterval(timer);
                element.style.display = 'none';
            }
            element.style.opacity = opacity;
            opacity -= 0.1;
        }, 50);
    };
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



2/2

