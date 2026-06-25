const CDN_URL = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';

let loaderPromise: Promise<void> | null = null;

export function loadModelViewer(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('model-viewer')) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-model-viewer]');
    if (!existing) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = CDN_URL;
      script.dataset.modelViewer = 'true';
      document.head.appendChild(script);
    }
    customElements.whenDefined('model-viewer').then(() => resolve());
  });

  return loaderPromise;
}
