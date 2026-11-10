// Gera dist/ConvertAI.html: o app inteiro num arquivo só, que abre com dois cliques e funciona sem internet.
// O navegador bloqueia import de módulos em file://, por isso core.js e app.js viram um único script embutido.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = (f) => readFileSync(`${root}${f}`, 'utf8');

const core = read('core.js').replace(/^export /gm, '');
const app = read('app.js').replace(/^import \{[^}]*\} from '\.\/core\.js';\r?\n/, '');
const pdfLib = read('vendor/pdf-lib.min.js');
const icon = `data:image/svg+xml;base64,${Buffer.from(read('icon.svg')).toString('base64')}`;

for (const [name, code] of [['core.js', core], ['app.js', app], ['pdf-lib', pdfLib]]) {
  if (/^\s*(import|export)\s/m.test(code)) throw new Error(`${name}: sobrou import/export, ajuste o build`);
  if (/<\/script/i.test(code)) throw new Error(`${name}: contém </script e quebraria o HTML`);
}

const tags = {
  '<link rel="icon" href="icon.svg" type="image/svg+xml">': `<link rel="icon" href="${icon}" type="image/svg+xml">`,
  '<link rel="stylesheet" href="style.css">': `<style>\n${read('style.css')}</style>`,
  '<script src="vendor/pdf-lib.min.js" defer></script>': `<script>\n${pdfLib}\n</script>`,
  '<script src="app.js" type="module"></script>': `<script type="module">\n${core}\n${app}</script>`,
};

let html = read('index.html');
for (const [from, to] of Object.entries(tags)) {
  if (!html.includes(from)) throw new Error(`index.html mudou, não achei: ${from}`);
  html = html.replace(from, () => to); // função: evita que "$" no código vire padrão de substituição
}

mkdirSync(`${root}dist`, { recursive: true });
writeFileSync(`${root}dist/ConvertAI.html`, html);
console.log(`dist/ConvertAI.html (${(html.length / 1e6).toFixed(2)} MB)`);
