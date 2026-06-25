'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type Variant = { id: string; label: string; color: string; metalness: number; roughness: number };
type Slot = { name: string; label: string; defaultVariantId: string; variants: Variant[] };
type ProductModel = { id: string; name: string; modelUrl: string; slots: Slot[] };

interface Props {
  product?: ProductModel;
  mode?: 'viewer' | 'customizer';
}

const CDN = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';

let loadPromise: Promise<void> | null = null;
function ensureModelViewer(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (customElements.get('model-viewer')) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve) => {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = CDN;
    document.head.appendChild(s);
    customElements.whenDefined('model-viewer').then(() => resolve());
  });
  return loadPromise;
}

export function Viewer3D({ product, mode = 'viewer' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!product) return;
    ensureModelViewer().then(() => setReady(true));
  }, [product]);

  useEffect(() => {
    if (!ready || !containerRef.current || !product) return;

    const existing = containerRef.current.querySelector('model-viewer');
    if (existing) existing.remove();

    const mv = document.createElement('model-viewer') as any;
    mv.setAttribute('src', product.modelUrl);
    mv.setAttribute('alt', product.name);
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('min-camera-orbit', 'auto 0deg auto');
    mv.setAttribute('max-camera-orbit', 'auto 180deg auto');
    mv.setAttribute('touch-action', 'none');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('shadow-intensity', '1');
    mv.setAttribute('exposure', '1.2');
    mv.setAttribute('ar', '');
    mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
    mv.style.width = '100%';
    mv.style.height = '100%';
    mv.style.minHeight = '300px';

    containerRef.current.appendChild(mv);
    viewerRef.current = mv;
  }, [ready, product?.modelUrl]);

  useEffect(() => {
    if (!product?.slots?.length) return;
    const defaults: Record<string, string> = {};
    product.slots.forEach(s => { defaults[s.name] = s.defaultVariantId; });
    setSelections(defaults);
    setActiveSlot(product.slots[0].name);
  }, [product?.slots]);

  const applyVariant = useCallback((slotName: string, variant: Variant) => {
    const mv = viewerRef.current;
    if (!mv?.model) return;
    const mat = mv.model.materials.find((m: any) => m.name === slotName);
    if (!mat) return;
    const hex = variant.color.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
    mat.pbrMetallicRoughness.setMetallicFactor(variant.metalness);
    mat.pbrMetallicRoughness.setRoughnessFactor(variant.roughness);
  }, []);

  const handleSelect = (slotName: string, variant: Variant) => {
    setSelections(prev => ({ ...prev, [slotName]: variant.id }));
    applyVariant(slotName, variant);
  };

  if (!product) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <p className="text-xs text-slate-400">Visualização 3D disponível em breve</p>
      </div>
    );
  }

  const showCustomizer = mode === 'customizer' && product.slots?.length > 0;

  return (
    <div className="w-full h-full flex flex-col">
      <div ref={containerRef} className="flex-1 min-h-0" />

      {showCustomizer && (
        <div className="p-3 bg-white border-t border-slate-200">
          <div className="flex gap-2 mb-2 flex-wrap">
            {product.slots.map(slot => (
              <button
                key={slot.name}
                onClick={() => setActiveSlot(slot.name)}
                className={`px-3 py-1 text-[11px] font-medium rounded-full border transition-all ${
                  activeSlot === slot.name
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {product.slots
              .filter(s => s.name === activeSlot)
              .flatMap(slot => slot.variants.map(v => (
                <button
                  key={v.id}
                  onClick={() => handleSelect(slot.name, v)}
                  title={v.label}
                  className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                    selections[slot.name] === v.id
                      ? 'border-slate-900 ring-2 ring-slate-900 ring-offset-1'
                      : 'border-slate-200'
                  }`}
                  style={{ backgroundColor: v.color }}
                />
              )))}
          </div>
        </div>
      )}
    </div>
  );
}
