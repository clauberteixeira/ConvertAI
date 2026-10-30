// Regras puras do ConvertAÍ (sem DOM), testadas em tests/core.test.mjs.

export const MAX_IMAGES = 100;
export const LONG_SIDE_PT = 841.89; // lado maior de uma folha A4
export const MIN_SIDE_PT = 3;
export const MB = 1_000_000;

// Do maior para o menor arquivo. Cada passo: lado maior em pixels e qualidade JPEG.
export const LADDER = [
  { longSide: 3000, quality: 0.9 },
  { longSide: 2000, quality: 0.8 },
  { longSide: 2000, quality: 0.65 },
  { longSide: 1400, quality: 0.65 },
  { longSide: 1400, quality: 0.5 },
  { longSide: 1000, quality: 0.5 },
  { longSide: 1000, quality: 0.35 },
  { longSide: 700, quality: 0.35 },
];

export const PRESETS = {
  alta: { label: 'Alta qualidade', step: 0 },
  equilibrada: { label: 'Equilibrada', step: 1 },
  pequena: { label: 'Arquivo menor', step: 3 },
};

/** Tipo real pelo conteúdo do arquivo (não confia na extensão). */
export function sniffType(bytes) {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (
    b.length >= 12 &&
    String.fromCharCode(b[0], b[1], b[2], b[3]) === 'RIFF' &&
    String.fromCharCode(b[8], b[9], b[10], b[11]) === 'WEBP'
  ) return 'webp';
  return null;
}

/** Dimensões finais em pixels: reduz até `longSide`, nunca aumenta. */
export function targetDims(width, height, longSide) {
  const scale = Math.min(1, longSide / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** Página com lado maior de A4, lado menor proporcional (piso de 3 pt); imagem centralizada. */
export function layout(width, height) {
  const landscape = width >= height;
  const drawW = landscape ? LONG_SIDE_PT : (LONG_SIDE_PT * width) / height;
  const drawH = landscape ? (LONG_SIDE_PT * height) / width : LONG_SIDE_PT;
  const pageW = Math.max(MIN_SIDE_PT, drawW);
  const pageH = Math.max(MIN_SIDE_PT, drawH);
  return { pageW, pageH, drawW, drawH, x: (pageW - drawW) / 2, y: (pageH - drawH) / 2 };
}

/** "5" ou "2,5" → bytes; vazio → null (sem limite); inválido → NaN. */
export function parseMaxMb(text) {
  const t = String(text ?? '').trim().replace(',', '.');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? Math.round(n * MB) : NaN;
}

export function formatBytes(bytes) {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1000)} KB`;
  return `${(bytes / MB).toFixed(1).replace('.', ',')} MB`;
}

/** Ordem natural por nome: "foto2" antes de "foto10". */
export function compareNames(a, b) {
  return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });
}

/** Move o item de `from` para `to` sem mudar o array original. */
export function moveItem(list, from, to) {
  const copy = list.slice();
  if (from === to || from < 0 || to < 0 || from >= copy.length || to >= copy.length) return copy;
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
