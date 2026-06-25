import { useRef, useEffect, useCallback } from 'react';
import type { MaterialVariant } from './types';

type ModelViewerElement = HTMLElement & {
  model?: {
    materials: Array<{
      name: string;
      pbrMetallicRoughness: {
        setBaseColorFactor: (color: [number, number, number, number]) => void;
        setMetallicFactor: (value: number) => void;
        setRoughnessFactor: (value: number) => void;
        baseColorTexture: {
          setTexture: (texture: unknown) => void;
        } | null;
      };
    }>;
  };
  createTexture: (uri: string) => Promise<unknown>;
  cameraOrbit: string;
  fieldOfView: string;
  interactionPrompt: string;
};

export function useModelViewer() {
  const ref = useRef<ModelViewerElement>(null);

  const applyMaterial = useCallback(async (slotName: string, variant: MaterialVariant) => {
    const viewer = ref.current;
    if (!viewer?.model) return;

    const material = viewer.model.materials.find(m => m.name === slotName);
    if (!material) return;

    if (variant.color) {
      const hex = variant.color.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
    }

    if (variant.textureUrl) {
      const texture = await viewer.createTexture(variant.textureUrl);
      material.pbrMetallicRoughness.baseColorTexture?.setTexture(texture);
    }

    if (variant.metalness !== undefined) {
      material.pbrMetallicRoughness.setMetallicFactor(variant.metalness);
    }

    if (variant.roughness !== undefined) {
      material.pbrMetallicRoughness.setRoughnessFactor(variant.roughness);
    }
  }, []);

  const resetCamera = useCallback(() => {
    const viewer = ref.current;
    if (!viewer) return;
    viewer.cameraOrbit = 'auto auto auto';
    viewer.fieldOfView = 'auto';
  }, []);

  return { ref, applyMaterial, resetCamera };
}
