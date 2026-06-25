'use client';

import { useState, useEffect, useRef } from 'react';
import type { Customizer3DProps, MaterialVariant } from './types';
import { useModelViewer } from './useModelViewer';
import { loadModelViewer } from './loadModelViewer';

export function ProductCustomizer3D({
  model,
  width = '100%',
  height = '600px',
  autoRotate = true,
  cameraControls = true,
  ar = true,
  arModes = 'webxr scene-viewer quick-look',
  exposure = 1,
  shadowIntensity = 1,
  className = '',
  onVariantChange,
  swatchSize = 32,
  panelPosition = 'bottom',
}: Customizer3DProps) {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const { ref, applyMaterial } = useModelViewer();
  const [loaded, setLoaded] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    loadModelViewer().then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!loaded || !viewerContainerRef.current) return;

    const existing = viewerContainerRef.current.querySelector('model-viewer');
    if (existing) existing.remove();

    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', model.modelUrl);
    if (model.posterUrl) mv.setAttribute('poster', model.posterUrl);
    if (model.iosModelUrl) mv.setAttribute('ios-src', model.iosModelUrl);
    mv.setAttribute('alt', `Modelo 3D customizável - ${model.name}`);
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

    viewerContainerRef.current.appendChild(mv);
    (ref as any).current = mv;
  }, [loaded, model.modelUrl]);

  useEffect(() => {
    if (model.slots) {
      const defaults: Record<string, string> = {};
      model.slots.forEach(slot => {
        defaults[slot.name] = slot.defaultVariantId;
      });
      setSelections(defaults);
      setActiveSlot(model.slots[0]?.name ?? null);
    }
  }, [model.slots]);

  const handleVariantSelect = async (slotName: string, variant: MaterialVariant) => {
    setSelections(prev => ({ ...prev, [slotName]: variant.id }));
    await applyMaterial(slotName, variant);
    onVariantChange?.(slotName, variant);
  };

  const isHorizontal = panelPosition === 'right' || panelPosition === 'left';

  return (
    <div className={className} style={{
      width,
      display: 'flex',
      flexDirection: isHorizontal ? (panelPosition === 'left' ? 'row-reverse' : 'row') : 'column',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#f8f9fa',
    }}>
      <div ref={viewerContainerRef} style={{ flex: 1, height, minHeight: '300px' }} />

      {model.slots && model.slots.length > 0 && (
        <div style={{
          padding: '16px',
          background: 'white',
          borderTop: isHorizontal ? 'none' : '1px solid #e2e8f0',
          borderLeft: panelPosition === 'right' ? '1px solid #e2e8f0' : 'none',
          borderRight: panelPosition === 'left' ? '1px solid #e2e8f0' : 'none',
          width: isHorizontal ? '240px' : 'auto',
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {model.slots.map(slot => (
              <button
                key={slot.name}
                onClick={() => setActiveSlot(slot.name)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  background: activeSlot === slot.name ? '#1a1a2e' : 'white',
                  color: activeSlot === slot.name ? 'white' : '#333',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {slot.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {model.slots
              .filter(slot => slot.name === activeSlot)
              .flatMap(slot =>
                slot.variants.map(variant => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantSelect(slot.name, variant)}
                    aria-label={variant.label}
                    title={variant.label}
                    style={{
                      width: swatchSize,
                      height: swatchSize,
                      borderRadius: '50%',
                      border: selections[slot.name] === variant.id ? '3px solid #1a1a2e' : '2px solid #e2e8f0',
                      backgroundColor: variant.color ?? '#ccc',
                      backgroundImage: variant.textureUrl ? `url(${variant.textureUrl})` : undefined,
                      backgroundSize: 'cover',
                      cursor: 'pointer',
                      boxShadow: selections[slot.name] === variant.id ? '0 0 0 2px #1a1a2e' : 'none',
                    }}
                  />
                ))
              )}
          </div>
        </div>
      )}
    </div>
  );
}
