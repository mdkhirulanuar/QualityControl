/* InspectWise Go — SW registration + install prompt */
(function() {
  // Register the service worker (expects /service-worker.js at site root)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => console.log('[SW] registered', reg.scope))
        .catch(err => console.error('[SW] registration failed', err));
    });
  }

  // Android Add-to-Home-Screen
  let deferredPrompt;
  const installBtn = document.querySelector('#install, #install-btn, [data-install]');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
      installBtn.addEventListener('click', async () => {
        installBtn.disabled = true;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[A2HS] outcome:', outcome);
        deferredPrompt = null;
        setTimeout(() => (installBtn.style.display = 'none'), 300);
      }, { once: true });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('[A2HS] App installed');
    if (installBtn) installBtn.style.display = 'none';
  });
})();
