(window as any).log = console.log;


if (env === 'dev') setTimeout(() => {
    const { port } = location
    const src = `http://localhost:${port}/browser-sync/browser-sync-client.js?v=2.27.4`;

    if (!document.querySelector('script[src="' + src + '"]')) {
      const browserSyncScript = document.createElement('script');
      browserSyncScript.src = src;
      document.body.appendChild(browserSyncScript);
    }
}, 1000);