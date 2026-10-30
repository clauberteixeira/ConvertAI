import {
  MAX_IMAGES, LADDER, PRESETS, sniffType, targetDims, layout, parseMaxMb, formatBytes,
  compareNames, moveItem,
} from './core.js';

const $ = (id) => document.getElementById(id);

let items = []; // { id, file, url }
let nextId = 1;
let cancelled = false;
let pdfUrl = null;
let dragFrom = null;

class Cancelled extends Error {}

// ---------- Escolha das imagens ----------

async function addFiles(fileList) {
  const notAccepted = [];
  let overLimit = 0;
  for (const file of [...fileList]) {
    const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!sniffType(head)) { notAccepted.push(file.name); continue; }
    if (items.length >= MAX_IMAGES) { overLimit++; continue; }
    items.push({ id: nextId++, file, url: URL.createObjectURL(file) });
  }
  const msgs = [];
  if (notAccepted.length) msgs.push(`Ficou de fora por não ser PNG, JPG ou WEBP: ${notAccepted.join(', ')}.`);
  if (overLimit) msgs.push(`O limite é de ${MAX_IMAGES} imagens por PDF. ${overLimit} não ${overLimit === 1 ? 'entrou' : 'entraram'}.`);
  showNotice(msgs.join(' '));
  render();
}

function showNotice(text) {
  $('notice').textContent = text;
  $('notice').hidden = !text;
}

function removeItem(index) {
  URL.revokeObjectURL(items[index].url);
  items.splice(index, 1);
  render();
}

function clearAll() {
  for (const it of items) URL.revokeObjectURL(it.url);
  items = [];
  showNotice('');
  render();
}

function render() {
  const n = items.length;
  $('list-card').hidden = n === 0;
  $('options').hidden = n === 0;
  $('count').textContent = n === 1 ? '1 imagem' : `${n} imagens`;

  const list = $('list');
  list.replaceChildren(...items.map((it, i) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.draggable = true;
    li.dataset.index = String(i);

    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = String(i + 1);

    const img = document.createElement('img');
    img.className = 'thumb';
    img.src = it.url;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = it.file.name;
    const size = document.createElement('small');
    size.textContent = formatBytes(it.file.size);
    name.append(size);

    const btns = document.createElement('span');
    btns.className = 'btns';
    btns.append(
      button('↑', 'Subir', i === 0, () => { items = moveItem(items, i, i - 1); render(); }),
      button('↓', 'Descer', i === n - 1, () => { items = moveItem(items, i, i + 1); render(); }),
      button('✕', 'Remover', false, () => removeItem(i)),
    );

    li.append(num, img, name, btns);
    return li;
  }));
}

function button(text, label, disabled, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = text;
  b.title = label;
  b.setAttribute('aria-label', label);
  b.disabled = disabled;
  b.addEventListener('click', onClick);
  return b;
}

// Arrastar para reordenar (computador).
function setupReorder() {
  const list = $('list');
  list.addEventListener('dragstart', (e) => {
    const li = e.target.closest('.item');
    if (!li) return;
    dragFrom = Number(li.dataset.index);
    li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', li.dataset.index);
  });
  list.addEventListener('dragover', (e) => {
    if (dragFrom === null) return;
    e.preventDefault();
    const li = e.target.closest('.item');
    for (const el of list.querySelectorAll('.target')) if (el !== li) el.classList.remove('target');
    li?.classList.add('target');
  });
  list.addEventListener('drop', (e) => {
    if (dragFrom === null) return;
    e.preventDefault();
    e.stopPropagation();
    const li = e.target.closest('.item');
    if (li) items = moveItem(items, dragFrom, Number(li.dataset.index));
    dragFrom = null;
    render();
  });
  list.addEventListener('dragend', () => { dragFrom = null; render(); });
}

// Soltar arquivos na área (ou em qualquer lugar da página).
function setupFileDrop() {
  const drop = $('drop');
  const hasFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files');
  window.addEventListener('dragover', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    drop.classList.add('over');
  });
  window.addEventListener('dragleave', (e) => {
    if (e.relatedTarget === null) drop.classList.remove('over');
  });
  window.addEventListener('drop', (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    drop.classList.remove('over');
    if ($('pick').hidden) return;
    addFiles(e.dataTransfer.files);
  });
  $('files').addEventListener('change', (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  });
}

// ---------- Conversão ----------

async function encode(file, step) {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = targetDims(bitmap.width, bitmap.height, step.longSide);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // fundo branco no lugar da transparência
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('falha ao gerar JPEG'))), 'image/jpeg', step.quality);
    });
    canvas.width = 0; // libera a memória do canvas
    canvas.height = 0;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
  } finally {
    bitmap.close();
  }
}

async function buildPdf(encoded) {
  const { PDFDocument } = window.PDFLib;
  const doc = await PDFDocument.create();
  doc.setTitle('PDF criado com ConvertAÍ');
  doc.setCreator('ConvertAÍ');
  doc.setProducer('ConvertAÍ');
  for (const e of encoded) {
    const image = await doc.embedJpg(e.bytes);
    const L = layout(e.width, e.height);
    const page = doc.addPage([L.pageW, L.pageH]);
    page.drawImage(image, { x: L.x, y: L.y, width: L.drawW, height: L.drawH });
  }
  return doc.save({ useObjectStreams: true });
}

function setProgress(text, fraction) {
  $('progress-text').textContent = text;
  $('bar-fill').style.width = `${Math.round(fraction * 100)}%`;
}

function showStage(stage) {
  const editing = stage === 'edit';
  $('pick').hidden = !editing;
  $('list-card').hidden = !editing || items.length === 0;
  $('options').hidden = !editing || items.length === 0;
  $('progress').hidden = stage !== 'progress';
  $('result').hidden = stage !== 'result';
}

async function generate() {
  const limit = parseMaxMb($('maxmb').value);
  $('maxmb-error').hidden = !Number.isNaN(limit);
  if (Number.isNaN(limit)) { $('maxmb').focus(); return; }

  const preset = document.querySelector('input[name="preset"]:checked').value;
  const start = PRESETS[preset].step;
  const steps = limit ? LADDER.slice(start) : [LADDER[start]];

  cancelled = false;
  showStage('progress');
  setProgress('Preparando…', 0);

  let pending = items.slice();
  const skipped = [];
  let best = null;

  try {
    for (let s = 0; s < steps.length; s++) {
      const label = s === 0 ? 'Convertendo' : `Ainda acima do limite, comprimindo mais (tentativa ${s + 1})`;
      const encoded = [];
      const ok = [];
      for (let i = 0; i < pending.length; i++) {
        if (cancelled) throw new Cancelled();
        setProgress(`${label}: imagem ${i + 1} de ${pending.length}…`, i / pending.length);
        try {
          encoded.push(await encode(pending[i].file, steps[s]));
          ok.push(pending[i]);
        } catch {
          skipped.push(pending[i].file.name);
        }
      }
      pending = ok;
      if (encoded.length === 0) throw new Error('Nenhuma imagem pôde ser lida. Confira se os arquivos não estão corrompidos.');

      const estimate = encoded.reduce((sum, e) => sum + e.bytes.length, 0);
      const isLast = s === steps.length - 1;
      if (limit && estimate > limit && !isLast) continue;

      if (cancelled) throw new Cancelled();
      setProgress('Montando o PDF…', 1);
      const pdf = await buildPdf(encoded);
      if (!best || pdf.length < best.bytes.length) best = { bytes: pdf, pages: encoded.length };
      if (!limit || pdf.length <= limit) break;
    }
    showResult(best, limit, skipped);
  } catch (err) {
    showStage('edit');
    if (!(err instanceof Cancelled)) showNotice(err.message || 'Algo deu errado ao gerar o PDF. Tente de novo.');
  }
}

function showResult(best, limit, skipped) {
  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  pdfUrl = URL.createObjectURL(new Blob([best.bytes], { type: 'application/pdf' }));
  $('download').href = pdfUrl;

  const pages = best.pages === 1 ? '1 página' : `${best.pages} páginas`;
  $('result-info').textContent = `${pages} · ${formatBytes(best.bytes.length)}`;

  const tooBig = limit && best.bytes.length > limit;
  $('result-warning').hidden = !tooBig;
  if (tooBig) {
    $('result-warning').textContent =
      `Não deu para chegar a ${formatBytes(limit)}. Este é o menor PDF possível com essas imagens.`;
  }

  const ul = $('skipped');
  ul.hidden = skipped.length === 0;
  ul.replaceChildren(...skipped.map((name) => {
    const li = document.createElement('li');
    li.textContent = `${name}: não foi possível ler esta imagem, ela ficou de fora.`;
    return li;
  }));

  showStage('result');
}

// ---------- Início ----------

setupReorder();
setupFileDrop();
$('sort').addEventListener('click', () => {
  items.sort((a, b) => compareNames(a.file.name, b.file.name));
  render();
});
$('clear').addEventListener('click', clearAll);
$('go').addEventListener('click', generate);
$('cancel').addEventListener('click', () => { cancelled = true; setProgress('Cancelando…', 0); });
$('back').addEventListener('click', () => showStage('edit'));
$('again').addEventListener('click', () => { clearAll(); showStage('edit'); });
$('maxmb').addEventListener('input', () => { $('maxmb-error').hidden = true; });
render();
