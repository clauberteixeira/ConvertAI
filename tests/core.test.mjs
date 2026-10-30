import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LADDER, PRESETS, LONG_SIDE_PT, sniffType, targetDims, layout, parseMaxMb, formatBytes,
  compareNames, moveItem,
} from '../core.js';

test('sniffType reconhece PNG, JPEG e WEBP pelo conteúdo', () => {
  assert.equal(sniffType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'png');
  assert.equal(sniffType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), 'jpeg');
  const webp = new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 ');
  assert.equal(sniffType(webp), 'webp');
  assert.equal(sniffType(new TextEncoder().encode('GIF89a......')), null);
  assert.equal(sniffType(new Uint8Array([])), null);
});

test('targetDims reduz pelo lado maior e nunca aumenta', () => {
  assert.deepEqual(targetDims(6000, 4000, 3000), { width: 3000, height: 2000 });
  assert.deepEqual(targetDims(1000, 3000, 1500), { width: 500, height: 1500 });
  assert.deepEqual(targetDims(800, 600, 3000), { width: 800, height: 600 });
  assert.deepEqual(targetDims(10000, 1, 700), { width: 700, height: 1 });
});

test('layout: lado maior com tamanho de A4 e o outro proporcional', () => {
  const p = layout(1000, 500);
  assert.equal(p.pageW, LONG_SIDE_PT);
  assert.ok(Math.abs(p.pageH - LONG_SIDE_PT / 2) < 1e-9);
  assert.equal(p.x, 0);
  assert.equal(p.y, 0);
  const r = layout(500, 1000);
  assert.equal(r.pageH, LONG_SIDE_PT);
  assert.ok(Math.abs(r.pageW - LONG_SIDE_PT / 2) < 1e-9);
});

test('layout: faixa muito fina usa piso de 3 pt e centraliza a imagem', () => {
  const p = layout(10000, 1);
  assert.equal(p.pageH, 3);
  assert.ok(p.drawH < 3);
  assert.ok(Math.abs(p.y - (3 - p.drawH) / 2) < 1e-9);
});

test('parseMaxMb aceita vírgula e trata vazio e inválido', () => {
  assert.equal(parseMaxMb(''), null);
  assert.equal(parseMaxMb('  '), null);
  assert.equal(parseMaxMb('5'), 5_000_000);
  assert.equal(parseMaxMb('2,5'), 2_500_000);
  assert.ok(Number.isNaN(parseMaxMb('0')));
  assert.ok(Number.isNaN(parseMaxMb('-1')));
  assert.ok(Number.isNaN(parseMaxMb('abc')));
});

test('formatBytes em português', () => {
  assert.equal(formatBytes(512), '512 B');
  assert.equal(formatBytes(45_300), '45 KB');
  assert.equal(formatBytes(2_340_000), '2,3 MB');
});

test('compareNames usa ordem natural', () => {
  const names = ['foto10.png', 'Foto2.png', 'foto1.png'];
  assert.deepEqual(names.sort(compareNames), ['foto1.png', 'Foto2.png', 'foto10.png']);
});

test('moveItem move sem alterar o original e ignora índices inválidos', () => {
  const list = ['a', 'b', 'c', 'd'];
  assert.deepEqual(moveItem(list, 0, 2), ['b', 'c', 'a', 'd']);
  assert.deepEqual(moveItem(list, 3, 0), ['d', 'a', 'b', 'c']);
  assert.deepEqual(moveItem(list, 1, 9), list);
  assert.deepEqual(list, ['a', 'b', 'c', 'd']);
});

test('escada de compressão sempre diminui e os níveis apontam para passos válidos', () => {
  for (let i = 1; i < LADDER.length; i++) {
    const prev = LADDER[i - 1];
    const cur = LADDER[i];
    assert.ok(cur.longSide <= prev.longSide && cur.quality <= prev.quality);
    assert.ok(cur.longSide < prev.longSide || cur.quality < prev.quality);
  }
  for (const p of Object.values(PRESETS)) assert.ok(p.step >= 0 && p.step < LADDER.length);
});
