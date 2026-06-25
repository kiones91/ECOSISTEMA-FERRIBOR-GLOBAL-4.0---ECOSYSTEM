export interface MaterialVariant {
  id: string;
  label: string;
  color?: string;
  textureUrl?: string;
  metalness?: number;
  roughness?: number;
}

export interface MaterialSlot {
  name: string;
  label: string;
  variants: MaterialVariant[];
  defaultVariantId: string;
}

export interface ProductModel {
  id: string;
  name: string;
  modelUrl: string;
  posterUrl?: string;
  iosModelUrl?: string;
  slots?: MaterialSlot[];
}

export interface Viewer3DProps {
  model: ProductModel;
  width?: string;
  height?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
  arModes?: string;
  exposure?: number;
  shadowIntensity?: number;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
}

export interface Customizer3DProps extends Viewer3DProps {
  onVariantChange?: (slotName: string, variant: MaterialVariant) => void;
  swatchSize?: number;
  panelPosition?: 'bottom' | 'right' | 'left';
}
