'use client';

import { useEffect, useRef, useState } from 'react';
import type { Viewer3DProps } from './types';
import { loadModelViewer } from './loadModelViewer';

export function ProductViewer3D({
  model,
  width = '100%',
  height = '500px',
  autoRotate = true,
  cameraControls = true,
  ar = true,
  arModes = 'webxr scene-viewer quick-look',
  exposure = 1,
  shadowIntensity = 1,
  className = '',
}: Viewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadModelViewer().then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded || !containerRef.current) return;

    const existing = containerRef.current.querySelector('model-viewer');
    if (existing) existing.remove();

    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', model.modelUrl);
    if (model.posterUrl) mv.setAttribute('poster', model.posterUrl);
    if (model.iosModelUrl) mv.setAttribute('ios-src', model.iosModelUrl);
    mv.setAttribute('alt', `Modelo 3D - ${model.name}`);
    if (autoRotate) mv.setAttribute('auto-rotate', '');
    if (cameraControls) mv.setAttribute('camera-controls', '');
    if (ar) {
      mv.setAttribute('ar', '');
      mv.setAttribute('ar-modes', arModes);
    }
    mv.setAttribute('exposure', String(exposure));
    mv.setAttribute('shadow-intensity', String(shadowIntensity));
    mv.style.width = '100%';
    mv.style.height = '100%';

    containerRef.current.appendChild(mv);
  }, [loaded, model, autoRotate, cameraControls, ar, arModes, exposure, shadowIntensity]);

  return (
    <div ref={containerRef} className={className} style={{ width, height, position: 'relative', borderRadius: '8px', overflow: 'hidden' }} />
  );
}
