// Copia só os arquivos do site para dist/app/, que o Tauri embute no instalador de desktop.
import { cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = `${root}dist/app`;
rmSync(out, { recursive: true, force: true });
for (const f of ['index.html', 'app.js', 'core.js', 'style.css', 'icon.svg', 'vendor']) {
  cpSync(`${root}${f}`, `${out}/${f}`, { recursive: true });
}
