# @buffallos/viewer-3d

Módulo reutilizável para visualização 3D e customização de produtos no navegador.

## Tecnologia

- **@google/model-viewer** — Web component open-source do Google para renderizar modelos 3D
- **WebGL** — Renderização 3D no navegador sem plugins
- **WebXR / AR Quick Look / Scene Viewer** — Realidade Aumentada nativa no mobile
- **glTF/GLB** — Formato padrão para modelos 3D web (o "JPEG do 3D")
- **USDZ** — Formato para AR no iOS

## Componentes

### ProductViewer3D

Visualizador 3D simples com rotação, zoom e AR.

```tsx
import { ProductViewer3D } from '@buffallos/viewer-3d';

<ProductViewer3D
  model={{
    id: 'broca-01',
    name: 'Broca Diamantada 10mm',
    modelUrl: '/models/broca-diamantada.glb',
    posterUrl: '/images/broca-poster.webp',
    iosModelUrl: '/models/broca-diamantada.usdz',
  }}
  height="500px"
  autoRotate
  ar
/>
```

### ProductCustomizer3D

Visualizador com troca de materiais/cores em tempo real.

```tsx
import { ProductCustomizer3D } from '@buffallos/viewer-3d';

<ProductCustomizer3D
  model={{
    id: 'rolo-01',
    name: 'Rolo de Pintura Industrial',
    modelUrl: '/models/rolo-industrial.glb',
    slots: [
      {
        name: 'corpo_material',
        label: 'Material do Corpo',
        defaultVariantId: 'aco',
        variants: [
          { id: 'aco', label: 'Aço Inox', color: '#C0C0C0', metalness: 0.9, roughness: 0.2 },
          { id: 'ferro', label: 'Ferro Fundido', color: '#4A4A4A', metalness: 0.7, roughness: 0.5 },
          { id: 'aluminio', label: 'Alumínio', color: '#D4D4D4', metalness: 0.8, roughness: 0.3 },
        ],
      },
      {
        name: 'revestimento',
        label: 'Revestimento',
        defaultVariantId: 'borracha',
        variants: [
          { id: 'borracha', label: 'Borracha Natural', color: '#1A1A1A', metalness: 0, roughness: 0.8 },
          { id: 'poliuretano', label: 'Poliuretano', color: '#FF6B00', metalness: 0, roughness: 0.6 },
          { id: 'silicone', label: 'Silicone', color: '#E8E8E8', metalness: 0, roughness: 0.4 },
        ],
      },
    ],
  }}
  panelPosition="right"
  onVariantChange={(slot, variant) => console.log(`${slot}: ${variant.label}`)}
/>
```

## Como criar os modelos 3D

### Softwares recomendados

1. **Blender** (gratuito) — modelagem e exportação GLB
2. **SolidWorks/Fusion 360** — se já tem CAD das peças, exportar como STEP e converter no Blender
3. **RealityCapture / Polycam** — fotogrametria (fotos → modelo 3D)

### Requisitos do modelo

- Formato: `.glb` (binário glTF)
- Tamanho: idealmente < 5MB para carregamento rápido
- Polígonos: 50k-200k para equilíbrio qualidade/performance
- Materiais nomeados: cada parte customizável precisa de um material com nome único
- Texturas: máx 2048x2048px, formato JPEG/PNG embutido no GLB

### Exportando do Blender

1. Nomeie os materiais com nomes descritivos (ex: `corpo_material`, `revestimento`)
2. File → Export → glTF 2.0 (.glb)
3. Settings: Format=Binary, Include=Selected Objects, Compression=Draco

### Para AR no iOS (USDZ)

Use o [Reality Converter](https://developer.apple.com/augmented-reality/tools/) da Apple para converter GLB → USDZ.

## Integração no projeto

### 1. Instalar dependência

```bash
cd Site
npm install @google/model-viewer
```

### 2. Importar componente

```tsx
// No Next.js, precisa ser 'use client'
import { ProductViewer3D } from '../../packages/viewer-3d/src';
```

### 3. Colocar modelos em /public

```
Site/public/models/
  broca-diamantada.glb
  broca-diamantada.usdz
  rolo-industrial.glb
```

## Estrutura de pastas

```
packages/viewer-3d/
├── package.json
├── README.md
└── src/
    ├── index.ts                 — barrel export
    ├── types.ts                 — interfaces TypeScript
    ├── model-viewer.d.ts        — declaração de tipos do web component
    ├── useModelViewer.ts        — hook para manipular materiais via API
    ├── ProductViewer3D.tsx       — componente viewer simples
    └── ProductCustomizer3D.tsx   — componente com customização
```

## Reutilização em outros projetos

Copie a pasta `packages/viewer-3d/` para qualquer projeto React/Next.js. As únicas dependências são:
- React 18+
- @google/model-viewer 3.5+
