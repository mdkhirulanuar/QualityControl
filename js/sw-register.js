/* SW registration + Android install prompt */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('[SW] registered', reg.scope))
      .catch(err => console.error('[SW] registration failed', err));
  });
}

let deferredPrompt;
const installBtn = document.querySelector('#install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) {
    installBtn.style.display = 'inline-flex';
    installBtn.addEventListener('click', async () => {
      installBtn.disabled = true;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      installBtn.style.display = 'none';
      deferredPrompt = null;
    }, { once: true });
  }
});

window.addEventListener('appinstalled', () => {
  console.log('[A2HS] App installed');
  if (installBtn) installBtn.style.display = 'none';
});
