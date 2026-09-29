// Service Worker Registration & Update Manager
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // In development mode (Vite dev server), do NOT register the ServiceWorker.
  // Lingering service workers on localhost (e.g. across port 5173/5174 or stale cache)
  // can intercept index.html or HMR scripts and cause blank screens.
  if (import.meta.env.DEV) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((unregistered) => {
            if (unregistered) {
              console.log('[PWA DEV] Unregistered legacy ServiceWorker from development origin:', registration.scope);
            }
          });
        }
      }).catch((err) => {
        console.debug('[PWA DEV] ServiceWorker inspection error:', err);
      });

      // Clear any cached HTML/JS shells if present in dev
      if ('caches' in window) {
        caches.keys().then((keys) => {
          for (const key of keys) {
            caches.delete(key);
          }
        }).catch(() => {});
      }
    });
    return;
  }

  // Production Mode Service Worker Registration
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] ServiceWorker registered with scope:', registration.scope);

        // Check for updates periodically (every 1 hour)
        setInterval(() => {
          registration.update().catch((err) => {
            console.debug('[PWA] Update check suppressed:', err);
          });
        }, 60 * 60 * 1000);

        // Listen for new worker waiting
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (
              installingWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[PWA] New version ready for activation');
              window.dispatchEvent(
                new CustomEvent('pwa-update-available', {
                  detail: { registration },
                })
              );
            }
          });
        });
      })
      .catch((error) => {
        console.warn('[PWA] ServiceWorker registration failed:', error);
      });
  });
}
