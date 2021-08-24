(window as any).log = console.log;

import 'index.sass';

if (env === 'prod' && "serviceWorker" in navigator) addEventListener('load', () => {
    navigator.serviceWorker
      .register("/public/sw.js")
      .catch((err) => console.log("Service worker registration failed", err));
});

if (env === 'dev') setTimeout(() => {
    const src = '/browser-sync/browser-sync-client.js';

    const hasBS = Array.from(document.querySelectorAll('script'))
      .find((x) => x.src.search(src) > -1)

    if (!hasBS) {
      const browserSyncScript = document.createElement('script');
      browserSyncScript.src = src;
      document.body.appendChild(browserSyncScript);
    }
}, 1000);
