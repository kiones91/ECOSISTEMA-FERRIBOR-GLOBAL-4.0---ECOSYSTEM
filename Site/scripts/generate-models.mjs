import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'models');
mkdirSync(OUTPUT_DIR, { recursive: true });

// --- GLB Binary Builder ---
function createGLB(meshes) {
  const accessors = [];
  const bufferViews = [];
  const meshDefs = [];
  const nodes = [];
  const materials = [];
  const materialMap = {};
  let bufferOffset = 0;
  const binaryChunks = [];

  for (const mesh of meshes) {
    const { positions, normals, indices, materialName, color, metalness, roughness } = mesh;

    // Material
    if (!materialMap[materialName]) {
      materialMap[materialName] = materials.length;
      materials.push({
        name: materialName,
        pbrMetallicRoughness: {
          baseColorFactor: [...color, 1.0],
          metallicFactor: metalness,
          roughnessFactor: roughness,
        },
      });
    }

    // Positions buffer
    const posData = new Float32Array(positions);
    const posBuf = Buffer.from(posData.buffer);
    const posViewIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset: bufferOffset, byteLength: posBuf.length, target: 34962 });
    binaryChunks.push(posBuf);
    bufferOffset += posBuf.length;

    // Compute bounds
    let minPos = [Infinity, Infinity, Infinity];
    let maxPos = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 3) {
      for (let j = 0; j < 3; j++) {
        minPos[j] = Math.min(minPos[j], positions[i + j]);
        maxPos[j] = Math.max(maxPos[j], positions[i + j]);
      }
    }

    const posAccIdx = accessors.length;
    accessors.push({
      bufferView: posViewIdx,
      componentType: 5126,
      count: positions.length / 3,
      type: 'VEC3',
      min: minPos,
      max: maxPos,
    });

    // Normals buffer
    const normData = new Float32Array(normals);
    const normBuf = Buffer.from(normData.buffer);
    const normViewIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset: bufferOffset, byteLength: normBuf.length, target: 34962 });
    binaryChunks.push(normBuf);
    bufferOffset += normBuf.length;

    const normAccIdx = accessors.length;
    accessors.push({
      bufferView: normViewIdx,
      componentType: 5126,
      count: normals.length / 3,
      type: 'VEC3',
    });

    // Indices buffer
    const idxData = new Uint16Array(indices);
    const idxBuf = Buffer.from(idxData.buffer);
    // Align to 4 bytes
    const padding = (4 - (idxBuf.length % 4)) % 4;
    const paddedIdxBuf = padding > 0 ? Buffer.concat([idxBuf, Buffer.alloc(padding)]) : idxBuf;
    const idxViewIdx = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset: bufferOffset, byteLength: idxBuf.length, target: 34963 });
    binaryChunks.push(paddedIdxBuf);
    bufferOffset += paddedIdxBuf.length;

    const idxAccIdx = accessors.length;
    accessors.push({
      bufferView: idxViewIdx,
      componentType: 5123,
      count: indices.length,
      type: 'SCALAR',
    });

    // Mesh primitive
    const primIdx = meshDefs.length;
    meshDefs.push({
      primitives: [{
        attributes: { POSITION: posAccIdx, NORMAL: normAccIdx },
        indices: idxAccIdx,
        material: materialMap[materialName],
      }],
      name: materialName,
    });

    nodes.push({ mesh: primIdx, name: materialName });
  }

  const gltf = {
    asset: { version: '2.0', generator: 'FerriBor Model Generator' },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes: meshDefs,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: bufferOffset }],
  };

  const jsonStr = JSON.stringify(gltf);
  const jsonPad = (4 - (jsonStr.length % 4)) % 4;
  const jsonBuf = Buffer.from(jsonStr + ' '.repeat(jsonPad), 'utf8');
  const binBuf = Buffer.concat(binaryChunks);

  const totalLength = 12 + 8 + jsonBuf.length + 8 + binBuf.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // "glTF"
  header.writeUInt32LE(2, 4);          // version
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuf.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // "JSON"

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBuf.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // "BIN\0"

  return Buffer.concat([header, jsonChunkHeader, jsonBuf, binChunkHeader, binBuf]);
}

// --- Geometry Generators ---
function generateCylinder(radius, height, segments, yOffset = 0) {
  const positions = [];
  const normals = [];
  const indices = [];

  // Side vertices
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const nx = Math.cos(theta);
    const nz = Math.sin(theta);

    positions.push(x, height / 2 + yOffset, z);
    normals.push(nx, 0, nz);
    positions.push(x, -height / 2 + yOffset, z);
    normals.push(nx, 0, nz);
  }

  // Side indices
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = i * 2 + 2;
    const d = i * 2 + 3;
    indices.push(a, b, c, b, d, c);
  }

  // Top cap
  const topCenter = positions.length / 3;
  positions.push(0, height / 2 + yOffset, 0);
  normals.push(0, 1, 0);
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(theta) * radius, height / 2 + yOffset, Math.sin(theta) * radius);
    normals.push(0, 1, 0);
  }
  for (let i = 0; i < segments; i++) {
    indices.push(topCenter, topCenter + 1 + i, topCenter + 2 + i);
  }

  // Bottom cap
  const botCenter = positions.length / 3;
  positions.push(0, -height / 2 + yOffset, 0);
  normals.push(0, -1, 0);
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(theta) * radius, -height / 2 + yOffset, Math.sin(theta) * radius);
    normals.push(0, -1, 0);
  }
  for (let i = 0; i < segments; i++) {
    indices.push(botCenter, botCenter + 2 + i, botCenter + 1 + i);
  }

  return { positions, normals, indices };
}

function generateTorus(majorRadius, minorRadius, majorSegments, minorSegments) {
  const positions = [];
  const normals = [];
  const indices = [];

  for (let i = 0; i <= majorSegments; i++) {
    const u = (i / majorSegments) * Math.PI * 2;
    for (let j = 0; j <= minorSegments; j++) {
      const v = (j / minorSegments) * Math.PI * 2;
      const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
      const y = minorRadius * Math.sin(v);
      const z = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);

      const nx = Math.cos(v) * Math.cos(u);
      const ny = Math.sin(v);
      const nz = Math.cos(v) * Math.sin(u);

      positions.push(x, y, z);
      normals.push(nx, ny, nz);
    }
  }

  for (let i = 0; i < majorSegments; i++) {
    for (let j = 0; j < minorSegments; j++) {
      const a = i * (minorSegments + 1) + j;
      const b = a + minorSegments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  return { positions, normals, indices };
}

function generateCone(radius, height, segments, yOffset = 0) {
  const positions = [];
  const normals = [];
  const indices = [];

  // Tip
  const tipIdx = 0;
  positions.push(0, height / 2 + yOffset, 0);
  normals.push(0, 1, 0);

  // Base ring
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const slantLen = Math.sqrt(radius * radius + height * height);
    const nx = (height / slantLen) * Math.cos(theta);
    const ny = radius / slantLen;
    const nz = (height / slantLen) * Math.sin(theta);
    positions.push(x, -height / 2 + yOffset, z);
    normals.push(nx, ny, nz);
  }

  // Side triangles
  for (let i = 0; i < segments; i++) {
    indices.push(tipIdx, 1 + i, 2 + i);
  }

  // Base cap
  const baseCenter = positions.length / 3;
  positions.push(0, -height / 2 + yOffset, 0);
  normals.push(0, -1, 0);
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    positions.push(Math.cos(theta) * radius, -height / 2 + yOffset, Math.sin(theta) * radius);
    normals.push(0, -1, 0);
  }
  for (let i = 0; i < segments; i++) {
    indices.push(baseCenter, baseCenter + 2 + i, baseCenter + 1 + i);
  }

  return { positions, normals, indices };
}

// --- Model 1: Rolo de Borracha Industrial ---
function buildRoloBorracha() {
  const eixo = generateCylinder(0.08, 2.4, 32);
  const revestimento = generateCylinder(0.35, 1.6, 48);
  const flangeL = generateCylinder(0.38, 0.05, 48, 0.82);
  const flangeR = generateCylinder(0.38, 0.05, 48, -0.82);

  return createGLB([
    { ...eixo, materialName: 'eixo', color: [0.75, 0.75, 0.75], metalness: 0.9, roughness: 0.2 },
    { ...revestimento, materialName: 'revestimento', color: [0.1, 0.1, 0.1], metalness: 0.0, roughness: 0.8 },
    { ...flangeL, materialName: 'flange', color: [0.53, 0.53, 0.53], metalness: 0.8, roughness: 0.3 },
    { ...flangeR, materialName: 'flange_dir', color: [0.53, 0.53, 0.53], metalness: 0.8, roughness: 0.3 },
  ]);
}

// --- Model 2: Broca Diamantada ---
function buildBrocaDiamantada() {
  const corpo = generateCylinder(0.06, 1.2, 32, 0.6);
  const ponta = generateCone(0.08, 0.4, 32, -0.2);
  const encaixe = generateCylinder(0.05, 0.3, 6, 1.35);

  return createGLB([
    { ...corpo, materialName: 'corpo', color: [0.55, 0.55, 0.55], metalness: 0.85, roughness: 0.3 },
    { ...ponta, materialName: 'ponta_diamantada', color: [0.83, 0.69, 0.22], metalness: 0.6, roughness: 0.4 },
    { ...encaixe, materialName: 'encaixe', color: [0.4, 0.4, 0.4], metalness: 0.9, roughness: 0.2 },
  ]);
}

// --- Model 3: Vedação Industrial ---
function buildVedacaoIndustrial() {
  const anelMetalico = generateTorus(0.5, 0.08, 48, 24);
  const vedacao = generateTorus(0.38, 0.06, 48, 24);
  const labio = generateTorus(0.32, 0.025, 32, 16);

  return createGLB([
    { ...anelMetalico, materialName: 'anel_metalico', color: [0.63, 0.63, 0.63], metalness: 0.9, roughness: 0.2 },
    { ...vedacao, materialName: 'vedacao', color: [0.16, 0.16, 0.16], metalness: 0.0, roughness: 0.9 },
    { ...labio, materialName: 'labio', color: [0.1, 0.1, 0.1], metalness: 0.0, roughness: 0.95 },
  ]);
}

// --- Generate all models ---
console.log('Gerando modelos 3D placeholder para FerriBor...\n');

const rolo = buildRoloBorracha();
writeFileSync(join(OUTPUT_DIR, 'rolo-borracha.glb'), rolo);
console.log(`  OK: rolo-borracha.glb (${(rolo.length / 1024).toFixed(1)} KB)`);

const broca = buildBrocaDiamantada();
writeFileSync(join(OUTPUT_DIR, 'broca-diamantada.glb'), broca);
console.log(`  OK: broca-diamantada.glb (${(broca.length / 1024).toFixed(1)} KB)`);

const vedacao = buildVedacaoIndustrial();
writeFileSync(join(OUTPUT_DIR, 'vedacao-industrial.glb'), vedacao);
console.log(`  OK: vedacao-industrial.glb (${(vedacao.length / 1024).toFixed(1)} KB)`);

console.log('\nPronto! Modelos em Site/public/models/');
